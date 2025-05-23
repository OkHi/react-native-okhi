import UIKit
import OkHi
import CoreLocation

@objc(Okhi)
class Okhi: RCTEventEmitter {
  private enum LocationPermissionRequestType: String {
    case whenInUse = "whenInUse"
    case always = "always"
  }
  private var currentLocationPermissionRequestType: LocationPermissionRequestType = .always
  private var resolve: RCTPromiseResolveBlock?
  private var reject: RCTPromiseRejectBlock?
  private var initResolve: RCTPromiseResolveBlock?
  private var initReject: RCTPromiseRejectBlock?
  private var didChangeLocationPermissionStatusResolve: RCTPromiseResolveBlock?
  private var didChangeLocationPermissionStatusReject: RCTPromiseRejectBlock?
  private var okVerify: OkVerify
  private var okhiLocationManager: OkHiLocationManager
  
  override init() {
    okVerify = OkVerify()
    okhiLocationManager = OkHiLocationManager()
    super.init()
    okVerify.delegate = self
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc(multiply:withB:withResolver:withRejecter:)
  func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
    resolve(a*b)
  }
  
  @objc func isLocationServicesEnabled(_ resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    resolve(okVerify.isLocationServicesEnabled())
  }
  
  @objc func isLocationPermissionGranted(_ resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    resolve(okVerify.isLocationPermissionGranted())
  }
  
  @objc func isBackgroundLocationPermissionGranted(_ resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    resolve(okVerify.isBackgroundLocationPermissionGranted())
  }
  
  @objc func getSystemVersion(_ resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    resolve(UIDevice.current.systemVersion)
  }
  
  @objc func requestLocationPermission(_ resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) {
    self.didChangeLocationPermissionStatusResolve = resolve
    self.didChangeLocationPermissionStatusReject = reject
    currentLocationPermissionRequestType = .whenInUse
    okVerify.requestLocationPermission()
  }
  
  @objc func requestBackgroundLocationPermission(_ resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) {
    self.didChangeLocationPermissionStatusResolve = resolve
    self.didChangeLocationPermissionStatusReject = reject
    currentLocationPermissionRequestType = .always
    okVerify.requestBackgroundLocationPermission()
  }
  
  @objc func requestEnableLocationServices(_ resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    if let url = URL.init(string: UIApplication.openSettingsURLString) {
      UIApplication.shared.open(url, options: [:], completionHandler: nil)
    }
    resolve(NSNull())
  }
  
  @objc func openAppSettings(_ resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    OkVerify.openAppSettings()
    resolve(NSNull())
  }
  
  @objc func getAuthToken(_ branchId: String, clientKey: String, resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    resolve("Token " + "\(branchId):\(clientKey)".toBase64())
  }
  
  @objc func initializeIOS(_ branchId: String, clientKey: String, environment: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    self.initResolve = resolve
    self.initReject = reject
    let appDetails = getAppDetails()
    let okHiAppContext = OkHiAppContext().withAppMeta(name: appDetails.name, version: appDetails.version, build: appDetails.version)
    let okHiAuth = OkHiAuth(
      branchId: branchId,
      clientKey: clientKey,
      environment: environment == "prod" ? .prod : .sandbox,
      appContext: okHiAppContext
    )
    OkCollect.initialize(with: okHiAuth)
    OkVerify.initialize(with: okHiAuth, launchOptions: nil)
    resolve(true)
  }
  
  @objc func startAddressVerification(_ token: String, phoneNumber: String, userId: String, locationId: String, lat: Double, lon: Double, usageTypes: [String], resolve:@escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    self.resolve = resolve
    self.reject = reject
    var enumUsageTypes: [OkHiUsageType] = []
    for usageType in usageTypes {
      if usageType == OkHiUsageType.physicalVerification.rawValue {
        enumUsageTypes.append(.physicalVerification)
      } else if usageType == OkHiUsageType.digitalVerification.rawValue {
        enumUsageTypes.append(.digitalVerification)
      } else if usageType == OkHiUsageType.addressBook.rawValue {
        enumUsageTypes.append(.addressBook)
      }
    }
    let user = OkHiUser(phoneNumber: phoneNumber).with(token: token).with(okHiId: userId)
    let location = OkHiLocation(identifier: locationId, lat: lat, lon: lon, usageTypes: enumUsageTypes)
    let response = OkCollectSuccessResponse(user: user, location: location)
    okVerify.startAddressVerification(response: response)
  }
  
  @objc func stopAddressVerification(_ phoneNumber: String, locationId: String, resolve:@escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    self.resolve = resolve
    self.reject = reject
    okVerify.stopAddressVerification(locationId: locationId)
  }
  
  @objc func retriveLocationPermissionStatus(_ resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    let manager = CLLocationManager()
    let status = fetchLocationPermissionStatus(status: getLocationAuthorizationStatus(manager: manager))
    resolve(status)
  }
  
  @objc func requestTrackingAuthorization(_ resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    if #available(iOS 14.0, *) {
      OkAnalytics.requestTrackingAuthorization { trackingId in
        if let id = trackingId {
          resolve(id)
        } else {
          resolve(NSNull())
        }
      }
    } else {
      resolve(NSNull())
    }
  }
  
  @objc func isNotificationPermissionGranted(_ resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    OkVerify.isNotificationPermissionGranted { result in
      resolve(result)
    }
  }
  
  @objc func requestNotificationPermission(_ resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    OkVerify.requestNotificationPermission(registerForRemoteNotifications: false) { result in
      resolve(result)
    }
  }
  
  @objc func fetchCurrentLocation(_ resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    okhiLocationManager.getCurrentLocation { result in
      if let location = result {
        let locationDict: NSDictionary = [
          "lat": location.coordinate.latitude,
          "lng": location.coordinate.longitude,
          "accuracy": location.horizontalAccuracy
        ]
        resolve(locationDict)
      } else {
        resolve(NSNull())
      }
    }
  }
  
  @objc func retrieveDeviceInfo(_ resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    let deviceInfoDict: NSDictionary = [
      "manufacturer": "Apple",
      "model": UIDevice.current.modelName,
      "osVersion": UIDevice.current.systemVersion,
      "platform": "ios"
    ]
    resolve(deviceInfoDict)
  }
  
  override func supportedEvents() -> [String]! {
    return ["onLocationPermissionStatusUpdate"]
  }
  
  private func fetchLocationPermissionStatus(status: CLAuthorizationStatus) -> String {
    var str: String = ""
    switch status {
    case .notDetermined:
      str = "notDetermined"
    case .restricted:
      str = "restricted"
    case .denied:
      str = "denied"
    case .authorizedAlways:
      str = "authorizedAlways"
    case .authorizedWhenInUse:
      str = "authorizedWhenInUse"
    case .authorized:
      str = "authorized"
    @unknown default:
      str = "unknown"
    }
    return str
  }
  
  @objc public func fetchIOSLocationPermissionStatus(_ resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    let manager = CLLocationManager()
    resolve(fetchLocationPermissionStatus(status: getLocationAuthorizationStatus(manager: manager)))
  }
  
  @objc public func onStart(_ resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    OkVerify.onStart { result in
      resolve(result)
    }
  }
  
  @objc public func fetchRegisteredGeofences(_ resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    do {
      let geofences: [[String: Any]] = OkVerify.fetchRegisteredGeofences()
      let jsonData = try JSONSerialization.data(withJSONObject: geofences, options: [])
      guard let jsonString = String(data: jsonData, encoding: .utf8) else {
        resolve(NSNull())
        return
      }
      resolve(jsonString)
    } catch {
      resolve(NSNull())
    }
  }
  
  @objc public func getLocationAccuracyLevel(_ resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    let level = OkVerify.getLocationAccuracyLevel()
    resolve(level)
  }
}

// MARK: - OkHi Utils
extension Okhi {
  func getLocationAuthorizationStatus(manager: CLLocationManager) -> CLAuthorizationStatus {
    if #available(iOS 14.0, *) {
      return manager.authorizationStatus
    } else {
      return CLLocationManager.authorizationStatus()
    }
  }
  
  func getAppDetails() -> (name: String, version: String, build: String) {
    let bundle = Bundle.main
    let appName = bundle.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String ??
    bundle.object(forInfoDictionaryKey: "CFBundleName") as? String ?? "Unknown App Name"
    let version = bundle.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "Unknown Version"
    let build = bundle.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? "Unknown Build"
    return (name: appName, version: version, build: build)
  }
}

// MARK: - OkVerify Delegates
extension Okhi: OkVerifyDelegate {
  func verify(_ okverify: OkVerify, didUpdateLocationPermissionStatus status: CLAuthorizationStatus) {
    sendEvent(withName: "onLocationPermissionStatusUpdate", body: fetchLocationPermissionStatus(status: status))
  }
  
  func verify(_ okverify: OkVerify, didChangeLocationPermissionStatus requestType: OkVerifyLocationPermissionRequestType, status: Bool) {
    if let resolve = self.didChangeLocationPermissionStatusResolve {
      if currentLocationPermissionRequestType == .whenInUse && requestType == .whenInUse {
        resolve(status)
      } else if currentLocationPermissionRequestType == .always && requestType == .always {
        resolve(status)
      } else {
        resolve(false)
      }
      self.didChangeLocationPermissionStatusResolve = nil
      self.didChangeLocationPermissionStatusReject = nil
    }
  }
  
  func verify(_ okverify: OkVerify, didInitialize result: Bool) {
    guard let resolve = initResolve else { return }
    resolve(result)
    self.initResolve = nil
    self.initReject = nil
  }
  
  func verify(_ okverify: OkVerify, didEncounterError error: OkVerifyError) {
    if let initReject = initReject {
      initReject(error.code, error.message, error)
      self.initResolve = nil
      self.initReject = nil
    } else {
      guard let reject = reject else { return }
      reject(error.code, error.message, error)
      self.reject = nil
    }
  }
  
  func verify(_ okverify: OkVerify, didStartAddressVerificationFor locationId: String) {
    guard let resolve = resolve else { return }
    resolve(locationId)
    self.resolve = nil
  }
  
  func verify(_ okverify: OkVerify, didStopVerificationFor locationId: String) {
    guard let resolve = resolve else { return }
    resolve(locationId)
    self.resolve = nil
  }
  
  func verify(_ okverify: OkVerify, didUpdateNotificationPermissionStatus status: Bool) {
    
  }
}

extension UIDevice {
  var modelName: String {
    var systemInfo = utsname()
    uname(&systemInfo)
    let machineMirror = Mirror(reflecting: systemInfo.machine)
    let identifier = machineMirror.children.reduce("") { identifier, element in
      guard let value = element.value as? Int8, value != 0 else { return identifier }
      return identifier + String(UnicodeScalar(UInt8(value)))
    }
    return identifier
  }
}

