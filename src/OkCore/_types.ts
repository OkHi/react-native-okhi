/**
 * @ignore
 */
export type OkHiAccessScope = 'verify' | 'address' | 'checkout' | 'profile';

export type OkHiInitializationConfiguration = {
  credentials: { branchId: string; clientKey: string };
  context: {
    mode: string;
    platform: 'react-native';
    developer: 'okhi' | 'external';
  };
  app?: {
    name?: string | null;
    version?: string | null;
    build?: number | null;
  };
};

export type AuthApplicationConfig = {
  auth: {
    token: string;
  };
  credentials: {
    branchId: string;
    clientKey: string;
  };
  context: {
    mode: 'sandbox' | 'prod';
    developer?: 'okhi' | 'external';
  };
  app?: {
    name?: string;
    version?: string;
    build?: string;
  };
};
