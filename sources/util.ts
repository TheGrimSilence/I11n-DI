import { ServiceIdentifier } from './ServiceIdentifier';

export type Ctor<TReturnType> = new (...args: any[]) => TReturnType;

export const serviceIds = new Map<string, ServiceIdentifier<any>>();

export const DI_TARGET = '$do$target';
export const DI_DEPENDENCIES = '$di$dependencies';

export type ServiceDependency = {
  id;
};

export function getServiceDependencies<T>(
  ctor: Ctor<T>
): {
  id: ServiceIdentifier<T>;
  index: number;
  optional: boolean;
}[] {
  return ctor[DI_DEPENDENCIES] || [];
}

export function storeServiceDependency<T>(
  id: ServiceIdentifier<T>,
  target: Ctor<T>,
  index: number,
  optional: boolean
): void {
  if (target[DI_TARGET] === target) {
    target[DI_DEPENDENCIES].push({ id, index, optional });
  } else {
    target[DI_DEPENDENCIES] = [{ id, index, optional }];
    target[DI_TARGET] = target;
  }
}
