import OkCore
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
    
    @objc func getApplicationConfiguration(_ resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        let clientKey = OkPreferences.shared.clientKey
        let branchId = OkPreferences.shared.branchId
        let context = OkPreferences.shared.appContext
        let env = OkPreferences.shared.environment
        if let clientKey = clientKey, let branchId = branchId, let context = context, let env = env {
            let accessToken = "\(branchId):\(clientKey)".toBase64()
            let mode: String = env == .prod ? "production" : env == .sandbox ? "sandbox" : "dev"
            let appName: String = context.appMeta?.name ?? ""
            let appVresion: String = context.appMeta?.version ?? ""
            let versionCode: String = context.appMeta?.build ?? ""
            let developer: String = context.developer
            let credentials = [
                "auth": [
                    "accessToken": accessToken
                ],
                "context": [
                    "platform": "react-native",
                    "developer": developer,
                    "mode": mode
                ],
                "app": [
                    "name": appName,
                    "version": appVresion,
                    "versionCode":versionCode
                ]
            ]
            do {
                let jsonData = try JSONSerialization.data(withJSONObject: credentials, options: .prettyPrinted)
                if let jsonString = String(data: jsonData, encoding: .utf8) {
                    resolve(jsonString)
                } else {
                    throw "unable parse credentials"
                }
            } catch {
                reject("unknown_error", "could not parse credentials", error)
            }
            
        } else {
            reject("unauthorized", "invalid credentials provided", nil)
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

extension String: Error {}
