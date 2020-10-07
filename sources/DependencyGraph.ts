export class Node<T> {
  readonly incoming = new Map<string, Node<T>>();
  readonly outgoing = new Map<string, Node<T>>();
  constructor(readonly data: T) {}
}

export class DependencyGraph<T> {
  private readonly _nodes = new Map<string, Node<T>>();

  constructor(private readonly _hashFn: (element: T) => string) {}

  roots(): Node<T>[] {
    const nodes: Node<T>[] = [];

    for (const node of this._nodes.values()) {
      if (node.outgoing.size === 0) {
        nodes.push(node);
      }
    }

    return nodes;
  }

  isEmpty(): boolean {
    return this._nodes.size === 0;
  }

  /** Returns a string representation of the `InstanceGraph`. */
  toString(): string {
    const data: string[] = [];

    for (const [key, value] of this._nodes) {
      data.push(
        `${key}, (incoming)[${[...value.incoming.keys()].join(
          ', '
        )}], (outgoing)[${[...value.outgoing.keys()].join(', ')}]`
      );
    }

    return data.join('\n');
  }

  //#region edges

  /** Creates a new relation between two `Node`s. */
  insertEdge(from: T, to: T): void {
    const fromNode = this.lookupOrInsertNode(from);
    const toNode = this.lookupOrInsertNode(to);

    fromNode.outgoing.set(this._hashFn(to), toNode);
    toNode.incoming.set(this._hashFn(from), fromNode);
  }

  /** Deletes an edge from the `InstanceGraph`. */
  removeNode(data: T): void {
    const key = this._hashFn(data);
    this._nodes.delete(key);

    for (const node of this._nodes.values()) {
      node.outgoing.delete(key);
      node.incoming.delete(key);
    }
  }

  //#endregion edges

  //#region lookup

  /** Returns a `Node`, either by finding or creating the `Node` with the given data. */
  lookupOrInsertNode(data: T): Node<T> {
    const key = this._hashFn(data);
    let node = this._nodes.get(key);

    if (!node) {
      node = new Node(data);
      this._nodes.set(key, node);
    }

    return node;
  }

  /** Returns a `Node` if it exists, or undefined if it does not. */
  lookup(data: T): Node<T> | undefined {
    return this._nodes.get(this._hashFn(data));
  }

  //#endregion lookup
}
