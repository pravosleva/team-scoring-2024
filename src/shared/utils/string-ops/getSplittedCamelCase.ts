/**
 * Function to extract a words from Camel Case key
 * 
 * @source
 *
 * @export
 * @param {string} input Input key
 * @returns {string[]} 
 */
export function getSplittedCamelCase(input: string): string[] {
  return input.match(/.+?(?:(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|$)/g) || [];
}
