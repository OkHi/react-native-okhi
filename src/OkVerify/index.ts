import { Platform } from 'react-native';
import {
  isBackgroundLocationPermissionGranted,
  isGooglePlayServicesAvailable,
  isLocationServicesEnabled,
  OkCollectSuccessResponse,
  OkHiException,
  requestBackgroundLocationPermission,
  requestEnableGooglePlayServices,
  requestEnableLocationServices,
} from '../';
import { errorHandler, isValidPlatform } from '../OkCore/_helpers';
import { OkHiNativeModule } from '../OkHiNativeModule';
import type { OkVerifyStartConfiguration } from './types';

export const start = (
  phoneNumber: string,
  locationId: string,
  lat: number,
  lon: number,
  configuration?: OkVerifyStartConfiguration
) => {
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

export const startVerification = async (
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

export const stopVerification = (phoneNumber: string, locationId: string) => {
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
  return isValidPlatform(OkHiNativeModule.stopForegroundService, 'android');
};

export const isForegroundServiceRunning = () => {
  return isValidPlatform(
    OkHiNativeModule.isForegroundServiceRunning,
    'android'
  );
};

export const canStartVerification = (configuration?: {
  requestServices?: boolean;
}): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    const requestServices = configuration && configuration.requestServices;
    const locationServicesStatus = await isLocationServicesEnabled();
    const googlePlayServices =
      Platform.OS === 'android' ? await isGooglePlayServicesAvailable() : true;
    const backgroundLocationPerm =
      await isBackgroundLocationPermissionGranted();
    if (!requestServices) {
      resolve(
        locationServicesStatus && googlePlayServices && backgroundLocationPerm
      );
    }
    if (!locationServicesStatus && Platform.OS === 'ios') {
      reject(
        new OkHiException({
          code: OkHiException.SERVICE_UNAVAILABLE_CODE,
          message: 'Location services is unavailable',
        })
      );
    } else {
      const locationServicesRequestStatus =
        (await requestEnableLocationServices()) as boolean;
      const googlePlayServicesRequestStatus =
        Platform.OS === 'android'
          ? await requestEnableGooglePlayServices()
          : true;
      const backgroundLocationRequestStatus =
        await requestBackgroundLocationPermission();
      resolve(
        locationServicesRequestStatus &&
          googlePlayServicesRequestStatus &&
          backgroundLocationRequestStatus
      );
    }
  });
};
