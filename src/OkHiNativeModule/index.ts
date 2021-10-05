import { NativeModules } from 'react-native';
import type { OkHiInitializationConfiguration } from '../OkCore/_types';

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
  getAuthToken(branchId: string, clientKey: string): Promise<string>;
  initialize(config: OkHiInitializationConfiguration): Promise<void>;
};

export const OkHiNativeModule: OkHiNativeModuleType = NativeModules.Okhi;
