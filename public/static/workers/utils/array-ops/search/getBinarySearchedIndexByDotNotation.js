const getBinarySearchedIndexByDotNotation = ({ items, target, sorted }) => {
  const { value, propPath } = target
  let result = -1
  let left = 0
  let right = items.length - 1
  let mid

  while (left <= right) {
    mid = Math.round((right + left) / 2)

    switch (sorted) {
      case 'DESC':
        if (value === getNestedValue({ obj: items[mid], path: propPath })) {
          result = mid
          return result
        } else if (value > getNestedValue({ obj: items[mid], path: propPath }))
          right = mid - 1
        else
          left = mid + 1
        break
      case 'ASC':
        if (value === getNestedValue({ obj: items[mid], path: propPath })) {
          result = mid
          return result
        } else if (value < getNestedValue({ obj: items[mid], path: propPath }))
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
