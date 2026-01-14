import { OkHiNitro, startGenericAddressVerification } from './functions'
import type { OkCollect, OkHiLogin } from './types'

export async function login(
  credentials: OkHiLogin
): Promise<string[] | undefined> {
  return new Promise((resolve) => {
    OkHiNitro.login(credentials, resolve)
  })
}

export async function startAddressVerification(params?: {
  okcollect?: OkCollect
}) {
  return startGenericAddressVerification('DIGITAL', params)
}

export async function startPhysicalAddressVerification(params?: {
  okcollect?: OkCollect
}) {
  return startGenericAddressVerification('PHYSICAL', params)
}

export async function startDigitalAndPhysicalAddressVerification(params?: {
  okcollect?: OkCollect
}) {
  return startGenericAddressVerification('DIGITALANDPHYSICAL', params)
}

export async function createAddress(params?: { okcollect?: OkCollect }) {
  return startGenericAddressVerification('ADDRESSBOOK', params)
}
