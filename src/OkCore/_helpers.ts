import { Platform, PlatformOSType } from 'react-native';
import { OkHiException } from './';

const SUPPORTED_PLATFORMS = ['ios', 'android'];

export function isValidPlatform<T>(
  fn: () => Promise<T>,
  platform?: PlatformOSType
) {
  return new Promise<T>((resolve, reject) => {
    const error = new OkHiException({
      code: OkHiException.UNSUPPORTED_PLATFORM_CODE,
      message: OkHiException.UNSUPPORTED_PLATFORM_MESSAGE,
    });
    if (platform && Platform.OS !== platform) {
      reject(error);
    } else if (!SUPPORTED_PLATFORMS.includes(Platform.OS)) {
      reject(error);
    } else {
      fn()
        .then(resolve)
        .catch((error) => {
          reject(
            new OkHiException({
              code: error.code || OkHiException.UNKNOWN_ERROR_CODE,
              message: error.message || OkHiException.UNKNOWN_ERROR_MESSAGE,
            })
          );
        });
    }
  });
}

export function errorHandler<T>(fn: () => Promise<T>) {
  return new Promise<T>((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        reject(
          new OkHiException({
            code: error.code || OkHiException.UNKNOWN_ERROR_CODE,
            message: error.message || OkHiException.UNKNOWN_ERROR_MESSAGE,
          })
        );
      });
  });
}
