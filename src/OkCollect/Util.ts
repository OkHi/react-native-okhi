import type { OkHiLocationManagerProps } from './types';
import {
  canOpenProtectedAppsSettings,
  isBackgroundLocationPermissionGranted,
  isLocationPermissionGranted,
  OkHiException,
  OkHiLocation,
} from '../OkCore';
import { OkHiMode } from '../OkCore';
import type {
  OkHiLocationManagerStartDataPayload,
  OkHiLocationManagerStartMessage,
} from './types';
import manifest from './app.json'; //TODO: fix this
import type { AuthApplicationConfig } from '../OkCore/_types';
import { Platform } from 'react-native';
import { OkHiNativeModule } from '../OkHiNativeModule';

export const fetchCurrentLocation = async (): Promise<null | {
  lat: number;
  lng: number;
  accuracy: number;
}> => {
  const result = await OkHiNativeModule.fetchCurrentLocation();
  return result;
};

/**
 * @ignore
 */
export const generateStartDataPayload = async (
  props: OkHiLocationManagerProps,
  applicationConfiguration: AuthApplicationConfig
): Promise<OkHiLocationManagerStartDataPayload> => {
  const payload: any = {};
  const { manufacturer, model, osVersion, platform } =
    await OkHiNativeModule.retrieveDeviceInfo();
  const geofences = await OkHiNativeModule.fetchRegisteredGeofences();
  const locationAccuracyLevel =
    await OkHiNativeModule.getLocationAccuracyLevel();

  if (geofences) {
    payload.locations = JSON.parse(geofences);
  }
  payload.style = !props.theme
    ? undefined
    : {
        base: {
          color: props.theme?.colors?.primary,
          logo: props.theme?.appBar?.logo,
          name: applicationConfiguration.app?.name,
        },
      };
  payload.user = {
    phone: props.user.phone,
    firstName: props.user.firstName,
    lastName: props.user.lastName,
    email: props.user.email,
    appUserId: props.user.appUserId,
  };
  payload.auth = {
    branchId: applicationConfiguration.credentials.branchId,
    clientKey: applicationConfiguration.credentials.clientKey,
  };
  payload.context = {
    container: {
      name: applicationConfiguration.app?.name,
      version: applicationConfiguration.app?.version,
    },
    developer: {
      name: applicationConfiguration.context.developer,
    },
    library: {
      name: manifest.name,
      version: manifest.version,
    },
    platform: {
      name: 'react-native',
    },
    device: {
      manufacturer,
      model,
      platform,
      osVersion,
    },
    locationAccuracyLevel,
  };
  payload.config = {
    streetView:
      typeof props.config?.streetView === 'boolean'
        ? props.config.streetView
        : true,
    appBar: {
      color: props.theme?.appBar?.backgroundColor,
      visible: props.config?.appBar?.visible,
    },
    addressTypes: {
      home:
        typeof props.config?.addressTypes?.home === 'boolean'
          ? props.config?.addressTypes?.home
          : true,
      work:
        typeof props.config?.addressTypes?.work === 'boolean'
          ? props.config?.addressTypes?.work
          : true,
    },
    protectedApps:
      Platform.OS === 'android' && (await canOpenProtectedAppsSettings()),
    permissionsOnboarding: true,
    usageTypes: props.config?.usageTypes || ['digital_verification'],
  };

  if (Platform.OS === 'ios') {
    const status = await OkHiNativeModule.fetchIOSLocationPermissionStatus();
    const locationPermission =
      status === 'notDetermined'
        ? 'notDetermined'
        : status === 'authorizedWhenInUse'
        ? 'whenInUse'
        : status === 'authorizedAlways'
        ? 'always'
        : 'denied';
    payload.context.permissions = {
      location: locationPermission,
    };
    if (
      status === 'authorized' ||
      status === 'authorizedWhenInUse' ||
      status === 'authorizedAlways'
    ) {
      const location = await fetchCurrentLocation();
      if (location) {
        payload.context.coordinates = {
          currentLocation: {
            lat: location.lat,
            lng: location.lng,
            accuracy: location.accuracy,
          },
        };
      }
    }
  } else if (Platform.OS === 'android') {
    let hasLocationPermission: boolean | undefined;
    try {
      hasLocationPermission = await isLocationPermissionGranted();
    } catch (error) {
      console.log(error);
    }

    let hasBackgroundLocationPermission: boolean | undefined;
    try {
      hasBackgroundLocationPermission =
        await isBackgroundLocationPermissionGranted();
    } catch (error) {
      console.log(error);
    }

    if (
      typeof hasLocationPermission === 'boolean' &&
      typeof hasBackgroundLocationPermission === 'boolean'
    ) {
      payload.context.permissions = {
        location: hasBackgroundLocationPermission
          ? 'always'
          : hasLocationPermission
          ? 'whenInUse'
          : 'denied',
      };
    }
  } else {
    throw new OkHiException({
      code: OkHiException.UNSUPPORTED_PLATFORM_CODE,
      message: OkHiException.UNAUTHORIZED_MESSAGE,
    });
  }

  if (props.location?.id) {
    payload.location = {
      id: props.location.id,
    };
  }

  return payload;
};

/**
 * @ignore
 */
export const getFrameUrl = (
  applicationConfiguration: AuthApplicationConfig
): string => {
  const DEV_FRAME_URL = 'https://dev-manager-v5.okhi.io';
  const PROD_FRAME_URL = 'https://manager-v5.okhi.io';
  const SANDBOX_FRAME_URL = 'https://sandbox-manager-v5.okhi.io';

  const LEGACY_DEV_FRAME_URL = 'https://dev-legacy-manager-v5.okhi.io';
  const LEGACY_PROD_FRAME_URL = 'https://legacy-manager-v5.okhi.io';
  const LEGACY_SANDBOX_FRAME_URL = 'https://sandbox-legacy-manager-v5.okhi.io';

  if (Platform.OS === 'android' && Platform.Version < 24) {
    if (applicationConfiguration.context.mode === OkHiMode.PROD) {
      return LEGACY_PROD_FRAME_URL;
    }
    if (applicationConfiguration.context.mode === ('dev' as any)) {
      return LEGACY_DEV_FRAME_URL;
    }
    return LEGACY_SANDBOX_FRAME_URL;
  }
  if (applicationConfiguration.context.mode === OkHiMode.PROD) {
    return PROD_FRAME_URL;
  }
  if (applicationConfiguration.context.mode === ('dev' as any)) {
    return DEV_FRAME_URL;
  }
  return SANDBOX_FRAME_URL;
};

/**
 * @ignore
 */
export const generateJavaScriptStartScript = (startPayload: {
  message: OkHiLocationManagerStartMessage;
  payload: OkHiLocationManagerStartDataPayload;
}) => {
  const jsBeforeLoad = `
      window.isNativeApp = true;
      window.NativeApp = {
        bridge: {
          receiveMessage: window.ReactNativeWebView.postMessage
        },
        data: ${JSON.stringify(startPayload)}
      }
      true;
      `;
  const jsAfterLoad = `window.startOkHiLocationManager({ receiveMessage: function(data) { window.ReactNativeWebView.postMessage(data) } }, ${JSON.stringify(
    startPayload
  )})`;
  return { jsBeforeLoad, jsAfterLoad };
};

/**
 * @ignore
 */
export const parseOkHiLocation = (location: any): OkHiLocation => {
  return {
    id: location?.id,
    lat: location?.geo_point?.lat,
    lon: location?.geo_point?.lon,
    placeId: location?.place_id,
    plusCode: location?.plus_code,
    propertyName: location?.property_name,
    streetName: location?.street_name,
    title: location?.title,
    subtitle: location?.subtitle,
    directions: location?.directions,
    otherInformation: location?.other_information,
    url: location?.url,
    streetViewPanoId: location?.street_view?.pano_id,
    streetViewPanoUrl: location?.street_view?.url,
    userId: location?.user_id,
    propertyNumber: location?.propertyNumber,
    photo: location?.photo,
    displayTitle: location?.display_title,
    country: location?.country,
    state: location?.state,
    city: location?.city,
    countryCode: location?.country_code,
    usageTypes: location?.usage_types,
  };
};
