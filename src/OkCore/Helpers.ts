import { OkHiNativeModule } from '../OkHiNativeModule';
import { PermissionsAndroid, Platform } from 'react-native';
import { errorHandler, isValidPlatform } from './_helpers';

export const isLocationServicesEnabled = (): Promise<boolean> => {
  return isValidPlatform(OkHiNativeModule.isLocationServicesEnabled);
};

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
    const state = await requestLocationPermission();
    if (state) {
      if (sdkVersion >= 29) {
        const permissions: any = [
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        ];
        const status: any = await PermissionsAndroid.requestMultiple(
          permissions
        );
        return (
          status['android.permission.ACCESS_BACKGROUND_LOCATION'] === 'granted'
        );
      }
      return true;
    } else {
      return false;
    }
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
  return isValidPlatform(OkHiNativeModule.requestEnableLocationServices);
};

export const isGooglePlayServicesAvailable = (): Promise<boolean> => {
  return isValidPlatform(
    OkHiNativeModule.isGooglePlayServicesAvailable,
    'android'
  );
};

export const requestEnableGooglePlayServices = (): Promise<boolean> => {
  return isValidPlatform(
    OkHiNativeModule.requestEnableGooglePlayServices,
    'android'
  );
};

export const getSystemVersion = (): Promise<string | number> =>
  isValidPlatform(OkHiNativeModule.getSystemVersion);
