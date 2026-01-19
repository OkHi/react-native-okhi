import { type HybridObject } from 'react-native-nitro-modules'
import type {
  NitroOkCollect,
  NitroOkHiSuccessResponse,
  OkHiException,
  OkHiLogin,
} from '../types'

type OkHiVerificationType =
  | 'DIGITAL'
  | 'PHYSICAL'
  | 'DIGITALANDPHYSICAL'
  | 'ADDRESSBOOK'

export interface OkhiNitro extends HybridObject<{
  ios: 'swift'
  android: 'kotlin'
}> {
  login(credentials: OkHiLogin, callback: (results?: string[]) => void): void

  startAddressVerification(
    type: OkHiVerificationType,
    okcollect: NitroOkCollect,
    callback: (
      response?: NitroOkHiSuccessResponse,
      error?: OkHiException
    ) => void
  ): void

  isLocationServicesEnabled(callback: (result: boolean) => any): void

  canOpenProtectedApps(callback: (result: boolean) => any): void

  getLocationAccuracyLevel(callback: (result: string) => any): void

  isBackgroundLocationPermissionGranted(
    callback: (result: boolean) => any
  ): void

  isCoarseLocationPermissionGranted(callback: (result: boolean) => any): void

  isFineLocationPermissionGranted(callback: (result: boolean) => any): void

  isPlayServicesAvailable(callback: (result: boolean) => any): void

  isPostNotificationPermissionGranted(callback: (result: boolean) => any): void

  openProtectedApps(): void

  requestBackgroundLocationPermission(callback: (result: boolean) => any): void

  requestEnableLocationServices(callback: (result: boolean) => any): void

  requestLocationPermission(callback: (result: boolean) => any): void

  requestPostNotificationPermissions(callback: (result: boolean) => any): void
}
