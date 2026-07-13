/**
 * Authentication credentials for the OkHi platform.
 *
 * @remarks
 * These credentials are provided by OkHi when you register your application.
 * You can find them in your OkHi dashboard under API Keys.
 *
 * @example
 * ```typescript
 * const auth: OkHiAuth = {
 *   branchId: 'your_branch_id',
 *   clientKey: 'your_client_key'
 * };
 * ```
 *
 * @see {@link OkHiLogin} - Used within the login configuration
 */
export type OkHiAuth = {
  /**
   * Your unique OkHi branch identifier.
   * Obtained from the OkHi dashboard.
   */
  branchId: string;

  /**
   * Your OkHi client API key.
   */
  clientKey: string;

  env?: string;
};

/**
 * User information for OkHi address verification.
 *
 * @remarks
 * This type represents the user whose address is being verified.
 * All contact information should be valid as it may be used for verification purposes.
 * important: Make sure to use a phone number you own during testing!
 *
 * @example
 * ```typescript
 * const user: OkHiUser = {
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   phone: '+254712345678',
 *   email: 'john.doe@example.com',
 * };
 * ```
 *
 * @see {@link OkHiLogin} - Used within the login configuration
 * @see {@link OkHiSuccessResponse} - Enriched and returned after successful verification
 */
export type OkHiUser = {
  /**
   * User's first name.
   */
  firstName: string;

  /**
   * User's last name.
   */
  lastName: string;

  /**
   * User's phone number in international format.
   * @example `'+254712345678'`
   */
  phone: string;

  /**
   * User's email address.
   */
  email: string;

  /**
   * OkHi's internal user identifier.
   */
  okhiUserId?: string;

  /**
   * Managed internally by the SDK.
   */
  token?: string;

  /**
   * Your application's internal user identifier.
   * Use this to link OkHi verifications to your own user records.
   *
   * @example `'user_abc123'`
   */
  appUserId?: string;
};

/**
 * Application context information sent to OkHi.
 *
 * @remarks
 * Provides metadata about your application for analytics and debugging purposes.
 *
 * @example
 * ```typescript
 * const appContext: OkHiAppContext = {
 *   name: 'MyApp',
 *   version: '1.2.3',
 *   build: '456',
 * };
 * ```
 *
 * @see {@link OkHiLogin} - Used within the login configuration
 */
export type OkHiAppContext = {
  /**
   * Your application's name.
   * @example `'MyLoanApp'`
   */
  name: string;

  /**
   * Your application's version string.
   * @example `'1.2.3'`
   */
  version: string;

  /**
   * Your application's build number.
   * @example `'456'`
   */
  build: string;
};

/**
 * Configuration options for the login process.
 *
 * @example
 * ```typescript
 * const loginConfig: OkHiLoginConfiguration = {
 *   withPermissionsRequest: true, // Request permissions during login
 * };
 * ```
 *
 * @see {@link OkHiLogin} - Used within the login configuration
 */
export type OkHiLoginConfiguration = {
  /**
   * Whether to request required permissions during login.
   * When `true`, the SDK will prompt for necessary permissions as part of the login flow.
   *
   * @defaultValue `false`
   */
  withPermissionsRequest?: boolean;
};

/**
 * Complete login configuration for authenticating with OkHi.
 *
 * @remarks
 * This is the primary configuration object passed to the `login()` function.
 * It combines authentication credentials, user information, and optional settings.
 *
 * @example
 * ```typescript
 * import * as OkHi from 'react-native-okhi';
 * import type { OkHiLogin } from 'react-native-okhi';
 *
 * const credentials: OkHiLogin = {
 *   auth: {
 *     branchId: 'your_branch_id',
 *     clientKey: 'your_client_key',
 *   },
 *   user: {
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     phone: '+254712345678',
 *     email: 'john.doe@example.com',
 *   },
 *   configuration: {
 *     withPermissionsRequest: true,
 *   },
 * };
 *
 * await OkHi.login(credentials);
 * ```
 */
export type OkHiLogin = {
  /**
   * Authentication credentials for OkHi.
   */
  auth: OkHiAuth;

  /**
   * User information.
   */
  user: OkHiUser;

  /**
   * Optional login behavior configuration.
   */
  configuration?: OkHiLoginConfiguration;

  /**
   * Optional application context for analytics.
   */
  appContext?: OkHiAppContext;
};

/**
 * Visual styling options for the OkCollect address collection UI.
 *
 * @remarks
 * Customize the appearance of the address collection interface to match your app's branding.
 *
 * @example
 * ```typescript
 * const style: OkCollectStyle = {
 *   color: '#FF5722', // Your brand's primary color
 *   logo: 'https://example.com/logo.png',
 * };
 * ```
 *
 * @see {@link OkCollect} - Parent configuration type
 */
export type OkCollectStyle = {
  /**
   * Primary theme color for the UI in hexadecimal format.
   * Applied to buttons, highlights, and accent elements.
   *
   * @defaultValue `'#005D67'` (OkHi teal)
   * @example `'#FF5722'`
   */
  color: string;

  /**
   * URL to your company logo.
   * Displayed in the address collection header.
   *
   * @defaultValue `'https://cdn.okhi.co/icon.png'`
   * @example `'https://example.com/logo.png'`
   */
  logo: string;
};

/**
 * Behavioral configuration options for the OkCollect address collection UI.
 *
 * @remarks
 * Control which features are available during address collection.
 *
 * @example
 * ```typescript
 * const config: OkCollectConfig = {
 *   streetView: true,
 *   withAppBar: true,
 * };
 * ```
 *
 * @see {@link OkCollect} - Parent configuration type
 */
export type OkCollectConfig = {
  /**
   * Whether to enable Google Street View for address collection.
   * When enabled, users can create addresses using street-level imagery.
   *
   * @defaultValue `true`
   */
  streetView: boolean;

  /**
   * Whether to show "Home" as an address type option.
   *
   * @defaultValue `true`
   */
  withHomeAddressType: boolean;

  /**
   * Whether to show "Work" as an address type option.
   *
   * @defaultValue `false`
   */
  withWorkAddressType: boolean;

  /**
   * Whether to display the app bar (header) in the collection UI.
   *
   * @defaultValue `true`
   */
  withAppBar: boolean;
};

/**
 * Configuration options for address collection
 *
 * @remarks
 * Pass this to verification functions to customize the address collection experience.
 * All properties are optional - sensible defaults are applied automatically.
 *
 * @example
 * ```typescript
 * import * as OkHi from 'react-native-okhi';
 * import type { OkCollect } from 'react-native-okhi';
 *
 * // Use with custom styling
 * const config: OkCollect = {
 *   style: {
 *     color: '#FF5722',
 *     logo: 'https://example.com/logo.png',
 *   },
 *   configuration: {
 *     streetView: true,
 *   },
 * };
 *
 * const result = await OkHi.startDigitalAddressVerification(config);
 * ```
 *
 * @example
 * ```typescript
 * // Start verification on a previously created address.
 * const locationId: string = await fetchLocationIdFromMyDatabase()
 * const config: OkCollect = {
 *   locationId,
 * };
 *
 * const result = await startPhysicalAddressVerification(config);
 * ```
 */
export type OkCollect = {
  /**
   * Visual styling options for the collection UI.
   * Partial - only specify the properties you want to override.
   */
  style?: Partial<OkCollectStyle>;

  /**
   * Behavioral configuration for the collection UI.
   * Partial - only specify the properties you want to override.
   */
  configuration?: Partial<OkCollectConfig>;

  /**
   * OkHi identifier for the address
   * Use this to start verification on a previously created address.
   */
  locationId?: string;
};

/**
 * Comprehensive location data returned once verification starts successfully.
 *
 * @remarks
 * Contains all available address information collected.
 * Properties may be `null` if not available for the specific location.
 *
 * @example
 * ```typescript
 * const handleVerification = async () => {
 *   const result = await OkHi.startDigitalAddressVerification();
 *   const { location } = result;
 *
 *   console.log('Address:', location.formattedAddress);
 *   console.log('Coordinates:', location.lat, location.lng);
 *   console.log('Plus Code:', location.plusCode);
 * };
 * ```
 *
 * @see {@link OkHiSuccessResponse} - Parent response type
 */
export type OkHiLocation = {
  /**
   * Unique OkHi location identifier.
   * Use this to reference the address in future API calls.
   */
  id?: string | null;

  /**
   * Latitude coordinate of the location.
   * @example `1.2921`
   */
  lat?: number | null;

  /**
   * Longitude coordinate of the location.
   * @example `36.8219`
   */
  lng?: number | null;

  /**
   * Legacy not in use
   */
  placeId?: string | null;

  /**
   * Open Location Code (Plus Code) for the address.
   * A short, alphanumeric code that represents a geographic location.
   *
   * @see https://plus.codes/
   * @example `'6GCRMQPX+JF'`
   */
  plusCode?: string | null;

  /**
   * Name of the property (building, apartment complex, etc.).
   * @example `'Sunrise Apartments'`
   */
  propertyName?: string | null;

  /**
   * Name of the street.
   * @example `'Ngong Road'`
   */
  streetName?: string | null;

  /**
   * System generated title for the address.
   */
  title?: string | null;

  /**
   * System generated subtitle for the address.
   */
  subtitle?: string | null;

  /**
   * User-provided directions to the location.
   */
  directions?: string | null;

  /**
   * Additional information about the location.
   */
  otherInformation?: string | null;

  /**
   * OkHi URL for the address.
   * Can be shared for navigation purposes.
   */
  url?: string | null;

  /**
   * Google Street View panorama ID.
   * Used to display street-level imagery.
   */
  streetViewPanoId?: string | null;

  /**
   * URL to the Google Street View panorama image.
   */
  streetViewPanoUrl?: string | null;

  /**
   * OkHi user ID associated with this location.
   */
  userId?: string | null;

  /**
   * URL to a photo of the location.
   */
  photoUrl?: string | null;

  /**
   * Property or house number.
   * @example `'42'`
   */
  propertyNumber?: string | null;

  /**
   * Country name.
   * @example `'Kenya'`
   */
  country?: string | null;

  /**
   * State, province, or region.
   * @example `'Nairobi'`
   */
  state?: string | null;

  /**
   * City or town name.
   * @example `'Nairobi'`
   */
  city?: string | null;

  /**
   * Display-friendly title for the address.
   * Formatted for showing in UI.
   */
  displayTitle?: string | null;

  /**
   * ISO 3166-1 alpha-2 country code.
   * @example `'KE'`
   */
  countryCode?: string | null;

  /**
   * Neighborhood or locality name.
   * @example `'Westlands'`
   */
  neighborhood?: string | null;

  /**
   * Used internally by the SDK
   */
  usageTypes?: string[] | null;

  /**
   * Administrative ward.
   * Common in African addressing systems.
   */
  ward?: string | null;

  /**
   * Complete formatted address string.
   * @example `'Sunrise Apartments, Ngong Road, Westlands, Nairobi, Kenya'`
   */
  formattedAddress?: string | null;

  /**
   * Postal or ZIP code.
   */
  postCode?: string | null;
};

export type OkHiSuccessResponse = {
  /**
   * User information.
   * @see {@link OkHiUser}
   */
  user: OkHiUser;

  /**
   * Location data.
   * @see {@link OkHiLocation}
   */
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
