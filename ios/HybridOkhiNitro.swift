//
//  HybridOkhiNitro.swift
//  Pods
//
//  Created by jgkiano on 12/19/2025.
//

import Foundation
import OkHi

class HybridOkhiNitro: HybridOkhiNitroSpec {
    func sum(num1: Double, num2: Double) throws -> Double {
        if OkVerify.isLocationServicesEnabled() {
            return 1.0
        }
        return 2.0
    }
}
