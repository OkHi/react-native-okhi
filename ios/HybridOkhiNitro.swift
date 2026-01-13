//
//  HybridOkhiNitro.swift
//  Pods
//
//  Created by jgkiano on 12/19/2025.
//

import Foundation
import React
import OkHi

class HybridOkhiNitro: HybridOkhiNitroSpec {
    func login(credentials: OkHiLogin, callback: @escaping ([String]?) -> Void) throws {
        var nativeAppContext: OkHi.OkHiAppContext? = nil
        if let appContext = credentials.appContext {
            nativeAppContext = OkHi.OkHiAppContext().withAppMeta(name: appContext.name, version: appContext.version, build: appContext.build)
        }
        
        let auth = OkHi.OkHiAuth(
            branchId: credentials.auth.branchId,
            clientKey: credentials.auth.clientKey,
            environment: credentials.auth.env ?? "prod",
            appContext: nativeAppContext
        )
        
        let user = OkHi.OkHiUser(phoneNumber: credentials.user.phone)
            .with(firstName: credentials.user.firstName)
            .with(lastName: credentials.user.lastName)
            .with(email: credentials.user.email)
            .with(appUserId: credentials.user.appUserId)
        
        OK.shared.login(auth: auth, user: user) { results in
            callback(results)
        }
    }
    
    func startAddressVerification(type: OkHiVerificationType, okcollect: NitroOkCollect, callback: @escaping (NitroOkHiSuccessResponse?, OkHiException?) -> Void) throws {
        DispatchQueue.main.async {
            var okhiLocation: OkHi.OkHiLocation? = nil
            
            if let locationId = okcollect.locationId {
                okhiLocation = OkHi.OkHiLocation(identifier: locationId)
            }
            
            guard let vc = RCTPresentedViewController() else {
                callback(nil, OkHiException(code: "unknown", message: "unable to retrive current view controller"))
                return
            }
            
            switch type {
            case .digital:
                self.startDigitalAddressVerification(vc: vc, okhiLocation: okhiLocation, okcollect: okcollect, callback: callback)
            case .physical:
                self.startPhysicalAddressVerification(vc: vc, okhiLocation: okhiLocation, okcollect: okcollect, callback: callback)
            case .digitalandphysical:
                self.startDigitalAndPhysicalAddressVerification(vc: vc, okhiLocation: okhiLocation, okcollect: okcollect, callback: callback)
            case .addressbook:
                self.createAddress(vc: vc, okhiLocation: okhiLocation, okcollect: okcollect, callback: callback)
            default:
                callback(nil, OkHiException(code: "unknown", message: "unknown selection"))
            }
        }
        
        
    }
    
    private func createAddress(vc: UIViewController, okhiLocation: OkHi.OkHiLocation?, okcollect: NitroOkCollect, callback: @escaping (NitroOkHiSuccessResponse?, OkHiException?) -> Void) {
        OK.shared.createAddress(
            vc: vc,
            theme: self.parseNitroOkCollect(okcollect: okcollect),
            config: self.parseNitroOkCollect(okcollect: okcollect),
        ) { [weak self] response, error in
            guard let self = self else { return }
            self.processResponse(response: response, error: error, callback: callback)
        }
    }
    
    private func startDigitalAndPhysicalAddressVerification(vc: UIViewController, okhiLocation: OkHi.OkHiLocation?, okcollect: NitroOkCollect, callback: @escaping (NitroOkHiSuccessResponse?, OkHiException?) -> Void) {
        OK.shared.startDigitalAndPhysicalAddressVerification(
            vc: vc,
            theme: self.parseNitroOkCollect(okcollect: okcollect),
            config: self.parseNitroOkCollect(okcollect: okcollect),
            location: okhiLocation
        ) { [weak self] response, error in
            guard let self = self else { return }
            self.processResponse(response: response, error: error, callback: callback)
        }
    }
    
    private func startPhysicalAddressVerification(vc: UIViewController, okhiLocation: OkHi.OkHiLocation?, okcollect: NitroOkCollect, callback: @escaping (NitroOkHiSuccessResponse?, OkHiException?) -> Void) {
        OK.shared.startPhysicalAddressVerification(
            vc: vc,
            theme: self.parseNitroOkCollect(okcollect: okcollect),
            config: self.parseNitroOkCollect(okcollect: okcollect),
            location: okhiLocation
        ) { [weak self] response, error in
            guard let self = self else { return }
            self.processResponse(response: response, error: error, callback: callback)
        }
    }
    
    private func startDigitalAddressVerification(vc: UIViewController, okhiLocation: OkHi.OkHiLocation?, okcollect: NitroOkCollect, callback: @escaping (NitroOkHiSuccessResponse?, OkHiException?) -> Void) {
        OK.shared.startAddressVerification(
            vc: vc,
            theme: self.parseNitroOkCollect(okcollect: okcollect),
            config: self.parseNitroOkCollect(okcollect: okcollect),
            location: okhiLocation
        ) { [weak self] response, error in
            guard let self = self else { return }
            self.processResponse(response: response, error: error, callback: callback)
        }
    }
    
    private func processResponse(response: OkHi.OkHiSuccessResponse?, error: OkHi.OkHiException?, callback: @escaping (NitroOkHiSuccessResponse?, OkHiException?) -> Void) {
        if let response = response, let user = response.user.toJSON(), let location = response.location.toJSON() {
            let successResponse = NitroOkHiSuccessResponse(user: user, location: location)
            callback(successResponse, nil)
        } else if let error = error {
            callback(nil, OkHiException(code: error.code, message: error.message ?? "unable to start verification"))
        } else {
            callback(nil, OkHiException(code: "unknown", message: "unable to parse verification response"))
        }
    }
    
    private func parseNitroOkCollect(okcollect: NitroOkCollect) -> OkHi.OkHiTheme {
        return OkHiTheme().with(appBarColor: okcollect.style.color).with(logoUrl: okcollect.style.logo).with(primaryColor: okcollect.style.color)
    }
    
    private func parseNitroOkCollect(okcollect: NitroOkCollect) -> OkHi.OkHiConfig {
        var config = OkHiConfig()
            .withAddressTypes(
                work: okcollect.configuration.withWorkAddressType,
                home: okcollect.configuration.withHomeAddressType
            )
        if okcollect.configuration.streetView {
            config = config.enableStreetView()
        }
        return config
    }
    
    func sum(num1: Double, num2: Double) throws -> Double {
        if OkVerify.isLocationServicesEnabled() {
            return 1.0
        }
        return 2.0
    }
}
