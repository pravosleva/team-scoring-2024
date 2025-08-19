const isNewNativeEvent = ({ newCode: n, prevCode: p }) => {
  if (!p) return true
  const ignoresEvsAsDedoup = [
    `[sock-nat]: ${NES.Socket.ENative.CONNECT}`,
    `[sock-nat]: ${NES.Socket.ENative.CONNECT_ERROR}`,
    `[sock-nat]: ${NES.Socket.ENative.RECONNECT}`,
    `[sock-nat]: ${NES.Socket.ENative.RECONNECT_ATTEMPT}`,
    `[sock-nat]: ${NES.Socket.ENative.DISCONNECT}`,
  ]

  if (ignoresEvsAsDedoup.includes(n) && n === p) return false
  else return true
}
