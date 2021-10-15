import { OkCollectSuccessResponse, OkHiException } from '..';
import { errorHandler, isValidPlatform } from '../OkCore/_helpers';
import { OkHiNativeModule } from '../OkHiNativeModule';
import type { OkVerifyStartConfiguration } from './types';

export const startVerification = (
  phoneNumber: string,
  locationId: string,
  lat: number,
  lon: number,
  configuration?: OkVerifyStartConfiguration
) => {
  //TODO: add config for start without foreground service
  return isValidPlatform(() => {
    return OkHiNativeModule.startAddressVerification(
      phoneNumber,
      locationId,
      lat,
      lon,
      configuration
    );
  });
};

export const startAddressVerification = async (
  response: OkCollectSuccessResponse,
  configuration?: OkVerifyStartConfiguration
) => {
  return new Promise((resolve, reject) => {
    const { location, user } = response;
    if (location.id) {
      const result = OkHiNativeModule.startAddressVerification(
        user.phone,
        location.id,
        location.lat,
        location.lon,
        configuration
      );
      resolve(result);
    } else {
      reject(
        new OkHiException({
          code: OkHiException.BAD_REQUEST_CODE,
          message: 'Missing location id from response',
        })
      );
    }
  });
};

export const stopAddressVerification = (
  phoneNumber: string,
  locationId: string
) => {
  return isValidPlatform(() =>
    OkHiNativeModule.stopAddressVerification(phoneNumber, locationId)
  );
};

export const startForegroundService = () => {
  return isValidPlatform(
    () => errorHandler(OkHiNativeModule.startForegroundService),
    'android'
  );
};

export const stopForegroundService = () => {
  return isValidPlatform(
    () => errorHandler(OkHiNativeModule.stopForegroundService),
    'android'
  );
};
