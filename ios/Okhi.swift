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
