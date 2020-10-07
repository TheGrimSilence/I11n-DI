export interface IDisposable {
  dispose(): void;
}

/**
 * An implementation of the "idle-until-urgent"-strategy as introduced
 * here: https://philipwalton.com/articles/idle-until-urgent/
 */
export class IdleService<T> {
  private readonly _executor: () => void;
  private readonly _handle: IDisposable;
  private _didRun = false;
  private _value: T;
  private _error: unknown;

  constructor(executor: () => T) {
    this._executor = () => {
      try {
        this._value = executor();
      } catch (error) {
        this._error = error;
      } finally {
        this._didRun = true;
      }
    };

    this._handle = runWhenIdle(() => this._executor());
  }

  dispose(): void {
    this._handle.dispose();
  }

  get value(): T {
    if (!this._didRun) {
      this._handle.dispose();
      this._executor();
    }

    if (this._error) throw this._error;

    return this._value;
  }
}

export interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining(): number;
}

export let runWhenIdle: (
  callback: (idle: IdleDeadline) => void,
  timeout?: number
) => IDisposable;

declare function requestIdleCallback(
  callback: (args: IdleDeadline) => void,
  timeout?: number
): number;
declare function cancelIdleCallback(handle: number): void;

(function () {
  if (
    typeof requestIdleCallback !== 'function' ||
    typeof cancelIdleCallback !== 'function'
  ) {
    const dummyIdle: IdleDeadline = Object.freeze({
      didTimeout: true,
      timeRemaining() {
        return 15;
      },
    });

    runWhenIdle = (runner) => {
      const handle = setTimeout(() => runner(dummyIdle));

      let disposed = false;

      return {
        dispose() {
          if (disposed) return;
          disposed = true;
          clearTimeout(handle);
        },
      };
    };
  } else {
    runWhenIdle = (runner, timeout?: number) => {
      const handle: number = requestIdleCallback(runner, timeout);

      let disposed = false;
      return {
        dispose() {
          if (disposed) return;
          disposed = true;
          cancelIdleCallback(handle);
        },
      };
    };
  }
});
