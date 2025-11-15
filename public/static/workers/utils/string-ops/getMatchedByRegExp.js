/**
 * Проверка соответствия тестируемой строки на предмет соответствия регулярке
 *
 * @param {{ tested: string; regexp: RegExp; }} param0 
 * @param {string} param0.tested Тестируемая строка
 * @param {RegExp} param0.regexp Регулярка
 * @returns {boolean} 
 */
const getMatchedByRegExp = ({ tested, regexp }) => {
  const result = tested.match(regexp);
  return !!result?.[0] || !!result?.input || false;
};
