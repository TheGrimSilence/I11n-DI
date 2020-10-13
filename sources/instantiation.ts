import * as descriptors from './descriptors';
import { createDecorator } from './decorators/createDecorator';
import { optional } from './decorators/optional';
import { ServiceCollection } from './ServiceCollection';
import { ServiceIdentifier } from './ServiceIdentifier';

export type BrandedService = {
  readonly _serviceBrand: undefined;
};

export interface ServicesAccessor {
  get<T>(id: ServiceIdentifier<T>): T;
  get<T>(id: ServiceIdentifier<T>, isOptional: typeof optional): T | undefined;
}

/**
 * Given a list of arguments as a tuple, attempt to extract the leading, non-service arguments
 * to their own tuple.
 */
type GetLeadingNonServiceArgs<Args> = Args extends [...BrandedService[]]
  ? []
  : Args extends [...infer A, ...BrandedService[]]
  ? [...A]
  : never;

export const IInstantiationService = createDecorator<IInstantiationService>(
  'instantiationService'
);

export interface IInstantiationService {
  /**
   * An unused property to break structural typing. All services must therefore also include such brands.
   *
   * Read more [here](https://basarat.gitbook.io/typescript/main-1/nominaltyping#nominal-typing).
   */
  _serviceBrand: undefined;

  /**
   * Synchronously creates an instance that is denoted by
   * the descriptor.
   */
  createInstance<T>(descriptor: descriptors.SyncDescriptor0<T>): T;
  createInstance<A1, T>(
    descriptor: descriptors.SyncDescriptor1<A1, T>,
    a1: A1
  ): T;
  createInstance<A1, A2, T>(
    descriptor: descriptors.SyncDescriptor2<A1, A2, T>,
    a1: A1,
    a2: A2
  ): T;
  createInstance<A1, A2, A3, T>(
    descriptor: descriptors.SyncDescriptor3<A1, A2, A3, T>,
    a1: A1,
    a2: A2,
    a3: A3
  ): T;
  createInstance<A1, A2, A3, A4, T>(
    descriptor: descriptors.SyncDescriptor4<A1, A2, A3, A4, T>,
    a1: A1,
    a2: A2,
    a3: A3,
    a4: A4
  ): T;
  createInstance<A1, A2, A3, A4, A5, T>(
    descriptor: descriptors.SyncDescriptor5<A1, A2, A3, A4, A5, T>,
    a1: A1,
    a2: A2,
    a3: A3,
    a4: A4,
    a5: A5
  ): T;
  createInstance<A1, A2, A3, A4, A5, A6, T>(
    descriptor: descriptors.SyncDescriptor6<A1, A2, A3, A4, A5, A6, T>,
    a1: A1,
    a2: A2,
    a3: A3,
    a4: A4,
    a5: A5,
    a6: A6
  ): T;
  createInstance<A1, A2, A3, A4, A5, A6, A7, T>(
    descriptor: descriptors.SyncDescriptor7<A1, A2, A3, A4, A5, A6, A7, T>,
    a1: A1,
    a2: A2,
    a3: A3,
    a4: A4,
    a5: A5,
    a6: A6,
    a7: A7
  ): T;
  createInstance<A1, A2, A3, A4, A5, A6, A7, A8, T>(
    descriptor: descriptors.SyncDescriptor8<A1, A2, A3, A4, A5, A6, A7, A8, T>,
    a1: A1,
    a2: A2,
    a3: A3,
    a4: A4,
    a5: A5,
    a6: A6,
    a7: A7,
    a8: A8
  ): T;

  // createInstance<T, A extends unknown[] = []>(
  //   descriptor: descriptors.SyncDescriptor<T>,
  //   ...args: [...A]
  // ): T;

  createInstance<
    TCtor extends new (...args: any[]) => any,
    R extends InstanceType<TCtor>
  >(
    ctor: TCtor,
    ...args: GetLeadingNonServiceArgs<ConstructorParameters<TCtor>>
  ): R;

  /**
   * Using an accessor, allows calling on service instances for use.
   */
  invokeFunction<T, A extends any[] = []>(
    fn: (accessor: ServicesAccessor, ...args: A) => T,
    ...args: A
  ): T;

  /**
   * Creates a child of this service which inherits all current services
   * and adds/overwrites the given services.
   */
  createChild(services: ServiceCollection): IInstantiationService;
}
