package com.reactnativeokhi;

import android.app.Activity;
import android.content.Intent;
import android.util.Base64;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

import org.json.JSONObject;

import io.okhi.android_core.OkHi;
import io.okhi.android_core.interfaces.OkHiRequestHandler;
import io.okhi.android_core.models.OkHiAppContext;
import io.okhi.android_core.models.OkHiAppMeta;
import io.okhi.android_core.models.OkHiAuth;
import io.okhi.android_core.models.OkHiException;

@ReactModule(name = OkhiModule.NAME)
public class OkhiModule extends ReactContextBaseJavaModule {
  public static final String NAME = "Okhi";
  OkHi okHi;
  RNOkHiCore core;

  public OkhiModule(ReactApplicationContext reactContext) {
    super(reactContext);
    try {
      core = new RNOkHiCore(getReactApplicationContext());
      ActivityEventListener activityEventListener = new ActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
          if (okHi != null) {
            okHi.onActivityResult(requestCode, resultCode, data);
          }
        }

        @Override
        public void onNewIntent(Intent intent) {
        }
      };
      reactContext.addActivityEventListener(activityEventListener);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  class RequestHandler implements OkHiRequestHandler<Boolean> {
    Promise promise;

    RequestHandler(Promise promise) {
      this.promise = promise;
    }

    @Override
    public void onResult(Boolean result) {
      promise.resolve(result);
    }

    @Override
    public void onError(OkHiException exception) {
      promise.reject(exception);
    }
  }


  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  public void multiply(int a, int b, Promise promise) {
    promise.resolve(a * b);
  }

  public static native int nativeMultiply(int a, int b);

  @ReactMethod
  public void isLocationServicesEnabled(Promise promise) {
    boolean result = OkHi.isLocationServicesEnabled(getReactApplicationContext());
    promise.resolve(result);
  }

  @ReactMethod
  public void isLocationPermissionGranted(Promise promise) {
    boolean result = OkHi.isLocationPermissionGranted(getReactApplicationContext());
    promise.resolve(result);
  }

  @ReactMethod
  public void isBackgroundLocationPermissionGranted(Promise promise) {
    boolean result = OkHi.isBackgroundLocationPermissionGranted(getReactApplicationContext());
    promise.resolve(result);
  }

  @ReactMethod
  public void isGooglePlayServicesAvailable(Promise promise) {
    promise.resolve(OkHi.isGooglePlayServicesAvailable(getReactApplicationContext()));
  }

  @ReactMethod
  public void requestEnableLocationServices(Promise promise) {
    if (OkHi.isLocationServicesEnabled(getReactApplicationContext())) {
      promise.resolve(true);
    } else if (getCurrentActivity() == null) {
      promise.reject(new OkHiException(OkHiException.UNKNOWN_ERROR_CODE, "Main activity hasn't loaded yet"));
    } else {
      okHi = new OkHi(getCurrentActivity());
      okHi.requestEnableLocationServices(new RequestHandler(promise));
    }
  }

  @ReactMethod
  public void requestEnableGooglePlayServices(Promise promise) {
    if (OkHi.isGooglePlayServicesAvailable(getReactApplicationContext())) {
      promise.resolve(true);
    } else if (getCurrentActivity() == null) {
      promise.reject(new OkHiException(OkHiException.UNKNOWN_ERROR_CODE, "Main activity hasn't loaded yet"));
    } else {
      okHi = new OkHi(getCurrentActivity());
      okHi.requestEnableGooglePlayServices(new RequestHandler(promise));
    }
  }

  @ReactMethod
  public void getSystemVersion (Promise promise) {
    promise.resolve(android.os.Build.VERSION.SDK_INT);
  }

  @ReactMethod
  public void getApplicationConfiguration (Promise promise) {
    if (core == null) {
      promise.reject(OkHiException.UNKNOWN_ERROR_CODE, "Unable to obtain auth credentials");
      return;
    }
    try {
      OkHiAuth auth = core.getAuth();
      OkHiAppContext appContext = auth.getContext();
      OkHiAppMeta appMeta = auth.getContext().getAppMeta();
      JSONObject payload = new JSONObject();

      JSONObject authPayload = new JSONObject();
      authPayload.put("accessToken", auth.getAccessToken());

      JSONObject contextPayload = new JSONObject();
      contextPayload.put("platform", "react-native");
      contextPayload.put("developer", appContext.getDeveloper());
      contextPayload.put("mode", appContext.getMode());

      JSONObject appMetaPayload = new JSONObject();
      appMetaPayload.put("name", appMeta.getName());
      appMetaPayload.put("version", appMeta.getVersion());
      appMetaPayload.put("versionCode", appMeta.getVersionCode());

      payload.put("auth", authPayload);
      payload.put("context", contextPayload);
      payload.put("app", appMetaPayload);

      promise.resolve(payload.toString());
    } catch (Exception e) {
      promise.reject(OkHiException.UNKNOWN_ERROR_CODE, "Unable to parse auth credentials");
    }
  }

  @ReactMethod
  public void getAuthToken(String branchId, String clientKey, Promise promise) {
    String concat = branchId + ":" + clientKey;
    String token = Base64.encodeToString(concat.getBytes(), Base64.NO_WRAP);
    promise.resolve("Token " + token);
  }
}
