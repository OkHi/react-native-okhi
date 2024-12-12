import React, { useState, useEffect, useRef } from 'react';
import { Modal, SafeAreaView, Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Spinner } from './Spinner';
import type {
  OkHiLocationManagerResponse,
  OkHiLocationManagerProps,
  OkHiLocationManagerStartDataPayload,
} from './types';
import {
  getFrameUrl,
  generateJavaScriptStartScript,
  generateStartDataPayload,
  parseOkHiLocation,
} from './Util';
import { OkHiException } from '../OkCore/OkHiException';
import type { AuthApplicationConfig } from '../OkCore/_types';
import { start as sv } from '../OkVerify';
import {
  getApplicationConfiguration,
  isBackgroundLocationPermissionGranted,
  isLocationServicesEnabled,
  openAppSettings,
  openProtectedAppsSettings,
  requestBackgroundLocationPermission,
  requestLocationPermission,
  UsageType,
} from '../OkCore';
import { OkHiNativeModule } from '../OkHiNativeModule';

/**
 * The OkHiLocationManager React Component is used to display an in app modal, enabling the user to quickly create an accurate OkHi address.
 */
export const OkHiLocationManager = (props: OkHiLocationManagerProps) => {
  const [applicationConfiguration, setApplicationConfiguration] =
    useState<AuthApplicationConfig | null>(null);
  const [startPayload, setStartPaylaod] =
    useState<null | OkHiLocationManagerStartDataPayload>(null);
  const defaultStyle = { flex: 1 };
  const style = props.style
    ? { ...props.style, ...defaultStyle }
    : defaultStyle;

  const { user, onSuccess, onCloseRequest, onError, loader, launch, config } =
    props;
  const webViewRef = useRef<WebView | null>(null);
  const startMessage =
    props.mode === 'create' ? 'start_app' : 'select_location';
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (launch) {
      setReady(launch);
    }
  }, [launch]);

  useEffect(() => {
    async function startOkHiLocationManager() {
      const appConfiguration = await getApplicationConfiguration();
      if (!appConfiguration) {
        throw new OkHiException({
          code: OkHiException.UNAUTHORIZED_CODE,
          message: OkHiException.UNAUTHORIZED_MESSAGE,
        });
      }
      const startPayload = await generateStartDataPayload(
        props,
        appConfiguration
      );
      setApplicationConfiguration(appConfiguration);
      setStartPaylaod(startPayload);
      if (Platform.OS === 'android' && Platform.Version > 25) {
        OkHiNativeModule.setItem(
          'okcollect-launch-payload',
          JSON.stringify({
            message: startMessage,
            payload: startPayload,
            url: getFrameUrl(appConfiguration),
          })
        ).catch(console.error);
      }
    }

    if (launch) {
      startOkHiLocationManager();
    }
  }, [launch, props, onError]);

  const runWebViewCallback = (value: string) => {
    if (webViewRef.current) {
      const jsString = `(function (){ if (typeof runOkHiLocationManagerCallback === "function") { runOkHiLocationManagerCallback("${value}") } })()`;
      webViewRef.current.injectJavaScript(jsString);
    }
  };

  const handleAndroidRequestLocationPermission = async (
    level: 'whenInUse' | 'always'
  ) => {
    if (level === 'whenInUse') {
      const whenInUseResult = await requestLocationPermission();
      const alwaysResult = await isBackgroundLocationPermissionGranted();
      runWebViewCallback(
        alwaysResult ? 'always' : whenInUseResult ? 'whenInUse' : 'blocked'
      );
    } else if (level === 'always') {
      const result = await requestBackgroundLocationPermission();
      runWebViewCallback(result ? 'always' : 'blocked');
    }
  };

  const handleIOSRequestLocationPermission = async (
    level: 'whenInUse' | 'always'
  ) => {
    const unknownError = new OkHiException({
      code: OkHiException.UNKNOWN_ERROR_CODE,
      message:
        'Something went wrong while requesting permissions. Please try again later.',
    });
    try {
      const isServiceAvailable = await isLocationServicesEnabled();
      if (!isServiceAvailable) {
        openAppSettings();
      } else if (level === 'whenInUse') {
        const result = await requestLocationPermission();
        runWebViewCallback(result ? level : 'denied');
      } else if (level === 'always') {
        const granted = await isBackgroundLocationPermissionGranted();
        if (granted) {
          runWebViewCallback(level);
        } else {
          openAppSettings();
        }
      }
    } catch (error) {
      onError(unknownError);
    }
  };

  const handleRequestLocationPermission = async ({
    level,
  }: {
    level: 'whenInUse' | 'always';
  }) => {
    if (Platform.OS === 'android') {
      handleAndroidRequestLocationPermission(level);
    } else if (Platform.OS === 'ios') {
      handleIOSRequestLocationPermission(level);
    }
  };

  const handleOpenAppSettings = async () => {
    try {
      const granted = await isBackgroundLocationPermissionGranted();
      if (granted) {
        runWebViewCallback('always');
      } else {
        await openAppSettings();
      }
    } catch (error) {
      const err = error as OkHiException;
      onError(err);
    }
  };

  const handleOnMessage = ({ nativeEvent: { data } }: WebViewMessageEvent) => {
    try {
      const response: OkHiLocationManagerResponse = JSON.parse(data);

      if (response.message === 'fatal_exit') {
        //TODO: figure out bad phone number code
        onError(
          new OkHiException({
            code: OkHiException.UNKNOWN_ERROR_CODE,
            message: response.payload,
          })
        );
      } else if (response.message === 'exit_app') {
        onCloseRequest();
      } else if (response.message === 'request_enable_protected_apps') {
        openProtectedAppsSettings();
      } else if (
        response.message === 'location_created' ||
        response.message === 'location_selected' ||
        response.message === 'location_updated'
      ) {
        setReady(false); // auto close
        onSuccess({
          user: {
            ...response.payload.user,
            fcmPushNotificationToken: user.fcmPushNotificationToken,
          },
          location: parseOkHiLocation(response.payload.location),
          startVerification: function () {
            const createdUser = { ...this.user };
            const location = { ...this.location };
            return new Promise((resolve, reject) => {
              if (!location.id) {
                reject(
                  new OkHiException({
                    code: OkHiException.BAD_REQUEST_CODE,
                    message: 'Missing location id from response',
                  })
                );
              } else if (!createdUser.id) {
                reject(
                  new OkHiException({
                    code: OkHiException.BAD_REQUEST_CODE,
                    message: 'Missing user id from response',
                  })
                );
              } else if (!createdUser.token) {
                reject(
                  new OkHiException({
                    code: OkHiException.UNAUTHORIZED_CODE,
                    message: OkHiException.UNAUTHORIZED_MESSAGE,
                  })
                );
              } else {
                const usageTypes: UsageType = Array.isArray(location.usageTypes)
                  ? location.usageTypes
                  : ['digital_verification'];
                sv(
                  createdUser.token,
                  createdUser.phone,
                  createdUser.id,
                  location.id,
                  location.lat,
                  location.lon,
                  usageTypes
                )
                  .then(resolve)
                  .catch(reject);
              }
            });
          },
        });
      } else if (response.message === 'request_location_permission') {
        handleRequestLocationPermission(response.payload);
      } else if (response.message === 'open_app_settings') {
        handleOpenAppSettings();
      }
    } catch (error) {
      let errorMessage = 'Something went wrong';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      onError(
        new OkHiException({
          code: OkHiException.UNKNOWN_ERROR_CODE,
          message: errorMessage,
        })
      );
    }
  };

  const handleOnError = () => {
    onError(
      new OkHiException({
        code: OkHiException.NETWORK_ERROR_CODE,
        message: OkHiException.NETWORK_ERROR_MESSAGE,
      })
    );
  };

  const handleModalRequestClose = () => {
    webViewRef.current?.goBack();
  };

  const renderContent = () => {
    if (startPayload === null || applicationConfiguration == null) {
      return loader || <Spinner />;
    }

    const { jsAfterLoad, jsBeforeLoad } = generateJavaScriptStartScript({
      message: startMessage,
      payload: startPayload,
    });

    return (
      <SafeAreaView style={style}>
        <WebView
          source={{ uri: getFrameUrl(applicationConfiguration) }}
          injectedJavaScriptBeforeContentLoaded={
            Platform.OS === 'ios' ? jsBeforeLoad : undefined
          }
          injectedJavaScript={Platform.OS === 'ios' ? undefined : jsAfterLoad}
          onMessage={handleOnMessage}
          onError={handleOnError}
          onHttpError={handleOnError}
          geolocationEnabled={true}
          allowsBackForwardNavigationGestures={true}
          ref={webViewRef}
        />
      </SafeAreaView>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={ready}
      onRequestClose={handleModalRequestClose}
    >
      {ready ? renderContent() : null}
    </Modal>
  );
};

export default OkHiLocationManager;
