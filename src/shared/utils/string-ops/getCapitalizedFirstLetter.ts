/**
 * Возврщает строку с првым символом в верхнем реистре
 * 
 * @source First letter will be set in uppercase
 *
 * @param {string} val 
 * @returns {string} 
 */
export const getCapitalizedFirstLetter = (val: string): string => {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1)
}