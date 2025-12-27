export const looperFactory = (ms = 1000) => {
  let timer: NodeJS.Timeout;
  let wasStopped = false;

  return () => {
    const start = (cb: () => void) => {
      // console.log("Run");
      if (!wasStopped) {
        timer = setTimeout(function () {
          // console.log("Looper done and will be restarted.");
          if (cb) cb();
          start(cb);
        }, ms);
      }
    };
    const stop = () => {
      // console.log("Looper stopped");
      wasStopped = true;
      clearTimeout(timer);
    };
    return { start, stop };
  };
}
