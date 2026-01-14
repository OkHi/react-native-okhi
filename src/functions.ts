import type {
  NitroOkCollect,
  OkCollect,
  OkHiException,
  OkHiLocation,
  OkHiSuccessResponse,
  OkHiUser,
  OkHiVerificationType,
} from './types'
import type { OkhiNitro as OkhiNitroSpec } from './specs/okhi-nitro.nitro'
import { NitroModules } from 'react-native-nitro-modules'

export const OkHiNitro =
  NitroModules.createHybridObject<OkhiNitroSpec>('OkhiNitro')

type StartGenericAddressVerificationParams = {
  okcollect?: OkCollect
}

const DEFAULT_OKCOLLECT: NitroOkCollect = {
  configuration: {
    streetView: true,
    withAppBar: true,
    withHomeAddressType: true,
    withWorkAddressType: false,
  },
  style: {
    color: '#005D67',
    logo: 'https://cdn.okhi.co/icon.png',
    name: 'OkHi Customer',
  },
  locationId: undefined,
}

function safeJsonParse<T>(value: unknown, label: string): T {
  if (typeof value !== 'string') {
    throw <OkHiException>{
      code: 'invalid_response',
      message: `Expected ${label} to be a JSON string`,
    }
  }
  try {
    return JSON.parse(value) as T
  } catch {
    throw <OkHiException>{
      code: 'invalid_json',
      message: `Failed to parse ${label} JSON`,
    }
  }
}

function normalizeLocationId(input: unknown): string | undefined {
  return typeof input === 'string' && input.trim().length > 0
    ? input
    : undefined
}

function buildNitroOkCollect(
  params?: StartGenericAddressVerificationParams
): NitroOkCollect {
  const c = params?.okcollect?.configuration
  const s = params?.okcollect?.style

  return {
    configuration: {
      streetView: c?.streetView ?? DEFAULT_OKCOLLECT.configuration.streetView,
      withAppBar: c?.withAppBar ?? DEFAULT_OKCOLLECT.configuration.withAppBar,
      withHomeAddressType:
        c?.withHomeAddressType ??
        DEFAULT_OKCOLLECT.configuration.withHomeAddressType,
      withWorkAddressType:
        c?.withWorkAddressType ??
        DEFAULT_OKCOLLECT.configuration.withWorkAddressType,
    },
    style: {
      color: s?.color ?? DEFAULT_OKCOLLECT.style.color,
      logo: s?.logo ?? DEFAULT_OKCOLLECT.style.logo,
      name: s?.name ?? DEFAULT_OKCOLLECT.style.name,
    },
    locationId: normalizeLocationId(params?.okcollect?.locationId),
  }
}

export async function startGenericAddressVerification(
  type: OkHiVerificationType,
  params?: StartGenericAddressVerificationParams
): Promise<OkHiSuccessResponse> {
  const okcollect = buildNitroOkCollect(params)

  const response = await new Promise<any>((resolve, reject) => {
    OkHiNitro.startAddressVerification(type, okcollect, (res, err) => {
      if (err) return reject(err)

      // If both are empty, treat it as an error
      if (!res) {
        return reject(<OkHiException>{
          code: 'unknown',
          message: 'No response received from address verification',
        })
      }

      resolve(res)
    })
  })

  const user = safeJsonParse<OkHiUser>(response.user, 'user')
  const location = safeJsonParse<OkHiLocation>(response.location, 'location')

  return { location, user }
}
