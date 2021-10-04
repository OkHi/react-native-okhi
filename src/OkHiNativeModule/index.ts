import { NativeModules } from 'react-native';

type OkHiNativeModuleType = {
  multiply(a: number, b: number): Promise<number>;
  isLocationServicesEnabled(): Promise<boolean>;
  isLocationPermissionGranted(): Promise<boolean>;
  isBackgroundLocationPermissionGranted(): Promise<boolean>;
  requestLocationPermission(): Promise<boolean>;
  requestBackgroundLocationPermission(): Promise<boolean>;
  requestEnableLocationServices(): Promise<boolean>;
  isGooglePlayServicesAvailable(): Promise<boolean>;
  requestEnableGooglePlayServices(): Promise<boolean>;
  getSystemVersion(): Promise<number | string>;
  getApplicationConfiguration(): Promise<string>;
};

export const OkHiNativeModule: OkHiNativeModuleType = NativeModules.Okhi;
