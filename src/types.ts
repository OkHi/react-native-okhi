/**
 * Authentication credentials required to initialize the OkHi SDK.
 * Obtain these credentials from your OkHi dashboard.
 *
 * @example
 * ```typescript
 * const auth: OkHiAuth = {
 *   branchId: 'your-branch-id',
 *   clientKey: 'your-client-key',
 *   env: 'prod' // optional, defaults to production
 * };
 * ```
 */
export type OkHiAuth = {
  /** Your unique OkHi branch identifier */
  branchId: string
  /** Your OkHi API client key */
  clientKey: string
  /** Optional environment setting (e.g., 'sandbox', 'prod'). Defaults to production if not specified. */
  env?: string
}

/**
 * Represents a user in the OkHi system.
 * This information is used to identify and associate addresses with users.
 *
 * @remarks
 * During testing, use a phone number you own as real verification SMS messages will be sent.
 *
 * @example
 * ```typescript
 * const user: OkHiUser = {
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   phone: '+254712345678', // MSISDN format
 *   email: 'john.doe@example.com',
 *   appUserId: 'user-123'
 * };
 * ```
 */
export type OkHiUser = {
  /** User's first name */
  firstName: string
  /** User's last name */
  lastName: string
  /** User's phone number in MSISDN format (e.g., +254712345678) */
  phone: string
  /** User's email address */
  email: string
  /** OkHi-assigned user identifier. Set automatically after successful login. */
  okhiUserId?: string
  /** Authentication token for the user session */
  token?: string
  /** Your application's unique identifier for this user */
  appUserId: string
}

/**
 * Configuration options for the OkHi login process.
 */
export type OkHiLoginConfiguration = {
  /** If true, automatically requests required location permissions during login. Defaults to false. */
  withPermissionsRequest?: boolean
}

/**
 * Application context information sent to OkHi for analytics and debugging.
 */
export type OkHiAppContext = {
  /** Your application's name */
  name: string
  /** Your application's version string (e.g., '1.0.0') */
  version: string
  /** Your application's build number or identifier */
  build: string
}

/**
 * Complete login payload containing all required data to initialize OkHi.
 * Pass this to the `login()` function to authenticate a user.
 *
 * @example
 * ```typescript
 * const loginPayload: OkHiLogin = {
 *   auth: { branchId: 'xxx', clientKey: 'yyy' },
 *   user: { firstName: 'John', lastName: 'Doe', phone: '+254...', email: '...', appUserId: '123' },
 *   configuration: { withPermissionsRequest: true },
 *   appContext: { name: 'MyApp', version: '1.0.0', build: '1' }
 * };
 * ```
 */
export type OkHiLogin = {
  /** Authentication credentials */
  auth: OkHiAuth
  /** User information */
  user: OkHiUser
  /** Optional login configuration settings */
  configuration?: OkHiLoginConfiguration
  /** Optional application context for analytics */
  appContext?: OkHiAppContext
}

/**
 * Internal type for native bridge response containing serialized user and location data.
 * @internal
 */
export type NitroOkHiSuccessResponse = {
  /** JSON-serialized user object */
  user: string
  /** JSON-serialized location object */
  location: string
}

/**
 * Response returned on successful address creation or verification.
 * Contains the user data and the created/verified location details.
 *
 * @remarks
 * Store the `location.id` securely on your server to track verification status
 * and to re-use the address for future verifications.
 */
export type OkHiSuccessResponse = {
  /** The user associated with this address */
  user: OkHiUser
  /** The created or verified location details */
  location: OkHiLocation
}

/**
 * Error object thrown when an OkHi operation fails.
 *
 * @remarks
 * Common error codes include:
 * - Network errors
 * - Permission denied
 * - Unsupported device
 * - Invalid phone number format
 */
export type OkHiException = {
  /** Error code identifying the type of failure */
  code: string
  /** Human-readable error message */
  message: string
}

/**
 * Represents a verified or created address/location in the OkHi system.
 * Contains comprehensive location data including coordinates, address components,
 * and metadata about the location.
 *
 * @remarks
 * The `id` field is particularly important - store it on your server to:
 * - Track verification status via OkHi webhooks
 * - Re-use the address for future verifications by passing it to `OkCollect.locationId`
 */
export type OkHiLocation = {
  /** Unique OkHi identifier for this location. Store this for tracking and re-use. */
  id?: string | null
  /** Latitude coordinate */
  lat?: number | null
  /** Longitude coordinate */
  lng?: number | null
  /** Google Place ID if available */
  placeId?: string | null
  /** Plus Code (Open Location Code) for this location */
  plusCode?: string | null
  /** Name of the property/building (e.g., 'Westgate Mall') */
  propertyName?: string | null
  /** Street name */
  streetName?: string | null
  /** Display title for the address */
  title?: string | null
  /** Secondary display text for the address */
  subtitle?: string | null
  /** User-provided directions to the location */
  directions?: string | null
  /** Additional information about the location */
  otherInformation?: string | null
  /** OkHi URL for this location */
  url?: string | null
  /** Google Street View panorama ID */
  streetViewPanoId?: string | null
  /** URL to the Street View panorama */
  streetViewPanoUrl?: string | null
  /** OkHi user ID associated with this location */
  userId?: string | null
  /** URL to a photo of the location */
  photoUrl?: string | null
  /** Property/building number */
  propertyNumber?: string | null
  /** Country name */
  country?: string | null
  /** State or province */
  state?: string | null
  /** City name */
  city?: string | null
  /** Formatted display title */
  displayTitle?: string | null
  /** ISO country code (e.g., 'KE', 'NG') */
  countryCode?: string | null
  /** Neighborhood name */
  neighborhood?: string | null
  /** Types of usage for this address (e.g., ['home', 'work']) */
  usageTypes?: string[] | null
  /** Ward/administrative subdivision */
  ward?: string | null
  /** Full formatted address string */
  formattedAddress?: string | null
  /** Postal/ZIP code */
  postCode?: string | null
  /** Local Government Area (Nigeria-specific) */
  lga?: string | null
  /** Local Government Area code */
  lgaCode?: string | null
  /** Unit/apartment number */
  unit?: string | null
  /** GPS accuracy in meters at time of capture */
  gpsAccuracy?: string | null
  /** Business name if this is a business address */
  businessName?: string | null
  /** Type of location (e.g., 'residential', 'commercial') */
  type?: string | null
  /** District name */
  district?: string | null
  /** Single-line address representation */
  addressLine?: string | null
  /** Raw JSON response from the API */
  jsonResponse?: string | null
}

/**
 * Customization options for branding the OkCollect address collection UI.
 *
 * @example
 * ```typescript
 * const style: OkCollectStyle = {
 *   color: '#FF5733',        // Your brand's primary color
 *   name: 'My Company',      // Displayed in the UI
 *   logo: 'https://...'      // URL to your logo
 * };
 * ```
 */
export type OkCollectStyle = {
  /** Primary brand color in hex format (e.g., '#FF5733') */
  color: string | null
  /** Your company/app name to display in the UI */
  name: string | null
  /** URL to your company logo image */
  logo: string | null
}

/**
 * Configuration options for the OkCollect address collection experience.
 */
export type OkCollectConfig = {
  /** Enable Street View capture during address collection */
  streetView?: boolean | null
  /** Show "Home" as an address type option */
  withHomeAddressType?: boolean | null
  /** Show "Work" as an address type option */
  withWorkAddressType?: boolean | null
  /** Display the app bar in the OkCollect UI */
  withAppBar?: boolean | null
}

/**
 * Configuration for the OkCollect address collection flow.
 * Pass this to address verification functions to customize the experience.
 *
 * @example
 * ```typescript
 * const okcollect: OkCollect = {
 *   style: { color: '#FF5733', name: 'MyApp', logo: 'https://...' },
 *   locationId: 'existing-location-id' // Optional: re-use a previously created address
 * };
 *
 * await startAddressVerification({ okcollect });
 * ```
 */
export type OkCollect = {
  /** Branding/styling options for the UI */
  style?: OkCollectStyle
  /** Feature configuration options */
  configuration?: OkCollectConfig
  /** Optional: Pass an existing location ID to re-use a previously created address */
  locationId?: String
}

/**
 * Internal type for native bridge - style configuration with required fields.
 * @internal
 */
export type NitroOkCollectStyle = {
  color: string
  name: string
  logo: string
}

/**
 * Internal type for native bridge - configuration with required fields.
 * @internal
 */
export type NitroOkCollectConfig = {
  streetView: boolean
  withHomeAddressType: boolean
  withWorkAddressType: boolean
  withAppBar: boolean
}

/**
 * Internal type for native bridge - complete OkCollect configuration.
 * @internal
 */
export type NitroOkCollect = {
  style: NitroOkCollectStyle
  configuration: NitroOkCollectConfig
  locationId?: string
}

/**
 * Specifies the type of address verification to perform.
 *
 * - `DIGITAL` - Collects location signals from the user's device for digital-only verification.
 *   No physical site visits required.
 * - `PHYSICAL` - Triggers physical site visits from OkHi's verification partner network.
 * - `DIGITALANDPHYSICAL` - Combines both approaches for the most comprehensive verification.
 * - `ADDRESSBOOK` - Creates and stores an address without immediate verification,
 *   enabling passive signal collection for later verification.
 */
export type OkHiVerificationType =
  | 'DIGITAL'
  | 'PHYSICAL'
  | 'DIGITALANDPHYSICAL'
  | 'ADDRESSBOOK'
