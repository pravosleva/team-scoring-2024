import { getNestedValue } from "~/shared/utils/object-ops"

type TProps<TItemFormat> = {
  items: TItemFormat[];
  target: {
    path: string;
    critery: {
      value: number;
      path: string;
    };
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
 * @param {string} arg.target.criteryPropPath Путь до свойства (dot notation) - критерий поиска
 * @param {"DESC"|"ASC"} arg.sorted Тип сортировки исходного массива:
 * - DESC - по убыванию;
 * - ASC - по возрастанию;
 * @returns {number|never} Индекс найденного элемента:
 * - ноль или натуральное число 👉 Удалось найти элемент
 * - -1 👉 элемент не найден
 * - never 👉 Выбронеша ошибка
 */
export const getBinarySearchedValueByDotNotation2 = <TItemFormat, TTargetValue>({ items, target, sorted }: TProps<TItemFormat>): TTargetValue | undefined => {
  const {
    critery: {
      value: criteryValue,
      path: criteryPropPath,
    },
    path,
  } = target
  let __resultIndex = -1
  let __result: TTargetValue | undefined = undefined
  let left = 0
  let right = items.length - 1
  let mid

  while (left <= right) {
    mid = Math.round((right + left) / 2)
    const _currentValue = getNestedValue<TItemFormat, number>({ source: items[mid], path: criteryPropPath })

    switch (sorted) {
      case 'DESC':
        if (criteryValue === _currentValue) {
          __resultIndex = mid
          __result = getNestedValue<TItemFormat, TTargetValue>({ source: items[__resultIndex], path })
          return __result
        }
        else if (criteryValue > (_currentValue as number)) right = mid - 1
        else left = mid + 1
        break
      case 'ASC':
        if (criteryValue === _currentValue) {
          __resultIndex = mid
          __result = getNestedValue<TItemFormat, TTargetValue>({ source: items[__resultIndex], path })
          return __result
        }
        else if (criteryValue < (_currentValue as number)) right = mid - 1
        else left = mid + 1
        break
      default:
        throw new Error(`Unknown case: sorted=${sorted} (${typeof sorted})`)
    }
  }

  return __result
}
