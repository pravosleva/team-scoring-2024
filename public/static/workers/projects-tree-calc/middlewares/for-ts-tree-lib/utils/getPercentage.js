console.log('[LOADED] projects-tree-calc/utils/getPercentage')

importScripts('./middlewares/for-ts-tree-lib/utils/getLinear.js')

const getPercentage = ({ x, sum }) => getLinear({
  x1: 0,
  y1: 0,
  x2: sum,
  y2: 100,
  x,
})
