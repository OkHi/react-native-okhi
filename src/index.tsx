import { Platform } from 'react-native';
import Okhi from './NativeOkhi';
import type { OkCollect, OkHiLogin, OkHiSuccessResponse } from './types';
export * from './types';

export function multiply(a: number, b: number): number {
  return Okhi.multiply(a, b);
}

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

// MARK: - Check Helpers

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

// MARK: - Request Helpers

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
