import { NativeModules, NativeEventEmitter } from 'react-native';
import type { OkVerifyStartConfiguration } from '../OkVerify/types';

type OkHiNativeModuleType = {
  isLocationServicesEnabled(): Promise<boolean>;
  isLocationPermissionGranted(): Promise<boolean>;
  isBackgroundLocationPermissionGranted(): Promise<boolean>;
  requestLocationPermission(): Promise<boolean>;
  requestBackgroundLocationPermission(): Promise<boolean>;
  requestEnableLocationServices(): Promise<boolean>;
  isGooglePlayServicesAvailable(): Promise<boolean>;
  requestEnableGooglePlayServices(): Promise<boolean>;
  getSystemVersion(): Promise<number | string>;
  getAuthToken(branchId: string, clientKey: string): Promise<string>;
  initialize(configuration: string): Promise<void>;
  startAddressVerification(
    phoneNumber: string,
    locationId: string,
    lat: Number,
    lon: Number,
    configuration?: OkVerifyStartConfiguration
  ): Promise<string>;
  stopAddressVerification(
    phoneNumber: string,
    locationId: string
  ): Promise<string>;
  startForegroundService(): Promise<boolean>;
  stopForegroundService(): Promise<boolean>;
  isForegroundServiceRunning(): Promise<boolean>;
  initializeIOS(
    branchId: string,
    clientKey: string,
    environment: string
  ): Promise<boolean>;
  openAppSettings(): Promise<void>;
  retriveLocationPermissionStatus(): Promise<string>;
  requestTrackingAuthorization(): Promise<string | null>;
  canOpenProtectedAppsSettings(): Promise<boolean>;
  openProtectedAppsSettings(): Promise<boolean>;
  retrieveDeviceInfo(): Promise<{ manufacturer: string; model: string }>;
};

export const OkHiNativeModule: OkHiNativeModuleType = NativeModules.Okhi;

export const OkHiNativeEvents = new NativeEventEmitter(NativeModules.Okhi);

OkHiNativeEvents.addListener('onLocationPermissionStatusUpdate', () => null);
