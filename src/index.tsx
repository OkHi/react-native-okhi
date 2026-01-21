import Okhi from './NativeOkhi';
import type { OkCollect, OkHiLogin, OkHiSuccessResponse } from './types';

export type {
  OkHiAuth,
  OkHiUser,
  OkHiAppContext,
  OkHiLogin,
  OkCollect,
  OkCollectStyle,
  OkCollectConfig,
  OkHiLocation,
  OkHiException,
} from './types';

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
