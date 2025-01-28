export const getArithmeticalMean = (arr: number[]): number => {
  const average = (ar: number[]) => ar.reduce((p, c) => p + c, 0) / ar.length

  const result = average([...arr])
  return result
}
