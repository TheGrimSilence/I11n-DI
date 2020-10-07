# I11n-DI "Instantiation DI"

> This is a standalone prototype for testing I11n-DI before settling it into Nodalis.

<!-- `find . -wholename "./sources/*.d.ts" -type f -delete` -->

Instantiation DI is meant to be a versatile dependency injection framework developed for Nodalis, and public use upon reaching a usable version suitable for production use. Torn from [Visual Studio Code's](https://code.visualstudio.com) Instantiation Service, I11n-DI (in-dee) [very temporary name] is an independent dependency injection service built for my [Nodalis](https://github.com/project-nodalis) framework. Although the majority of I11n-DI is pulled from **Code**, I've made adjustments to accurately log the instantiation tracing as well as pulling the tests from Mocha to Jest and logging the test name before each test so that we can accurately test I11n-DI as we modify it to a more appropriate structure using our preferred API implementation while also supporting the old one.

Cheers!

## Checklist

- [x] Is based on decorators.
- [x] Is unobtrusive (no god damn manual `.bind` bullshit!).
- [ ] Is capable of supporting multiple injection methods (Class decorators, constructor injectors, etc...).

---

- [ ] Container (Injectable)
- [ ] Service
- [ ] Injector

## Current API

**Creating a service**:

Creating a service is super easy, since I11n-DI provides a parameter decorator factory, leaving the responsibility of naming the decorator to you! I recommend following Code, and naming it as your interface so there's only a single `import` needed.

```ts
export const IFileService = createDecorator<IFileService>(`fileService`);

export interface IFileService {
  readonly _serviceBrand: undefined;
  ...
}
```

**Using your service**

Naming your decorator the same name as your interface allows you to only need a single import. Helpful, but unfortunately Constructor Injection "CI" is extremely repetitive. So I'm working on a nicer API similar to Angular which will let you use class decorators as well.

```ts
import { IFileService } from 'files.ts';

class Foo {
  readonly _serviceBrand: undefined;

  constructor(@IFileService fileService: IFileService) {}
}
```

**Getting your application running**

Getting your application running is extremely simple. You create your services, add them to a `ServiceCollection`, and create a new I11n-DI instance with the services. Afterwards, you call `createInstance()` and pass your main application and any non-service arguments it's expecting.

```ts
// @file app.ts
class CodeApplication {
  constructor(
    ...,
    @IInstantiationService private readonly instantiationService: IInstantiationService,
    @IFileService private readonly fileService: IFileService
    ) {
      ...
  }

  startup():void {
    ...
  }
}

// @file main.ts
const services = new ServiceCollection();

// Create and add your LogService instance.
const logService = ...;
service.set(ILogService, logService)

// Create and add your FileService instance.
const fileService = new FileService(logService);
service.set(IFileService, fileService)

// Let's say you have a service that only has service dependencies.
// A new SyncDescriptor will allow I11n-DI to handle it's creation.
// But, if your service requires static arguments like (name: string),
// it no longer qualifies as an independent service, and will error!
services.set(ILifecycleMainService, new SyncDescriptor(LifecycleMainService));

// We instantiate I11n-DI and pass our services, and set it to strict.
const instantiationService = new InstantiationService(services, true);
// Here we create our CodeApplication, and pass any args it requires other than services.
// I11n-DI will take care of the services for us.
instantiationService.createInstance(CodeApplication, ...).startup();
```

**Invoking services**

If you need to do some initial setup before you create your final application instance, you can use `invokeFunction` with an asynchronous callback to access any services you've registered in the service collection. Let's take a look at Code's startup invocation.

_Assume all services have been added by `services.set()` prior to invocation and startup._

```ts
await instantiationService.invokeFunction(async accessor => {
  const logService = accessor.get(ILogService);
  const lifecycleMainService = accessor.get(ILifecycleMainService);
  const fileService = accessor.get(IFileService);
  const configurationService = accessor.get(IConfigurationService);

  environmentService, lifecycleMainService, instantiationService, true);

  environmentService.logsPath, bufferLogService.getLevel());

  once(lifecycleMainService.onWillShutdown)(() => {
		fileService.dispose();
		(configurationService as ConfigurationService).dispose();
  });

  instanceEnvironment).startup();
});
```

## Proposed API

**Creating a service**:

```ts
// Nodalis-style
@Service()
class FileService implements IFileService {}
```

OR

```ts
// VSCode-style
const FileService = createService<IFileService>(`fileService`);
interface IFileService {}
```

**Using a service**:

```ts
// Nodalis-style
class LogService implements ILogService {
  constructor(fileService: FileService) {}
}
```

OR

```ts
// VSCode-style
class LogService implements ILogService {
  constructor(@FileService fileService: IFileService) {}
}
```
