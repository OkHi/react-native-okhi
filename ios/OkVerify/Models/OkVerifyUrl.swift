//
//  OkVerifyUrls.swift
//  Okhi
//
//  Created by Julius Kiano on 20/01/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

struct OkVerifyUrl {
    static let devAnonymusSignInUrl = URL(string: "https://dev-api.okhi.io/v5/auth/anonymous-signin")
    static let sandboxAnonymusSignInUrl = URL(string: "https://sandbox-api.okhi.io/v5/auth/anonymous-signin")
    static let prodAnonymusSignInUrl = URL(string: "https://api.okhi.io/v5/auth/anonymous-signin")
    
    static let devGeofenceConfigurationUrl = URL(string: "https://dev-api.okhi.io/v5/verify/config")
    static let sandboxGeofenceConfigurationUrl = URL(string: "https://sandbox-api.okhi.io/v5/verify/config")
    static let prodGeofenceConfigurationUrl = URL(string: "https://api.okhi.io/v5/verify/config")
    
    static let devGeofenceTransitsUrl = URL(string: "https://dev-api.okhi.io/v5/users/transits")
    static let sandboxGeofenceTransitsUrl = URL(string: "https://sandbox-api.okhi.io/v5/users/transits")
    static let prodGeofenceTransitsUrl = URL(string: "https://api.okhi.io/v5/users/transits")
    
    static func fetchGeofenceTransitsUrl(environment: String) -> URL? {
        if environment == "dev" {
            return OkVerifyUrl.devGeofenceTransitsUrl
        }
        if environment == "prod" {
            return OkVerifyUrl.prodGeofenceTransitsUrl
        }
        return OkVerifyUrl.sandboxGeofenceTransitsUrl
    }
}
