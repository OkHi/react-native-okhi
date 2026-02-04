import Foundation
import OkHi
import React
import UserNotifications

@objc public class OkHiWrapper: NSObject, OkVerifyDelegate {
  
  // Singleton instance for delegate callbacks
  private static let shared = OkHiWrapper()
  
  private var okVerify: OkVerify = OkVerify()
  private var currentPermissionCallback: ((NSNumber?, NSDictionary?) -> Void)?
  private var currentPermissionLevelRequest: String?
  
  private override init() {
    super.init()
    okVerify.delegate = self
  }
  
  @objc public static func login(_ credentials: NSDictionary, callback: @escaping ([String]?) -> Void) {
    // Extract auth dictionary
    guard let authDict = credentials["auth"] as? NSDictionary,
          let branchId = authDict["branchId"] as? String,
          let clientKey = authDict["clientKey"] as? String else {
      callback(nil)
      return
    }
    let env = authDict["env"] as? String ?? "prod"
    
    // Extract user dictionary
    guard let userDict = credentials["user"] as? NSDictionary,
          let phone = userDict["phone"] as? String else {
      callback(nil)
      return
    }
    let firstName = userDict["firstName"] as? String
    let lastName = userDict["lastName"] as? String
    let email = userDict["email"] as? String
    let appUserId = userDict["appUserId"] as? String
    
    // Extract optional appContext dictionary
    var nativeAppContext: OkHiAppContext? = nil
    if let appContextDict = credentials["appContext"] as? NSDictionary,
       let name = appContextDict["name"] as? String,
       let version = appContextDict["version"] as? String,
       let build = appContextDict["build"] as? String {
      nativeAppContext = OkHiAppContext().withAppMeta(name: name, version: version, build: build)
    }
    
    let auth = OkHiAuth(
      branchId: branchId,
      clientKey: clientKey,
      environment: env,
      appContext: nativeAppContext
    )
    
    var user = OkHiUser(phoneNumber: phone)
    if let firstName = firstName {
      user = user.with(firstName: firstName)
    }
    if let lastName = lastName {
      user = user.with(lastName: lastName)
    }
    if let email = email {
      user = user.with(email: email)
    }
    if let appUserId = appUserId {
      user = user.with(appUserId: appUserId)
    }
    
    OK.shared.login(auth: auth, user: user) { results in
      callback(results)
    }
  }
  
  // MARK: - Helper Methods
  
  private static func parseOkCollect(_ okcollect: NSDictionary) -> (theme: OkHiTheme, config: OkHiConfig, location: OkHi.OkHiLocation?) {
    // Parse style
    let styleDict = okcollect["style"] as? NSDictionary
    let color = styleDict?["color"] as? String ?? "#005D67"
    let logo = styleDict?["logo"] as? String ?? "https://cdn.okhi.co/icon.png"
    
    // Parse configuration
    let configDict = okcollect["configuration"] as? NSDictionary
    let streetView = configDict?["streetView"] as? Bool ?? true
    let withHomeAddressType = configDict?["withHomeAddressType"] as? Bool ?? true
    let withWorkAddressType = configDict?["withWorkAddressType"] as? Bool ?? false
    
    // Parse optional locationId
    let locationId = okcollect["locationId"] as? String
    var okhiLocation: OkHi.OkHiLocation? = nil
    if let locationId = locationId {
      okhiLocation = OkHi.OkHiLocation(identifier: locationId)
    }
    
    // Build theme
    let theme = OkHiTheme()
      .with(appBarColor: color)
      .with(logoUrl: logo)
      .with(primaryColor: color)
    
    // Build config
    var config = OkHiConfig()
      .withAddressTypes(work: withWorkAddressType, home: withHomeAddressType)
    if streetView {
      config = config.enableStreetView()
    }
    
    return (theme, config, okhiLocation)
  }
  
  private static func processResponse(_ response: OkHi.OkHiSuccessResponse?, _ error: OkHi.OkHiException?, callback: @escaping (NSDictionary?, NSDictionary?) -> Void) {
    if let response = response,
       let userJson = response.user.toJSON(),
       let locationJson = response.location.toJSON() {
      let successResult: NSDictionary = ["user": userJson, "location": locationJson]
      callback(successResult, nil)
    } else if let error = error {
      let errorResult: NSDictionary = ["code": error.code, "message": error.message ?? "Unable to complete operation"]
      callback(nil, errorResult)
    } else {
      let errorResult: NSDictionary = ["code": "unknown", "message": "Unable to parse response"]
      callback(nil, errorResult)
    }
  }
  
  // MARK: - Digital Verification
  
  @objc public static func startDigitalAddressVerification(_ okcollect: NSDictionary, callback: @escaping (NSDictionary?, NSDictionary?) -> Void) {
    DispatchQueue.main.async {
      guard let vc = RCTPresentedViewController() else {
        let errorResult: NSDictionary = ["code": "unknown", "message": "Unable to retrieve current view controller"]
        callback(nil, errorResult)
        return
      }
      
      let (theme, config, location) = parseOkCollect(okcollect)
      
      OK.shared.startAddressVerification(
        vc: vc,
        theme: theme,
        config: config,
        location: location
      ) { response, error in
        processResponse(response, error, callback: callback)
      }
    }
  }
  
  // MARK: - Physical Verification
  
  @objc public static func startPhysicalAddressVerification(_ okcollect: NSDictionary, callback: @escaping (NSDictionary?, NSDictionary?) -> Void) {
    DispatchQueue.main.async {
      guard let vc = RCTPresentedViewController() else {
        let errorResult: NSDictionary = ["code": "unknown", "message": "Unable to retrieve current view controller"]
        callback(nil, errorResult)
        return
      }
      
      let (theme, config, location) = parseOkCollect(okcollect)
      
      OK.shared.startPhysicalAddressVerification(
        vc: vc,
        theme: theme,
        config: config,
        location: location
      ) { response, error in
        processResponse(response, error, callback: callback)
      }
    }
  }
  
  // MARK: - Digital and Physical Verification
  
  @objc public static func startDigitalAndPhysicalAddressVerification(_ okcollect: NSDictionary, callback: @escaping (NSDictionary?, NSDictionary?) -> Void) {
    DispatchQueue.main.async {
      guard let vc = RCTPresentedViewController() else {
        let errorResult: NSDictionary = ["code": "unknown", "message": "Unable to retrieve current view controller"]
        callback(nil, errorResult)
        return
      }
      
      let (theme, config, location) = parseOkCollect(okcollect)
      
      OK.shared.startDigitalAndPhysicalAddressVerification(
        vc: vc,
        theme: theme,
        config: config,
        location: location
      ) { response, error in
        processResponse(response, error, callback: callback)
      }
    }
  }
  
  // MARK: - Create Address
  
  @objc public static func createAddress(_ okcollect: NSDictionary, callback: @escaping (NSDictionary?, NSDictionary?) -> Void) {
    DispatchQueue.main.async {
      guard let vc = RCTPresentedViewController() else {
        let errorResult: NSDictionary = ["code": "unknown", "message": "Unable to retrieve current view controller"]
        callback(nil, errorResult)
        return
      }
      
      let (theme, config, _) = parseOkCollect(okcollect)
      
      OK.shared.createAddress(
        vc: vc,
        theme: theme,
        config: config
      ) { response, error in
        processResponse(response, error, callback: callback)
      }
    }
  }
  
  // MARK: - Check Helper Methods
  
  @objc public static func isLocationServicesEnabled(callback: @escaping (NSNumber?, NSDictionary?) -> Void) {
    let result = OkVerify.isLocationServicesEnabled()
    callback(NSNumber(value: result), nil)
  }
  
  @objc public static func canOpenProtectedApps(callback: @escaping (NSNumber?, NSDictionary?) -> Void) {
    // Always false on iOS - protected apps is Android-specific
    callback(NSNumber(value: false), nil)
  }
  
  @objc public static func getLocationAccuracyLevel(callback: @escaping (NSString?, NSDictionary?) -> Void) {
    let level = OkVerify.getLocationAccuracyLevel()
    callback(level as NSString, nil)
  }
  
  @objc public static func isBackgroundLocationPermissionGranted(callback: @escaping (NSNumber?, NSDictionary?) -> Void) {
    let result = OkVerify.isBackgroundLocationPermissionGranted()
    callback(NSNumber(value: result), nil)
  }
  
  @objc public static func isCoarseLocationPermissionGranted(callback: @escaping (NSNumber?, NSDictionary?) -> Void) {
    // On iOS, coarse location is granted if accuracy level is "precise" or "approximate"
    let level = OkVerify.getLocationAccuracyLevel()
    let result = level == "precise" || level == "approximate"
    callback(NSNumber(value: result), nil)
  }
  
  @objc public static func isFineLocationPermissionGranted(callback: @escaping (NSNumber?, NSDictionary?) -> Void) {
    // On iOS, fine location is granted if accuracy level is "precise"
    let level = OkVerify.getLocationAccuracyLevel()
    let result = level == "precise"
    callback(NSNumber(value: result), nil)
  }
  
  @objc public static func isPlayServicesAvailable(callback: @escaping (NSNumber?, NSDictionary?) -> Void) {
    // Always false on iOS - Play Services is Android-specific
    callback(NSNumber(value: false), nil)
  }
  
  @objc public static func isPostNotificationPermissionGranted(callback: @escaping (NSNumber?, NSDictionary?) -> Void) {
    UNUserNotificationCenter.current().getNotificationSettings { settings in
      let result = settings.authorizationStatus == .authorized
      callback(NSNumber(value: result), nil)
    }
  }
  
  @objc public static func openProtectedApps() {
    // No-op on iOS - protected apps is Android-specific
  }
  
  // MARK: - Request Helper Methods
  
  @objc public static func requestLocationPermission(callback: @escaping (NSNumber?, NSDictionary?) -> Void) {
    shared.currentPermissionCallback = callback
    shared.currentPermissionLevelRequest = "whenInUse"
    shared.okVerify.requestLocationPermission()
  }
  
  @objc public static func requestBackgroundLocationPermission(callback: @escaping (NSNumber?, NSDictionary?) -> Void) {
    shared.currentPermissionCallback = callback
    shared.currentPermissionLevelRequest = "always"
    shared.okVerify.requestBackgroundLocationPermission()
  }
  
  @objc public static func requestEnableLocationServices(callback: @escaping (NSNumber?, NSDictionary?) -> Void) {
    // On iOS, we cannot programmatically enable location services
    // Return unsupported_platform error like the Nitro implementation
    let errorResult: NSDictionary = ["code": "unsupported_platform", "message": "Requesting enable location services is not supported on iOS"]
    callback(nil, errorResult)
  }
  
  @objc public static func requestPostNotificationPermissions(callback: @escaping (NSNumber?, NSDictionary?) -> Void) {
    // On iOS, we cannot programmatically request notification permissions from this context
    // Return unsupported_platform error like the Nitro implementation
    let errorResult: NSDictionary = ["code": "unsupported_platform", "message": "Requesting post notification permissions is not supported on iOS"]
    callback(nil, errorResult)
  }
}


extension OkHiWrapper {
  public func verify(_ okverify: OkHi.OkVerify, didChangeLocationPermissionStatus requestType: OkHi.OkVerifyLocationPermissionRequestType, status: Bool) {
    if let callback = currentPermissionCallback, let request = currentPermissionLevelRequest {
      if (request == "whenInUse" && requestType == .whenInUse) {
        callback(NSNumber(value: status), nil)
        currentPermissionCallback = nil
        currentPermissionLevelRequest = nil
        return
      } else if (currentPermissionLevelRequest == "always" && requestType == .always) {
        callback(NSNumber(value: status), nil)
        currentPermissionCallback = nil
        currentPermissionLevelRequest = nil
        return
      } else {
        let errorResult: NSDictionary = ["code": "permission_denied", "message": "User denied permission"]
        callback(nil, errorResult)
      }
    }
  }
  
  public func verify(_ okverify: OkHi.OkVerify, didInitialize result: Bool) {
    
  }
  
  public func verify(_ okverify: OkHi.OkVerify, didEncounterError error: OkHi.OkVerifyError) {
    
  }
  
  public func verify(_ okverify: OkHi.OkVerify, didStartAddressVerificationFor locationId: String) {
    
  }
  
  public func verify(_ okverify: OkHi.OkVerify, didStopVerificationFor locationId: String) {
    
  }
  
  public func verify(_ okverify: OkHi.OkVerify, didUpdateLocationPermissionStatus status: CLAuthorizationStatus) {
    
  }
  
  public func verify(_ okverify: OkHi.OkVerify, didUpdateNotificationPermissionStatus status: Bool) {
    
  }
}
