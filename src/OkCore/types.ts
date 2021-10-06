/**
 * Defines the structure of the user object requried by OkHi services and libraries.
 */
export interface OkHiUser {
  /**
   * The user's phone number. Must be MSISDN standard format. e.g +254712345678.
   */
  phone: string;
  /**
   * The user's first name.
   */
  firstName?: string;
  /**
   * The user's last name.
   */
  lastName?: string;
  /**
   * The OkHi's userId. Usually obtained after a user successfully creates an OkHi address.
   */
  id?: string;
}

/**
 * Defines the current mode you'll be using OkHi's services as well as your application's meta information.
 */
export interface OkHiAppContext {
  /**
   * The current mode you'll be using OkHi services.
   */
  mode: 'sandbox' | 'prod' | string;
  /**
   * Your application's meta information.
   */
  app?: {
    /**
     * Your application's name.
     */
    name: string;
    /**
     * Your application's current version.
     */
    version: string;
    /**
     * Your application's current build number.
     */
    build: number;
  };
  /**
   * Meta information about the current developer. Can only be okhi | external.
   */
  developer?: string;
}

/**
 * Defines the structure of the OkHi location object once an address has been successfully created by the user.
 */
export interface OkHiLocation {
  /**
   * The latitude of the location.
   */
  lat: number;
  /**
   * The longitude of the location.
   */
  lon: number;
  /**
   * The OkHi's locationId. Usually obtained once an address has been successfully created by the user.
   */
  id?: string;
  /**
   * The id of a common residential or geological space such as apartment building or office block.
   */
  placeId?: string;
  /**
   * Geocode system for identifying an area anywhere on the Earth.
   * See https://plus.codes/
   */
  plusCode?: string;
  /**
   * The location's property name.
   */
  propertyName?: string;
  /**
   * The location's street name.
   */
  streetName?: string;
  /**
   * A string that can be used to render information about the location.
   */
  title?: string;
  /**
   * A string that can be used to render meta information about the location.
   */
  subtitle?: string;
  /**
   * User generated directions to the location.
   */
  directions?: string;
  /**
   * User generated meta information about the location, how to access it and any other relevant notes.
   */
  otherInformation?: string;
  /**
   * A link to the user's address visible on browser or desktop.
   */
  url?: string;
  /**
   * A Google's StreetView Panorama Id, if the address was created using Google StreetView.
   * See: https://developers.google.com/maps/documentation/javascript/streetview
   */
  streetViewPanoId?: string;
  /**
   * A Google's StreetView Panorama Url, if the address was created using Google StreetView.
   * See: https://developers.google.com/maps/documentation/javascript/streetview
   */
  streetViewPanoUrl?: string;
  /**
   * The OkHi's userId. Usually obtained after a user successfully creates an OkHi address.
   */
  userId?: string;
  /**
   * The location's property number.
   */
  propertyNumber?: string;
  /**
   * A link to the location's gate photo.
   */
  photo?: string;

  /**
   * A user's country
   */
  country?: string;

  /**
   * A user's city
   */
  city?: string;

  /**
   * A user's state
   */
  state?: string;

  /**
   * A formatted location information
   */
  displayTitle?: string;
}

/**
 * @ignore
 */
export interface OkHiError {
  code: string;
  message: string;
}

export type OkHiApplicationConfiguration = {
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
  notification?: {
    title: string;
    text: string;
    channelId: string;
    channelName: string;
    channelDescription: string;
  };
};
