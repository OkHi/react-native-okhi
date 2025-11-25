import { Platform, AppState } from 'react-native';
import { OkHiNativeModule } from '../OkHiNativeModule';
import type { OkHiApplicationConfiguration } from './types';
import { errorHandler } from './_helpers';
import type { AuthApplicationConfig } from './_types';
import { OkHiException } from './OkHiException';

export * from './types';
export * from './OkHiException';
export * from './OkHiMode';
export * from './Helpers';

let okhiApplicationConfiguration: OkHiApplicationConfiguration | undefined;

function validateConfiguration(config: OkHiApplicationConfiguration) {
  if (
    typeof config !== 'object' ||
    config === null ||
    !config.credentials ||
    typeof config.credentials.branchId !== 'string' ||
    config.credentials.branchId.trim().length === 0 ||
    typeof config.credentials.clientKey !== 'string' ||
    config.credentials.clientKey.trim().length === 0
  ) {
    return false;
  }
  return true;
}
/**
 * Initializes the OkHi library with provided API keys
 * @param {Object} configuration A configuration object with your OkHi credentials as well as library settings
 * @returns {Promise<void>} A promise that resolves when initialization is successful
 */
export function initialize(
  configuration: OkHiApplicationConfiguration
): Promise<void> {
  if (!configuration.user || !configuration.user.phone) {
    console.warn(
      '[OkHi] Missing user in configuration object. Providing a user helps verify previous addresses. See https://docs.okhi.com'
    );
  }
  return errorHandler(async () => {
    const isValidConfig = validateConfiguration(configuration);
    if (!isValidConfig) {
      throw new OkHiException({
        code: OkHiException.UNAUTHORIZED_CODE,
        message: 'Invalid OkHi configuration provided.',
      });
    }
    okhiApplicationConfiguration = configuration;
    if (Platform.OS === 'ios') {
      await OkHiNativeModule.initializeIOS(
        configuration.credentials.branchId,
        configuration.credentials.clientKey,
        configuration.context.mode
      );
      if (AppState.currentState !== 'background') {
        await OkHiNativeModule.onStart();
      }
    } else {
      await OkHiNativeModule.initialize(JSON.stringify(configuration));
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
