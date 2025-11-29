import { Graph } from './graph.js';

type DijkstraResult = {
  distance: number;
  path: string[];
};

export function dijkstra(
  graph: Graph,
  startNode: string
): Map<string, DijkstraResult> {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const unvisited = new Set<string>();

  // 初期化
  for (const nodeId of graph.getNodeIds()) {
    distances.set(nodeId, nodeId === startNode ? 0 : Infinity);
    previous.set(nodeId, null);
    unvisited.add(nodeId);
  }

  // 開始ノードが存在しない場合
  if (!graph.hasNode(startNode)) {
    return new Map();
  }

  while (unvisited.size > 0) {
    // 未訪問ノードの中から最小距離のノードを選択
    let currentNode: string | null = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId)!;
      if (dist < minDistance) {
        minDistance = dist;
        currentNode = nodeId;
      }
    }

    // 到達可能なノードがない場合は終了
    if (currentNode === null || minDistance === Infinity) {
      break;
    }

    unvisited.delete(currentNode);
    visited.add(currentNode);

    // 隣接ノードの距離を更新
    for (const neighbor of graph.getNeighbors(currentNode)) {
      if (visited.has(neighbor.node)) {
        continue;
      }

      const newDistance = distances.get(currentNode)! + neighbor.weight;
      const currentDistance = distances.get(neighbor.node)!;

      if (newDistance < currentDistance) {
        distances.set(neighbor.node, newDistance);
        previous.set(neighbor.node, currentNode);
      }
    }
  }

  // 結果を構築
  const result = new Map<string, DijkstraResult>();

  for (const nodeId of graph.getNodeIds()) {
    const distance = distances.get(nodeId)!;
    const path = buildPath(previous, startNode, nodeId);

    result.set(nodeId, { distance, path });
  }

  return result;
}

function buildPath(
  previous: Map<string, string | null>,
  startNode: string,
  endNode: string
): string[] {
  const path: string[] = [];

  // 到達不可能な場合は空のパスを返す
  if (previous.get(endNode) === null && startNode !== endNode) {
    return [];
  }

  let current: string | null = endNode;
  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }

  return path;
}
