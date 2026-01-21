import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  multiply(a: number, b: number): number;
  login(
    credentials: Object,
    callback: (results: string[] | null) => void
  ): void;
  startDigitalVerification(
    okcollect: Object,
    callback: (result?: Object, error?: Object) => void
  ): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Okhi');
