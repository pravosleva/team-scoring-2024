// importScripts('./utils/clsx.js')
// importScripts('./utils/gu.js')
importScripts('../utils/socket/mws/withLNativeSubscribers.js')
// importScripts('./utils/socket/mws/withCustomEmitters.js')
// importScripts('./utils/socket/socket.io-client@4.7.2.min.js')

const _compose = (fns, arg) => {
  return fns.reduce(
    (acc, fn) => {
      fn(arg)
      acc += 1
      return acc
    },
    0
  )
}

const rootSubscribers = (arg) => _compose([
  withLNativeSubscribers,

  // -- NOTE: For example
  // ({ socket, options }) => {
  //   socket.on(NES.Socket.Metrix.EClientIncoming.SP_MX_EV, (data) => {
  //     console.log(data)
  //   })
  // },
  // --

  // TODO: etc.
], arg)
