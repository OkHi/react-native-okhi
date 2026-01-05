package com.okhinitro

import com.margelo.nitro.NitroModules
import com.margelo.nitro.okhinitro.HybridOkhiNitroSpec
import io.okhi.android_core.OkHi

class HybridOkhiNitro: HybridOkhiNitroSpec() {    
    override fun sum(num1: Double, num2: Double): Double {

        NitroModules.applicationContext?.let {
            if (OkHi.isLocationServicesEnabled(it)) {
                return 1.0
            }
            return 2.0
        }
        return 3.0
    }
}
