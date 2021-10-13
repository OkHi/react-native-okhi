import { OkHiNativeModule } from '../OkHiNativeModule';
import { PermissionsAndroid, Platform } from 'react-native';
import { errorHandler, isValidPlatform } from './_helpers';

export const isLocationServicesEnabled = (): Promise<boolean> => {
  return isValidPlatform(() =>
    errorHandler(OkHiNativeModule.isLocationServicesEnabled)
  );
};

export const isLocationPermissionGranted = (): Promise<boolean> => {
  return isValidPlatform(() =>
    errorHandler(OkHiNativeModule.isLocationPermissionGranted)
  );
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

export const isBackgroundLocationPermissionGranted = (): Promise<boolean> => {
  return isValidPlatform(() => {
    return errorHandler(
      Platform.OS === 'android'
        ? isBackgroundLocationPermissionGrantedAndroid
        : isBackgroundLocationPermissionGrantedIOS
    );
  });
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
    const status: any = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
    ]);
    return sdkVersion < 29
      ? status['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
      : status['android.permission.ACCESS_BACKGROUND_LOCATION'] === 'granted';
  };

const requestBackgroundLocationPermissionIOS = (): Promise<boolean> => {
  return OkHiNativeModule.requestBackgroundLocationPermission();
};

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

export const requestEnableLocationServices = (): Promise<boolean> => {
  return isValidPlatform(() =>
    errorHandler(OkHiNativeModule.requestEnableLocationServices)
  );
};

export const isGooglePlayServicesAvailable = (): Promise<boolean> => {
  return isValidPlatform(
    () => errorHandler(OkHiNativeModule.isGooglePlayServicesAvailable),
    'android'
  );
};

export const requestEnableGooglePlayServices = (): Promise<boolean> => {
  return isValidPlatform(
    () => errorHandler(OkHiNativeModule.requestEnableGooglePlayServices),
    'android'
  );
};

export const getSystemVersion = (): Promise<string | number> =>
  isValidPlatform(() => errorHandler(OkHiNativeModule.getSystemVersion));
