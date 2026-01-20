/**
 * Helper functions for checking device capabilities and managing permissions.
 * These utilities help ensure the device meets the requirements for OkHi address verification.
 *
 * @module helpers
 */

import { OkHiNitro } from './functions'
import type { OkHiException } from './types';

/**
 * Checks if location services are enabled on the device.
 *
 * @returns Promise resolving to `true` if location services are enabled, `false` otherwise.
 * @throws {OkHiException} If the check fails due to an unexpected error.
 *
 * @example
 * ```typescript
 * const enabled = await isLocationServicesEnabled();
 * if (!enabled) {
 *   // Prompt user to enable location services
 *   await requestEnableLocationServices();
 * }
 * ```
 */
export async function isLocationServicesEnabled(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.isLocationServicesEnabled((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

/**
 * Checks if the device supports opening the "protected apps" settings.
 * This is primarily relevant for Android devices with aggressive battery optimization
 * (e.g., Huawei, Xiaomi, Oppo) that may kill background processes.
 *
 * @returns Promise resolving to `true` if the protected apps settings can be opened, `false` otherwise.
 * @throws {OkHiException} If the check fails due to an unexpected error.
 * @platform Android
 *
 * @example
 * ```typescript
 * const canOpen = await canOpenProtectedApps();
 * if (canOpen) {
 *   // Show UI explaining why the user should whitelist the app
 *   await openProtectedApps();
 * }
 * ```
 */
export async function canOpenProtectedApps(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.canOpenProtectedApps((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

/**
 * Gets the current location permission accuracy level granted by the user.
 *
 * @returns Promise resolving to one of:
 *   - `"precise"` - User granted precise/fine location access
 *   - `"approximate"` - User granted only approximate/coarse location access
 *   - `"no_permission"` - No location permission has been granted
 * @throws {OkHiException} If the check fails due to an unexpected error.
 *
 * @remarks
 * For optimal address verification, precise location is recommended.
 * If approximate is returned, consider requesting precise location permission.
 *
 * @example
 * ```typescript
 * const accuracy = await getLocationAccuracyLevel();
 * if (accuracy === 'no_permission') {
 *   await requestLocationPermission();
 * } else if (accuracy === 'approximate') {
 *   // Optionally request upgrade to precise location
 * }
 * ```
 */
export async function getLocationAccuracyLevel(): Promise<"precise" | "no_permission" | "approximate"> {
  return new Promise((resolve, reject) => {
    OkHiNitro.getLocationAccuracyLevel((result, error) => {
      if (typeof result === "string") {
        resolve(result.toLowerCase() as "precise" | "no_permission" | "approximate")
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

/**
 * Checks if background location permission has been granted.
 * Background location is required for OkHi to collect location signals
 * when your app is not in the foreground.
 *
 * @returns Promise resolving to `true` if background location permission is granted.
 * @throws {OkHiException} If the check fails due to an unexpected error.
 *
 * @remarks
 * On Android, this corresponds to `ACCESS_BACKGROUND_LOCATION`.
 * On iOS, this corresponds to "Always" location permission.
 * This permission is essential for address verification to work reliably.
 *
 * @example
 * ```typescript
 * const hasPermission = await isBackgroundLocationPermissionGranted();
 * if (!hasPermission) {
 *   await requestBackgroundLocationPermission();
 * }
 * ```
 */
export async function isBackgroundLocationPermissionGranted(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.isBackgroundLocationPermissionGranted((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

/**
 * Checks if coarse (approximate) location permission has been granted.
 *
 * @returns Promise resolving to `true` if coarse location permission is granted.
 * @throws {OkHiException} If the check fails due to an unexpected error.
 *
 * @remarks
 * On Android, this corresponds to `ACCESS_COARSE_LOCATION`.
 * While coarse location can work, fine location is recommended for better accuracy.
 *
 * @see {@link isFineLocationPermissionGranted} for checking precise location permission.
 */
export async function isCoarseLocationPermissionGranted(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.isCoarseLocationPermissionGranted((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

/**
 * Checks if fine (precise) location permission has been granted.
 *
 * @returns Promise resolving to `true` if fine location permission is granted.
 * @throws {OkHiException} If the check fails due to an unexpected error.
 *
 * @remarks
 * On Android, this corresponds to `ACCESS_FINE_LOCATION`.
 * On iOS, this corresponds to "When In Use" or "Always" with precise location enabled.
 * Fine location is recommended for optimal address verification accuracy.
 *
 * @see {@link isCoarseLocationPermissionGranted} for checking approximate location permission.
 */
export async function isFineLocationPermissionGranted(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.isFineLocationPermissionGranted((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

/**
 * Checks if Google Play Services is available on the device.
 * Play Services is required for OkHi to function on Android devices.
 *
 * @returns Promise resolving to `true` if Play Services is available.
 * @throws {OkHiException} If the check fails due to an unexpected error.
 * @platform Android
 *
 * @remarks
 * On iOS, this always returns `true` as Play Services is not applicable.
 * On Android, if Play Services is unavailable, OkHi verification features will not work.
 */
export async function isPlayServicesAvailable(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.isPlayServicesAvailable((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

/**
 * Checks if notification permission has been granted.
 * Notifications are used to inform users about verification status updates.
 *
 * @returns Promise resolving to `true` if notification permission is granted.
 * @throws {OkHiException} If the check fails due to an unexpected error.
 *
 * @remarks
 * On Android 13+ (API 33+), `POST_NOTIFICATIONS` permission must be explicitly granted.
 * On older Android versions and iOS, this may behave differently based on OS-level settings.
 *
 * @example
 * ```typescript
 * const canNotify = await isPostNotificationPermissionGranted();
 * if (!canNotify) {
 *   await requestPostNotificationPermissions();
 * }
 * ```
 */
export async function isPostNotificationPermissionGranted(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.isPostNotificationPermissionGranted((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

/**
 * Opens the device's "protected apps" or battery optimization settings.
 * Use this to guide users to whitelist your app from battery optimization,
 * ensuring background location collection continues reliably.
 *
 * @returns Promise that resolves when the settings screen is opened.
 * @platform Android
 *
 * @remarks
 * This is particularly important for devices from manufacturers with aggressive
 * battery optimization (Huawei, Xiaomi, Oppo, Vivo, etc.).
 * Check {@link canOpenProtectedApps} first to determine if this is supported.
 *
 * @example
 * ```typescript
 * if (await canOpenProtectedApps()) {
 *   // Show explanation dialog to user, then:
 *   await openProtectedApps();
 * }
 * ```
 */
export async function openProtectedApps(): Promise<void> {
  return new Promise(() => {
    return OkHiNitro.openProtectedApps()
  });
}

/**
 * Requests background location permission from the user.
 * Background location is essential for OkHi to collect location signals
 * when your app is not actively being used.
 *
 * @returns Promise resolving to `true` if permission was granted, `false` otherwise.
 * @throws {OkHiException} If the request fails due to an unexpected error.
 *
 * @remarks
 * On Android, this requests `ACCESS_BACKGROUND_LOCATION`.
 * On iOS, this requests "Always" location permission.
 *
 * Best practice: Request foreground location permission first using {@link requestLocationPermission},
 * then request background location with a clear explanation of why it's needed.
 *
 * @example
 * ```typescript
 * // First ensure foreground permission is granted
 * await requestLocationPermission();
 *
 * // Then request background permission
 * const granted = await requestBackgroundLocationPermission();
 * if (granted) {
 *   // Proceed with address verification
 * }
 * ```
 */
export async function requestBackgroundLocationPermission(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.requestBackgroundLocationPermission((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

/**
 * Prompts the user to enable location services on their device.
 * Displays a system dialog directing the user to location settings.
 *
 * @returns Promise resolving to `true` if location services were enabled, `false` otherwise.
 * @throws {OkHiException} If the request fails due to an unexpected error.
 *
 * @example
 * ```typescript
 * const enabled = await isLocationServicesEnabled();
 * if (!enabled) {
 *   const userEnabled = await requestEnableLocationServices();
 *   if (!userEnabled) {
 *     // Handle case where user declined to enable location
 *   }
 * }
 * ```
 */
export async function requestEnableLocationServices(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.requestEnableLocationServices((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

/**
 * Requests foreground location permission from the user.
 * This is typically the first location permission to request before
 * requesting background location.
 *
 * @returns Promise resolving to `true` if permission was granted, `false` otherwise.
 * @throws {OkHiException} If the request fails due to an unexpected error.
 *
 * @remarks
 * On Android, this requests `ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION`.
 * On iOS, this requests "When In Use" location permission.
 *
 * @example
 * ```typescript
 * const granted = await requestLocationPermission();
 * if (granted) {
 *   // Now can optionally request background permission
 *   await requestBackgroundLocationPermission();
 * }
 * ```
 */
export async function requestLocationPermission(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.requestLocationPermission((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}

/**
 * Requests notification permission from the user.
 * Notifications allow OkHi to inform users about verification status updates.
 *
 * @returns Promise resolving to `true` if permission was granted, `false` otherwise.
 * @throws {OkHiException} If the request fails due to an unexpected error.
 *
 * @remarks
 * On Android 13+ (API 33+), this displays a permission dialog for `POST_NOTIFICATIONS`.
 * On older Android versions, notifications may be enabled by default.
 *
 * @example
 * ```typescript
 * const granted = await requestPostNotificationPermissions();
 * if (!granted) {
 *   // App can still function, but user won't receive verification updates
 *   console.log('Notifications disabled - user may miss verification updates');
 * }
 * ```
 */
export async function requestPostNotificationPermissions(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OkHiNitro.requestPostNotificationPermissions((result, error) => {
      if (typeof result === "boolean") {
        resolve(result)
      } else {
        const err: OkHiException = error || {code: "unknown", message: "unable to retrive result"}
        reject(err)
      }
    })
  });
}