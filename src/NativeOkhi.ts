import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  login(
    credentials: Object,
    callback: (results: string[] | null) => void
  ): void;
  logout(callback: (results: string[] | null) => void): void;
  startDigitalAddressVerification(
    okcollect: Object,
    callback: (result?: Object, error?: Object) => void
  ): void;
  startPhysicalAddressVerification(
    okcollect: Object,
    callback: (result?: Object, error?: Object) => void
  ): void;
  startDigitalAndPhysicalAddressVerification(
    okcollect: Object,
    callback: (result?: Object, error?: Object) => void
  ): void;
  createAddress(
    okcollect: Object,
    callback: (result?: Object, error?: Object) => void
  ): void;

  // helpers
  isLocationServicesEnabled(
    callback: (result?: boolean, error?: Object) => void
  ): void;
  canOpenProtectedApps(
    callback: (result?: boolean, error?: Object) => void
  ): void;
  getLocationAccuracyLevel(
    callback: (result?: string, error?: Object) => void
  ): void;
  isBackgroundLocationPermissionGranted(
    callback: (result?: boolean, error?: Object) => void
  ): void;
  isCoarseLocationPermissionGranted(
    callback: (result?: boolean, error?: Object) => void
  ): void;
  isFineLocationPermissionGranted(
    callback: (result?: boolean, error?: Object) => void
  ): void;
  isPlayServicesAvailable(
    callback: (result?: boolean, error?: Object) => void
  ): void;
  isPostNotificationPermissionGranted(
    callback: (result?: boolean, error?: Object) => void
  ): void;
  openProtectedApps(): void;

  // request helpers
  requestLocationPermission(
    callback: (result?: boolean, error?: Object) => void
  ): void;
  requestBackgroundLocationPermission(
    callback: (result?: boolean, error?: Object) => void
  ): void;
  requestEnableLocationServices(
    callback: (result?: boolean, error?: Object) => void
  ): void;
  requestPostNotificationPermissions(
    callback: (result?: boolean, error?: Object) => void
  ): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Okhi');
