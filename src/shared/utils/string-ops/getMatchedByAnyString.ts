import { getMatchedByRegExp } from './getMatchedByRegExp';

export const getMatchedByAnyString = ({
  tested, expected
}: {
  tested: string;
  expected: string[];
}): boolean => {
  const modifiedWords = expected
    .join(' ')
    .replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
  // console.log(`modifiedWords: ${expected.join(',')} -> ${modifiedWords}`);
  const regexpGroups = modifiedWords
    .split(' ')
    .map((w) => [`(?=.*${w})`]);
  const regexp = new RegExp(`^${regexpGroups.join('|')}.*$`, 'im');
  return getMatchedByRegExp({
    tested, regexp
  });
};
