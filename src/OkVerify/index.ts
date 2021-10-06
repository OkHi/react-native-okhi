import { OkHiNativeModule } from '../OkHiNativeModule';

export const startAddressVerification = (
  phoneNumber: string,
  locationId: string,
  lat: number,
  lon: number
) => {
  return OkHiNativeModule.startAddressVerification(
    phoneNumber,
    locationId,
    lat,
    lon
  );
};
