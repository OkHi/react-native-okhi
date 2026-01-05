import { NitroModules } from 'react-native-nitro-modules'
import type { OkhiNitro as OkhiNitroSpec } from './specs/okhi-nitro.nitro'

export const OkhiNitro =
  NitroModules.createHybridObject<OkhiNitroSpec>('OkhiNitro')