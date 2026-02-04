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
 * This is the primary configuration object passed to the {@link login} function.
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

/**
 * Error information returned when an OkHi operation fails.
 *
 * @remarks
 * All OkHi functions that can fail will reject with this error structure.
 * Use the `code` property to programmatically handle specific error cases.
 *
 * @example
 * ```typescript
 * import * as OkHi from 'react-native-okhi';
 * import type { OkHiException } from 'react-native-okhi';
 *
 * try {
 *   await OkHi.startDigitalAddressVerification();
 * } catch (error) {
 *   const okhiError = error as OkHiException;
 *   switch (okhiError.code) {
 *     case 'user_closed':
 *       console.log('User closed collection experience.', okhiError.message);
 *       break;
 *     case 'network_error':
 *       console.log('Network issue:', okhiError.message);
 *       break;
 *     default:
 *       console.log('Error:', okhiError.message);
 *   }
 * }
 * ```
 */
export type OkHiException = {
  /**
   * Machine-readable error code.
   * Use this for programmatic error handling.
   */
  code: string;

  /**
   * Human-readable error description.
   * Suitable for logging.
   */
  message: string;
};

/**
 * Successful response from address verification operations.
 *
 * @remarks
 * Returned when address verification starts successfully.
 * Contains both updated user information and location data.
 *
 * @example
 * ```typescript
 * import * as OkHi from "react-native-okhi";
 * import type { OkHiSuccessResponse } from 'react-native-okhi';
 *
 * const handleVerification = async () => {
 *   try {
 *     const result: OkHiSuccessResponse = await OkHi.startDigitalAddressVerification();
 *
 *     // Access user data
 *     console.log('User:', result.user.firstName, result.user.lastName);
 *
 *     // Access location data
 *     console.log('Location ID:', result.location.id);
 *     console.log('Address:', result.location.formattedAddress);
 *     console.log('Coordinates:', result.location.lat, result.location.lng);
 *
 *     // Store location ID for future verifications
 *     await saveToDatabase(result.location.id);
 *   } catch (error) {
 *     console.error('Verification failed:', error);
 *   }
 * };
 * ```
 */
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
