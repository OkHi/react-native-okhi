import { OkHiNativeModule } from '../OkHiNativeModule';
import { PermissionsAndroid, Platform } from 'react-native';

const SUPPORTED_PLATFORMS = ['ios', 'android'];

export const isLocationServicesEnabled = () => {
  if (SUPPORTED_PLATFORMS.includes(Platform.OS)) {
    return OkHiNativeModule.isLocationServicesEnabled();
  }
  return Promise.reject(false);
};

export const isLocationPermissionGranted = () => {
  if (SUPPORTED_PLATFORMS.includes(Platform.OS)) {
    return OkHiNativeModule.isLocationPermissionGranted();
  }
  return Promise.reject(false);
};

export const isBackgroundLocationPermissionGranted = (): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    if (Platform.OS === 'android') {
      const sdkVersion = await OkHiNativeModule.getSystemVersion();
      if (sdkVersion < 29) {
        resolve(await isLocationPermissionGranted());
      } else if (sdkVersion < 23) {
        resolve(true);
      } else {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
        );
        resolve(hasPermission);
      }
    } else if (Platform.OS === 'ios') {
      OkHiNativeModule.isBackgroundLocationPermissionGranted()
        .then(resolve)
        .catch(reject);
    } else {
      reject(false);
    }
  });
};

export const requestLocationPermission = (): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    if (Platform.OS === 'android') {
      const hasPermission = await isLocationPermissionGranted();
      if (hasPermission) {
        return resolve(hasPermission);
      }
      const status: any = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      resolve(status['android.permission.ACCESS_FINE_LOCATION'] === 'granted');
    } else if (Platform.OS === 'ios') {
      OkHiNativeModule.requestLocationPermission().then(resolve).catch(reject);
    } else {
      reject(false);
    }
  });
};

export const requestBackgroundLocationPermission = (): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    if (Platform.OS === 'android') {
      const hasPermission = await isBackgroundLocationPermissionGranted();
      if (hasPermission) {
        return resolve(hasPermission);
      }
      const status: any = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      ]);
      const sdkVersion = await OkHiNativeModule.getSystemVersion();
      if (sdkVersion < 29) {
        resolve(
          status['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
        );
      } else if (sdkVersion < 23) {
        resolve(true);
      } else {
        resolve(
          status['android.permission.ACCESS_BACKGROUND_LOCATION'] === 'granted'
        );
      }
    } else if (Platform.OS === 'ios') {
      OkHiNativeModule.requestBackgroundLocationPermission()
        .then(resolve)
        .catch(reject);
    } else {
      reject(false);
    }
  });
};

export const requestEnableLocationServices = () => {
  if (SUPPORTED_PLATFORMS.includes(Platform.OS)) {
    return OkHiNativeModule.requestEnableLocationServices();
  }
  return Promise.reject(false);
};

export const isGooglePlayServicesAvailable = () => {
  if (Platform.OS === 'android') {
    return OkHiNativeModule.isGooglePlayServicesAvailable();
  }
  return Promise.reject(false);
};

export const requestEnableGooglePlayServices = () => {
  if (Platform.OS === 'android') {
    return OkHiNativeModule.requestEnableGooglePlayServices();
  }
  return Promise.reject(false);
};

export const getSystemVersion = () => OkHiNativeModule.getSystemVersion();
