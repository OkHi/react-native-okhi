import { OkHiNativeModule } from '../OkHiNativeModule';

export const startAddressVerification = (
  phoneNumber: string,
  locationId: string,
  lat: number,
  lon: number
) => {
  //TODO: add config for start without foreground service
  return OkHiNativeModule.startAddressVerification(
    phoneNumber,
    locationId,
    lat,
    lon
  );
};

export const stopAddressVerification = (
  phoneNumber: string,
  locationId: string
) => OkHiNativeModule.stopAddressVerification(phoneNumber, locationId);

export const startForegroundService = () =>
  OkHiNativeModule.startForegroundService();

export const stopForegroundService = () =>
  OkHiNativeModule.stopForegroundService();
