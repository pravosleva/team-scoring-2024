export const getMatchedByRegExp = ({
  tested, regexp
}: {
  tested: string;
  regexp: RegExp;
}): boolean => {
  const result = tested.match(regexp);
  return !!result?.[0] || !!result?.input || false;
};
