export type Node = {
  id: string;
};

export type Edge = {
  from: string;
  to: string;
  weight: number;
};

export class Graph {
  private nodes: Map<string, Node> = new Map();
  private adjacencyList: Map<string, Array<{ node: string; weight: number }>> =
    new Map();

  addNode(id: string): void {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { id });
      this.adjacencyList.set(id, []);
    }
  }

  addEdge(from: string, to: string, weight: number): void {
    if (!this.nodes.has(from)) {
      this.addNode(from);
    }
    if (!this.nodes.has(to)) {
      this.addNode(to);
    }

    this.adjacencyList.get(from)!.push({ node: to, weight });
  }

  getNeighbors(nodeId: string): Array<{ node: string; weight: number }> {
    return this.adjacencyList.get(nodeId) ?? [];
  }

  getNodeIds(): string[] {
    return Array.from(this.nodes.keys());
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }
}
