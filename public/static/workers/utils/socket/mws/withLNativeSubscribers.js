const withLNativeSubscribers = ({ socket, options }) => {
  for (const eventType in options)
    socket.on(eventType, options[eventType])
}
