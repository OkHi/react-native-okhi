//
//  OkVerify.swift
//  Okhi
//
//  Created by Julius Kiano on 17/01/2022.
//

import UIKit
import CoreLocation

protocol OkVerifyDelegate {
    func didChangeLocationPermissionStatus(_ okverify: OkVerify, locationPermissionRequestType: OkVerifyLocationPermissionRequestType, status: Bool)
    func didInitialize(_ okverify: OkVerify)
    func didEncounterError(_ okverify: OkVerify, error: OkVerifyError?)
    func didStartAddressVerification(_ okverify: OkVerify, locationId: String)
    func didStopVerification(_ okverify: OkVerify, locationId: String)
}

class Geofence: NSObject {
    public var latitude: Double?
    public var id: String?
    public var longitude: Double?
    public var radius: Double?
    public var userId: String?
}

class User: NSObject {
    public var accessToken: String?
    public var bearerToken: String?
    public var environment: String?
    public var phoneNumber: String?
    public var id: String?
}

@objc public class OkVerify: NSObject {
    var delegate:OkVerifyDelegate?
    private var locationPermissionRequestType: OkVerifyLocationPermissionRequestType?
    
    // okverify auth values
    private var branchId: String?
    private var clientKey: String?
    private var environment: String?
    private var accessToken: String?
    
    // urls
    private var anonymusSignInUrl: URL?
    private var geofenceConfigurationUrl: URL?
    private var geofenceTransitsUrl: URL?
    
    // configuration
    private var geofenceConfiguration: OkVerifyGeofenceConfiguration?
    
    // core location
    private let coreLocationManager: CLLocationManager
    
    // geofence
    private var currentGeofence: Geofence
    
    // user
    private var currentUser: User
    
    // core data
    private let okverifyCoreDataManager: OkVerifyCoreDataManager
    
    @objc public override init() {
        coreLocationManager = CLLocationManager()
        okverifyCoreDataManager = OkVerifyCoreDataManager()
        currentGeofence = Geofence()
        currentUser = User()
        coreLocationManager.desiredAccuracy = kCLLocationAccuracyBest
        coreLocationManager.activityType = .other
        coreLocationManager.allowsBackgroundLocationUpdates = true
        coreLocationManager.pausesLocationUpdatesAutomatically = false
        super.init()
        coreLocationManager.delegate = self
    }
}

// MARK: - OkVerify Public API Methods
extension OkVerify {
    public func initialize(branchId: String, clientKey: String, environment: String) {
        self.branchId = branchId
        self.clientKey = clientKey
        self.environment = environment
        self.accessToken = "Token " + "\(branchId):\(clientKey)".toBase64()
        if environment == OkVerifyEnvironment.prod.rawValue {
            self.anonymusSignInUrl = OkVerifyUrl.prodAnonymusSignInUrl
            self.geofenceConfigurationUrl = OkVerifyUrl.prodGeofenceConfigurationUrl
            self.geofenceTransitsUrl = OkVerifyUrl.prodGeofenceTransitsUrl
        } else if environment == OkVerifyEnvironment.dev.rawValue {
            self.anonymusSignInUrl = OkVerifyUrl.devAnonymusSignInUrl
            self.geofenceConfigurationUrl = OkVerifyUrl.devGeofenceConfigurationUrl
            self.geofenceTransitsUrl = OkVerifyUrl.devGeofenceTransitsUrl
        } else {
            self.anonymusSignInUrl = OkVerifyUrl.sandboxAnonymusSignInUrl
            self.geofenceConfigurationUrl = OkVerifyUrl.sandboxGeofenceConfigurationUrl
            self.geofenceTransitsUrl = OkVerifyUrl.sandboxGeofenceTransitsUrl
        }
        fetchGeofenceConfiguration()
    }
    
    public func initialize(branchId: String, clientKey: String) {
        self.initialize(branchId: branchId, clientKey: clientKey, environment: "sandbox")
    }
    
    @objc public func startMonitoring() {
        OkVerifyUtils.transmitStoredGeofenceTransitions()
        if OkVerify.getLocationAuthorizationStatus(clManager: coreLocationManager) == .authorizedAlways {
            let geofences = okverifyCoreDataManager.fetchAllGeofences()
            for geofence in geofences {
                if let geofenceId = geofence.id {
                    let center = CLLocationCoordinate2D(latitude: geofence.latitude, longitude: geofence.longitude)
                    let region = CLCircularRegion(center: center, radius: geofence.radius, identifier: geofenceId)
                    coreLocationManager.startMonitoring(for: region)
                }
            }
        }
    }
    
    public func startAddressVerification(phoneNumber: String, locationId: String, lat: Double, lon: Double) {
        if !isLocationServicesEnabled() {
            delegate?.didEncounterError(self, error: .serviceUnavailable)
            return
        }
        if !isBackgroundLocationPermissionGranted() {
            delegate?.didEncounterError(self, error: .permissionDenied)
            return
        }
        let existingGeofence = okverifyCoreDataManager.fetchGeofence(locationId: locationId)
        if (existingGeofence != nil) {
            delegate?.didEncounterError(self, error: .inVerification)
            return
        }
        guard let token = accessToken else {
            delegate?.didEncounterError(self, error: .unauthorized)
            return
        }
        OkVerifyUtils.fetchBearerToken(signInUrl: anonymusSignInUrl, phoneNumber: phoneNumber, accessToken: token) { [weak self] bearerToken, error in
            guard let this = self else { return }
            if error != nil {
                this.delegate?.didEncounterError(this, error: error)
            }
            guard let bearerToken = bearerToken else { return }
            this.currentUser.id = UUID().uuidString.lowercased()
            this.currentUser.phoneNumber = phoneNumber
            this.currentUser.bearerToken = bearerToken
            this.currentUser.accessToken = this.accessToken
            this.currentUser.environment = this.environment
            let _ = this.okverifyCoreDataManager.saveUser(user: this.currentUser)
            this.startGeofenceMonitoring(locationId: locationId, lat: lat, lon: lon)
        }
    }
    
    public func stopAddressVerification(locationId: String) {
        if let geofence = okverifyCoreDataManager.fetchGeofence(locationId: locationId) {
            let center = CLLocationCoordinate2D(latitude: geofence.latitude, longitude: geofence.longitude)
            let region = CLCircularRegion(center: center, radius: geofence.radius, identifier: locationId)
            coreLocationManager.stopMonitoring(for: region)
            okverifyCoreDataManager.deleteGeofence(locationId: locationId)
            delegate?.didStopVerification(self, locationId: locationId)
        }
    }
    
    private func startGeofenceMonitoring(locationId: String, lat: Double, lon: Double) {
        guard let config = geofenceConfiguration else { return }
        let center = CLLocationCoordinate2D(latitude: lat, longitude: lon)
        let region = CLCircularRegion(center: center, radius: Double(config.radius), identifier: locationId)
        region.notifyOnExit = true
        region.notifyOnEntry = true
        currentGeofence.userId = currentUser.id
        currentGeofence.id = locationId
        currentGeofence.longitude = lon
        currentGeofence.latitude = lat
        currentGeofence.radius = Double(config.radius)
        coreLocationManager.startMonitoring(for: region)
    }
    
    // OkVerify Helpers
    public func isLocationPermissionGranted() -> Bool {
        let status = OkVerify.getLocationAuthorizationStatus(clManager: coreLocationManager)
        return status == .authorizedWhenInUse || status == .authorizedAlways
    }
    
    public func isBackgroundLocationPermissionGranted() -> Bool {
        return OkVerify.getLocationAuthorizationStatus(clManager: coreLocationManager) == .authorizedAlways
    }
    
    public func isLocationServicesEnabled() -> Bool {
        return CLLocationManager.locationServicesEnabled()
    }
    
    public static func openAppSettings() -> Void {
        if #available(iOS 10.0, *) {
            DispatchQueue.main.async {
                UIApplication.shared.open(URL(string:UIApplication.openSettingsURLString)!)
            }
        }
    }
}

// MARK: - OkVerify Network Requests
extension OkVerify {
    private func fetchGeofenceConfiguration() {
        if let url = geofenceConfigurationUrl, let token = accessToken {
            URLSession.shared.get(url: url, headerAuthorization: token, expecting: OkVerifyGeofenceConfiguration.self) { [weak self] result in
                switch result {
                case .success(let configuraion):
                    guard let self = self else { return }
                    self.geofenceConfiguration = configuraion
                    if OkVerify.getLocationAuthorizationStatus(clManager: self.coreLocationManager) == .authorizedAlways || OkVerify.getLocationAuthorizationStatus(clManager: self.coreLocationManager) == .authorizedWhenInUse {
                        if let cachedLocation = self.coreLocationManager.location {
                            let delta = Date().timeIntervalSince(cachedLocation.timestamp)
                            if delta < 600 {
                                self.handleDidUpdateLocations(
                                    manager: self.coreLocationManager,
                                    location: cachedLocation,
                                    transitionId: UUID().uuidString.lowercased()
                                )
                                print("using cached location..")
                            } else {
                                self.coreLocationManager.requestLocation()
                            }
                        } else {
                            self.coreLocationManager.requestLocation()
                        }
                    }
                    self.delegate?.didInitialize(self)
                    OkVerifyUtils.transmitStoredGeofenceTransitions()
                case .failure(let error):
                    guard let self = self else { return }
                    self.delegate?.didEncounterError(self, error: OkVerifyUtils.mapURLSessionError(error: error))
                }
            }
        }
    }
}

// MARK: - Request Helpers
extension OkVerify {
    public func requestLocationPermission() {
        if !isLocationServicesEnabled() {
            delegate?.didChangeLocationPermissionStatus(self, locationPermissionRequestType: .whenInUse, status: false)
        } else if OkVerify.getLocationAuthorizationStatus(clManager: coreLocationManager) == .authorizedWhenInUse {
            delegate?.didChangeLocationPermissionStatus(self, locationPermissionRequestType: .whenInUse, status: true)
        } else {
            locationPermissionRequestType = .whenInUse
            coreLocationManager.requestWhenInUseAuthorization()
        }
    }
    
    public func requestBackgroundLocationPermission() {
        if !isLocationServicesEnabled() {
            delegate?.didChangeLocationPermissionStatus(self, locationPermissionRequestType: .always, status: false)
        } else if OkVerify.getLocationAuthorizationStatus(clManager: coreLocationManager) == .authorizedAlways {
            delegate?.didChangeLocationPermissionStatus(self, locationPermissionRequestType: .always, status: true)
        } else {
            locationPermissionRequestType = .always
            coreLocationManager.requestWhenInUseAuthorization()
        }
    }
}

// MARK: - Utils
extension OkVerify {
    private static func getLocationAuthorizationStatus(clManager: CLLocationManager) -> CLAuthorizationStatus {
        if #available(iOS 14.0, *) {
            return clManager.authorizationStatus
        } else {
            return CLLocationManager.authorizationStatus()
        }
    }
    
    private func handleAuthorizationStatusChange(manager: CLLocationManager) {
        guard let delegate = self.delegate, let locationPermissionRequestType = self.locationPermissionRequestType else { return }
        if #available(iOS 14.0, *) {
            if manager.accuracyAuthorization != .fullAccuracy {
                delegate.didChangeLocationPermissionStatus(self, locationPermissionRequestType: locationPermissionRequestType, status: false)
                self.locationPermissionRequestType = nil
                return
            }
        }
        if locationPermissionRequestType == .whenInUse {
            if OkVerify.getLocationAuthorizationStatus(clManager: manager) == .authorizedWhenInUse {
                delegate.didChangeLocationPermissionStatus(self, locationPermissionRequestType: locationPermissionRequestType, status: true)
            } else {
                delegate.didChangeLocationPermissionStatus(self, locationPermissionRequestType: locationPermissionRequestType, status: false)
            }
        } else if locationPermissionRequestType == .always {
            if OkVerify.getLocationAuthorizationStatus(clManager: manager) == .authorizedWhenInUse {
                manager.requestAlwaysAuthorization()
            } else if OkVerify.getLocationAuthorizationStatus(clManager: manager) == .authorizedAlways {
                delegate.didChangeLocationPermissionStatus(self, locationPermissionRequestType: locationPermissionRequestType, status: true)
            } else {
                delegate.didChangeLocationPermissionStatus(self, locationPermissionRequestType: locationPermissionRequestType, status: false)
            }
        }
    }
}

// MARK: - OkVerify Core Location Handlers
extension OkVerify {
    func handleDidStartMonitoringFor(manager: CLLocationManager, region: CLRegion) {
        if currentGeofence.id != nil {
            okverifyCoreDataManager.saveGeofence(geofence: currentGeofence)
            if OkVerify.getLocationAuthorizationStatus(clManager: coreLocationManager) == .authorizedWhenInUse || OkVerify.getLocationAuthorizationStatus(clManager: coreLocationManager) == .authorizedAlways {
                manager.requestLocation()
            }
            delegate?.didStartAddressVerification(self, locationId: region.identifier)
        }
    }
    
    func handleDidFailWithError(manager: CLLocationManager, error: Error) {
        if let clErr = error as? CLError {
            switch clErr {
            case CLError.regionMonitoringFailure:
                delegate?.didEncounterError(self, error: .addressVerificationFailure)
            case CLError.regionMonitoringDenied:
                delegate?.didEncounterError(self, error: .addressVerificationDenied)
            case CLError.denied:
                delegate?.didEncounterError(self, error: .denied)
            case CLError.network:
                delegate?.didEncounterError(self, error: .networkError)
            default:
                delegate?.didEncounterError(self, error: .unknownError)
            }
        } else {
            delegate?.didEncounterError(self, error: .unknownError)
        }
    }
    
    func handleDidUpdateLocations(manager: CLLocationManager, location: CLLocation, transitionId: String) {
        if let url = geofenceTransitsUrl {
            if currentGeofence.id != nil {
                OkVerifyUtils.transmitGeofenceTransition(
                    url: url,
                    geofence: currentGeofence,
                    location: location,
                    transitionId: transitionId,
                    geoPointSource: .appOpen
                )
            } else {
                let geofences = okverifyCoreDataManager.fetchAllGeofences()
                for geofence in geofences {
                    OkVerifyUtils.transmitGeofenceTransition(
                        url: url,
                        geofence: geofence,
                        location: location,
                        transitionId: transitionId,
                        geoPointSource: .appOpen
                    )
                }
            }
        }
    }
    
    func handleRegionLocationUpdate(manager: CLLocationManager, region: CLRegion, transition: OkVerifyGeofenceTransitionType, transitionId: String) {
        let user = okverifyCoreDataManager.fetchUser(locationId: region.identifier)
        if let environment = user?.environment {
            let url = OkVerifyUrl.fetchGeofenceTransitsUrl(environment: environment)
            if let location = manager.location{
                OkVerifyUtils.transmitGeofenceTransition(
                    url: url,
                    region: region,
                    location: location,
                    transition: transition,
                    transitionId: transitionId,
                    geoPointSource: .geofence
                )
            }
        }
    }
}


// MARK: - Core Location
extension OkVerify: CLLocationManagerDelegate {
    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        handleAuthorizationStatusChange(manager: manager)
    }
    public func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        handleAuthorizationStatusChange(manager: manager)
    }
    public func locationManager(_ manager: CLLocationManager, didStartMonitoringFor region: CLRegion) {
        handleDidStartMonitoringFor(manager: manager, region: region)
    }
    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        handleDidFailWithError(manager: manager, error: error)
    }
    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        if let location = locations.last {
            handleDidUpdateLocations(manager: manager, location: location, transitionId: UUID().uuidString)
        }
    }
    public func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
        handleRegionLocationUpdate(manager: manager, region: region, transition: .enter, transitionId: UUID().uuidString)
    }
    public func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
        handleRegionLocationUpdate(manager: manager, region: region, transition: .exit, transitionId: UUID().uuidString)
    }
}
