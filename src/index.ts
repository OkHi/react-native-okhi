import { OkHiNitro, startGenericAddressVerification } from './functions'
import type { OkCollect, OkHiLogin, OkHiSuccessResponse } from './types'
export * from "./helpers"

export async function login(
  credentials: OkHiLogin
): Promise<string[] | undefined> {
  return new Promise((resolve) => {
    OkHiNitro.login(credentials, resolve)
  })
}

export async function logout(
): Promise<void> {
  return Promise.resolve()
}

export async function startAddressVerification(params?: {
  okcollect?: OkCollect
}): Promise<OkHiSuccessResponse> {
  return startGenericAddressVerification('DIGITAL', params)
}

export async function startPhysicalAddressVerification(params?: {
  okcollect?: OkCollect
}): Promise<OkHiSuccessResponse> {
  return startGenericAddressVerification('PHYSICAL', params)
}

export async function startDigitalAndPhysicalAddressVerification(params?: {
  okcollect?: OkCollect
}): Promise<OkHiSuccessResponse> {
  return startGenericAddressVerification('DIGITALANDPHYSICAL', params)
}

export async function createAddress(params?: { okcollect?: OkCollect }): Promise<OkHiSuccessResponse> {
  return startGenericAddressVerification('ADDRESSBOOK', params)
}