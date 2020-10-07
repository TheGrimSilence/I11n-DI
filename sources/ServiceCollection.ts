import { SyncDescriptor } from './descriptors';
import { ServiceIdentifier } from './ServiceIdentifier';

/**
 * Holds service objects.
 */
export class ServiceCollection {
  #entries = new Map<ServiceIdentifier<any>, any>();

  constructor(...entries: any[]) {
    for (const [id, service] of entries) {
      this.set(id, service);
    }
  }

  /**
   * Adds or updates a service with the specified id and instance or descriptor.
   */
  set<T>(
    id: ServiceIdentifier<T>,
    instanceOrDescriptor: T | SyncDescriptor<T>
  ): T | SyncDescriptor<T> {
    const result = this.#entries.get(id);

    this.#entries.set(id, instanceOrDescriptor);

    return result;
  }

  /**
   * Returns a boolean indicating whether a service with the specified id
   * exists or not.
   */
  has(id: ServiceIdentifier<any>): boolean {
    return this.#entries.has(id);
  }

  /**
   * Returns a specified service.
   */
  get<T>(id: ServiceIdentifier<T>): T | SyncDescriptor<T> {
    return this.#entries.get(id);
  }
}
