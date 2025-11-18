/**
 * Проверка соответствия тестируемой строки на предмет соответствия регулярке
 *
 * @param {Object} arg 
 * @param {string} arg.tested Тестируемая строка
 * @param {RegExp} arg.regexp Регулярка
 * @returns {boolean} 
 */
const getMatchedByRegExp = ({ tested, regexp }) => {
  const result = tested.match(regexp);
  return !!result?.[0] || !!result?.input || false;
};
