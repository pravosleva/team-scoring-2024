export const getFullUrl = ({ url, query, queryKeysToremove }: {
  url: string;
  query?: { [key: string]: string | null | number; };
  queryKeysToremove?: string[];
}): string => {
  const filteredQuery: { [key: string]: string | number } = {}
  // console.log(`queryKeysToremove -> ${JSON.stringify(queryKeysToremove)}`)
  if (!!query && Object.keys(query).length > 0) {
    for (const key in query) {
      if (!!queryKeysToremove && queryKeysToremove.length > 0) {
        if (!queryKeysToremove.includes(key)) {
          if (typeof query[key] === 'string' || typeof query[key] === 'number') {
            filteredQuery[key] = encodeURIComponent(query[key])
          }
          // else {
          //   console.log(`key ${key} NOT ADDED -> ${typeof query[key]}`)
          // }
        }
        // else {
        //   console.log(`key ${key} NOT ADDED (2) -> ${typeof query[key]}`)
        //   console.log(query[key])
        // }
      } else {
        if (typeof query[key] === 'string' || typeof query[key] === 'number') {
          filteredQuery[key] = encodeURIComponent(query[key])
        }
        // else {
        //   console.log(`key ${key} NOT ADDED (3) -> ${typeof query[key]}`)
        //   console.log(query[key])
        // }
      }
    }
  }
  return `${url}${Object.keys(filteredQuery).length > 0 ? `?${Object.keys(filteredQuery).map((key) => `${key}=${filteredQuery[key]}`).join('&')}` : ''}`
}