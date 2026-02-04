export type OkHiAuth = {
  branchId: string;
  clientKey: string;
  env?: string;
};

export type OkHiUser = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  okhiUserId?: string;
  token?: string;
  appUserId?: string;
};

export type OkHiAppContext = {
  name: string;
  version: string;
  build: string;
};

export type OkHiLoginConfiguration = {
  withPermissionsRequest?: boolean;
};

export type OkHiLogin = {
  auth: OkHiAuth;
  user: OkHiUser;
  configuration?: OkHiLoginConfiguration;
  appContext?: OkHiAppContext;
};

export type OkCollectStyle = {
  color: string;
  logo: string;
};

export type OkCollectConfig = {
  streetView: boolean;
  withHomeAddressType: boolean;
  withWorkAddressType: boolean;
  withAppBar: boolean;
};

export type OkCollect = {
  style?: Partial<OkCollectStyle>;
  configuration?: Partial<OkCollectConfig>;
  locationId?: string;
};

export type OkHiLocation = {
  id?: string | null;
  lat?: number | null;
  lng?: number | null;
  placeId?: string | null;
  plusCode?: string | null;
  propertyName?: string | null;
  streetName?: string | null;
  title?: string | null;
  subtitle?: string | null;
  directions?: string | null;
  otherInformation?: string | null;
  url?: string | null;
  streetViewPanoId?: string | null;
  streetViewPanoUrl?: string | null;
  userId?: string | null;
  photoUrl?: string | null;
  propertyNumber?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  displayTitle?: string | null;
  countryCode?: string | null;
  neighborhood?: string | null;
  usageTypes?: string[] | null;
  ward?: string | null;
  formattedAddress?: string | null;
  postCode?: string | null;
};

export type OkHiSuccessResponse = {
  user: OkHiUser;
  location: OkHiLocation;
};

/**
 * Standard error codes returned by OkHi operations.
 *
 * These codes are consistent across iOS and Android platforms.
 */
export type OkHiErrorCode =
  | 'fatal_exit'
  | 'user_closed'
  | 'unknown'
  | 'network_error'
  | 'permission_denied'
  | 'service_unavailable'
  | 'unsupported_device'
  | 'unauthenticated'
  | 'invalid_phone';

/**
 * Error class for OkHi operations.
 *
 * @remarks
 * All OkHi functions that can fail will throw an `OkHiException`.
 * Use the static code constants for type-safe error handling in switch statements.
 *
 * @example
 * ```typescript
 * import * as OkHi from 'react-native-okhi';
 *
 * try {
 *   const result = await OkHi.startDigitalAddressVerification();
 * } catch (error) {
 *   if (error instanceof OkHi.OkHiException) {
 *     switch (error.code) {
 *       case OkHi.OkHiException.USER_CLOSED:
 *         console.log('User cancelled the verification');
 *         break;
 *       case OkHi.OkHiException.NETWORK_ERROR:
 *         console.log('Network issue:', error.message);
 *         break;
 *       case OkHi.OkHiException.PERMISSION_DENIED:
 *         console.log('Permission denied:', error.message);
 *         break;
 *       default:
 *         console.log('Error:', error.code, error.message);
 *     }
 *   }
 * }
 * ```
 */
export class OkHiException extends Error {
  /**
   * A fatal error occurred that caused the SDK to exit unexpectedly.
   */
  static readonly FATAL_EXIT: OkHiErrorCode = 'fatal_exit';

  /**
   * The user dismissed or closed the verification flow.
   */
  static readonly USER_CLOSED: OkHiErrorCode = 'user_closed';

  /**
   * An unknown or unexpected error occurred.
   */
  static readonly UNKNOWN: OkHiErrorCode = 'unknown';

  /**
   * A network connectivity error occurred.
   */
  static readonly NETWORK_ERROR: OkHiErrorCode = 'network_error';

  /**
   * Required permissions were not granted.
   */
  static readonly PERMISSION_DENIED: OkHiErrorCode = 'permission_denied';

  /**
   * The OkHi service is temporarily unavailable.
   */
  static readonly SERVICE_UNAVAILABLE: OkHiErrorCode = 'service_unavailable';

  /**
   * The device is not supported (e.g., missing Play Services, unsupported platform).
   */
  static readonly UNSUPPORTED_DEVICE: OkHiErrorCode = 'unsupported_device';

  /**
   * Authentication failed. Call `login()` with valid credentials.
   */
  static readonly UNAUTHENTICATED: OkHiErrorCode = 'unauthenticated';

  /**
   * The phone number provided is invalid.
   */
  static readonly INVALID_PHONE: OkHiErrorCode = 'invalid_phone';

  /**
   * Machine-readable error code.
   * Use this for programmatic error handling with switch statements.
   *
   * @example
   * ```typescript
   * if (error.code === OkHi.OkHiException.USER_CLOSED) {
   *   // Handle user cancellation
   * }
   * ```
   */
  readonly code: OkHiErrorCode;

  /**
   * Creates a new OkHiException.
   *
   * @param code - The error code
   * @param message - Human-readable error description
   */
  constructor(code: OkHiErrorCode, message: string) {
    super(message);
    this.name = 'OkHiException';
    this.code = code;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OkHiException);
    }
  }

  /**
   * Normalizes error codes from native SDKs to standard OkHi error codes.
   *
   * @param nativeCode - The error code received from native SDK
   * @returns The normalized OkHiErrorCode
   *
   * @internal
   */
  static normalizeCode(nativeCode: string | undefined | null): OkHiErrorCode {
    if (!nativeCode || nativeCode === '') {
      return OkHiException.UNKNOWN;
    }

    const code = nativeCode.toLowerCase();

    switch (code) {
      case 'fatal_exit':
        return OkHiException.FATAL_EXIT;
      case 'user_closed':
        return OkHiException.USER_CLOSED;
      case 'network_error':
        return OkHiException.NETWORK_ERROR;
      case 'permission_denied':
        return OkHiException.PERMISSION_DENIED;
      case 'service_unavailable':
        return OkHiException.SERVICE_UNAVAILABLE;
      case 'unsupported_device':
      case 'unsupported_platform': // JS-only code mapped to unsupported_device
        return OkHiException.UNSUPPORTED_DEVICE;
      case 'unauthenticated':
        return OkHiException.UNAUTHENTICATED;
      case 'invalid_phone':
        return OkHiException.INVALID_PHONE;
      case 'unknown':
      case 'unknown_error': // Android-specific code mapped to unknown
      default:
        return OkHiException.UNKNOWN;
    }
  }

  /**
   * Creates an OkHiException from a native error object.
   *
   * @param error - The error object from native SDK
   * @returns A new OkHiException instance
   *
   * @internal
   */
  static fromNativeError(error: {
    code?: string;
    message?: string;
  }): OkHiException {
    const code = OkHiException.normalizeCode(error.code);
    const message = error.message || 'An unknown error occurred';
    return new OkHiException(code, message);
  }

  /**
   * Type guard to check if an error is an OkHiException.
   *
   * @param error - The error to check
   * @returns True if the error is an OkHiException
   *
   * @example
   * ```typescript
   * try {
   *   await OkHi.startDigitalAddressVerification();
   * } catch (error) {
   *   if (OkHi.OkHiException.isOkHiException(error)) {
   *     console.log(error.code, error.message);
   *   }
   * }
   * ```
   */
  static isOkHiException(error: unknown): error is OkHiException {
    return error instanceof OkHiException;
  }
}
