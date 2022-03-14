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
    private var okVerify: OkVerify
    
    
    override init() {
        okVerify = OkVerify()
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
    
    @objc func requestLocationPermission(_ resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        self.resolve = resolve
        currentLocationPermissionRequestType = .whenInUse
        okVerify.requestLocationPermission()
    }
    
    @objc func requestBackgroundLocationPermission(_ resolve:@escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        self.resolve = resolve
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
        okVerify.initialize(with: branchId, clientKey: clientKey, environment: environment)
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
    
    @objc func retriveLocationPermissionStatus(_ resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
        let manager = CLLocationManager()
        let status = fetchLocationPermissionStatus(status: getLocationAuthorizationStatus(manager: manager))
        resolve(status)
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
    func verify(_ okverify: OkVerify, didUpdateLocationPermissionStatus status: CLAuthorizationStatus) {
        sendEvent(withName: "onLocationPermissionStatusUpdate", body: fetchLocationPermissionStatus(status: status))
    }
    
    func verify(_ okverify: OkVerify, didChangeLocationPermissionStatus requestType: OkVerifyLocationPermissionRequestType, status: Bool) {
        if let resolve = self.resolve {
            if currentLocationPermissionRequestType == .whenInUse && requestType == .whenInUse {
                resolve(status)
            } else if currentLocationPermissionRequestType == .always && requestType == .always {
                resolve(status)
            } else {
                resolve(false)
            }
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
}
