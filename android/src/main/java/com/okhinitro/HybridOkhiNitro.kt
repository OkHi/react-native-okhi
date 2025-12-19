package com.okhinitro

import com.margelo.nitro.NitroModules
import com.margelo.nitro.okhinitro.HybridOkhiNitroSpec
import com.margelo.nitro.okhinitro.NitroOkCollect
import com.margelo.nitro.okhinitro.OkHiException
import com.margelo.nitro.okhinitro.OkHiLogin
import com.margelo.nitro.okhinitro.OkHiSuccessResponse
import com.margelo.nitro.okhinitro.OkHiVerificationType
import io.okhi.android.OkHi
import io.okhi.android.collect.OkCollect
import io.okhi.android.collect.OkCollectConfig
import io.okhi.android.collect.OkCollectStyle
import io.okhi.android.core.interfaces.OkHiAddressVerificationCallback
import io.okhi.android.core.model.OkHiAuth
import io.okhi.android.core.model.OkHiUser

class HybridOkhiNitro: HybridOkhiNitroSpec() {
    override fun login(
        credentials: OkHiLogin,
        callback: (results: Array<String>?) -> Unit
    ) {
        val user = OkHiUser(
            firstName = credentials.user.firstName,
            lastName = credentials.user.lastName,
            phone = credentials.user.phone,
            email = credentials.user.email,
            appUserId = credentials.user.appUserId
        )
        val auth = OkHiAuth(
            branchId = credentials.auth.branchId,
            clientKey = credentials.auth.clientKey,
            env = credentials.auth.env ?: "prod"
        )
        val context = NitroModules.applicationContext

        if (context != null) {
            OkHi.login(context = context, auth = auth, user = user) { results ->
                val arrayResult = results?.toTypedArray() ?: arrayOf()
                callback(arrayResult)
            }
        } else {
            callback(arrayOf())
        }
    }

    override fun startAddressVerification(
        type: OkHiVerificationType,
        okcollect: NitroOkCollect,
        callback: (response: OkHiSuccessResponse?, error: OkHiException?) -> Unit
    ) {
        val activity = NitroModules.applicationContext?.currentActivity
        if (activity == null) {
            callback(null, OkHiException("unknown", "activity not available"))
            return
        }
        val style = OkCollectStyle(
            color = okcollect.style.color,
            name = okcollect.style.name,
            logo = okcollect.style.logo
        )
        val config = OkCollectConfig(
            streetView = okcollect.configuration.streetView,
            withHomeAddressType = okcollect.configuration.withHomeAddressType,
            withWorkAddressType = okcollect.configuration.withWorkAddressType,
            withAppBar = okcollect.configuration.withAppBar
        )
        val location = okcollect.location?.asSecondOrNull()
        var nativeLocation: io.okhi.android.core.model.OkHiLocation? = null
        if (location != null) {
            nativeLocation = io.okhi.android.core.model.OkHiLocation(location.id)
        }

        val nativeOkCollect = OkCollect(
            style,
            config,
            nativeLocation
        )
        when (type) {
            OkHiVerificationType.DIGITAL -> {
                OkHi.startAddressVerification(
                    activity = activity,
                    collect = nativeOkCollect,
                    callback = object : OkHiAddressVerificationCallback() {
                        override fun onSuccess(response: io.okhi.android.collect.models.OkHiSuccessResponse) {
                            super.onSuccess(response)
                            val response = OkHiSuccessResponse(
                                user = response.user.toJSON().toString(),
                                location = response.location.toJSON().toString()
                            )
                            callback(response, null)
                        }

                        override fun onError(e: io.okhi.android.core.model.OkHiException) {
                            super.onError(e)
                            callback(null, OkHiException(e.code, e.message))
                        }

                        override fun onClose() {
                            super.onClose()
                            callback(null, OkHiException("user_closed", "user closed address creation"))
                        }
                    }
                )
            }

            OkHiVerificationType.PHYSICAL -> {
                OkHi.startPhysicalAddressVerification(
                    activity = activity,
                    collect = nativeOkCollect,
                    callback = object : OkHiAddressVerificationCallback() {
                        override fun onSuccess(response: io.okhi.android.collect.models.OkHiSuccessResponse) {
                            super.onSuccess(response)
                            val response = OkHiSuccessResponse(
                                user = response.user.toJSON().toString(),
                                location = response.location.toJSON().toString()
                            )
                            callback(response, null)
                        }

                        override fun onError(e: io.okhi.android.core.model.OkHiException) {
                            super.onError(e)
                            callback(null, OkHiException(e.code, e.message))
                        }

                        override fun onClose() {
                            super.onClose()
                            callback(null, OkHiException("user_closed", "user closed address creation"))
                        }
                    }
                )
            }

            OkHiVerificationType.DIGITALANDPHYSICAL -> {
                OkHi.startDigitalAndPhysicalAddressVerification(
                    activity = activity,
                    collect = nativeOkCollect,
                    callback = object : OkHiAddressVerificationCallback() {
                        override fun onSuccess(response: io.okhi.android.collect.models.OkHiSuccessResponse) {
                            super.onSuccess(response)
                            val response = OkHiSuccessResponse(
                                user = response.user.toJSON().toString(),
                                location = response.location.toJSON().toString()
                            )
                            callback(response, null)
                        }

                        override fun onError(e: io.okhi.android.core.model.OkHiException) {
                            super.onError(e)
                            callback(null, OkHiException(e.code, e.message))
                        }

                        override fun onClose() {
                            super.onClose()
                            callback(null, OkHiException("user_closed", "user closed address creation"))
                        }
                    }
                )
            }

            OkHiVerificationType.ADDRESSBOOK -> {
                OkHi.createAddress(
                    activity = activity,
                    collect = nativeOkCollect,
                    callback = object : OkHiAddressVerificationCallback() {
                        override fun onSuccess(response: io.okhi.android.collect.models.OkHiSuccessResponse) {
                            super.onSuccess(response)
                            val response = OkHiSuccessResponse(
                                user = response.user.toJSON().toString(),
                                location = response.location.toJSON().toString()
                            )
                            callback(response, null)
                        }

                        override fun onError(e: io.okhi.android.core.model.OkHiException) {
                            super.onError(e)
                            callback(null, OkHiException(e.code, e.message))
                        }

                        override fun onClose() {
                            super.onClose()
                            callback(null, OkHiException("user_closed", "user closed address creation"))
                        }
                    }
                )
            }

            null -> {
                OkHi.startAddressVerification(
                    activity = activity,
                    collect = nativeOkCollect,
                    callback = object : OkHiAddressVerificationCallback() {
                        override fun onSuccess(response: io.okhi.android.collect.models.OkHiSuccessResponse) {
                            super.onSuccess(response)
                            val response = OkHiSuccessResponse(
                                user = response.user.toJSON().toString(),
                                location = response.location.toJSON().toString()
                            )
                            callback(response, null)
                        }

                        override fun onError(e: io.okhi.android.core.model.OkHiException) {
                            super.onError(e)
                            callback(null, OkHiException(e.code, e.message))
                        }

                        override fun onClose() {
                            super.onClose()
                            callback(null, OkHiException("user_closed", "user closed address creation"))
                        }
                    }
                )
            }
        }
    }


}
