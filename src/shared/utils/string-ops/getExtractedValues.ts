export const getExtractedValues = ({
  tested, expectedKey
}: {
  tested: string[];
  expectedKey: string;
}): string[] => {
  const results: string[] = [];
  for (let i = 0, max = tested.length; i < max; i++) {
    const t = tested[i];
    const regex = new RegExp(`\\[${expectedKey}=(?<value>\\d+)\\]`, 'g');

    for (const n of t.matchAll(regex))
      if (n?.groups) results.push(n.groups.value)
  }
  return results;
}

// NOTE: Comments by guru
// Метод str.match возвращает скобочные группы только без флага g.
// Метод str.matchAll возвращает скобочные группы всегда.
// Скобочные группы: https://learn.javascript.ru/regexp-groups#itogo
// Именованные группы: https://learn.javascript.ru/regexp-groups#imenovannye-gruppy
