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
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.module.annotations.ReactModule;

import org.json.JSONObject;

import java.util.ArrayList;

import io.okhi.android_core.OkHi;
import io.okhi.android_core.interfaces.OkHiRequestHandler;
import io.okhi.android_core.models.OkCollectSuccessResponse;
import io.okhi.android_core.models.OkHiAppContext;
import io.okhi.android_core.models.OkHiAuth;
import io.okhi.android_core.models.OkHiException;
import io.okhi.android_core.models.OkHiLocation;
import io.okhi.android_core.models.OkHiLocationService;
import io.okhi.android_core.models.OkHiPermissionService;
import io.okhi.android_core.models.OkHiUsageType;
import io.okhi.android_core.models.OkHiUser;
import io.okhi.android_core.models.OkPreference;
import io.okhi.android_okverify.OkVerify;
import io.okhi.android_okverify.interfaces.OkVerifyCallback;
import io.okhi.android_okverify.models.OkHiNotification;
import io.okhi.android_okverify.models.StartVerificationService;

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
      auth = new OkHiAuth(getReactApplicationContext(), branchId, clientKey, mode);
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
  public void startAddressVerification(String token, String phoneNumber, String userId, String locationId, Float lat, Float lon, ReadableArray usageTypes, Promise promise) {
    if (okVerify == null) {
      promise.reject("unauthorized", "failed to initialise okhi");
      return;
    }
    String[] usageTypeList = new String[usageTypes.size()];
    for (int i = 0; i < usageTypes.size(); i++) {
      usageTypeList[i] = usageTypes.getString(i);
    }
    if (usageTypeList.length == 0) {
      usageTypeList = new String[]{OkHiUsageType.digitalVerification.toString()};
    }
    OkHiLocation location = new OkHiLocation.Builder(locationId, lat, lon).setUsageTypes(usageTypeList).build();
    OkHiUser user = new OkHiUser.Builder(phoneNumber).withOkHiUserId(userId).withToken(token).build();
    OkCollectSuccessResponse response = new OkCollectSuccessResponse(user, location);
    okVerify.start(response, new OkVerifyCallback<String>() {
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
    map.putString("osVersion", Build.VERSION.RELEASE);
    map.putString("platform", "android");
    promise.resolve(map);
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

  // Required for rn built in EventEmitter Calls.
  @ReactMethod
  public void addListener(String eventName) {

  }

  @ReactMethod
  public void removeListeners(Integer count) {

  }

  @ReactMethod
  public void setItem(String key, String value, Promise promise) {
    try {
      OkPreference.setItem(key, value, getReactApplicationContext());
      promise.resolve(true);
    } catch (OkHiException e) {
      promise.reject(e.getCode(), e.getMessage(), e);
      e.printStackTrace();
    }
  }

  @ReactMethod
  public void getItem(String key, Promise promise) {
    try {
      promise.resolve(OkPreference.getItem(key, getReactApplicationContext()));
    } catch (OkHiException e) {
      promise.reject(e.getCode(), e.getMessage(), e);
      e.printStackTrace();
    }
  }

  @ReactMethod
  public void fetchRegisteredGeofences(Promise promise) {
    promise.resolve(OkVerify.fetchRegisteredGeofences(getReactApplicationContext()));
  }

  @ReactMethod
  public void onNewToken(String fcmPushNotificationToken, Promise promise) {
    StartVerificationService.onNewToken(fcmPushNotificationToken, getReactApplicationContext());
    promise.resolve(true);
  }

  @ReactMethod
  public void onMessageReceived(Promise promise) {
    StartVerificationService.onMessageReceived(getReactApplicationContext());
    promise.resolve(true);
  }

  @ReactMethod
  public void getLocationAccuracyLevel(Promise promise) {
    String level = OkHiLocationService.getLocationAccuracyLevel(getReactApplicationContext());
    promise.resolve(level);
  }
}
