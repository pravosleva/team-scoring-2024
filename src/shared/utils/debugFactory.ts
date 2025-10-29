export const debugFactory = <TEvent, TError>({ label: header }: { label: string }) => {
  let counter = 0;
  // const sources: { [key: string]: number } = { _others: 0 };
  return {
    log: ({
      evt, err, label
    }: {
      label: string;
      evt: TEvent;
      err: TError;
    }) => {
      counter += 1;
      console.groupCollapsed(`${header} [${counter}] | ${label}`);
      console.log({ evt });
      if (!!err) console.log({ err });
      console.groupEnd();
    },
    counter,
  };
};
