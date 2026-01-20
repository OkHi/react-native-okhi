/**
 * React Native OkHi SDK
 *
 * This module provides the main API for integrating OkHi address verification
 * into your React Native application. It enables:
 * - User authentication with OkHi
 * - Address collection and verification (digital, physical, or hybrid)
 * - Address book management
 *
 * @example
 * ```typescript
 * import { login, startAddressVerification } from 'react-native-okhi';
 *
 * // 1. Login the user
 * await login({
 *   auth: { branchId: 'your-branch-id', clientKey: 'your-client-key' },
 *   user: { firstName: 'John', lastName: 'Doe', phone: '+254...', email: '...', appUserId: '123' }
 * });
 *
 * // 2. Start address verification
 * const result = await startAddressVerification();
 * console.log('Location ID:', result.location.id);
 * ```
 *
 * @module react-native-okhi
 */

import { OkHiNitro, startGenericAddressVerification } from './functions'
import type { OkCollect, OkHiLogin, OkHiSuccessResponse } from './types'
export * from "./helpers"

/**
 * Authenticates a user with OkHi and initializes the SDK.
 * This must be called before any address verification functions.
 *
 * @param credentials - The login payload containing auth credentials, user info, and optional configuration.
 * @returns Promise resolving to an array of strings (internal tokens) on success, or undefined.
 *
 * @remarks
 * Call this function once you have an authenticated user in your app,
 * typically immediately after the user logs in or the app dashboard is rendered.
 *
 * During testing, use a phone number you own/control as real verification SMS may be sent.
 *
 * @example
 * ```typescript
 * const credentials: OkHiLogin = {
 *   auth: {
 *     branchId: 'your-branch-id',
 *     clientKey: 'your-client-key'
 *   },
 *   user: {
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     phone: '+254712345678',
 *     email: 'john@example.com',
 *     appUserId: 'user-123'
 *   },
 *   configuration: {
 *     withPermissionsRequest: true // Optionally request permissions during login
 *   }
 * };
 *
 * await login(credentials);
 * ```
 */
export async function login(
  credentials: OkHiLogin
): Promise<string[] | undefined> {
  return new Promise((resolve) => {
    OkHiNitro.login(credentials, resolve)
  })
}

/**
 * Logs out the current user and stops all location signal collection.
 * Call this when the user logs out of your application.
 *
 * @returns Promise that resolves when logout is complete.
 *
 * @remarks
 * After calling logout, you must call {@link login} again before using
 * any address verification functions.
 *
 * @example
 * ```typescript
 * // When user logs out of your app
 * await logout();
 * ```
 */
export async function logout(
): Promise<void> {
  return Promise.resolve()
}

/**
 * Starts digital address verification for the logged-in user.
 * Opens the OkCollect UI for the user to create or select an address,
 * then begins collecting location signals from their device.
 *
 * @param params - Optional configuration for the address collection UI.
 * @param params.okcollect - Customization options for branding and features.
 * @returns Promise resolving to the user and location data on success.
 * @throws {OkHiException} If verification fails (network error, permissions denied, etc.).
 *
 * @remarks
 * Digital verification collects location signals from the user's device
 * without requiring physical site visits. This is the default and most
 * common verification method.
 *
 * Store the returned `location.id` on your server to track verification status
 * via OkHi webhooks.
 *
 * @example
 * ```typescript
 * try {
 *   const result = await startAddressVerification({
 *     okcollect: {
 *       style: { color: '#FF5733', name: 'MyApp', logo: 'https://...' }
 *     }
 *   });
 *
 *   // Send location ID to your server
 *   await saveToServer(result.location.id, result.user);
 * } catch (error) {
 *   console.error('Verification failed:', error.message);
 * }
 * ```
 */
export async function startAddressVerification(params?: {
  okcollect?: OkCollect
}): Promise<OkHiSuccessResponse> {
  return startGenericAddressVerification('DIGITAL', params)
}

/**
 * Starts physical address verification for the logged-in user.
 * Opens the OkCollect UI for the user to create or select an address,
 * then triggers a physical site visit from OkHi's verification partner network.
 *
 * @param params - Optional configuration for the address collection UI.
 * @param params.okcollect - Customization options for branding and features.
 * @returns Promise resolving to the user and location data on success.
 * @throws {OkHiException} If verification fails (network error, permissions denied, etc.).
 *
 * @remarks
 * Physical verification involves a real person visiting the address to confirm
 * its validity. This provides higher confidence verification but takes longer
 * than digital verification.
 *
 * Use this for high-value transactions or when regulatory requirements demand
 * physical address confirmation.
 *
 * @example
 * ```typescript
 * const result = await startPhysicalAddressVerification();
 * console.log('Physical verification initiated for:', result.location.formattedAddress);
 * ```
 */
export async function startPhysicalAddressVerification(params?: {
  okcollect?: OkCollect
}): Promise<OkHiSuccessResponse> {
  return startGenericAddressVerification('PHYSICAL', params)
}

/**
 * Starts combined digital and physical address verification for the logged-in user.
 * Opens the OkCollect UI for the user to create or select an address,
 * then performs both digital signal collection AND schedules a physical site visit.
 *
 * @param params - Optional configuration for the address collection UI.
 * @param params.okcollect - Customization options for branding and features.
 * @returns Promise resolving to the user and location data on success.
 * @throws {OkHiException} If verification fails (network error, permissions denied, etc.).
 *
 * @remarks
 * This hybrid approach provides the most comprehensive address verification by:
 * 1. Immediately collecting location signals from the user's device (digital)
 * 2. Scheduling a physical site visit from OkHi's verification partner network
 *
 * Use this when you need the highest level of address confidence, combining
 * the speed of digital verification with the certainty of physical confirmation.
 *
 * @example
 * ```typescript
 * const result = await startDigitalAndPhysicalAddressVerification({
 *   okcollect: {
 *     configuration: { withHomeAddressType: true }
 *   }
 * });
 * console.log('Hybrid verification started for location:', result.location.id);
 * ```
 */
export async function startDigitalAndPhysicalAddressVerification(params?: {
  okcollect?: OkCollect
}): Promise<OkHiSuccessResponse> {
  return startGenericAddressVerification('DIGITALANDPHYSICAL', params)
}

/**
 * Creates and stores an address without triggering immediate verification.
 * Opens the OkCollect UI for the user to create or select an address,
 * saves it to their address book, and enables passive signal collection.
 *
 * @param params - Optional configuration for the address collection UI.
 * @param params.okcollect - Customization options for branding and features.
 * @returns Promise resolving to the user and location data on success.
 * @throws {OkHiException} If address creation fails (network error, permissions denied, etc.).
 *
 * @remarks
 * Use this function when you want to:
 * - Collect addresses during onboarding without immediate verification
 * - Build an address book that users can manage
 * - Enable passive location signal collection for future verification
 *
 * The stored `location.id` can later be passed to verification functions via
 * `OkCollect.locationId` to initiate verification for a previously created address.
 *
 * @example
 * ```typescript
 * // Create address during onboarding
 * const result = await createAddress();
 *
 * // Store the location ID for later
 * await saveLocationId(result.location.id);
 *
 * // Later, verify the stored address
 * const verifyResult = await startAddressVerification({
 *   okcollect: { locationId: savedLocationId }
 * });
 * ```
 */
export async function createAddress(params?: { okcollect?: OkCollect }): Promise<OkHiSuccessResponse> {
  return startGenericAddressVerification('ADDRESSBOOK', params)
}