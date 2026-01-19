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

  isLocationServicesEnabled(callback: (result: boolean) => void): void

  canOpenProtectedApps(callback: (result: boolean) => void): void

  getLocationAccuracyLevel(callback: (result: string) => void): void

  isBackgroundLocationPermissionGranted(
    callback: (result: boolean) => void
  ): void

  isCoarseLocationPermissionGranted(callback: (result: boolean) => void): void

  isFineLocationPermissionGranted(callback: (result: boolean) => void): void

  isPlayServicesAvailable(callback: (result: boolean) => void): void

  isPostNotificationPermissionGranted(callback: (result: boolean) => void): void

  openProtectedApps(): void

  requestBackgroundLocationPermission(callback: (result: boolean) => void): void

  requestEnableLocationServices(callback: (result: boolean) => void): void

  requestLocationPermission(callback: (result: boolean) => void): void

  requestPostNotificationPermissions(callback: (result: boolean) => void): void
}
