// NOTE: See also https://github.com/SanichKotikov/sort-array-objects

// export type SortOrder = 1 | -1;

function compare(a, b, key, order) {
  // NOTE: v1
  if (key in a && key in b) {
    if (a[key] < b[key]) return -order;
    if (a[key] > b[key]) return order;
  }

  // TODO: v2
  // value === getNestedValue({ obj: items[mid], path: propPath })

  return 0;
}

function getSortedArray({
  arr,
  keys,
  order = 1,
}) {
  return [...arr].sort((a, b) => {
    for (let i = 0; i < keys.length; i++) {
      const result = compare(a, b, keys[i], order);
      if (result !== 0) return result;
    }
    return 0;
  });
}
