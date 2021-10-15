import { errorHandler, isValidPlatform } from '../OkCore/_helpers';
import { OkHiNativeModule } from '../OkHiNativeModule';

export const startAddressVerification = (
  phoneNumber: string,
  locationId: string,
  lat: number,
  lon: number
) => {
  //TODO: add config for start without foreground service
  return isValidPlatform(() => {
    return OkHiNativeModule.startAddressVerification(
      phoneNumber,
      locationId,
      lat,
      lon
    );
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
