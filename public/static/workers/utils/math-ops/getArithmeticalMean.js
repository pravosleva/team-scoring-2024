const getArithmeticalMean = (arr) => {
  const average = (ar) => ar.reduce((p, c) => p + c, 0) / ar.length

  const result = average([...arr])
  return result
}
