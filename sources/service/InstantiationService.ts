import { optional } from '../decorators/optional';
import { SyncDescriptor } from '../descriptors';
import { DependencyGraph } from '../DependencyGraph';
import { IdleService } from '../idleService';
import { IInstantiationService, ServicesAccessor } from '../instantiation';
import { ServiceCollection } from '../ServiceCollection';
import { ServiceIdentifier } from '../ServiceIdentifier';
import { Trace } from '../tracing/Trace';
import { Ctor, getServiceDependencies } from '../util';

/**
 * A Dependency Injection container which also acts as an Injectable allowing
 * for automated instantiation at runtime, and idling services that support
 * delayed instantiation.
 */
export class InstantiationService implements IInstantiationService {
  declare readonly _serviceBrand: undefined;

  constructor(
    private readonly _services: ServiceCollection = new ServiceCollection(),
    private readonly _strict: boolean = false,
    private readonly _parent?: InstantiationService
  ) {
    this._services.set(IInstantiationService, this);
  }

  createChild(services: ServiceCollection): IInstantiationService {
    return new InstantiationService(services, this._strict, this);
  }

  createInstance<T>(
    ctorOrDescriptor: any | SyncDescriptor<T>,
    ...rest: any[]
  ): T | SyncDescriptor<T> {
    let trace: Trace<T>;
    let result: T;

    if (ctorOrDescriptor instanceof SyncDescriptor) {
      trace = Trace.traceCreation(ctorOrDescriptor.ctor);
      result = this._createInstance<T>(
        ctorOrDescriptor.ctor,
        ctorOrDescriptor.staticArguments.concat(rest),
        trace
      );
    } else {
      trace = Trace.traceCreation(ctorOrDescriptor);
      result = this._createInstance<T>(ctorOrDescriptor, rest, trace);
    }

    trace.stop();

    return result;
  }

  public invokeFunction<T, TS extends any[] = []>(
    fn: (accessor: ServicesAccessor, ...args: TS) => T,
    ...args: TS
  ): T {
    const trace = Trace.traceInvocation(fn);
    let done = false;

    try {
      const accessor = {
        get: <K>(id: ServiceIdentifier<K>, isOptional?: typeof optional) => {
          if (done) throw new Error('');

          const result = this._getOrCreateServiceInstance<K>(
            id,
            trace as Trace<K>
          );

          if (!result && isOptional !== optional) throw new Error('');

          return result;
        },
      };

      return fn(accessor, ...args);
    } finally {
      done = true;
      trace.stop();
    }
  }

  // #region private

  private _createInstance<T>(
    ctor: Ctor<T>,
    args: any[] = [],
    trace: Trace<T>
  ): T {
    const serviceDependencies = getServiceDependencies(ctor).sort(
      (a, b) => a.index - b.index
    );
    const serviceArgs: any[] = [];

    for (const dependency of serviceDependencies) {
      const service = this._getOrCreateServiceInstance(dependency.id, trace);

      if (!service && this._strict && !dependency.optional)
        throw new Error(
          `${ctor.name} depends on unknown service ${dependency.id}`
        );

      serviceArgs.push(service);
    }

    const firstServiceArgPosition =
      serviceDependencies.length > 0
        ? serviceDependencies[0].index
        : args.length;

    if (args.length !== firstServiceArgPosition) {
      console.log(
        `First service dependency of ${ctor.name} at position ${
          firstServiceArgPosition + 1
        } conflicts with ${args.length} static arguments`
      );

      const delta = firstServiceArgPosition - args.length;

      if (delta > 0) args = args.concat(new Array(delta));
      else args = args.slice(0, firstServiceArgPosition);
    }

    return <T>new ctor(...[...args, ...serviceArgs]);
  }

  private _getOrCreateServiceInstance<T>(
    id: ServiceIdentifier<T>,
    trace: Trace<T>
  ): T {
    const service = this._getService(id);

    if (service instanceof SyncDescriptor)
      return this._createCachedServiceInstance(
        id,
        service,
        trace.branch(id, true)
      );
    else {
      trace.branch(id, false);

      return service;
    }
  }

  private _getService<T>(id: ServiceIdentifier<T>): T | SyncDescriptor<T> {
    const service = this._services.get<T>(id);

    if (!service && this._parent) return this._parent._getService(id);
    else return service;
  }

  private _createCachedServiceInstance<T>(
    id: ServiceIdentifier<T>,
    dependency: SyncDescriptor<T>,
    trace: Trace<T>
  ): T {
    type Triple = {
      id: ServiceIdentifier<T>;
      dependency: SyncDescriptor<T>;
      trace: Trace<T>;
    };
    const graph = new DependencyGraph<Triple>((data) => data.id.toString());

    let cycleCount = 0;
    const stack = [{ id, dependency, trace }];

    while (stack.length) {
      const currentSvc = stack.pop()!;

      graph.lookupOrInsertNode(currentSvc);

      if (cycleCount++ > 1000) throw new Error('');

      for (const dependency of getServiceDependencies<T>(
        currentSvc.dependency.ctor
      )) {
        const service = this._getService(dependency.id);

        if (!service && !dependency.optional)
          console.log(
            `createInstance ${id} depends on ${dependency.id} which is not registered.`
          );

        if (service instanceof SyncDescriptor) {
          const serviceDependency: Triple = {
            id: dependency.id,
            dependency: service,
            trace: currentSvc.trace.branch(dependency.id, true),
          };
          graph.insertEdge(currentSvc, serviceDependency);
          stack.push(serviceDependency);
        }
      }
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const roots = graph.roots();

      if (roots.length === 0) {
        if (!graph.isEmpty()) throw new Error('');
        break;
      }

      for (const { data: serviceDependency } of roots) {
        const { id, dependency, trace } = serviceDependency;
        const currentSvc = this._getService(serviceDependency.id);

        if (currentSvc instanceof SyncDescriptor) {
          const svcInstance = this._createServiceWithOwner(
            id,
            dependency.ctor,
            dependency.staticArguments,
            dependency.supportsDelayedInstantiation,
            trace
          );
          this._setServiceInstance(id, svcInstance);
        }

        graph.removeNode(serviceDependency);
      }
    }

    return <T>this._getService(id);
  }

  private _createServiceWithOwner<T>(
    id: ServiceIdentifier<T>,
    ctor: new (...args: any[]) => T,
    args: any[] = [],
    supportsDelayedInstantiation: boolean,
    trace: Trace<T>
  ): T {
    if (this._services.get<T>(id) instanceof SyncDescriptor)
      return this._createService<T>(
        ctor,
        args,
        supportsDelayedInstantiation,
        trace
      );
    else if (this._parent)
      return this._parent._createServiceWithOwner<T>(
        id,
        ctor,
        args,
        supportsDelayedInstantiation,
        trace
      );
    else throw new Error(`illegalState ${ctor.name}`);
  }

  private _setServiceInstance<T>(
    id: ServiceIdentifier<T>,
    svcInstance: any
  ): void {
    if (this._services.get(id) instanceof SyncDescriptor)
      this._services.set(id, svcInstance);
    else if (this._parent) this._parent._services.set(id, svcInstance);
    else throw new Error('illegalState');
  }

  private _createService<T>(
    ctor: Ctor<T>,
    args: any[] = [],
    supportsDelayedInstantiation: boolean,
    trace: Trace<T>
  ): T {
    if (!supportsDelayedInstantiation)
      return this._createInstance<T>(ctor, args, trace);
    else {
      const idle = new IdleService<T>(() =>
        this._createInstance<T>(ctor, args, trace)
      );
      return <T>new Proxy(Object.create(null), {
        get(target: T, key: PropertyKey): T {
          if (key in target) return target[key];

          const obj = idle.value;
          let prop = obj[key];

          if (typeof prop !== 'function') return prop;

          prop = prop.bind(obj);
          target[key] = prop;

          return prop;
        },
        set(_target: T, key: PropertyKey, value: any): boolean {
          idle.value[key] = value;

          return true;
        },
      });
    }
  }
  // #endregion private
}
