import { Platform } from 'react-native';
import {
  isBackgroundLocationPermissionGranted,
  isGooglePlayServicesAvailable,
  isLocationServicesEnabled,
  requestBackgroundLocationPermission,
  requestEnableGooglePlayServices,
  requestEnableLocationServices,
  requestLocationPermission,
  isLocationPermissionGranted,
} from '../OkCore/Helpers';
import { errorHandler, isValidPlatform } from '../OkCore/_helpers';
import { OkHiNativeModule } from '../OkHiNativeModule';
import type { OkCollectSuccessResponse } from '../OkCollect/types';
import { OkHiException } from '../OkCore/OkHiException';
import type { UsageType } from '../OkCore';
/**
 * Starts verification for a particular address
 * @param {string} phoneNumber A users phone number
 * @param {string} locationId An OkHi location identifier obtained after successfull creation of addresses.
 * @param {number} lat The latitude of the created address
 * @param {number} lon The longitude of the created address
 * @param usageTypes - Optional. An array of verification types that specifies the mode of verification.
 *                            Can include "physical" and/or "digital" as valid values.
 * @returns {Promise<string>} A promise that resolves to a string value of the location identifier
 */
export const start = (
  token: string,
  phoneNumber: string,
  okhiUserId: string,
  locationId: string,
  lat: number,
  lon: number,
  usageTypes?: UsageType
) => {
  return isValidPlatform(() => {
    const utypes: UsageType = Array.isArray(usageTypes)
      ? usageTypes
      : ['digital_verification'];
    return OkHiNativeModule.startAddressVerification(
      token,
      phoneNumber,
      okhiUserId,
      locationId,
      lat,
      lon,
      utypes
    );
  });
};

/**
 * Starts verification for a particular address using the response object returned by OkCollect
 * @param {Object} response Response returned by OkCollect
 * @returns {Promise<string>} A promise that resolves to a string value of the location identifier
 */
export const startVerification = (
  response: OkCollectSuccessResponse
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { location, user } = response;
      if (!user.token || !user.id) {
        throw new OkHiException({
          code: OkHiException.UNAUTHORIZED_CODE,
          message: OkHiException.UNAUTHORIZED_MESSAGE,
        });
      }
      if (!location.id) {
        throw new OkHiException({
          code: OkHiException.BAD_REQUEST_CODE,
          message: 'Missing location id from response',
        });
      }
      const usageTypes: UsageType = Array.isArray(response.location.usageTypes)
        ? response.location.usageTypes
        : ['digital_verification'];
      const result = await OkHiNativeModule.startAddressVerification(
        user.token,
        user.phone,
        user.id,
        location.id,
        location.lat,
        location.lon,
        usageTypes
      );
      resolve(result);
    } catch (error) {
      reject(error);
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
    const whenInUseLocationPerm = await isLocationPermissionGranted();
    if (!requestServices) {
      resolve(
        locationServicesStatus && googlePlayServices && backgroundLocationPerm
      );
      return;
    }
    if (Platform.OS === 'ios') {
      if (!locationServicesStatus) {
        reject(
          new OkHiException({
            code: OkHiException.SERVICE_UNAVAILABLE_CODE,
            message: 'Location services is unavailable',
          })
        );
        return;
      }
      if (backgroundLocationPerm) {
        resolve(true);
        return;
      }
      if (whenInUseLocationPerm && !backgroundLocationPerm) {
        resolve(false);
        return;
      }
      const iosPerm = await requestBackgroundLocationPermission();
      resolve(iosPerm);
      return;
    } else if (Platform.OS === 'android') {
      const locationServicesRequestStatus =
        (await requestEnableLocationServices()) as boolean;
      const gPlayServices = await requestEnableGooglePlayServices();
      const androidPerm =
        (await requestLocationPermission()) &&
        (await requestBackgroundLocationPermission());
      resolve(locationServicesRequestStatus && gPlayServices && androidPerm);
    } else {
      reject(
        new OkHiException({
          code: OkHiException.UNSUPPORTED_PLATFORM_CODE,
          message: OkHiException.UNSUPPORTED_PLATFORM_MESSAGE,
        })
      );
    }
  });
};

/**
 * Checks whether all necessary permissions and services are available in order to start the address verification process
 * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether or not all conditions are met to start the address verification process
 */
export const checkVerificationStartRequirements = (): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    if (Platform.OS === 'android') {
      const isPlayServicesAvailable = await isGooglePlayServicesAvailable();
      if (!isPlayServicesAvailable) {
        reject(
          new OkHiException({
            code: OkHiException.PLAY_SERVICES_UNAVAILABLE_CODE,
            message: 'Google Play Services is unavailable',
          })
        );
        return;
      }
    }
    if (!(await isLocationServicesEnabled())) {
      reject(
        new OkHiException({
          code: OkHiException.LOCATION_SERVICES_UNAVAILABLE_CODE,
          message: 'Location services unavailable',
        })
      );
      return;
    }
    if (!(await isBackgroundLocationPermissionGranted())) {
      reject(
        new OkHiException({
          code: OkHiException.PERMISSION_DENIED_CODE,
          message: 'Background Location permission not granted',
        })
      );
      return;
    }
    resolve(true);
  });
};

/**
 * Android Only - Updates user's device firebase push notification token
 * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the service has started successfully
 */
export const onNewToken = (fcmPushNotificationToken: string) => {
  if (Platform.OS === 'android') {
    return OkHiNativeModule.onNewToken(fcmPushNotificationToken);
  }
  return Promise.resolve(true);
};

/**
 * Android Only - Should be invoked only when push notification is received.
 * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the service has started successfully
 */
export const onMessageReceived = () => {
  if (Platform.OS === 'android') {
    return OkHiNativeModule.onMessageReceived();
  }
  return Promise.resolve(true);
};
