const getNestedValue = ({ obj, path }) => {
  const arr = path.split(/[.[]['"]?/)
  let o = obj;
  while (arr.length && o) {
    o = o[arr.shift().replace(/['"]?]$/, '')]
  }
  return o
}
