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
