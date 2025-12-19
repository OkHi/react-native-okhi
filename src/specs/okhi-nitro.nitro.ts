import { type HybridObject } from 'react-native-nitro-modules'
import type {
  NitroOkCollect,
  OkHiException,
  OkHiLogin,
  OkHiSuccessResponse,
} from '../types'

type OkHiVerificationType =
  | 'DIGITAL'
  | 'PHYSICAL'
  | 'DIGITALANDPHYSICAL'
  | 'ADDRESSBOOK'

export interface OkhiNitro extends HybridObject<{
  ios: 'swift'
  android: 'kotlin'
}> {
  login(credentials: OkHiLogin, callback: (results?: string[]) => void): void

  startAddressVerification(
    type: OkHiVerificationType,
    okcollect: NitroOkCollect,
    callback: (response?: OkHiSuccessResponse, error?: OkHiException) => void
  ): void
}
