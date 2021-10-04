import type { OkHiError } from './types';

/**
 * The OkHiException class extends the Error class to provide additional information regarding the type of errors thrown while running any OkHiLibraries.
 * It contains static string properties that can be used to evaluate the kind of errors being thrown and handle them appropriately.
 */
export class OkHiException extends Error {
  /**
   * Error is thrown when the device can't connect to OkHi's servers.
   */
  static NETWORK_ERROR_CODE = 'network_error';
  /**
   * Error is thrown when the device can't connect to OkHi's servers.
   */
  static NETWORK_ERROR_MESSAGE =
    'Unable to establish a connection with OkHi servers';
  /**
   * Error is thrown whenever there's an unknown error that occured during the usage of one of OkHi's services.
   */
  static UNKNOWN_ERROR_CODE = 'unknown_error';
  /**
   * Error is thrown whenever there's an unknown error that occured during the usage of one of OkHi's services.
   */
  static UNKNOWN_ERROR_MESSAGE =
    'Unable to process the request. Something went wrong';
  /**
   * Error is thrown whenever an invalid phone number is provided to a service that requires a user's phone number.
   */
  static INVALID_PHONE_CODE = 'invalid_phone';
  /**
   * Error is thrown whenever an invalid phone number is provided to a service that requires a user's phone number.
   */
  static INVALID_PHONE_MESSAGE =
    'Invalid phone number provided. Please make sure its in MSISDN standard format';
  /**
   * Error is thrown whenever there's an issue with the credentials provided.
   */
  static UNAUTHORIZED_CODE = 'unauthorized';
  /**
   * Error is thrown whenever there's an issue with the credentials provided.
   */
  static UNAUTHORIZED_MESSAGE = 'Invalid credentials provided';
  /**
   * Error is thrown whenever a particular permission is required for a service to run and isn't granted by the user.
   */
  static PERMISSION_DENIED_CODE = 'permission_denied';
  /**
   * Error is thrown whenever a particular device service is required for a library to run and isn't granted by the user.
   */
  static SERVICE_UNAVAILABLE_CODE = 'service_unavailable';
  /**
   * Error is thrown whenever an OkHi service is run on an unsupported platform.
   */
  static UNSUPPORTED_PLATFORM_CODE = 'unsupported_platform';
  /**
   * Error is thrown whenever an OkHi service is run on an unsupported platform.
   */
  static UNSUPPORTED_PLATFORM_MESSAGE =
    'OkHi methods currently support Android devices only';
  /**
   * Error is thrown whenever bad configuration is provided to an OkHi service.
   */
  static BAD_REQUEST_CODE = 'bad_request';
  /**
   * Error is thrown whenever bad configuration is provided to an OkHi service.
   */
  static BAD_REQUEST_MESSAGE = 'Invalid parameters provided';

  /**
   * Specific error code string detailing the kind of error being thrown.
   */
  code: string;

  /**
   * @param error An error object with code and respective message.
   * @param error.code Specific error code string detailing the kind of error being thrown.
   * @param error.message Specific error message string detailing the kind of error being thrown.
   */
  constructor(error: OkHiError) {
    super(error.message);
    this.name = 'OkHiException';
    this.message = error.message;
    this.code = error.code;
  }
}
