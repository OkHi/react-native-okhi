import React, { useState, useEffect } from 'react';
import { Modal, SafeAreaView, Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Spinner } from './Spinner';
import type {
  OkHiLocationManagerResponse,
  OkHiLocationManagerProps,
} from './types';
import {
  getFrameUrl,
  generateJavaScriptStartScript,
  generateStartDataPayload,
  parseOkHiLocation,
} from './Util';
import { getApplicationConfiguration, OkHiException } from '../OkCore';
import { OkHiAuth } from '../OkCore/OkHiAuth';
import type { AuthApplicationConfig } from '../OkCore/_types';
import { start as sv } from '../OkVerify';
import type { OkVerifyStartConfiguration } from '../OkVerify/types';
/**
 * The OkHiLocationManager React Component is used to display an in app modal, enabling the user to quickly create an accurate OkHi address.
 */
export const OkHiLocationManager = (props: OkHiLocationManagerProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [applicationConfiguration, setApplicationConfiguration] =
    useState<AuthApplicationConfig | null>(null);
  const defaultStyle = { flex: 1 };
  const style = props.style
    ? { ...props.style, ...defaultStyle }
    : defaultStyle;

  const { user, onSuccess, onCloseRequest, onError, loader, launch } = props;

  useEffect(() => {
    if (user.phone) {
      const auth = new OkHiAuth();
      auth
        .anonymousSignInWithPhoneNumber(user.phone, ['address'])
        .then(setToken)
        .catch(onError);
      getApplicationConfiguration()
        .then(setApplicationConfiguration)
        .catch(onError);
    }
  }, [onError, user.phone]);

  const handleOnMessage = ({ nativeEvent: { data } }: WebViewMessageEvent) => {
    try {
      const response: OkHiLocationManagerResponse = JSON.parse(data);
      if (response.message === 'fatal_exit') {
        onError(
          new OkHiException({
            code: OkHiException.UNKNOWN_ERROR_CODE,
            message: response.payload.toString(),
          })
        );
      } else if (response.message === 'exit_app') {
        onCloseRequest();
      } else {
        onSuccess({
          ...response.payload,
          location: parseOkHiLocation(response.payload.location),
          startAddressVerification: function (
            config?: OkVerifyStartConfiguration
          ) {
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
              } else {
                sv(
                  createdUser.phone,
                  location.id,
                  location.lat,
                  location.lon,
                  config
                )
                  .then(resolve)
                  .catch(reject);
              }
            });
          },
        });
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

  const renderContent = () => {
    if (token === null || applicationConfiguration == null) {
      return loader || <Spinner />;
    }

    const { jsAfterLoad, jsBeforeLoad } = generateJavaScriptStartScript({
      message: 'select_location',
      payload: generateStartDataPayload(props, token, applicationConfiguration),
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
        />
      </SafeAreaView>
    );
  };

  return (
    <Modal animationType="slide" transparent={false} visible={launch}>
      {launch ? renderContent() : null}
    </Modal>
  );
};

export default OkHiLocationManager;
