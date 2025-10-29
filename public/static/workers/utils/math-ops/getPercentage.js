console.log('[LOADED] workers/utils/getPercentage')

// importScripts('./utils/getLinear.js')
// importScripts('./getLinear.js')

const getPercentage = ({ x, sum }) => getLinear({
  x1: 0,
  y1: 0,
  x2: sum,
  y2: 100,
  x,
})
