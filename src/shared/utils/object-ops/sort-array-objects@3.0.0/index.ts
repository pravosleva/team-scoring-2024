// NOTE: See also https://github.com/SanichKotikov/sort-array-objects

export type SortOrder = 1 | -1;

function compare<T, K extends keyof T>(a: T, b: T, key: K, order: SortOrder) {
  if (key in (a as object) && key in (b as object)) {
    if (a[key] < b[key]) return -order;
    if (a[key] > b[key]) return order;
  }
  return 0;
}

export function sort<T, K extends keyof T>(
  arr: ReadonlyArray<T>,
  keys: ReadonlyArray<K>,
  order: SortOrder = 1,
): Array<T> {
  return [...arr].sort((a: T, b: T) => {
    for (let i = 0; i < keys.length; i++) {
      const result = compare(a, b, keys[i], order);
      if (result !== 0) return result;
    }
    return 0;
  });
}
