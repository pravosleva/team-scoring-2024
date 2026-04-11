type TQueryParams = {
  from?: string;
  backActionUiText?: string;
  to?: string;
  forwardActionUiText?: string;
} & Record<string, string | number | null | undefined>;

export const getFullUrl = ({ url, query, queryKeysToremove }: {
  url: string;
  query?: TQueryParams;
  queryKeysToremove?: string[];
}): string => {
  if (!query || Object.keys(query).length === 0) return url;

  const queryParts: string[] = [];

  for (const key in query) {
    const value = query[key];

    // NOTE: Пропускаем, если ключ в списке на удаление или значение не подходит
    if (queryKeysToremove?.includes(key)) continue;
    if (value === null || value === undefined) continue;

    queryParts.push(`${key}=${encodeURIComponent(value)}`);
  }

  const queryString = queryParts.join('&');
  return queryString ? `${url}?${queryString}` : url;
};
