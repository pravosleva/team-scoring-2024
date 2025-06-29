const getMedian = (arr) => {
  if (arr.length === 0) {
    throw new Error('Input array is empty');
  }

  // NOTE: Sorting values, preventing original array
  // from being mutated.
  const result = [...arr].sort((a, b) => a - b);

  const half = Math.floor(result.length / 2);
  return (result.length % 2
    ? result[half]
    : (result[half - 1] + result[half]) / 2
  )
}
