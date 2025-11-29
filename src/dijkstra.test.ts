import { describe, it, expect, beforeEach } from 'vitest';
import { Graph } from './graph.js';
import { dijkstra } from './dijkstra.js';

describe('dijkstra', () => {
  describe('単純な一直線のグラフ（A→B→C）', () => {
    let graph: Graph;

    beforeEach(() => {
      graph = new Graph();
      graph.addEdge('A', 'B', 1);
      graph.addEdge('B', 'C', 2);
    });

    it('Aから各ノードへの最短距離', () => {
      const result = dijkstra(graph, 'A');

      expect(result.get('A')).toEqual({ distance: 0, path: ['A'] });
      expect(result.get('B')).toEqual({ distance: 1, path: ['A', 'B'] });
      expect(result.get('C')).toEqual({ distance: 3, path: ['A', 'B', 'C'] });
    });

    it('Bから各ノードへの最短距離', () => {
      const result = dijkstra(graph, 'B');

      expect(result.get('A')).toEqual({ distance: Infinity, path: [] });
      expect(result.get('B')).toEqual({ distance: 0, path: ['B'] });
      expect(result.get('C')).toEqual({ distance: 2, path: ['B', 'C'] });
    });
  });

  describe('複数の経路があるグラフ', () => {
    let graph: Graph;

    beforeEach(() => {
      // A → B → D (1 + 10 = 11)
      // A → C → D (2 + 3 = 5) ← 最短
      graph = new Graph();
      graph.addEdge('A', 'B', 1);
      graph.addEdge('A', 'C', 2);
      graph.addEdge('B', 'D', 10);
      graph.addEdge('C', 'D', 3);
    });

    it('最短経路を正しく選択する', () => {
      const result = dijkstra(graph, 'A');

      expect(result.get('D')).toEqual({ distance: 5, path: ['A', 'C', 'D'] });
    });

    it('全ノードへの最短距離', () => {
      const result = dijkstra(graph, 'A');

      expect(result.get('A')).toEqual({ distance: 0, path: ['A'] });
      expect(result.get('B')).toEqual({ distance: 1, path: ['A', 'B'] });
      expect(result.get('C')).toEqual({ distance: 2, path: ['A', 'C'] });
      expect(result.get('D')).toEqual({ distance: 5, path: ['A', 'C', 'D'] });
    });
  });

  describe('到達不可能なノードがあるグラフ', () => {
    let graph: Graph;

    beforeEach(() => {
      // A → B (接続)
      // C (孤立)
      graph = new Graph();
      graph.addEdge('A', 'B', 1);
      graph.addNode('C'); // 孤立ノード
    });

    it('到達不可能なノードはdistance: Infinity', () => {
      const result = dijkstra(graph, 'A');

      expect(result.get('A')).toEqual({ distance: 0, path: ['A'] });
      expect(result.get('B')).toEqual({ distance: 1, path: ['A', 'B'] });
      expect(result.get('C')).toEqual({ distance: Infinity, path: [] });
    });

    it('孤立ノードから開始した場合', () => {
      const result = dijkstra(graph, 'C');

      expect(result.get('C')).toEqual({ distance: 0, path: ['C'] });
      expect(result.get('A')).toEqual({ distance: Infinity, path: [] });
      expect(result.get('B')).toEqual({ distance: Infinity, path: [] });
    });
  });

  describe('単一ノードのグラフ', () => {
    it('単一ノードへの距離は0', () => {
      const graph = new Graph();
      graph.addNode('A');

      const result = dijkstra(graph, 'A');

      expect(result.get('A')).toEqual({ distance: 0, path: ['A'] });
    });

    it('存在しないノードから開始した場合は空のMapを返す', () => {
      const graph = new Graph();
      graph.addNode('A');

      const result = dijkstra(graph, 'X');

      expect(result.size).toBe(0);
    });
  });

  describe('サンプルグラフ', () => {
    let graph: Graph;

    beforeEach(() => {
      /**
       *   A --(4)-- B
       *   |         |
       *  (2)       (1)
       *   |         |
       *   C --(5)-- D
       *   |
       *  (1)
       *   |
       *   E
       *
       * 双方向グラフとして実装
       */
      graph = new Graph();

      // A-B (weight: 4)
      graph.addEdge('A', 'B', 4);
      graph.addEdge('B', 'A', 4);

      // A-C (weight: 2)
      graph.addEdge('A', 'C', 2);
      graph.addEdge('C', 'A', 2);

      // B-D (weight: 1)
      graph.addEdge('B', 'D', 1);
      graph.addEdge('D', 'B', 1);

      // C-D (weight: 5)
      graph.addEdge('C', 'D', 5);
      graph.addEdge('D', 'C', 5);

      // C-E (weight: 1)
      graph.addEdge('C', 'E', 1);
      graph.addEdge('E', 'C', 1);
    });

    it('Aから各ノードへの最短距離', () => {
      const result = dijkstra(graph, 'A');

      // A→A: 0
      expect(result.get('A')).toEqual({ distance: 0, path: ['A'] });

      // A→B: 4 (直接)
      expect(result.get('B')).toEqual({ distance: 4, path: ['A', 'B'] });

      // A→C: 2 (直接)
      expect(result.get('C')).toEqual({ distance: 2, path: ['A', 'C'] });

      // A→D: A→B→D (4+1=5) が最短 (A→C→D は 2+5=7)
      expect(result.get('D')).toEqual({ distance: 5, path: ['A', 'B', 'D'] });

      // A→E: A→C→E (2+1=3)
      expect(result.get('E')).toEqual({ distance: 3, path: ['A', 'C', 'E'] });
    });

    it('Eから各ノードへの最短距離', () => {
      const result = dijkstra(graph, 'E');

      // E→E: 0
      expect(result.get('E')).toEqual({ distance: 0, path: ['E'] });

      // E→C: 1
      expect(result.get('C')).toEqual({ distance: 1, path: ['E', 'C'] });

      // E→A: E→C→A (1+2=3)
      expect(result.get('A')).toEqual({ distance: 3, path: ['E', 'C', 'A'] });

      // E→D: E→C→D (1+5=6) vs E→C→A→B→D (1+2+4+1=8) → 6が最短
      expect(result.get('D')).toEqual({ distance: 6, path: ['E', 'C', 'D'] });

      // E→B: E→C→A→B (1+2+4=7)
      expect(result.get('B')).toEqual({ distance: 7, path: ['E', 'C', 'A', 'B'] });
    });

    it('Dから各ノードへの最短距離', () => {
      const result = dijkstra(graph, 'D');

      // D→D: 0
      expect(result.get('D')).toEqual({ distance: 0, path: ['D'] });

      // D→B: 1
      expect(result.get('B')).toEqual({ distance: 1, path: ['D', 'B'] });

      // D→A: D→B→A (1+4=5)
      expect(result.get('A')).toEqual({ distance: 5, path: ['D', 'B', 'A'] });

      // D→C: D→C (5) vs D→B→A→C (1+4+2=7) → 5が最短
      expect(result.get('C')).toEqual({ distance: 5, path: ['D', 'C'] });

      // D→E: D→C→E (5+1=6)
      expect(result.get('E')).toEqual({ distance: 6, path: ['D', 'C', 'E'] });
    });
  });
});
