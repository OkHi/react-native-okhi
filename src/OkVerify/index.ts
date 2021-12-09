import { Platform } from 'react-native';
import {
  isBackgroundLocationPermissionGranted,
  isGooglePlayServicesAvailable,
  isLocationServicesEnabled,
  requestBackgroundLocationPermission,
  requestEnableGooglePlayServices,
  requestEnableLocationServices,
  requestLocationPermission,
} from '../OkCore/Helpers';
import { errorHandler, isValidPlatform } from '../OkCore/_helpers';
import { OkHiNativeModule } from '../OkHiNativeModule';
import type { OkVerifyStartConfiguration } from './types';
import type { OkCollectSuccessResponse } from '../OkCollect/types';
import { OkHiException } from '../OkCore/OkHiException';
export * from './types';
/**
 * Starts verification for a particular address
 * @param {string} phoneNumber A users phone number
 * @param {string} locationId An OkHi location identifier obtained after successfull creation of addresses.
 * @param {number} lat The latitude of the created address
 * @param {number} lon The longitude of the created address
 * @param {Object} configuration Configures how verification will start on different platforms
 * @param {Object} configuration.android Specifices how verification will start on Android platforms
 * @param {boolean} configuration.android.withForeground Specifices if the foreground service will be turned on to speed up rate of verification, default is true
 * @returns {Promise<string>} A promise that resolves to a string value of the location identifier
 */
export const start = (
  phoneNumber: string,
  locationId: string,
  lat: number,
  lon: number,
  configuration?: OkVerifyStartConfiguration
) => {
  return isValidPlatform(() => {
    if (Platform.OS === 'android') {
      return OkHiNativeModule.startAddressVerification(
        phoneNumber,
        locationId,
        lat,
        lon,
        configuration
      );
    } else {
      return OkHiNativeModule.startAddressVerification(
        phoneNumber,
        locationId,
        lat,
        lon
      );
    }
  });
};

/**
 * Starts verification for a particular address using the response object returned by OkCollect
 * @param {Object} response Response returned by OkCollect
 * @param {Object} configuration Configures how verification will start on different platforms
 * @param {Object} configuration.android Specifices how verification will start on Android platforms
 * @param {boolean} configuration.android.withForeground Specifices if the foreground service will be turned on to speed up rate of verification
 * @returns {Promise<string>} A promise that resolves to a string value of the location identifier
 */
export const startVerification = async (
  response: OkCollectSuccessResponse,
  configuration?: OkVerifyStartConfiguration
) => {
  return new Promise((resolve, reject) => {
    const { location, user } = response;
    if (location.id) {
      if (Platform.OS === 'android') {
        const result = OkHiNativeModule.startAddressVerification(
          user.phone,
          location.id,
          location.lat,
          location.lon,
          configuration
        );
        resolve(result);
      } else {
        const result = OkHiNativeModule.startAddressVerification(
          user.phone,
          location.id,
          location.lat,
          location.lon
        );
        resolve(result);
      }
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

/**
 * Stops verification for a particular address using a user's phonenumber and OkHi location identifier
 * @param {string} phoneNumber The user's phone number
 * @param {string} locationId An OkHi location identifier obtained after successfull creation of addresses.
 * @returns {Promise<string>} A promise that resolves to a string value of the location identifier
 */
export const stopVerification = (phoneNumber: string, locationId: string) => {
  return isValidPlatform(() =>
    OkHiNativeModule.stopAddressVerification(phoneNumber, locationId)
  );
};

/**
 * Android Only - Starts a foreground service that speeds up rate of verification
 * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the service has started successfully
 */
export const startForegroundService = () => {
  return isValidPlatform(
    () => errorHandler(OkHiNativeModule.startForegroundService),
    'android'
  );
};

/**
 * Android Only - Stops previously started foreground services
 * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the service has stopped successfully
 */
export const stopForegroundService = () => {
  return isValidPlatform(OkHiNativeModule.stopForegroundService, 'android');
};

/**
 * Android Only - Checks if the foreground service is running
 * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the service is running
 */
export const isForegroundServiceRunning = () => {
  return isValidPlatform(
    OkHiNativeModule.isForegroundServiceRunning,
    'android'
  );
};

/**
 * Checks whether all necessary permissions and services are available in order to start the address verification process
 * @param {Object} configuration Object that determines whether or not to request these permissions and services from the user
 * @param {boolean} configuration.requestServices Flag that determines whether to request the services from the user
 * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether or not all conditions are met to start the address verification process
 */
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
      return;
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
        Platform.OS === 'ios'
          ? true
          : ((await requestEnableLocationServices()) as boolean);
      const gPlayServices =
        Platform.OS === 'ios' ? true : await requestEnableGooglePlayServices();
      let perm = false;
      if (Platform.OS === 'ios') {
        perm = await requestBackgroundLocationPermission();
      } else {
        perm =
          (await requestLocationPermission()) &&
          (await requestBackgroundLocationPermission());
      }
      resolve(locationServicesRequestStatus && gPlayServices && perm);
    }
  });
};
