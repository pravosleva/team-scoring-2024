export const getExtractedValues = ({
  tested, expectedKey, valueType
}: {
  tested: string[];
  expectedKey: string;
  valueType: 'number' | 'string';
}): string[] => {
  const results: string[] = [];
  for (let i = 0, max = tested.length; i < max; i++) {
    const t = tested[i];
    let regex
    switch (valueType) {
      case 'number':
        regex = new RegExp(`\\[${expectedKey}=(?<value>\\d+)\\]`, 'g')
        break
      case 'string':
      default:
        // NOTE: "Ленивый" квантификатор ".*?"
        // -> будет искать минимальное количество символов до следующего экранированного "]"
        regex = new RegExp(`\\[${expectedKey}=(?<value>.*?)\\]`, 'g')
        break
    }

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
