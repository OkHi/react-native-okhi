//
//  File.swift
//  react-native-okhi
//
//  Created by Julius Kiano on 01/09/2022.
//

import Foundation

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
