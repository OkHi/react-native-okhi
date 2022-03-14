import { OkHiNativeModule, OkHiNativeEvents } from '../OkHiNativeModule';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { errorHandler, isValidPlatform } from './_helpers';
import type {
  LocationPermissionCallback,
  LocationPermissionStatus,
  LocationRequestPermissionType,
} from './types';

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
    if (sdkVersion < 23) {
      return true;
    }
    if (sdkVersion < 29) {
      return await isLocationPermissionGranted();
    }
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
    );
    return hasPermission;
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
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
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
    if (sdkVersion < 23) return true;
    if (sdkVersion >= 29) {
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

export const request = (
  locationPermissionType: LocationRequestPermissionType,
  rationale: {
    title: string;
    text: string;
    successButton?: { label: string };
  } | null,
  callback: LocationPermissionCallback
) => {
  if (Platform.OS === 'ios') {
    OkHiNativeEvents.removeAllListeners('onLocationPermissionStatusUpdate');
    OkHiNativeEvents.addListener('onLocationPermissionStatusUpdate', callback);
    if (locationPermissionType === 'whenInUse') {
      OkHiNativeModule.requestLocationPermission();
    } else {
      OkHiNativeModule.requestBackgroundLocationPermission();
    }
  } else {
    if (locationPermissionType === 'whenInUse') {
      requestLocationPermissionAndroid().then((result) =>
        callback(result ? 'authorizedWhenInUse' : 'denied')
      );
    } else {
      requestLocationPermissionAndroid().then(async (whenInUseResult) => {
        if (whenInUseResult) {
          const version = await getSystemVersion();
          if (version >= 30 && rationale) {
            Alert.alert(
              rationale.title,
              rationale.text,
              [
                {
                  text: rationale.successButton
                    ? rationale.successButton.label
                    : 'Okay',
                  onPress: async () => {
                    const result = await requestBackgroundLocationPermission();
                    callback(
                      result ? 'authorizedAlways' : 'authorizedWhenInUse'
                    );
                  },
                },
              ],
              {
                onDismiss: () => {
                  callback('authorizedWhenInUse');
                },
              }
            );
          } else {
            const permission = await requestBackgroundLocationPermission();
            callback(permission ? 'authorizedAlways' : 'authorizedWhenInUse');
          }
        } else {
          callback('denied');
        }
      });
    }
  }
};

export const openAppSettings = () => {
  OkHiNativeModule.openAppSettings();
};

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
