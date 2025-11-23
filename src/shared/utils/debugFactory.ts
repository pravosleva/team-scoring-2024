/**
 * Пакет логов (вызов для отображения свернутых логов в консоле со счетчиком вызова)
 *
 * @source
 * 
 * @template TEvent Формат события
 * @template TError Формат ошибки
 * @param {Object} arg 
 * @param {string} arg.label Основной заголовок 
 * @returns {Object} Экземпляр (инстанс) { log: ({ evt, err, label }) => void, counter }
 */
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
