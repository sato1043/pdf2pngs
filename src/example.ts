import { Graph } from './graph.js';
import { dijkstra } from './dijkstra.js';

/**
 * 都市間の最短経路を求める例
 *
 * グラフ構造（距離はkm、おおよその値）:
 *
 *           仙台
 *            |
 *          (350)
 *            |
 *          東京 ----(350)---- 名古屋
 *            \                  |
 *           (500)             (180)
 *              \                |
 *               \---- 大阪 ----+
 *                       |
 *                     (600)
 *                       |
 *                     福岡
 */

function main(): void {
  const graph = new Graph();

  // 都市間のエッジを追加（双方向）
  const edges: Array<[string, string, number]> = [
    ['東京', '仙台', 350],
    ['東京', '名古屋', 350],
    ['東京', '大阪', 500],
    ['名古屋', '大阪', 180],
    ['大阪', '福岡', 600],
  ];

  for (const [from, to, distance] of edges) {
    graph.addEdge(from, to, distance);
    graph.addEdge(to, from, distance);
  }

  // 東京から各都市への最短経路を計算
  const startCity = '東京';
  const result = dijkstra(graph, startCity);

  console.log('='.repeat(50));
  console.log(`🚄 ${startCity}から各都市への最短経路`);
  console.log('='.repeat(50));
  console.log();

  // 結果を表示
  for (const [city, { distance, path }] of result) {
    if (city === startCity) {
      console.log(`📍 ${city}（出発地点）`);
    } else {
      console.log(`📍 ${city}`);
      console.log(`   距離: ${distance} km`);
      console.log(`   経路: ${path.join(' → ')}`);
    }
    console.log();
  }

  // 詳細な経路分析
  console.log('='.repeat(50));
  console.log('📊 経路分析');
  console.log('='.repeat(50));
  console.log();

  // 直行 vs 経由の比較（大阪の場合）
  const osakaResult = result.get('大阪')!;
  console.log('【大阪への経路比較】');
  console.log(`  直行: 東京 → 大阪 = 500 km`);
  console.log(`  経由: 東京 → 名古屋 → 大阪 = 350 + 180 = 530 km`);
  console.log(`  最短経路: ${osakaResult.path.join(' → ')} (${osakaResult.distance} km)`);
  console.log();

  // 福岡への経路
  const fukuokaResult = result.get('福岡')!;
  console.log('【福岡への経路】');
  console.log(`  最短経路: ${fukuokaResult.path.join(' → ')}`);
  console.log(`  総距離: ${fukuokaResult.distance} km`);
}

main();
