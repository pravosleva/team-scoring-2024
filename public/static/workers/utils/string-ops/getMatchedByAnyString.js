const getMatchedByAnyString = ({
  tested, // string;
  expected, // string[];
}) => {
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
