import UIKit
import CoreLocation

@objc(Okhi)
class Okhi: NSObject {
    private var locationPermissionRequestType: OkVerifyLocationPermissionRequestType?
    private var resolve: RCTPromiseResolveBlock?
    private var reject: RCTPromiseRejectBlock?
    private var okVerify: OkVerify
    
    override init() {
        okVerify = OkVerify()
        super.init()
        okVerify.delegate = self
    }
    
    @objc static func requiresMainQueueSetup() -> Bool {
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
    
    @objc func requestLocationPermission(_ resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        self.resolve = resolve
        locationPermissionRequestType = .whenInUse
        okVerify.requestLocationPermission()
    }
    
    @objc func requestBackgroundLocationPermission(_ resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        self.resolve = resolve
        locationPermissionRequestType = .always
        okVerify.requestBackgroundLocationPermission()
    }
    
    @objc func requestEnableLocationServices(_ resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        OkVerify.openAppSettings()
        resolve(NSNull())
    }
    
    @objc func getAuthToken(_ branchId: String, clientKey: String, resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        resolve("Token " + "\(branchId):\(clientKey)".toBase64())
    }
    
    @objc func initializeIOS(_ branchId: String, clientKey: String, environment: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        self.resolve = resolve
        self.reject = reject
        okVerify.initialize(branchId: branchId, clientKey: clientKey, environment: environment)
    }
    
    @objc func startAddressVerification(_ phoneNumber: String, locationId: String, lat: Double, lon: Double, resolve:@escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        self.resolve = resolve
        self.reject = reject
        okVerify.startAddressVerification(phoneNumber: phoneNumber, locationId: locationId, lat: lat, lon: lon)
    }
    
    @objc func stopAddressVerification(_ phoneNumber: String, locationId: String, resolve:@escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        self.resolve = resolve
        self.reject = reject
        okVerify.stopAddressVerification(locationId: locationId)
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
}

// MARK: - OkVerify Delegates
extension Okhi: OkVerifyDelegate {
    func didStopVerification(_ okverify: OkVerify, locationId: String) {
        guard let resolve = resolve else { return }
        resolve(locationId)
        self.resolve = nil
    }
    
    func didStartAddressVerification(_ okverify: OkVerify, locationId: String) {
        guard let resolve = resolve else { return }
        resolve(locationId)
        self.resolve = nil
    }
    
    func didInitialize(_ okverify: OkVerify) {
        guard let resolve = resolve else { return }
        resolve(true)
        self.resolve = nil
    }
    
    func didEncounterError(_ okverify: OkVerify, error: OkVerifyError?) {
        guard let reject = reject else { return }
        reject(error?.code, error?.message, error)
        self.reject = nil
    }
    
    func didChangeLocationPermissionStatus(_ okverify: OkVerify, locationPermissionRequestType: OkVerifyLocationPermissionRequestType, status: Bool) {
        if let request = self.locationPermissionRequestType, let resolve = self.resolve {
            if locationPermissionRequestType == request {
                resolve(status)
                self.resolve = nil
            }
        }
    }
}
