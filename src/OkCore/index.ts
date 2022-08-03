import { Platform, AppState } from 'react-native';
import { OkHiNativeModule } from '../OkHiNativeModule';
import type { OkHiApplicationConfiguration } from './types';
import { errorHandler } from './_helpers';
import type { AuthApplicationConfig } from './_types';

export * from './types';
export * from './OkHiException';
export * from './OkHiMode';
export * from './Helpers';

let okhiApplicationConfiguration: OkHiApplicationConfiguration | undefined;

/**
 * Initializes the OkHi library with provided API keys
 * @param {Object} configuration A configuration object with your OkHi credentials as well as library settings
 * @returns {Promise<void>} A promise that resolves when initialization is successful
 */
export function initialize(
  configuration: OkHiApplicationConfiguration
): Promise<void> {
  return errorHandler(async () => {
    okhiApplicationConfiguration = configuration;
    if (AppState.currentState !== 'background') {
      if (Platform.OS === 'android') {
        await OkHiNativeModule.initialize(JSON.stringify(configuration));
      } else {
        await OkHiNativeModule.initializeIOS(
          configuration.credentials.branchId,
          configuration.credentials.clientKey,
          configuration.context.mode
        );
      }
    }
  });
}

/**
 * Obtains your current running configuration
 * @returns {Promise<void>} A promise that resolves with your application configuration
 */
export async function getApplicationConfiguration(): Promise<AuthApplicationConfig | null> {
  try {
    if (typeof okhiApplicationConfiguration === 'object') {
      return {
        ...okhiApplicationConfiguration,
        auth: {
          token: await OkHiNativeModule.getAuthToken(
            okhiApplicationConfiguration?.credentials.branchId || '',
            okhiApplicationConfiguration?.credentials.clientKey || ''
          ),
        },
      };
    }
    return null;
  } catch (error) {
    throw error;
  }
}
