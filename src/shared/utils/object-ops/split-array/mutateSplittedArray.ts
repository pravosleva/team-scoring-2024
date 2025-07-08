export const mutateSplittedArray = <T>({ pageLimit, list }: {
  pageLimit: number;
  list: T[] | T[][];
}): void => {
  for (let i = 0, max = Math.ceil(list.length / pageLimit); i < max; i++) {
    const subList = list.splice(i, pageLimit)
    list.splice(i, 0, (subList as T[]))
  }
  // NOTE: Ничего не возвращает, результат в list
}
