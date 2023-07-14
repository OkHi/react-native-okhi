import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import type { OkVerifyStartConfiguration } from '../OkVerify/types';

const LINKING_ERROR =
  `The package 'react-native-okhi' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

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
    configuration?: OkVerifyStartConfiguration,
    fcmPushNotificationToken?: string
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
  setItem(key: string, value: string): Promise<boolean>;
  onNewToken(fcmPushNotificationToken: string): Promise<boolean>;
  onMessageReceived(): Promise<boolean>;
  isNotificationPermissionGranted(): Promise<boolean>;
  requestNotificationPermission(): Promise<boolean>;
  fetchCurrentLocation(): Promise<null | {
    lat: number;
    lng: number;
    accuracy: number;
  }>;
};

export const OkHiNativeModule: OkHiNativeModuleType = NativeModules.Okhi
  ? NativeModules.Okhi
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export const OkHiNativeEvents = new NativeEventEmitter(NativeModules.Okhi);

OkHiNativeEvents.addListener('onLocationPermissionStatusUpdate', () => null);
