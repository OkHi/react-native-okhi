//
//  Extensions.swift
//  Okhi
//
//  Created by Julius Kiano on 20/01/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import UIKit

// MARK: - Extensions
extension URLSession {
    enum NetworkRequestError: Error {
        case invalidUrl
        case invalidData
        case networkError
        case unknownError
        case unableToParseResponse
        case invalidPhoneNumber
        case unauthorized
    }
    
    func get<T: Codable>(url: URL?, headerAuthorization: String?, expecting: T.Type, completion: @escaping (Result<T, NetworkRequestError>) -> Void) {
        guard let url = url else {
            completion(.failure(NetworkRequestError.invalidUrl))
            return
        }
        var request = URLRequest(url: url)
        if headerAuthorization != nil {
            request.setValue(headerAuthorization, forHTTPHeaderField: "authorization")
        }
        let task = self.dataTask(with: request) { data, response, error in
            if error != nil {
                completion(.failure(NetworkRequestError.networkError))
                return
            }
            guard let response = response as? HTTPURLResponse else {
                completion(.failure(NetworkRequestError.networkError))
                return
            }
            guard let data = data else {
                completion(.failure(NetworkRequestError.unknownError))
                return
            }
            if (200...299).contains(response.statusCode) {
                do {
                    let result = try JSONDecoder().decode(expecting, from: data)
                    completion(.success(result))
                } catch {
                    completion(.failure(NetworkRequestError.unableToParseResponse))
                }
            } else if response.statusCode == 400 {
                completion(.failure(NetworkRequestError.invalidPhoneNumber))
            } else if response.statusCode == 401 {
                completion(.failure(NetworkRequestError.unauthorized))
            } else {
                completion(.failure(NetworkRequestError.unknownError))
            }
        }
        task.resume()
    }
    
    func post<T: Codable>(url: URL?, parameters: [String: Any], headerAuthorization: String?, expecting: T.Type, completion: @escaping (Result<T, NetworkRequestError>) -> Void) {
        guard let url = url else {
            completion(.failure(NetworkRequestError.invalidUrl))
            return
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        if headerAuthorization != nil {
            request.setValue(headerAuthorization, forHTTPHeaderField: "authorization")
        }
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: parameters)
            print("REQUEST BODY: \(NSString(data: request.httpBody!, encoding: String.Encoding.ascii.rawValue)!)")
        } catch {
            completion(.failure(NetworkRequestError.invalidData))
            return
        }
        let task = self.dataTask(with: request) { data, response, error in
            if error != nil {
                completion(.failure(NetworkRequestError.networkError))
                return
            }
            guard let response = response as? HTTPURLResponse else {
                completion(.failure(NetworkRequestError.networkError))
                return
            }
            guard let data = data else {
                completion(.failure(NetworkRequestError.unknownError))
                return
            }
            print("RESPONSE BODY: \(NSString(data: data, encoding: String.Encoding.ascii.rawValue)!)")
            if (200...299).contains(response.statusCode) {
                do {
                    let result = try JSONDecoder().decode(expecting, from: data)
                    completion(.success(result))
                } catch {
                    completion(.failure(NetworkRequestError.unableToParseResponse))
                }
            } else if response.statusCode == 400 {
                completion(.failure(NetworkRequestError.invalidPhoneNumber))
            } else if response.statusCode == 401 {
                completion(.failure(NetworkRequestError.unauthorized))
            } else {
                completion(.failure(NetworkRequestError.unknownError))
            }
        }
        task.resume()
    }
    
    func getErrorCode(error: NetworkRequestError) -> String {
        switch error {
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
        }
    }
    
    func getErrorMessage(error: NetworkRequestError) -> String {
        switch error {
        case .invalidUrl:
            return "invalid url"
        case .invalidData:
            return "invalid data received from server"
        case .networkError:
            return "unable to reach okhi servers"
        case .unknownError:
            return "something has gone wrong"
        case .unableToParseResponse:
            return "unable to parse server response"
        case .invalidPhoneNumber:
            return "invalid phone number provided"
        case .unauthorized:
            return "unauthorized"
        }
    }
}

extension UIDevice {
    var modelName: String {
        var systemInfo = utsname()
        uname(&systemInfo)
        let machineMirror = Mirror(reflecting: systemInfo.machine)
        let identifier = machineMirror.children.reduce("") { identifier, element in
            guard let value = element.value as? Int8, value != 0 else { return identifier }
            return identifier + String(UnicodeScalar(UInt8(value)))
        }
        return identifier
    }
}
