import { Platform } from 'react-native';
import {
  isLocationServicesEnabled,
  isLocationPermissionGranted,
  isGooglePlayServicesAvailable,
  requestEnableLocationServices,
  requestEnableGooglePlayServices,
  requestLocationPermission,
} from '../OkCore/Helpers';
import { OkHiException } from '../OkCore/OkHiException';

/**
 * Checks whether all necessary permissions and services are available in order to start the address creation process.
 * @param {Object} configuration Object that determines whether or not to request these permissions and services from the user.
 * @param {boolean} configuration.requestServices Flag that determines whether to request the services from the user.
 * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether or not all conditions are met to start the address creation process.
 */
export const canStartAddressCreation = (configuration?: {
  requestServices?: boolean;
}): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    const requestServices = configuration && configuration.requestServices;
    const locationServicesStatus = await isLocationServicesEnabled();
    const googlePlayServices =
      Platform.OS === 'android' ? await isGooglePlayServicesAvailable() : true;
    const locationPerm = await isLocationPermissionGranted();
    if (!requestServices) {
      resolve(locationServicesStatus && googlePlayServices && locationPerm);
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
        Platform.OS === 'android'
          ? await requestEnableGooglePlayServices()
          : true;
      const locationPermStatus = await requestLocationPermission();
      resolve(
        locationServicesRequestStatus && gPlayServices && locationPermStatus
      );
    }
  });
};
