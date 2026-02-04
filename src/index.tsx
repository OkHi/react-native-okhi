/**
 * @packageDocumentation
 * React Native OkHi SDK
 *
 * A comprehensive React Native library for address verification using OkHi's
 * digital and physical verification methods.
 *
 * @example
 * ```typescript
 * import * as OkHi from 'react-native-okhi';
 *
 * // 1. Login
 * await OkHi.login({
 *   auth: { branchId: 'xxx', clientKey: 'xxx' },
 *   user: { firstName: 'John', lastName: 'Doe', phone: '+254...', email: '...' },
 * });
 *
 * // 2. Start verification
 * const result = await OkHi.startDigitalAddressVerification();
 * console.log('Verified address:', result.location.formattedAddress);
 * ```
 */

import { Platform } from 'react-native';
import Okhi from './NativeOkhi';
import type { OkCollect, OkHiLogin, OkHiSuccessResponse } from './types';
export type * from './types';

/**
 * Authenticates a user with the OkHi platform.
 *
 * @remarks
 * This must be called before any verification functions. It establishes
 * the user session and validates your API credentials.
 *
 * The login persists for the duration of the app session. You should call
 * this when your user signs in or when starting an address verification flow.
 *
 * @param credentials - The login configuration containing auth credentials and user info
 * @returns A promise that resolves with an array of permission strings that were granted,
 *          or `null` if `withPermissionsRequest` was not enabled
 *
 * @example
 * ```typescript
 * import * as OkHi from 'react-native-okhi';
 * import type { OkHiLogin } from 'react-native-okhi';
 *
 * const credentials: OkHiLogin = {
 *   auth: {
 *     branchId: 'your_branch_id',
 *     clientKey: 'your_client_key',
 *   },
 *   user: {
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     phone: '+254712345678',
 *     email: 'john.doe@example.com',
 *   },
 * };
 *
 * try {
 *   await OkHi.login(credentials);
 *   console.log('Login successful');
 * } catch (error) {
 *   console.error('Login failed:', error);
 * }
 * ```
 *
 * @see {@link OkHiLogin} - Configuration type
 * @see {@link startDigitalAddressVerification} - Call after login to verify addresses
 */
export function login(credentials: OkHiLogin): Promise<string[] | null> {
  return new Promise((resolve) => {
    Okhi.login(credentials, (results) => {
      resolve(results);
    });
  });
}

// Helper to build config with defaults
function buildConfig(okcollect?: OkCollect) {
  return {
    style: {
      color: okcollect?.style?.color ?? '#005D67',
      logo: okcollect?.style?.logo ?? 'https://cdn.okhi.co/icon.png',
    },
    configuration: {
      withAppBar: true,
      streetView: okcollect?.configuration?.streetView ?? true,
      withHomeAddressType:
        okcollect?.configuration?.withHomeAddressType ?? true,
      withWorkAddressType:
        okcollect?.configuration?.withWorkAddressType ?? false,
    },
    locationId: okcollect?.locationId,
  };
}

// Helper to process response
function processVerificationResponse(
  response: unknown,
  error: unknown,
  resolve: (value: OkHiSuccessResponse) => void,
  reject: (reason: { code: string; message: string }) => void
) {
  try {
    const res = response as { user: string; location: string };
    if (response != null) {
      resolve({
        user: JSON.parse(res.user),
        location: JSON.parse(res.location),
      });
    } else if (error != null) {
      const err = error as { code: string; message: string };
      reject({
        code: err.code,
        message: err.message,
      });
    } else {
      reject({
        code: 'unknown',
        message: 'unable to complete operation - unknown response',
      });
    }
  } catch {
    reject({
      code: 'unknown',
      message: 'unable to complete operation - unknown error',
    });
  }
}

/**
 * @remarks
 * Starts the digital address verification flow.
 *
 * **Prerequisites:**
 * - Must call {@link login} first
 *
 * @param okcollect - Optional configuration for styling and behavior
 * @returns A promise that resolves with the user and location data
 *
 * @example
 * ```typescript
 * import * as OkHi from 'react-native-okhi';
 *
 * // Basic usage with defaults
 * const result = await OkHi.startDigitalAddressVerification();
 * console.log('Address:', result.location.formattedAddress);
 * console.log('Location ID:', result.location.id);
 * ```
 *
 * @example
 * ```typescript
 * import * as OkHi from 'react-native-okhi';
 * import type { OkCollect } from 'react-native-okhi';
 *
 * // With custom styling
 * const config: OkCollect = {
 *   style: {
 *     color: '#FF5722',
 *     logo: 'https://example.com/logo.png',
 *   },
 *   configuration: {
 *     streetView: true,
 *   },
 * };
 *
 * const result = await OkHi.startDigitalAddressVerification(config);
 * ```
 *
 * @example
 * ```typescript
 * import * as OkHi from 'react-native-okhi';
 *
 * // Start verification on previously created address
 * const locationId: string = await fetchLocationIDFromMyDB()
 * const result = await OkHi.startDigitalAddressVerification({
 *   locationId: locationId,
 * });
 * ```
 *
 * @see {@link OkCollect} - Configuration options
 * @see {@link OkHiSuccessResponse} - Return type
 * @see {@link startPhysicalAddressVerification} - For physical verification
 * @see {@link startDigitalAndPhysicalAddressVerification} - For combined verification
 */
export function startDigitalAddressVerification(
  okcollect?: OkCollect
): Promise<OkHiSuccessResponse> {
  const config = buildConfig(okcollect);
  return new Promise((resolve, reject) => {
    Okhi.startDigitalAddressVerification(config, (response, error) => {
      processVerificationResponse(response, error, resolve, reject);
    });
  });
}

/**
 * Starts the physical address verification flow.
 *
 * @remarks
 * Physical verification requires an agent to visit the user's location
 * in person.
 *
 * **Prerequisites:**
 * - Must call {@link login} first
 *
 * @param okcollect - Optional configuration for styling and behavior
 * @returns A promise that resolves with the user and location data
 *
 * @example
 * ```typescript
 * import * as OkHi from 'react-native-okhi';
 *
 * const result = await OkHi.startPhysicalAddressVerification();
 * console.log('Verification requested for:', result.location.formattedAddress);
 * console.log('Location ID for tracking:', result.location.id);
 * ```
 *
 * @example
 * ```typescript
 * import * as OkHi from 'react-native-okhi';
 *
 * // With custom configuration
 * const result = await OkHi.startPhysicalAddressVerification({
 *   style: { color: '#2196F3' },
 * });
 * ```
 *
 * @see {@link OkCollect} - Configuration options
 * @see {@link OkHiSuccessResponse} - Return type
 * @see {@link startDigitalAddressVerification} - For instant digital verification
 * @see {@link startDigitalAndPhysicalAddressVerification} - For combined verification
 */
export function startPhysicalAddressVerification(
  okcollect?: OkCollect
): Promise<OkHiSuccessResponse> {
  const config = buildConfig(okcollect);
  return new Promise((resolve, reject) => {
    Okhi.startPhysicalAddressVerification(config, (response, error) => {
      processVerificationResponse(response, error, resolve, reject);
    });
  });
}

/**
 * Starts both digital and physical address verification flows.
 *
 * @remarks
 * This combines both verification methods for maximum confidence.
 *
 * **Prerequisites:**
 * - Must call {@link login} first
 *
 * @param okcollect - Optional configuration for styling and behavior
 * @returns A promise that resolves with the user and location data
 *
 * @example
 * ```typescript
 * import * as OkHi from 'react-native-okhi';
 *
 * const result = await OkHi.startDigitalAndPhysicalAddressVerification();
 * console.log('Physical + Digital Verification started for:', result.location.id);
 * ```
 *
 * @example
 * ```typescript
 * import * as OkHi from 'react-native-okhi';
 *
 * // With full customization
 * const result = await OkHi.startDigitalAndPhysicalAddressVerification({
 *   style: {
 *     color: '#4CAF50',
 *     logo: 'https://example.com/logo.png',
 *   },
 *   configuration: {
 *     streetView: true,
 *   },
 * });
 * ```
 *
 * @see {@link OkCollect} - Configuration options
 * @see {@link OkHiSuccessResponse} - Return type
 * @see {@link startDigitalAddressVerification} - For digital-only verification
 * @see {@link startPhysicalAddressVerification} - For physical-only verification
 */
export function startDigitalAndPhysicalAddressVerification(
  okcollect?: OkCollect
): Promise<OkHiSuccessResponse> {
  const config = buildConfig(okcollect);
  return new Promise((resolve, reject) => {
    Okhi.startDigitalAndPhysicalAddressVerification(
      config,
      (response, error) => {
        processVerificationResponse(response, error, resolve, reject);
      }
    );
  });
}

/**
 * Creates an address without starting verification.
 *
 * @remarks
 * Use this when you want to collect and store an address but defer
 * verification to a later time. The address can
 * be verified later using the returned `locationId`.
 *
 * **Prerequisites:**
 * - Must call {@link login} first
 *
 * @param okcollect - Optional configuration for styling and behavior
 * @returns A promise that resolves with the user and location data
 *
 * @example
 * ```typescript
 * import * as OkHi from 'react-native-okhi';
 *
 * // Create address without verification
 * const result = await OkHi.createAddress();
 * console.log('Address created:', result.location.id);
 *
 * // Save the location ID to verify later
 * const locationId = result.location.id;
 * await saveToDatabase({ locationId: locationId });
 * ```
 *
 * @example
 * ```typescript
 * import * as OkHi from 'react-native-okhi';
 *
 * // Later, verify the saved address
 * const savedLocationId = await fetchLocationIdFromMyDB();
 * const result = await OkHi.startDigitalAddressVerification({
 *   locationId: savedLocationId,
 * });
 * ```
 *
 * @see {@link OkCollect} - Configuration options
 * @see {@link OkHiSuccessResponse} - Return type
 * @see {@link startDigitalAddressVerification} - To verify an address
 */
export function createAddress(
  okcollect?: OkCollect
): Promise<OkHiSuccessResponse> {
  const config = buildConfig(okcollect);
  return new Promise((resolve, reject) => {
    Okhi.createAddress(config, (response, error) => {
      processVerificationResponse(response, error, resolve, reject);
    });
  });
}

// Helper to process boolean response
function processBooleanResponse(
  result: unknown,
  error: unknown,
  resolve: (value: boolean) => void,
  reject: (reason: { code: string; message: string }) => void
) {
  if (error != null) {
    const err = error as { code: string; message: string };
    reject({ code: err.code, message: err.message });
  } else {
    resolve(result as boolean);
  }
}

// Helper to process string response
function processStringResponse(
  result: unknown,
  error: unknown,
  resolve: (value: string) => void,
  reject: (reason: { code: string; message: string }) => void
) {
  if (error != null) {
    const err = error as { code: string; message: string };
    reject({ code: err.code, message: err.message });
  } else {
    resolve(result as string);
  }
}

export function isLocationServicesEnabled(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    Okhi.isLocationServicesEnabled((result, error) => {
      processBooleanResponse(result, error, resolve, reject);
    });
  });
}

export function canOpenProtectedApps(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    Okhi.canOpenProtectedApps((result, error) => {
      processBooleanResponse(result, error, resolve, reject);
    });
  });
}

export function getLocationAccuracyLevel(): Promise<string> {
  return new Promise((resolve, reject) => {
    Okhi.getLocationAccuracyLevel((result, error) => {
      processStringResponse(result?.toLowerCase(), error, resolve, reject);
    });
  });
}

export function isBackgroundLocationPermissionGranted(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    Okhi.isBackgroundLocationPermissionGranted((result, error) => {
      processBooleanResponse(result, error, resolve, reject);
    });
  });
}

export function isCoarseLocationPermissionGranted(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    Okhi.isCoarseLocationPermissionGranted((result, error) => {
      processBooleanResponse(result, error, resolve, reject);
    });
  });
}

export function isFineLocationPermissionGranted(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    Okhi.isFineLocationPermissionGranted((result, error) => {
      processBooleanResponse(result, error, resolve, reject);
    });
  });
}

export function isPlayServicesAvailable(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    Okhi.isPlayServicesAvailable((result, error) => {
      processBooleanResponse(result, error, resolve, reject);
    });
  });
}

export function isPostNotificationPermissionGranted(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    Okhi.isPostNotificationPermissionGranted((result, error) => {
      processBooleanResponse(result, error, resolve, reject);
    });
  });
}

export function openProtectedApps(): Promise<void> {
  return new Promise((resolve) => {
    Okhi.openProtectedApps();
    resolve();
  });
}

export function requestLocationPermission(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    Okhi.requestLocationPermission((result, error) => {
      processBooleanResponse(result, error, resolve, reject);
    });
  });
}

export function requestBackgroundLocationPermission(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    Okhi.requestBackgroundLocationPermission((result, error) => {
      processBooleanResponse(result, error, resolve, reject);
    });
  });
}

export function requestEnableLocationServices(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    Okhi.requestEnableLocationServices((result, error) => {
      processBooleanResponse(result, error, resolve, reject);
    });
  });
}

export function requestPostNotificationPermissions(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (Platform.OS === 'ios') {
      reject({
        code: 'unsupported_platform',
        message: 'operation not supported',
      });
    } else {
      Okhi.requestPostNotificationPermissions((result, error) => {
        processBooleanResponse(result, error, resolve, reject);
      });
    }
  });
}
