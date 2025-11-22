/**
 * Truncated string
 *
 * @param {string} str 
 * @param {number} [n=16] 
 * @returns {string} 
 */
export const getTruncated = (str: string, n: number = 16): string => {
  if (str.length > n) {
    return `${str.slice(0, n)}...`
  }
  return str
}
