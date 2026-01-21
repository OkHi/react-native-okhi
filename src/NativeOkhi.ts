import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  multiply(a: number, b: number): number;
  login(
    credentials: Object,
    callback: (results: string[] | null) => void
  ): void;
  startDigitalAddressVerification(
    okcollect: Object,
    callback: (result?: Object, error?: Object) => void
  ): void;
  startPhysicalAddressVerification(
    okcollect: Object,
    callback: (result?: Object, error?: Object) => void
  ): void;
  startDigitalAndPhysicalAddressVerification(
    okcollect: Object,
    callback: (result?: Object, error?: Object) => void
  ): void;
  createAddress(
    okcollect: Object,
    callback: (result?: Object, error?: Object) => void
  ): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Okhi');
