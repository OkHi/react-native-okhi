import { NitroModules } from 'react-native-nitro-modules'
import type { OkhiNitro as OkhiNitroSpec } from './specs/okhi-nitro.nitro'
import type {
  NitroOkCollect,
  OkCollect,
  OkHiLogin,
  OkHiSuccessResponse,
  OkHiVerificationType,
} from './types'

const OkhiNitro = NitroModules.createHybridObject<OkhiNitroSpec>('OkhiNitro')

export async function login(
  credentials: OkHiLogin
): Promise<string[] | undefined> {
  return new Promise((resolve) => {
    OkhiNitro.login(credentials, resolve)
  })
}
async function startGenericAddressVerification(
  type: OkHiVerificationType,
  params?: {
    okcollect?: OkCollect
  }
): Promise<OkHiSuccessResponse> {
  return new Promise((resolve, reject) => {
    const okcollect: NitroOkCollect = {
      configuration: {
        streetView: params?.okcollect?.configuration?.streetView || true,
        withAppBar: params?.okcollect?.configuration?.withAppBar || true,
        withHomeAddressType:
          params?.okcollect?.configuration?.withHomeAddressType || true,
        withWorkAddressType:
          params?.okcollect?.configuration?.withWorkAddressType || false,
      },
      style: {
        color: params?.okcollect?.style?.color || '#005D67',
        logo: params?.okcollect?.style?.logo || 'https://cdn.okhi.co/icon.png',
        name: params?.okcollect?.style?.name || 'OkHi Customer',
      },
      location:
        typeof params?.okcollect?.location?.id === 'string'
          ? { id: params.okcollect.location.id }
          : null,
    }
    OkhiNitro.startAddressVerification(type, okcollect, (response, error) => {
      if (response) {
        resolve(response)
      }
      if (error) {
        reject(error)
      }
    })
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
