/**
 * Возврщает строку с првым символом в верхнем реистре
 *
 * @param {string} val 
 * @returns {string} 
 */
export const getCapitalizedFirstLetter = (val: string): string => {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1)
}