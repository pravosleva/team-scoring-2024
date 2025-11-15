/**
 * Бинарный поиск (поиск по сортированному списку элементов)
 *
 * @param {{ items: unknown; target: unknown; sorted: "DESC"|"ASC"; }} param0 
 * @param {*} param0.items Исходный массив для поиска
 * @param {*} param0.target Целевой объект с параметрами поиска
 * @param {*} param0.target.value Целевое значение
 * @param {string} param0.target.propName Целевое свойство (критерий поиска)
 * @param {"DESC"|"ASC"} param0.sorted Тип сортировки исходного массива:
 * - DESC - по убыванию;
 * - ASC - по возрастанию;
 * @returns {number|never} Индекс найденного элемента:
 * - ноль или натуральное число 👉 Удалось найти элемент
 * - -1 👉 элемент не найден
 * - never 👉 Выбронеша ошибка
 */
const getBinarySearchedIndexByProp = ({ items, target, sorted }) => {
  const { value, propName } = target
  let result = -1
  let left = 0
  let right = items.length - 1
  let mid

  while (left <= right) {
    mid = Math.round((right + left) / 2)

    switch (sorted) {
      case 'DESC':
        if (value === items[mid][propName]) {
          result = mid
          return result
        } else if (value > items[mid][propName])
          right = mid - 1
        else
          left = mid + 1
        break
      case 'ASC':
        if (value === items[mid][propName]) {
          result = mid
          return result
        } else if (value < items[mid][propName])
          right = mid - 1
        else
          left = mid + 1
        break
      default:
        throw new Error(`Unknown case: sorted=${sorted} (${typeof sorted})`)
    }
  }

  return result
}
