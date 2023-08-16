import { OkHiNativeModule, OkHiNativeEvents } from '../OkHiNativeModule';
import { Alert, Permission, PermissionsAndroid, Platform } from 'react-native';
import { errorHandler, isValidPlatform } from './_helpers';
import type {
  LocationPermissionCallback,
  LocationPermissionStatus,
  LocationRequestPermissionType,
} from './types';
import { OkHiException } from './OkHiException';

/**
 * Checks whether location services are enabled
 * @returns {Promise<boolean>} A promise that resolves to a boolen value indicating whether the service is available
 */
export const isLocationServicesEnabled = (): Promise<boolean> => {
  return isValidPlatform(OkHiNativeModule.isLocationServicesEnabled);
};

/**
 * Checks whether when in use location permission is granted
 * @returns {Promise<boolean>} A promise that resolves to a boolen value indicating whether the permission is granted
 */
export const isLocationPermissionGranted = (): Promise<boolean> => {
  return isValidPlatform(OkHiNativeModule.isLocationPermissionGranted);
};

const isBackgroundLocationPermissionGrantedAndroid =
  async (): Promise<boolean> => {
    const sdkVersion = await OkHiNativeModule.getSystemVersion();
    if (Number(sdkVersion) < 23) {
      return true;
    }
    if (Number(sdkVersion) < 29) {
      return await isLocationPermissionGranted();
    }
    if (
      typeof PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION !==
      'undefined'
    ) {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION as Permission
      );
      return hasPermission;
    }
    console.warn(
      `PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION is undefined, this is an issue with the current version of RN you are running. Please consider upgrading`
    );
    return false;
  };

const isBackgroundLocationPermissionGrantedIOS = (): Promise<boolean> => {
  return OkHiNativeModule.isBackgroundLocationPermissionGranted();
};

/**
 * Checks whether background location permission is granted
 * @returns {Promise<boolean>} A promise that resolves to a boolen value indicating whether the permission is granted
 */
export const isBackgroundLocationPermissionGranted = (): Promise<boolean> => {
  const fn =
    Platform.OS === 'android'
      ? isBackgroundLocationPermissionGrantedAndroid
      : isBackgroundLocationPermissionGrantedIOS;
  return isValidPlatform(fn);
};

const requestLocationPermissionAndroid = async (): Promise<boolean> => {
  const status: any = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION as Permission,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION as Permission,
  ]);
  return status['android.permission.ACCESS_FINE_LOCATION'] === 'granted';
};

const requestLocationPermissionIOS = (): Promise<boolean> => {
  return OkHiNativeModule.requestLocationPermission();
};

/**
 * Requests for when in use location permission
 * @returns {Promise<boolean>} A promise that resolves to a boolen value indicating whether the permission is granted
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  const isGranted = await isLocationPermissionGranted();
  if (isGranted) return isGranted;
  return errorHandler(
    Platform.OS === 'android'
      ? requestLocationPermissionAndroid
      : requestLocationPermissionIOS
  );
};

const requestBackgroundLocationPermissionAndroid =
  async (): Promise<boolean> => {
    const sdkVersion = await OkHiNativeModule.getSystemVersion();
    if (Number(sdkVersion) < 23) return true;
    if (Number(sdkVersion) >= 29) {
      const permissions: any = [
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      ];
      const status: any = await PermissionsAndroid.requestMultiple(permissions);
      return (
        status['android.permission.ACCESS_BACKGROUND_LOCATION'] === 'granted'
      );
    } else {
      return await requestLocationPermissionAndroid();
    }
  };

const requestBackgroundLocationPermissionIOS = (): Promise<boolean> => {
  return OkHiNativeModule.requestBackgroundLocationPermission();
};

/**
 * Requests for background location permission
 * @returns {Promise<boolean>} A promise that resolves to a boolen value indicating whether the permission is granted
 */
export const requestBackgroundLocationPermission =
  async (): Promise<boolean> => {
    const isGranted = await isBackgroundLocationPermissionGranted();
    if (isGranted) return isGranted;
    return errorHandler(
      Platform.OS === 'android'
        ? requestBackgroundLocationPermissionAndroid
        : requestBackgroundLocationPermissionIOS
    );
  };

/**
 * Requests the user to enable location services by showing an in app modal on android and opening location settings on iOS
 * @returns {Promise<boolean>} A promise that resolves to either a boolean value on android or null on iOS
 */
export const requestEnableLocationServices = (): Promise<boolean | null> => {
  return isValidPlatform(OkHiNativeModule.requestEnableLocationServices);
};

/**
 * Android Only - Checks if Google Play Services is available
 * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the service is avaialbe
 */
export const isGooglePlayServicesAvailable = (): Promise<boolean> => {
  return isValidPlatform(
    OkHiNativeModule.isGooglePlayServicesAvailable,
    'android'
  );
};

/**
 * Android Only - Requests user to enable Google Play Services
 * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the service is avaialbe
 */
export const requestEnableGooglePlayServices = (): Promise<boolean> => {
  return isValidPlatform(
    OkHiNativeModule.requestEnableGooglePlayServices,
    'android'
  );
};

/**
 * Returns the system version of the current platform
 * @returns {Promise<boolean>} A promise that resolves either a string on iOS or number on Android
 */
export const getSystemVersion = (): Promise<string | number> =>
  isValidPlatform(OkHiNativeModule.getSystemVersion);

/**
 * Requests location permission from the user. It'll also attempt to activate any disbaled services (Android Only)
 */
export const request = (
  locationPermissionType: LocationRequestPermissionType,
  rationale: {
    title: string;
    text: string;
    successButton?: { label: string };
    denyButton?: { label: string };
  } | null,
  callback: LocationPermissionCallback
) => {
  const serviceError = new OkHiException({
    code: OkHiException.SERVICE_UNAVAILABLE_CODE,
    message:
      'Location service is currently not available. Please enable in app settings',
  });

  const googlePlayError = new OkHiException({
    code: OkHiException.SERVICE_UNAVAILABLE_CODE,
    message:
      'Google Play Services is currently unavailable. Please enable in settings',
  });

  const handleError = (error: OkHiException) => {
    callback(null, error);
  };

  const handleGooglePlayServiceRequest = () => {
    requestEnableGooglePlayServices().then((googlePlayStatus) => {
      if (!googlePlayStatus) {
        handleError(googlePlayError);
      } else {
        handleRationaleRequest();
      }
    });
  };

  const handleRationaleAlert = (alertRationale: {
    title: string;
    text: string;
    grantButton?: { label: string };
    denyButton?: { label: string };
  }) => {
    return new Promise((resolve, _) => {
      Alert.alert(
        alertRationale.title,
        alertRationale.text,
        [
          {
            text: alertRationale.grantButton
              ? alertRationale.grantButton.label
              : 'Grant',
            onPress: () => {
              resolve(true);
            },
          },
          {
            text: alertRationale.denyButton
              ? alertRationale.denyButton.label
              : 'Deny',
            onPress: () => {
              resolve(false);
            },
            style: 'cancel',
          },
        ],
        {
          onDismiss: () => {
            resolve(false);
          },
        }
      );
    });
  };

  const handlePermissionRequest = () => {
    if (Platform.OS === 'ios') {
      OkHiNativeEvents.removeAllListeners('onLocationPermissionStatusUpdate');
      OkHiNativeEvents.addListener(
        'onLocationPermissionStatusUpdate',
        (permissionUpdate) => {
          callback(permissionUpdate, null);
        }
      );
      if (locationPermissionType === 'whenInUse') {
        OkHiNativeModule.requestLocationPermission();
      } else {
        OkHiNativeModule.requestBackgroundLocationPermission();
      }
    } else {
      if (locationPermissionType === 'whenInUse') {
        requestLocationPermissionAndroid().then((whenInUseResult) =>
          callback(whenInUseResult ? 'authorizedWhenInUse' : 'denied', null)
        );
      } else {
        requestLocationPermissionAndroid().then((initialWhenInUseResult) => {
          if (!initialWhenInUseResult) {
            callback('denied', null);
          } else {
            callback('authorizedWhenInUse', null);
            requestBackgroundLocationPermission().then((alwaysResult) => {
              callback(
                alwaysResult ? 'authorizedAlways' : 'authorizedWhenInUse',
                null
              );
            });
          }
        });
      }
    }
  };

  const handleRationaleRequest = async () => {
    const currentStatus = await retriveLocationPermissionStatus();
    let showRationale = true;
    if (
      locationPermissionType === 'whenInUse' &&
      (currentStatus === 'authorizedWhenInUse' ||
        currentStatus === 'authorizedAlways')
    ) {
      showRationale = false;
    }
    if (
      locationPermissionType === 'always' &&
      currentStatus === 'authorizedAlways'
    ) {
      showRationale = false;
    }
    if (rationale && showRationale) {
      const result = await handleRationaleAlert(rationale);
      if (!result) {
        callback('rationaleDissmissed', null);
      } else {
        handlePermissionRequest();
      }
    } else {
      handlePermissionRequest();
    }
  };

  isLocationServicesEnabled()
    .then((serviceStatus) => {
      if (!serviceStatus && Platform.OS === 'ios') {
        handleError(serviceError);
      } else if (!serviceStatus && Platform.OS === 'android') {
        requestEnableLocationServices()
          .then((enableResult) => {
            if (!enableResult) {
              handleError(serviceError);
            } else {
              handleGooglePlayServiceRequest();
            }
          })
          .catch(handleError);
      } else {
        if (Platform.OS === 'ios') {
          handleRationaleRequest();
        } else {
          handleGooglePlayServiceRequest();
        }
      }
    })
    .catch(handleError);
};

/**
 * Open the device's app settings.
 */
export const openAppSettings = () => {
  OkHiNativeModule.openAppSettings();
};

/**
 * Retrives the location permission status from the device
 */
export const retriveLocationPermissionStatus =
  async (): Promise<LocationPermissionStatus> => {
    if (Platform.OS === 'ios') {
      return OkHiNativeModule.retriveLocationPermissionStatus() as Promise<LocationPermissionStatus>;
    }
    const alwaysPerm = await isBackgroundLocationPermissionGranted();
    if (alwaysPerm) {
      return 'authorizedAlways';
    }
    const whenInUsePerm = await isLocationPermissionGranted();
    return whenInUsePerm ? 'authorizedWhenInUse' : 'denied';
  };

/**
 * Requests tracking authorization from the user. iOS only, iOS version >= 14
 * Read more: https://developer.apple.com/app-store/user-privacy-and-data-use/
 */
export const requestTrackingAuthorization = async (): Promise<
  string | null
> => {
  return isValidPlatform(async () => {
    const result = await OkHiNativeModule.requestTrackingAuthorization();
    return result;
  }, 'ios');
};

/**
 * Checks whether current device can open "Protected Apps Settings" available in Transsion Group android devices such as Infinix and Tecno
 * When your application is included in protected apps, verification processes are less likely to be terminated by the OS. Increasing rate of users being verified.
 */
export const canOpenProtectedAppsSettings = (): Promise<boolean> => {
  return isValidPlatform(async () => {
    const result = await OkHiNativeModule.canOpenProtectedAppsSettings();
    return result;
  }, 'android');
};

/**
 * Opens "Protected Apps Settings" available in Transsion Group android devices such as Infinix and Tecno
 * When your application is included in protected apps, verification processes are less likely to be terminated by the OS. Increasing rate of users being verified.
 */
export const openProtectedAppsSettings = (): Promise<boolean> => {
  return isValidPlatform(async () => {
    const result = await OkHiNativeModule.openProtectedAppsSettings();
    return result;
  }, 'android');
};

const isAndroidNotificationGranted = async (): Promise<boolean> => {
  return isValidPlatform(async () => {
    const sdkVersion = await OkHiNativeModule.getSystemVersion();
    if (Number(sdkVersion) < 33) {
      return true;
    }
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as Permission
    );
    return hasPermission;
  }, 'android');
};

const requestAndroidNotificationPermission = async (): Promise<boolean> => {
  return isValidPlatform(async () => {
    const existingPermissionStatus = await isAndroidNotificationGranted();
    if (existingPermissionStatus) {
      return true;
    }
    const status: any = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as Permission
    );
    return status === 'granted';
  }, 'android');
};

const isIOSNotificationGranted = async (): Promise<boolean> => {
  return isValidPlatform(async () => {
    return OkHiNativeModule.isNotificationPermissionGranted();
  }, 'ios');
};

const requestIOSNotificationPermission = async (): Promise<boolean> => {
  return isValidPlatform(async () => {
    const existingPermissionStatus = await isIOSNotificationGranted();
    if (existingPermissionStatus) {
      return true;
    }
    return OkHiNativeModule.requestNotificationPermission();
  }, 'ios');
};

/**
 * Checks whether notification permission is granted on both android and ios devices
 */
export const isNotificationPermissionGranted = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    return isAndroidNotificationGranted();
  } else if (Platform.OS === 'ios') {
    return isIOSNotificationGranted();
  } else {
    throw new OkHiException({
      code: OkHiException.UNSUPPORTED_PLATFORM_CODE,
      message: OkHiException.UNSUPPORTED_PLATFORM_MESSAGE,
    });
  }
};

/**
 * Requests notification permission from both android and ios devices
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    return requestAndroidNotificationPermission();
  } else if (Platform.OS === 'ios') {
    return requestIOSNotificationPermission();
  } else {
    throw new OkHiException({
      code: OkHiException.UNSUPPORTED_PLATFORM_CODE,
      message: OkHiException.UNSUPPORTED_PLATFORM_MESSAGE,
    });
  }
};
