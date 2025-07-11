/* eslint-disable @typescript-eslint/ban-ts-comment */
export const getNestedValue = <T>({ obj, path }: {
  obj: T;
  path: string;
}) => {
  const arr = path.split(/[.[]['"]?/)
  let o = obj;
  while (arr.length && o) {
    //@ts-ignore
    o = o[arr.shift().replace(/['"]?]$/, '')]
  }
  return o
}
