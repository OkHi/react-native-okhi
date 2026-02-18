package com.okhi

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import io.okhi.android.OkHi
import io.okhi.android.collect.OkCollect
import io.okhi.android.collect.OkCollectConfig
import io.okhi.android.collect.OkCollectStyle
import io.okhi.android.collect.models.OkHiSuccessResponse
import io.okhi.android.core.interfaces.OkHiAddressVerificationCallback
import io.okhi.android.core.model.OkHiAuth
import io.okhi.android.core.model.OkHiException
import io.okhi.android.core.model.OkHiLocation
import io.okhi.android.core.model.OkHiUser

@ReactModule(name = OkhiModule.NAME)
class OkhiModule(reactContext: ReactApplicationContext) : NativeOkhiSpec(reactContext) {
  var currentCallback: Callback? = null

  val okhiAddressVerificationCallback = object : OkHiAddressVerificationCallback() {
    override fun onClose() {
      val error = Arguments.createMap().apply {
        putString("code", "user_closed")
        putString("message", "user closed address creation")
      }
      currentCallback?.invoke(null, error)
    }

    override fun onError(e: OkHiException) {
      val error = Arguments.createMap().apply {
        putString("code", e.code)
        putString("message", e.message)
      }
      currentCallback?.invoke(null, error)
    }

    override fun onSuccess(response: OkHiSuccessResponse) {
      val response = Arguments.createMap().apply {
        putString("user", response.user.toJSON().toString())
        putString("location", response.location.toJSON().toString())
      }
      currentCallback?.invoke(response, null)
    }
  }

  override fun getName(): String {
    return NAME
  }

  override fun login(credentials: ReadableMap?, callback: Callback?) {
    if (credentials == null) {
      callback?.invoke(null)
      return
    }

    val authMap = credentials.getMap("auth")
    val userMap = credentials.getMap("user")

    if (authMap == null || userMap == null) {
      callback?.invoke(null)
      return
    }

    val branchId = authMap.getString("branchId") ?: ""
    val clientKey = authMap.getString("clientKey") ?: ""
    val env = authMap.getString("env") ?: "prod"

    val phone = userMap.getString("phone") ?: ""
    val firstName = userMap.getString("firstName") ?: ""
    val lastName = userMap.getString("lastName") ?: ""
    val email = userMap.getString("email") ?: ""
    val appUserId = if (userMap.hasKey("appUserId")) userMap.getString("appUserId") else null

    val auth = OkHiAuth(
      branchId = branchId,
      clientKey = clientKey,
      env = env
    )

    val user = OkHiUser(
      firstName = firstName,
      lastName = lastName,
      phone = phone,
      email = email,
      appUserId = appUserId
    )

    OkHi.login(reactApplicationContext.applicationContext, auth, user) { results ->
      if (results != null) {
        val writableArray = Arguments.createArray()
        for (result in results) {
          writableArray.pushString(result)
        }
        callback?.invoke(writableArray)
      } else {
        callback?.invoke(null)
      }
    }
  }

  override fun logout(callback: Callback?) {
    OkHi.logout(reactApplicationContext.applicationContext) { results ->
      if (results != null) {
        val writableArray = Arguments.createArray()
        for (result in results) {
          writableArray.pushString(result)
        }
        callback?.invoke(writableArray)
      } else {
        callback?.invoke(null)
      }
    }
  }

  override fun startDigitalAddressVerification(okcollect: ReadableMap?, callback: Callback?) {
    currentCallback = callback
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      val error = Arguments.createMap().apply {
        putString("code", "unknown")
        putString("message", "unable to get current activity")
      }
      callback?.invoke(null, error)
    } else {
      OkHi.startDigitalAddressVerification(
        activity = activity,
        collect = parseOkCollect(okcollect),
        callback = okhiAddressVerificationCallback
      )
    }
  }

  override fun startPhysicalAddressVerification(okcollect: ReadableMap?, callback: Callback?) {
    currentCallback = callback
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      val error = Arguments.createMap().apply {
        putString("code", "unknown")
        putString("message", "unable to get current activity")
      }
      callback?.invoke(null, error)
    } else {
      OkHi.startPhysicalAddressVerification(
        activity = activity,
        collect = parseOkCollect(okcollect),
        callback = okhiAddressVerificationCallback
      )
    }
  }

  override fun startDigitalAndPhysicalAddressVerification(okcollect: ReadableMap?, callback: Callback?) {
    currentCallback = callback
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      val error = Arguments.createMap().apply {
        putString("code", "unknown")
        putString("message", "unable to get current activity")
      }
      callback?.invoke(null, error)
    } else {
      OkHi.startDigitalAndPhysicalAddressVerification(
        activity = activity,
        collect = parseOkCollect(okcollect),
        callback = okhiAddressVerificationCallback
      )
    }
  }

  override fun createAddress(okcollect: ReadableMap?, callback: Callback?) {
    currentCallback = callback
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      val error = Arguments.createMap().apply {
        putString("code", "unknown")
        putString("message", "unable to get current activity")
      }
      callback?.invoke(null, error)
    } else {
      OkHi.createAddress(
        activity = activity,
        collect = parseOkCollect(okcollect),
        callback = okhiAddressVerificationCallback
      )
    }
  }

  private fun parseOkCollect(okcollect: ReadableMap?): OkCollect {
    var nativeOkCollect: OkCollect? = null
    if (okcollect == null) {
      nativeOkCollect = OkCollect()
    } else {
      val styleMap = okcollect.getMap("style")
      val color = styleMap?.getString("color") ?: "#005D67"
      val logo = styleMap?.getString("color") ?: "https://cdn.okhi.co/icon.png"

      val configurationMap = okcollect.getMap("configuration")
      val streetView = configurationMap?.getBoolean("streetView") ?: true
      val withHomeAddressType = configurationMap?.getBoolean("withHomeAddressType") ?: true
      val withWorkAddressType = configurationMap?.getBoolean("withWorkAddressType") ?: false
      val withAppBar = configurationMap?.getBoolean("withAppBar") ?: true

      val locationId = if (okcollect.hasKey("locationId")) okcollect.getString("locationId") else null

      val style = OkCollectStyle(
        color = color,
        name = name,
        logo = logo
      )

      val config = OkCollectConfig(
        streetView = streetView,
        withHomeAddressType = withHomeAddressType,
        withWorkAddressType = withWorkAddressType,
        withAppBar = withAppBar
      )

      var nativeLocation: OkHiLocation? = null
      if (locationId != null) {
        nativeLocation = OkHiLocation(locationId)
      }

      nativeOkCollect = OkCollect(
        style,
        config,
        nativeLocation
      )
    }

    return nativeOkCollect
  }

  // Helper Methods

  override fun isLocationServicesEnabled(callback: Callback?) {
    val result = OkHi.isLocationServicesEnabled(reactApplicationContext.applicationContext)
    callback?.invoke(result, null)
  }

  override fun canOpenProtectedApps(callback: Callback?) {
    val result = OkHi.canOpenProtectedApps(reactApplicationContext.applicationContext)
    callback?.invoke(result, null)
  }

  override fun getLocationAccuracyLevel(callback: Callback?) {
    val result = OkHi.getLocationAccuracyLevel(reactApplicationContext.applicationContext)
    callback?.invoke(result.toString(), null)
  }

  override fun isBackgroundLocationPermissionGranted(callback: Callback?) {
    val result = OkHi.isBackgroundLocationPermissionGranted(reactApplicationContext.applicationContext)
    callback?.invoke(result, null)
  }

  override fun isCoarseLocationPermissionGranted(callback: Callback?) {
    val result = OkHi.isCoarseLocationPermissionGranted(reactApplicationContext.applicationContext)
    callback?.invoke(result, null)
  }

  override fun isFineLocationPermissionGranted(callback: Callback?) {
    val result = OkHi.isFineLocationPermissionGranted(reactApplicationContext.applicationContext)
    callback?.invoke(result, null)
  }

  override fun isPlayServicesAvailable(callback: Callback?) {
    val result = OkHi.isPlayServicesAvailable(reactApplicationContext.applicationContext)
    callback?.invoke(result, null)
  }

  override fun isPostNotificationPermissionGranted(callback: Callback?) {
    val result = OkHi.isPostNotificationPermissionGranted(reactApplicationContext.applicationContext)
    callback?.invoke(result, null)
  }

  override fun openProtectedApps() {
    OkHi.openProtectedApps(reactApplicationContext.applicationContext)
  }

  // Request Helpers

  override fun requestLocationPermission(callback: Callback?) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      val error = Arguments.createMap().apply {
        putString("code", "unknown")
        putString("message", "unable to get current activity")
      }
      callback?.invoke(null, error)
    } else {
      OkHi.requestLocationPermission(activity) { result ->
        callback?.invoke(result, null)
      }
    }
  }

  override fun requestBackgroundLocationPermission(callback: Callback?) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      val error = Arguments.createMap().apply {
        putString("code", "unknown")
        putString("message", "unable to get current activity")
      }
      callback?.invoke(null, error)
    } else {
      OkHi.requestBackgroundLocationPermission(activity) { result ->
        callback?.invoke(result, null)
      }
    }
  }

  override fun requestEnableLocationServices(callback: Callback?) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      val error = Arguments.createMap().apply {
        putString("code", "unknown")
        putString("message", "unable to get current activity")
      }
      callback?.invoke(null, error)
    } else {
      OkHi.requestEnableLocationServices(activity) { result ->
        callback?.invoke(result, null)
      }
    }
  }

  override fun requestPostNotificationPermissions(callback: Callback?) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      val error = Arguments.createMap().apply {
        putString("code", "unknown")
        putString("message", "unable to get current activity")
      }
      callback?.invoke(null, error)
    } else {
      OkHi.requestPostNotificationPermissions(activity) { result ->
        callback?.invoke(result, null)
      }
    }
  }

  companion object {
    const val NAME = "Okhi"
  }
}
