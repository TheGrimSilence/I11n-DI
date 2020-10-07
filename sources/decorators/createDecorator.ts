import { ServiceIdentifier } from '../ServiceIdentifier';
import { Ctor, serviceIds, storeServiceDependency } from '../util';

/**
 * Creates a new ParameterDecorator for constructor injection.
 *
 * Not to be called by a client unless as a factory.
 *
 * @example
 * ```ts
 * // definition
 * const FileService = createDecorator<IFileService>(`fileService`);
 * export interface IFileService {}
 *
 * // usage
 * class LogService implements ILogService {
 *   constructor(@FileService fileService: IFileService) {}
 * }
 * ```
 */
export function createDecorator<T>(service: string): ServiceIdentifier<T> {
  if (serviceIds.has(service)) return serviceIds.get(service)!;

  const serviceId = <any>((
    target: Ctor<T>,
    key: string,
    index: number
  ): any => {
    storeServiceDependency(serviceId, target, index, false);
  });

  serviceId.toString = () => service;

  serviceIds.set(service, serviceId);

  return serviceId as ServiceIdentifier<T>;
}
