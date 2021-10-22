import OkCore
import OkVerify
import UIKit
import CoreLocation

@objc(Okhi)
class Okhi: NSObject {
    private enum LocationPermissionRequestType: String {
        case whenInUse = "whenInUse"
        case always = "always"
    }
    private var locationPermissionRequestType: LocationPermissionRequestType = .always
    private let okhiLocationService = OkHiLocationService()
    private var resolve: RCTPromiseResolveBlock?
    private var reject: RCTPromiseRejectBlock?
    private var okVerify:OkHiVerify?
    
    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc(multiply:withB:withResolver:withRejecter:)
    func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        resolve(a*b)
    }
    
    @objc func isLocationServicesEnabled(_ resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        resolve(okhiLocationService.isLocationServicesAvailable())
    }
    
    @objc func isLocationPermissionGranted(_ resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        resolve(okhiLocationService.isLocationPermissionGranted())
    }
    
    @objc func isBackgroundLocationPermissionGranted(_ resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        //        resolve(okhiLocationService.isBackgroundLocationPermissionGranted()) // TODO: use once implemented
        resolve(_isBackgroundLocationPermissionGranted())
    }
    
    @objc func getSystemVersion(_ resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        resolve(UIDevice.current.systemVersion)
    }
    
    @objc func requestLocationPermission(_ resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        if okhiLocationService.isLocationPermissionGranted() {
            resolve(true)
            return
        }
        okhiLocationService.delegate = self
        self.resolve = resolve
        locationPermissionRequestType = .whenInUse
    }
    
    @objc func requestBackgroundLocationPermission(_ resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        if _isBackgroundLocationPermissionGranted() {
            resolve(true)
            return
        }
        okhiLocationService.delegate = self
        self.resolve = resolve
        locationPermissionRequestType = .always
        okhiLocationService.requestLocationPermission(withBackgroundLocationPermission: true)
    }
    
    @objc func requestEnableLocationServices(_ resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        UIApplication.shared.open(URL(string:UIApplication.openSettingsURLString)!)
        resolve(NSNull())
    }
    
    @objc func getAuthToken(_ branchId: String, clientKey: String, resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        resolve("Token " + "\(branchId):\(clientKey)".toBase64())
    }
    
    @objc func initialize(_ configuration: String, resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        if let data = configuration.data(using: .utf8) {
            if let config = try? JSONDecoder().decode(RNOkHiConfiguration.self, from: data) {
                var context = OkHiAppContext()
                if let appName = config.app?.name, let appVersion = config.app?.version, let appBuild = config.app?.build {
                    context = OkHiAppContext().withAppMeta(name: appName, version: appVersion, build: appBuild)
                }
                if config.context.mode == "dev" {
                    let auth = OkHiAuth(
                        branchId: config.credentials.branchId,
                        clientKey: config.credentials.clientKey,
                        environment: "https://dev-api.okhi.io",
                        appContext:context
                    )
                    OkHiVerify.initialize(with: auth)
                    resolve(true)
                } else {
                    let auth = OkHiAuth(
                        branchId: config.credentials.branchId,
                        clientKey: config.credentials.clientKey,
                        environment: config.context.mode == "prod" ? .prod : .sandbox,
                        appContext:context
                    )
                    OkHiVerify.initialize(with: auth)
                    resolve(true)
                }
            } else {
                reject("unauthorized", "unable to decode init configuration", nil)
            }
        } else {
            reject("unauthorized", "unable to decode init data configuration", nil)
        }
    }
    
    @objc func startAddressVerification(_ phoneNumber: String, locationId: String, lat: Double, lon: Double, resolve:@escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let user = OkHiUser(phoneNumber: phoneNumber)
        let location = OkHiLocation(identifier: locationId, lat: lat, lon: lon)
        self.resolve = resolve
        self.reject = reject
        okVerify = OkHiVerify(user: user)
        okVerify?.delegate = self
        okVerify?.start(location: location)
    }
    
    @objc func stopAddressVerification(_ phoneNumber: String, locationId: String, resolve:@escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let user = OkHiUser(phoneNumber: phoneNumber)
        self.resolve = resolve
        self.reject = reject
        okVerify = OkHiVerify(user: user)
        okVerify?.delegate = self
        okVerify?.stop(locationId: locationId)
    }
    
    private func _isBackgroundLocationPermissionGranted() -> Bool {
        if okhiLocationService.isLocationServicesAvailable() {
            return CLLocationManager.authorizationStatus() == .authorizedAlways
        } else {
            return false
        }
    }
}

// MARK: - OkHiLocationService Delegate
extension Okhi: OkHiLocationServiceDelegate {
    func okHiLocationService(locationService: OkHiLocationService, didChangeLocationPermissionStatus locationPermissionType: LocationPermissionType, result: Bool) {
        guard let resolve = resolve else { return }
        if locationPermissionRequestType == .whenInUse {
            if locationPermissionType == .whenInUse {
                resolve(result)
            }
        } else if locationPermissionRequestType == .always {
            if locationPermissionType == .always {
                resolve(result)
            }
        }
    }
}

// MARK: - OkVerify Delegate
extension Okhi: OkVerifyDelegate {
    func verify(_ okVerify: OkHiVerify, didEncounterError error: OkHiError) {
        guard let reject = reject else { return }
        reject(error.code, error.message, nil)
    }
    
    func verify(_ okVerify: OkHiVerify, didStart locationId: String) {
        guard let resolve = resolve else { return }
        resolve(locationId)
    }
    
    func verify(_ okVerify: OkHiVerify, didEnd locationId: String) {
        guard let resolve = resolve else { return }
        resolve(locationId)
    }
}
