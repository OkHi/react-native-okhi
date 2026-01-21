package com.okhi

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = OkhiModule.NAME)
class OkhiModule(reactContext: ReactApplicationContext) :
  NativeOkhiSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  override fun login(credentials: ReadableMap?, callback: Callback?) {
    // TODO: Implement Android login
    callback?.invoke(null)
  }

  override fun startDigitalVerification(okcollect: ReadableMap?, callback: Callback?) {
    // TODO: Implement Android digital verification
    val error = Arguments.createMap().apply {
      putString("code", "not_implemented")
      putString("message", "Android not yet implemented")
    }
    callback?.invoke(null, error)
  }

  override fun startPhysicalVerification(okcollect: ReadableMap?, callback: Callback?) {
    // TODO: Implement Android physical verification
    val error = Arguments.createMap().apply {
      putString("code", "not_implemented")
      putString("message", "Android not yet implemented")
    }
    callback?.invoke(null, error)
  }

  override fun startDigitalAndPhysicalVerification(okcollect: ReadableMap?, callback: Callback?) {
    // TODO: Implement Android digital and physical verification
    val error = Arguments.createMap().apply {
      putString("code", "not_implemented")
      putString("message", "Android not yet implemented")
    }
    callback?.invoke(null, error)
  }

  override fun createAddress(okcollect: ReadableMap?, callback: Callback?) {
    // TODO: Implement Android create address
    val error = Arguments.createMap().apply {
      putString("code", "not_implemented")
      putString("message", "Android not yet implemented")
    }
    callback?.invoke(null, error)
  }

  companion object {
    const val NAME = "Okhi"
  }
}
