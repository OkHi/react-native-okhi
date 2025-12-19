import { NitroModules } from 'react-native-nitro-modules'
import type { Okhi as OkhiSpec } from './specs/okhi.nitro'

export const Okhi =
  NitroModules.createHybridObject<OkhiSpec>('Okhi')