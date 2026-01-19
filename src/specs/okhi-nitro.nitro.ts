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

  isLocationServicesEnabled(
    callback: (result?: boolean, error?: OkHiException) => void
  ): void

  canOpenProtectedApps(
    callback: (result?: boolean, error?: OkHiException) => void
  ): void

  getLocationAccuracyLevel(
    callback: (result?: string, error?: OkHiException) => void
  ): void

  isBackgroundLocationPermissionGranted(
    callback: (result?: boolean, error?: OkHiException) => void
  ): void

  isCoarseLocationPermissionGranted(
    callback: (result?: boolean, error?: OkHiException) => void
  ): void

  isFineLocationPermissionGranted(
    callback: (result?: boolean, error?: OkHiException) => void
  ): void

  isPlayServicesAvailable(
    callback: (result?: boolean, error?: OkHiException) => void
  ): void

  isPostNotificationPermissionGranted(
    callback: (result?: boolean, error?: OkHiException) => void
  ): void

  openProtectedApps(): void

  requestBackgroundLocationPermission(
    callback: (result?: boolean, error?: OkHiException) => void
  ): void

  requestEnableLocationServices(
    callback: (result?: boolean, error?: OkHiException) => void
  ): void

  requestLocationPermission(
    callback: (result?: boolean, error?: OkHiException) => void
  ): void

  requestPostNotificationPermissions(
    callback: (result?: boolean, error?: OkHiException) => void
  ): void
}
