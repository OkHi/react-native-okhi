//
//  OkVerifyUtils.swift
//  Okhi
//
//  Created by Julius Kiano on 20/01/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import CoreLocation
import UIKit

struct OkVerifySignInAuthorization: Codable {
    let authorization_token: String
}

struct OkVerifyTransit: Codable {
    let status: String
}

class OkVerifyUtils {
    public static func fetchBearerToken(signInUrl: URL?, phoneNumber: String, accessToken: String, callback: @escaping (String?, OkVerifyError?) -> Void) {
        let params = [
            "scopes": ["verify"],
            "phone": phoneNumber
        ] as [String : Any]
        URLSession.shared.post(url: signInUrl, parameters: params, headerAuthorization: accessToken, expecting: OkVerifySignInAuthorization.self) { result in
            switch result {
            case .success(let result):
                callback("Bearer \(result.authorization_token)", nil)
            case .failure(let error):
                callback(nil, OkVerifyUtils.mapURLSessionError(error: error))
            }
        }
    }
    
    public static func mapURLSessionError(error: URLSession.NetworkRequestError) -> OkVerifyError {
        switch error {
        case .invalidUrl:
            return OkVerifyError.invalidUrl
        case .invalidData:
            return OkVerifyError.invalidData
        case .networkError:
            return OkVerifyError.networkError
        case .unknownError:
            return OkVerifyError.unknownError
        case .unableToParseResponse:
            return OkVerifyError.unableToParseResponse
        case .invalidPhoneNumber:
            return OkVerifyError.invalidPhoneNumber
        case .unauthorized:
            return OkVerifyError.unauthorized
        }
    }
    
    public static func transmitGeofenceTransition(
        url: URL,
        geofence: Geofence,
        location: CLLocation,
        transitionId: String,
        geoPointSource: OkVerifyGeoPointSource
    ) {
        let db = OkVerifyCoreDataManager()
        guard
            let userId = geofence.userId,
            let user = db.fetchUser(userId: userId),
            let token = user.bearerToken,
            let geofenceId = geofence.id,
            let originLatitude = geofence.latitude,
            let originLongitude = geofence.longitude,
            let geofenceRadius = geofence.radius
        else { return }
        let origin = CLLocation(latitude: originLatitude, longitude: originLongitude)
        let transition: OkVerifyGeofenceTransitionType = origin.distance(from: location) > Double(geofenceRadius) ? .exit : .enter
        OkVerifyUtils.transmitGeofenceTransition(
            url: url,
            bearerToken: token,
            location: location,
            transition: transition,
            geoPointSource: geoPointSource,
            locationId: geofenceId,
            transitionDate: Int(Date().timeIntervalSince1970 * 1000),
            transitionId: transitionId,
            save: false
        )
    }
    
    public static func transmitGeofenceTransition(
        url: URL,
        geofence: OkVerifyGeofence,
        location: CLLocation,
        transitionId: String,
        geoPointSource: OkVerifyGeoPointSource
    ) {
        let db = OkVerifyCoreDataManager()
        guard
            let userId = geofence.userId,
            let user = db.fetchUser(userId: userId),
            let token = user.bearerToken,
            let geofenceId = geofence.id
        else { return }
        let origin = CLLocation(latitude: geofence.latitude, longitude: geofence.longitude)
        let transition: OkVerifyGeofenceTransitionType = origin.distance(from: location) > Double(geofence.radius) ? .exit : .enter
        OkVerifyUtils.transmitGeofenceTransition(
            url: url,
            bearerToken: token,
            location: location,
            transition: transition,
            geoPointSource: geoPointSource,
            locationId: geofenceId,
            transitionDate: Int(Date().timeIntervalSince1970 * 1000),
            transitionId: transitionId,
            save: true
        )
    }
    
    public static func transmitGeofenceTransition(
        url: URL?,
        region: CLRegion,
        location: CLLocation,
        transition: OkVerifyGeofenceTransitionType,
        transitionId: String,
        geoPointSource: OkVerifyGeoPointSource
    ) {
        let db = OkVerifyCoreDataManager()
        let user = db.fetchUser(locationId: region.identifier)
        if let token = user?.bearerToken {
            OkVerifyUtils.transmitGeofenceTransition(
                url: url,
                bearerToken: token,
                location: location,
                transition: transition,
                geoPointSource: .geofence,
                locationId: region.identifier,
                transitionDate: Int(Date().timeIntervalSince1970 * 1000),
                transitionId: transitionId,
                save: true
            )
        }
    }
    
    public static func transmitGeofenceTransition(
        url: URL?,
        bearerToken: String,
        location: CLLocation,
        transition: OkVerifyGeofenceTransitionType,
        geoPointSource: OkVerifyGeoPointSource,
        locationId: String,
        transitionDate: Int,
        transitionId: String,
        save: Bool
    ) {
        let db = OkVerifyCoreDataManager()
        let params = [
            "transits": [[
                "ids": [
                    locationId
                ],
                "transition_date": transitionDate,
                "location_date": Int(location.timestamp.timeIntervalSince1970 * 1000),
                "geopoint_provider": "gps",
                "geo_point": [
                    "lat": location.coordinate.latitude,
                    "lon": location.coordinate.longitude
                ],
                "gps_accuracy": location.horizontalAccuracy,
                "transition_event": transition.rawValue,
                "geo_point_source": geoPointSource.rawValue,
                "device_os_name": "ios",
                "device_os_version": UIDevice.current.systemVersion,
                "device_manufacturer": "apple",
                "device_model": UIDevice.current.modelName,
                "transition_id": transitionId.lowercased()
            ]],
            "meta": [
                "lib": [
                    "name": "okverifyMobileIOS",
                    "version": "1.0.0"
                ]
            ]
        ] as [String : Any]
        URLSession.shared.post(url: url, parameters: params, headerAuthorization: bearerToken, expecting: OkVerifyTransit.self) { result in
            switch result {
            case .success(_):
                print("successfully uploaded transition.")
            case .failure(_):
                if save {
                    print("could not transmit transition. Saving for re-transmission.")
                    db.saveGeofenceTransition(
                        locationId: locationId,
                        transitionDate: transitionDate,
                        locationDate: Int(location.timestamp.timeIntervalSince1970),
                        latitude: location.coordinate.longitude,
                        longitude: location.coordinate.longitude,
                        accuracy: location.horizontalAccuracy,
                        transition: transition.rawValue,
                        geoPointSource: geoPointSource.rawValue,
                        transitionId: transitionId
                    )
                }
            }
        }
    }
    
    public static func transmitStoredGeofenceTransitions() {
        let db = OkVerifyCoreDataManager()
        let transitions = db.fetchAllGeofenceTransitions()
        for transit in transitions {
            if
                let locationId = transit.locationId,
                let user = db.fetchUser(locationId: locationId)
            {
                guard
                    let env = user.environment,
                    let token = user.bearerToken,
                    let locationId = transit.locationId,
                    let id = transit.id
                else { return }
                OkVerifyUtils.transmitGeofenceTransition(
                    url: OkVerifyUrl.fetchGeofenceTransitsUrl(environment: env),
                    bearerToken: token,
                    location: CLLocation(latitude: transit.latitude, longitude: transit.longitude),
                    transition: transit.transition == OkVerifyGeofenceTransitionType.exit.rawValue ? .exit : .enter,
                    geoPointSource: transit.geoPointSource == OkVerifyGeoPointSource.appOpen.rawValue ? .appOpen : .geofence,
                    locationId: locationId,
                    transitionDate: Int(transit.transitionDate * 1000),
                    transitionId: id,
                    save: false
                )
            }
        }
    }
}
