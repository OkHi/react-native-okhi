import { OkHiNativeModule } from '../OkHiNativeModule';
import type { OkHiApplicationConfiguration } from './types';
import { errorHandler } from './_helpers';
import type { AuthApplicationConfig } from './_types';

export * from './types';
export * from './OkHiException';
export * from './OkHiMode';
export * from './Helpers';

let okhiApplicationConfiguration: OkHiApplicationConfiguration | undefined;

export function initialize(
  configuration: OkHiApplicationConfiguration
): Promise<void> {
  return errorHandler(async () => {
    await OkHiNativeModule.initialize(JSON.stringify(configuration));
    okhiApplicationConfiguration = configuration;
  });
}

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
