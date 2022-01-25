//
//  Enums.swift
//  Okhi
//
//  Created by Julius Kiano on 21/01/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

enum OkVerifyLocationPermissionRequestType {
    case whenInUse
    case always
}

enum OkVerifyEnvironment: String {
    case prod = "prod"
    case sandbox = "sandbox"
    case dev = "dev"
}

enum OkVerifyGeoPointSource: String {
    case appOpen = "appOpen"
    case geofence = "geofence"
}

enum OkVerifyGeofenceTransitionType: String {
    case enter = "enter"
    case exit = "exit"
}
