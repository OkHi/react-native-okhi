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

export function startDigitalVerification(
  okcollect?: OkCollect
): Promise<OkHiSuccessResponse> {
  const config = {
    style: {
      color: okcollect?.style?.color ?? '#005D67',
      logo: okcollect?.style?.logo ?? 'https://cdn.okhi.co/icon.png',
    },
    configuration: {
      streetView: okcollect?.configuration?.streetView ?? true,
      withHomeAddressType:
        okcollect?.configuration?.withHomeAddressType ?? true,
      withWorkAddressType:
        okcollect?.configuration?.withWorkAddressType ?? false,
    },
    locationId: okcollect?.locationId,
  };

  return new Promise((resolve, reject) => {
    Okhi.startDigitalVerification(config, (response, error) => {
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
            message: 'unable to start verification - unknown response',
          });
        }
      } catch (error) {
        reject({
          code: 'unknown',
          message: 'unable to start verification - unknown error',
        });
      }
    });
  });
}
