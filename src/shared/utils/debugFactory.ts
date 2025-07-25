export const debugFactory = <TEvent, TError>({ label: header }: { label: string }) => {
  let counter = 0;
  // const sources: { [key: string]: number } = { _others: 0 };
  return {
    log: ({
      event, err, label
    }: {
      label: string;
      event: TEvent;
      err: TError;
    }) => {
      counter += 1;
      console.groupCollapsed(`${header} [${counter}] | ${label}`);
      console.dir({ event });
      if (!!err) console.dir({ err });
      console.groupEnd();
    },
    counter,
  };
};
