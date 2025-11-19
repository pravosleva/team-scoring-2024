/**
 * Конфигурация отладки при работе с воркерами
 *
 * @property {Object} ps Настройки отладки всех событий
 * @property {Object} ps.workerEvs Настройки параметров отладки работы внутренних событий (входящих и исходящих)
 * @property {Object} ps.workerEvs.fromClient События от клиента (основной поток)
 * @property {boolean} ps.workerEvs.fromClient.isEnabled
 * @property {Object} ps.workerEvs.fromServer События от сервера
 * @property {boolean} ps.workerEvs.fromServer.isEnabled
 * @property {Object} ps.workerEvs.mwsInternalLogs Внутренние процессы в потоке воркера
 * @property {boolean} ps.workerEvs.mwsInternalLogs.isEnabled
 * @property {Object} ps.api Настройки параметров отладки работы внешних событий (работа с сервером по API)
 * @property {Object} ps.api.responseByServer Получение ответов от сервера
 * @property {boolean} ps.api.responseByServer.isEnabled
 * @property {Object} ps.socketState Настройки параметров отладки состояния сокет-соединения
 * @property {boolean} ps.socketState.isEnabled
 * @property {Object} ps.swState Настройки параметров отладки общего состояния воркера (только для Shared Worker)
 * @property {boolean} ps.swState.isEnabled
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
