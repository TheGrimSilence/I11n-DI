/* eslint-disable indent */
import { ServiceIdentifier } from '../ServiceIdentifier';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace _testNaming {
  // eslint-disable-next-line prefer-const
  export let testName: string | null = null;
}

const enum TraceType {
  Creation,
  Invocation,
  Branch,
}

export class Trace<TService> {
  static traceInvocation<TService>(ctor: any): Trace<TService> {
    return new Trace<TService>(
      TraceType.Invocation,
      ctor.name || ctor.toString().substring(0, 80).replace(/\n\s+/g, '  ')
    );
  }

  static traceCreation<TService>(ctor: any): Trace<TService> {
    return new Trace(TraceType.Creation, ctor.name);
  }

  #causedCreation = false;
  #totalTime = 0;
  #start: number = Date.now();
  private readonly _dependencyMap: [
    ServiceIdentifier<TService>,
    boolean,
    Trace<TService>
  ][] = [];

  constructor(readonly type: TraceType, readonly name: string | null) {}

  branch(id: ServiceIdentifier<TService>, first: boolean): Trace<TService> {
    const child = new Trace<TService>(TraceType.Branch, id.toString());

    this._dependencyMap.push([id, first, child]);

    return child;
  }

  stop(): void {
    const duration = Date.now() - this.#start;
    this.#totalTime += duration;

    let lines;

    if (_testNaming.testName !== null)
      lines = [
        `<<< ${_testNaming.testName} >>>`,
        `${this.type === TraceType.Creation ? 'CREATE' : 'CALL'} ${this.name}`,
        `${this._printChild(1, this)}`,
        `DONE, took ${duration.toFixed(
          2
        )}ms (grand total ${this.#totalTime.toFixed(2)}ms)\n\n`,
      ];
    else
      lines = [
        `${this.type === TraceType.Creation ? 'CREATE' : 'CALL'} ${this.name}`,
        `${this._printChild(1, this)}`,
        `DONE, took ${duration.toFixed(
          2
        )}ms (grand total ${this.#totalTime.toFixed(2)}ms)\n\n`,
      ];

    if (duration > 2 || this.#causedCreation)
      process.stdout.write(lines.join('\n'));
  }

  private _printChild(num: number, trace: Trace<TService>): string {
    const result: string[] = [];
    const prefix = new Array(num + 1).join('\t');

    for (const [id, first, child] of trace._dependencyMap) {
      if (first && child) {
        this.#causedCreation = true;
        result.push(`${prefix}CREATES -> ${id.toString()}`);

        const nested = this._printChild(num + 1, child);

        if (nested) result.push(nested);
      } else result.push(`${prefix}USES -> ${id.toString()}`);
    }

    return result.join('\n');
  }
}
