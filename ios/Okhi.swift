import OkCore
import OkVerify
import UIKit

@objc(Okhi)
class Okhi: NSObject {
    private enum LocationPermissionRequestType: String {
        case whenInUse = "whenInUse"
        case always = "always"
    }
    private var locationPermissionRequestType: LocationPermissionRequestType = .always
    private let okhiLocationService = OkHiLocationService()
    private var resolve: RCTPromiseResolveBlock?
    
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
        resolve(true)
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
                        environment: config.context.mode == "prod" ? .prod : .sandbox,
                        appContext:context
                    )
                    OkHiVerify.initialize(with: auth)
                    resolve(true)
                } else {
                    let auth = OkHiAuth(
                        branchId: config.credentials.branchId,
                        clientKey: config.credentials.clientKey,
                        environment: "https://dev-api.okhi.io",
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
    
    private func _isBackgroundLocationPermissionGranted() -> Bool {
        if okhiLocationService.isLocationServicesAvailable() {
            return CLLocationManager.authorizationStatus() == .authorizedAlways
        } else {
            return false
        }
    }
}

struct RNOkHiCredential: Codable {
    let branchId: String
    let clientKey: String
}

struct RNOkHiContext: Codable {
    let mode: String
    let developer: String?
}

struct RNOkHiApp: Codable {
    let name: String?
    let version: String?
    let build: String?
}
struct RNOkHiConfiguration: Codable {
    let credentials: RNOkHiCredential
    let context: RNOkHiContext
    let app: RNOkHiApp?
}

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

extension String {
    func fromBase64() -> String? {
        guard let data = Data(base64Encoded: self) else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }
    func toBase64() -> String {
        return Data(self.utf8).base64EncodedString()
    }
}

extension String {
    func toJSON() -> Any? {
        guard let data = self.data(using: .utf8, allowLossyConversion: false) else { return nil }
        return try? JSONSerialization.jsonObject(with: data, options: .mutableContainers)
    }
}
