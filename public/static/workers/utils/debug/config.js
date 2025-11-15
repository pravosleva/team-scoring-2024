/**
 * Конфигурация отладки
 *
 * @type {{ workerEvs: {
 *     fromClient: { isEnabled: boolean; };
 *     fromServer: { isEnabled: boolean; };
 *     mwsInternalLogs: { isEnabled: boolean; }; };
 *   api: { responseByServer: { isEnabled: boolean; }; };
 *   socketState: { ...; };
 *   swState: { ...; };
 * }}
 */
var debugConfig = {
  workerEvs: {
    fromClient: {
      isEnabled: true,
    },
    fromServer: {
      isEnabled: true,
    },
    mwsInternalLogs: {
      isEnabled: true,
    },
  },
  api: {
    responseByServer: {
      isEnabled: false,
    },
  },
  socketState: {
    isEnabled: false,
  },
  swState: {
    isEnabled: true,
  },
}
