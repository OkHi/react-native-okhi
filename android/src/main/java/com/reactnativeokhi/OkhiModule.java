package com.reactnativeokhi;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Base64;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.module.annotations.ReactModule;

import org.json.JSONObject;

import io.okhi.android_core.OkHi;
import io.okhi.android_core.interfaces.OkHiRequestHandler;
import io.okhi.android_core.models.OkHiAppContext;
import io.okhi.android_core.models.OkHiAuth;
import io.okhi.android_core.models.OkHiException;
import io.okhi.android_core.models.OkHiLocation;
import io.okhi.android_core.models.OkHiPermissionService;
import io.okhi.android_core.models.OkHiUser;
import io.okhi.android_okverify.OkVerify;
import io.okhi.android_okverify.interfaces.OkVerifyCallback;
import io.okhi.android_okverify.models.OkHiNotification;

@ReactModule(name = OkhiModule.NAME)
public class OkhiModule extends ReactContextBaseJavaModule {
  public static final String NAME = "Okhi";
  OkHi okHi;
  OkVerify okVerify;
  OkHiAuth auth;

  public OkhiModule(ReactApplicationContext reactContext) {
    super(reactContext);
    try {
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
  public void getAuthToken(String branchId, String clientKey, Promise promise) {
    String concat = branchId + ":" + clientKey;
    String token = Base64.encodeToString(concat.getBytes(), Base64.NO_WRAP);
    promise.resolve("Token " + token);
  }

  @ReactMethod
  public void initialize(String configuration, Promise promise) {
    try {
      JSONObject config = new JSONObject(configuration);
      String branchId = config.getJSONObject("credentials").getString("branchId");
      String clientKey = config.getJSONObject("credentials").getString("clientKey");
      String mode = config.getJSONObject("context").getString("mode");
      String developer = config.getJSONObject("context").optString("developer", "external");
      OkHiAppContext context = new OkHiAppContext(getReactApplicationContext(), mode, "react-native", developer);
      auth = new OkHiAuth(getReactApplicationContext(), branchId, clientKey, context);
      if (getCurrentActivity() != null && getCurrentActivity().getApplicationContext() != null) {
        okVerify = new OkVerify.Builder(getCurrentActivity(), auth).build();
        if (config.has("notification")) {
          JSONObject notificationConfig = config.getJSONObject("notification");
          int importance = Build.VERSION.SDK_INT >= Build.VERSION_CODES.N ? NotificationManager.IMPORTANCE_DEFAULT : 3;
          OkVerify.init(getReactApplicationContext(), new OkHiNotification(
            notificationConfig.optString("title", "Verification in progress"),
            notificationConfig.optString("text", "Address Verification in progress"),
            notificationConfig.optString("channelId", "okhi"),
            notificationConfig.optString("channelName", "OkHi Channel"),
            notificationConfig.optString("channelDescription", "OkHi verification alerts"),
            importance
          ));
        }
        promise.resolve(true);
      } else {
        promise.resolve(false);
      }
    } catch (Exception e) {
      e.printStackTrace();
      promise.reject("unauthorized", "unable to parse credentials", e);
    }
  }

  @ReactMethod
  public void startAddressVerification(String phoneNumber, String locationId, Float lat, Float lon, ReadableMap config, Promise promise) {
    if (okVerify == null) {
      promise.reject("unauthorized", "failed to initialise okhi");
      return;
    }
    OkHiUser user = new OkHiUser.Builder(phoneNumber).build();
    OkHiLocation location = new OkHiLocation.Builder(locationId, lat, lon).build();
    Boolean withForeground = true;
    Dynamic foregroundConfig = getConfig(config, "withForeground");
    if(foregroundConfig != null) {
      withForeground = foregroundConfig.asBoolean();
    }
    okVerify.start(user, location, withForeground, new OkVerifyCallback<String>() {
      @Override
      public void onSuccess(String result) {
        promise.resolve(result);
      }
      @Override
      public void onError(OkHiException e) {
        promise.reject(e.getCode(), e.getMessage(), e);
      }
    });
  }

  @ReactMethod
  public void stopAddressVerification(String phoneNumber, String locationId, Promise promise) {
    OkVerify.stop(getReactApplicationContext(), locationId, new OkVerifyCallback<String>() {
      @Override
      public void onSuccess(String result) {
        promise.resolve(result);
      }
      @Override
      public void onError(OkHiException e) {
        promise.reject(e.getCode(), e.getMessage(), e);
      }
    });
  }

  @ReactMethod
  public void startForegroundService(Promise promise) {
    try {
      OkVerify.startForegroundService(getReactApplicationContext());
      promise.resolve(true);
    } catch (OkHiException e) {
      e.printStackTrace();
      promise.reject(e.getCode(), e.getMessage(), e);
    }
  }

  @ReactMethod
  public void stopForegroundService(Promise promise) {
    OkVerify.stopForegroundService(getReactApplicationContext());
    promise.resolve(true);
  }

  @ReactMethod
  public void isForegroundServiceRunning(Promise promise) {
    Boolean result = OkVerify.isForegroundServiceRunning(getReactApplicationContext());
    promise.resolve(result);
  }

  @ReactMethod
  public void openAppSettings(Promise promise) {
    Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
    Uri uri = Uri.fromParts("package", getReactApplicationContext().getPackageName(), null);
    intent.setData(uri);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    getReactApplicationContext().startActivity(intent);
  }

  @ReactMethod
  public void canOpenProtectedAppsSettings(Promise promise) {
    promise.resolve(OkHiPermissionService.canOpenProtectedApps(getReactApplicationContext()));
  }

  @ReactMethod
  public void openProtectedAppsSettings(Promise promise) {
    try {
      Activity activity = getCurrentActivity();
      if (activity != null) {
        OkHiPermissionService.openProtectedAppsSettings(getCurrentActivity(), 69);
        promise.resolve(true);
      } else {
        throw new OkHiException(OkHiException.UNKNOWN_ERROR_CODE, "unable to retrieve current activity");
      }
    } catch (OkHiException e) {
      promise.reject(e.getCode(), e.getMessage(), e);
    }
  }

  @ReactMethod
  public void retrieveDeviceInfo(Promise promise) {
    WritableMap map = new WritableNativeMap();
    map.putString("manufacturer", Build.MANUFACTURER);
    map.putString("model", Build.MODEL);
    promise.resolve(map);
  }

  @ReactMethod
  public void addListener(String eventName) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  @ReactMethod
  public void removeListeners(Integer count) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  private Dynamic getConfig(ReadableMap map, String prop) {
    if (map != null && map.hasKey("android")) {
      ReadableMap config = map.getMap("android");
      if (config.hasKey("withForeground")) {
        return config.getDynamic("withForeground");
      } else {
        return null;
      }
    }
    return  null;
  }
}
