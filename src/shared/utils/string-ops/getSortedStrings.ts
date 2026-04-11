type Order = 'ASC' | 'DESC';

export const getSortedStrings = ({ items, order = 'ASC' }: { items: string[]; order: Order }): string[] => {
  return [...items].sort((a, b) => {
    // Настройки: numeric для чисел, sensitivity для игнорирования регистра
    const compareOptions: Intl.CollatorOptions = {
      numeric: true,
      sensitivity: 'base'
    };
    return order === 'ASC'
      ? a.localeCompare(b, undefined, compareOptions)
      : b.localeCompare(a, undefined, compareOptions);
  });
}
