type TProps<TItemFormat> = {
  items: TItemFormat[];
  target: {
    value: number;
    propName: keyof TItemFormat;
  };
}

export const getBinarySearchedIndexByProp = <TItemFormat>({ items, target }: TProps<TItemFormat>): number => {
  const { value, propName } = target
  let result: number = -1
  let left: number = 0
  let right: number = items.length - 1
  let mid: number

  while (left <= right) {
    mid = Math.round((right + left) / 2)

    if (value === items[mid][propName]) {
      result = mid
      return result
    } else if (value < (items[mid][propName] as number))
      right = mid - 1
    else
      left = mid + 1
  }

  return result
}