import type { OkHiLocationManagerProps } from './types';
import type { OkHiLocation } from '../OkCore';
import { OkHiMode } from '../OkCore';
import type {
  OkHiLocationManagerStartDataPayload,
  OkHiLocationManagerStartMessage,
} from './types';
import manifest from './app.json'; //TODO: fix this
import type { AuthApplicationConfig } from '../OkCore/_types';

/**
 * @ignore
 */
export const generateStartDataPayload = (
  props: OkHiLocationManagerProps,
  authToken: string,
  applicationConfiguration: AuthApplicationConfig
): OkHiLocationManagerStartDataPayload => {
  const payload: any = {};
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
  };
  payload.auth = {
    authToken,
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
  };
  return payload;
};

/**
 * @ignore
 */
export const getFrameUrl = (
  applicationConfiguration: AuthApplicationConfig
) => {
  const DEV_FRAME_URL = 'https://dev-manager-v5.okhi.io';
  const PROD_FRAME_URL = 'https://manager-v5.okhi.io';
  const SANDBOX_FRAME_URL = 'https://sandbox-manager-v5.okhi.io';
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
  const jsAfterLoad = `
      window.startOkHiLocationManager({ 
        receiveMessage: function(data) { window.ReactNativeWebView.postMessage(data) } }, 
        ${JSON.stringify(startPayload)})
      `;
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
  };
};
