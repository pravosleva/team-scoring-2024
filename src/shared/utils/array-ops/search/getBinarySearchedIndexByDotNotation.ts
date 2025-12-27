import { getNestedValue } from "~/shared/utils/object-ops"

type TProps<TItemFormat> = {
  items: TItemFormat[];
  target: {
    value: number;
    propPath: string;
  };
  sorted: 'DESC' | 'ASC';
}

/**
 * Бинарный поиск (поиск по сортированному списку элементов)
 *
 * @param {Object} arg For example: { items: unknown[]; target: unknown; sorted: "DESC"|"ASC"; }
 * @param {unknown[]} arg.items Исходный массив для поиска
 * @param {Object} arg.target Целевой объект с параметрами поиска и сортировки
 * @param {unknown} arg.target.value Целевое значение (киртерий сортировки)
 * @param {string} arg.target.propPath Путь до свойства (dot notation) - критерий поиска
 * @param {"DESC"|"ASC"} arg.sorted Тип сортировки исходного массива:
 * - DESC - по убыванию;
 * - ASC - по возрастанию;
 * @returns {number|never} Индекс найденного элемента:
 * - ноль или натуральное число 👉 Удалось найти элемент
 * - -1 👉 элемент не найден
 * - never 👉 Выбронеша ошибка
 */
export const getBinarySearchedIndexByDotNotation = <TItemFormat>({ items, target, sorted }: TProps<TItemFormat>) => {
  const { value, propPath } = target
  let result = -1
  let left = 0
  let right = items.length - 1
  let mid

  while (left <= right) {
    mid = Math.round((right + left) / 2)
    const _currentValue: unknown = getNestedValue({ obj: items[mid], path: propPath })

    switch (sorted) {
      case 'DESC':
        if (value === _currentValue) {
          result = mid
          return result
        } else if (value > (_currentValue as number)) right = mid - 1
        else left = mid + 1
        break
      case 'ASC':
        if (value === _currentValue) {
          result = mid
          return result
        } else if (value < (_currentValue as number))
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
