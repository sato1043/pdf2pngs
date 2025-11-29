import { describe, it, expect } from 'vitest';
import { add, distance } from './math.js';

describe('add', () => {
  it('正の数同士を足す', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('正の数と負の数を足す', () => {
    expect(add(5, -3)).toBe(2);
  });

  it('ゼロを含む計算', () => {
    expect(add(0, 5)).toBe(5);
  });
});

describe('distance', () => {
  it('原点から(3,4)までの距離は5', () => {
    expect(distance(0, 0, 3, 4)).toBe(5);
  });

  it('同じ点の距離は0', () => {
    expect(distance(5, 5, 5, 5)).toBe(0);
  });

  it('(1,1)から(4,5)までの距離は5', () => {
    expect(distance(1, 1, 4, 5)).toBe(5);
  });
});
