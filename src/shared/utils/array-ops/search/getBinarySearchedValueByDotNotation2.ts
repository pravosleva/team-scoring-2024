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
type TResult<TTargetValueFormat> = {
  result: TTargetValueFormat | undefined;
  index: number;
}

/**
 * Бинарный поиск (поиск по сортированному списку элементов)
 * 
 * External deps: getNestedValue
 *
 * @param {Object} arg Аргумент
 * @param {TItemFormat[]} arg.items Исходный массив для поиска
 * @param {Object} arg.target Целевой объект с указанием путей к целевому объекту и для критерия поиска
 * @param {String} arg.target.path Путь (dot notation) к целевому объекту (значение которого нужно найти)
 * @param {Object} arg.target.critery Настройки критерия
 * @param {String} arg.target.critery.path Путь (dot notation) до свойства - критерий поиска
 * @param {Object} arg.target.critery.value Целевое значение критерия поиска
 * @param {"DESC"|"ASC"} arg.sorted Тип сортировки исходного массива:
 * - DESC - по убыванию;
 * - ASC - по возрастанию;
 * @returns {{ result: TTargetValue | undefined, index: number }} Hайденный элемент:
 */
export const getBinarySearchedValueByDotNotation2 = <TItemFormat, TTargetValue>({ items, target, sorted }: TProps<TItemFormat>): TResult<TTargetValue> => {
  const {
    critery: {
      value: criteryValue,
      path: criteryPropPath,
    },
    path,
  } = target
  let __resultIndex = -1
  let __result: unknown = undefined
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
          __result = !!path
            ? getNestedValue<TItemFormat, TTargetValue>({ source: items[__resultIndex], path })
            : items[__resultIndex]
          return { result: __result as TTargetValue, index: __resultIndex }
        }
        else if (criteryValue > (_currentValue as number)) right = mid - 1
        else left = mid + 1
        break
      case 'ASC':
        if (criteryValue === _currentValue) {
          __resultIndex = mid
          __result = !!path
            ? getNestedValue<TItemFormat, TTargetValue>({ source: items[__resultIndex], path })
            : items[__resultIndex]
          return { result: __result as TTargetValue, index: __resultIndex }
        }
        else if (criteryValue < (_currentValue as number)) right = mid - 1
        else left = mid + 1
        break
      default:
        throw new Error(`Unknown case: sorted=${sorted} (${typeof sorted})`)
    }
  }

  return {
    result: __result as TTargetValue | undefined,
    index: __resultIndex,
  }
}
