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
  createInstance<T>(descriptor: descriptors.SyncDescriptor<T>): T;
  createInstance<T, A extends unknown[] = []>(
    descriptor: descriptors.SyncDescriptor<T>,
    ...args: [...A]
  ): T;

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
