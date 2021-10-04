import {
  isLocationServicesEnabled,
  isLocationPermissionGranted,
  requestEnableLocationServices,
  requestLocationPermission,
} from '../';

/**
 * Checks whether all necessary permissions and services are available in order to start the address creation process.
 * @param {Object} configuration Object that determines whether or not to request these permissions and services from the user.
 * @param {boolean} configuration.requestServices Flag that determines whether to request the services from the user.
 * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether or not all conditions are met to start the address creation process.
 */
export const canStartAddressCreation = async (configuration?: {
  requestServices?: boolean;
}): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      let hasLocationServices = await isLocationServicesEnabled();
      let hasLocationPermission = await isLocationPermissionGranted();
      if (!configuration?.requestServices) {
        return resolve(hasLocationPermission && hasLocationServices);
      }
      if (!hasLocationServices) {
        hasLocationServices = await requestEnableLocationServices();
        if (!hasLocationServices) {
          return resolve(hasLocationServices);
        }
      }
      if (!hasLocationPermission) {
        hasLocationPermission = await requestLocationPermission();
        if (!hasLocationPermission) {
          return resolve(hasLocationPermission);
        }
      }
      return resolve(hasLocationPermission && hasLocationServices);
    } catch (error) {
      reject(error);
    }
  });
};
