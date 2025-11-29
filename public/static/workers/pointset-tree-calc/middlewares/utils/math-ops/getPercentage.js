console.log('[LOADED] pointset-tree-calc/utils/math-ops/getPercentage')

importScripts('./middlewares/utils/math-ops/getLinear.js')

const getPercentage = ({ x, sum }) => getLinear({
  x1: 0,
  y1: 0,
  x2: sum,
  y2: 100,
  x,
})
