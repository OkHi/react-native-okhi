//
//  OkVerifyError.swift
//  Okhi
//
//  Created by Julius Kiano on 21/01/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

enum OkVerifyError: Error {
    case invalidUrl
    case invalidData
    case networkError
    case unknownError
    case unableToParseResponse
    case invalidPhoneNumber
    case unauthorized
    case addressVerificationFailure
    case addressVerificationDenied
    case denied
    case inVerification
    case permissionDenied
    case serviceUnavailable
}

extension OkVerifyError: LocalizedError {
    public var message: String {
        switch self {
        case .invalidUrl:
            return NSLocalizedString("URL provided is invalid", comment: "Invalid URL")
        case .invalidData:
            return NSLocalizedString("Data received is invalid", comment: "Invalid data")
        case .networkError:
            return NSLocalizedString("Could not reach OkHi servers", comment: "Network error")
        case .unknownError:
            return NSLocalizedString("Something went wrong", comment: "Unknown error")
        case .unableToParseResponse:
            return NSLocalizedString("Unable to parse response", comment: "Unable to parse response")
        case .invalidPhoneNumber:
            return NSLocalizedString("Invalid phone number provided", comment: "Invalid phone number")
        case .unauthorized:
            return NSLocalizedString("Invalid credentials", comment: "Unauthorized")
        case .addressVerificationFailure:
            return NSLocalizedString("Unable to start address verification", comment: "Address verification faliure")
        case .denied:
            return NSLocalizedString("User denied address verification", comment: "User denied")
        case .addressVerificationDenied:
            return NSLocalizedString("User denied address verification", comment: "User denied")
        case .inVerification:
            return NSLocalizedString("Address is already being verified", comment: "Address already in verification")
        case .permissionDenied:
            return NSLocalizedString("Required location permission is not granted", comment: "Permission denied")
        case .serviceUnavailable:
            return NSLocalizedString("Location services unavailable", comment: "Location services unavailable")
        }
    }
    public var code: String {
        switch self {
        case .invalidUrl:
            return "invalid_url"
        case .invalidData:
            return "invalid_data"
        case .networkError:
            return "network_error"
        case .unknownError:
            return "unknown_error"
        case .unableToParseResponse:
            return "unable_to_parse_response"
        case .invalidPhoneNumber:
            return "invalid_phone"
        case .unauthorized:
            return "unauthorized"
        case .addressVerificationFailure:
            return "address_verification_failure"
        case .denied:
            return "denied"
        case .permissionDenied:
            return "permission_denied"
        case .serviceUnavailable:
            return "service_unavailable"
        case .addressVerificationDenied:
            return "address_verification_denied"
        case .inVerification:
            return "in_verification"
        }
    }
}
