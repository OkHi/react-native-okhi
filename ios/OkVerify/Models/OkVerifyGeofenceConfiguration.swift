//
//  OkVerifyGeofenceConfiguration.swift
//  Okhi
//
//  Created by Julius Kiano on 20/01/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

struct OkVerifyGeofenceConfiguration: Codable {
    let set_dwell_transition_type: Bool
    let set_initial_triggers: Bool
    let register_on_device_restart: Bool
    let loitering_delay: Int
    let expiration: Int
    let radius: Int
    let notification_responsiveness: Int
}
