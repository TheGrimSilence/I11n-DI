# instantiation-di-prototype

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
