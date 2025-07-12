const getBinarySearchedIndexByDotNotation = ({ items, target, sorted }) => {
  const { value, propPath } = target
  let result = -1
  let left = 0
  let right = items.length - 1
  let mid

  while (left <= right) {
    mid = Math.round((right + left) / 2)
    const _currentValue = getNestedValue({ obj: items[mid], path: propPath })

    switch (sorted) {
      case 'DESC':
        if (value === _currentValue) {
          result = mid
          return result
        } else if (value > _currentValue) right = mid - 1
        else left = mid + 1
        break
      case 'ASC':
        if (value === _currentValue) {
          result = mid
          return result
        } else if (value < _currentValue)
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
