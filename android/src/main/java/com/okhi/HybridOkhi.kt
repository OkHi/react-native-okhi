package com.okhi

import com.margelo.nitro.okhi.HybridOkhiSpec

class HybridOkhi: HybridOkhiSpec() {    
    override fun sum(num1: Double, num2: Double): Double {
        return num1 + num2
    }
}
