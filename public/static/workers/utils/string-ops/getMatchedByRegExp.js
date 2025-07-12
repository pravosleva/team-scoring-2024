const getMatchedByRegExp = ({
  tested, // string;
  regexp,  // RegExp;
}) => {
  const result = tested.match(regexp);
  return !!result?.[0] || !!result?.input || false;
};
