/* NOTE: Чтобы сделать функцию полностью универсальной (Generic),
мы позволим ей принимать любой интерфейс, который расширяет базовый набор параметров. Это даст вам идеальный автокомплит (подсказки) в IDE для каждого конкретного вызова.
*/

// NOTE: Базовый тип для параметров, которые мы разрешаем (строки или числа)
type BaseQuery = Record<string, string | number | null | undefined>;

export const getFullUrl = <T extends BaseQuery>({
  url,
  query,
  queryKeysToremove
}: {
  url: string;
  query?: T;
  queryKeysToremove?: (keyof T | string)[]; // NOTE: Ключи для удаления теперь связаны с типом T
}): string => {
  if (!query) return url;

  const queryParts: string[] = [];

  for (const key in query) {
    const value = query[key];

    // NOTE: Проверка: удаляем ли ключ или пустое ли значение
    if (queryKeysToremove?.includes(key)) continue;
    if (value === null || value === undefined) continue;

    // NOTE: Гарантируем TS, что значение можно привести к строке
    queryParts.push(`${key}=${encodeURIComponent(String(value))}`);
  }

  const queryString = queryParts.join('&');
  return queryString ? `${url}${url.includes('?') ? '&' : '?'}${queryString}` : url;
};

/* NOTE: Usage
// v1
interface MyPageParams {
  backActionUiText?: string;
  userId: number;
  theme?: 'dark' | 'light';
}

const url = getFullUrl<MyPageParams>({
  url: '/home',
  query: {
    backActionUiText: 'Назад', // TS подскажет это поле
    userId: 123,
    theme: 'dark'
  },
  queryKeysToremove: ['userId'] // TS подскажет ключи из MyPageParams
});

// v2
const url = getFullUrl({
  url: '/api',
  query: { backActionUiText: 'Go back', customId: 10 },
});
*/