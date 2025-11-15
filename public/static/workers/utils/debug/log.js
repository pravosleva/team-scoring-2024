// NOTE: Attention!
// _perfInfo is global for this.


/**
 * Функция логирования
 *
 * @param {{ label: any; msgs: any; }} param0 
 * @param {*} param0.label Заголовок
 * @param {*} param0.msgs Сообщения
 */
var log = ({ label, msgs }) => {
  switch (true) {
    case !label:
      return
    case !!msgs && Array.isArray(msgs) && msgs.length > 0:
      // case _perfInfo.tsList.length > 0:
      console.groupCollapsed(label)
      if (!!msgs) for (const msg of msgs) console.log(msg)
      // console.log(_perfInfo)
      console.groupEnd()
      break
    default:
      break
  }
}
