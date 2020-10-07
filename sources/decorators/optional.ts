import { ServiceIdentifier } from '../ServiceIdentifier';
import { Ctor, storeServiceDependency } from '../util';

/** Marks a service dependency as optional. */
export function optional<T>(serviceIdentifier: ServiceIdentifier<T>) {
  return (target: Ctor<T>, key: string, index: number) => {
    storeServiceDependency(serviceIdentifier, target, index, true);
  };
}
