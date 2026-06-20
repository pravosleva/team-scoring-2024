export const getTextProgressbar = ({ postfix = 'Завершено', barLength, counters }: {
  barLength: number;
  postfix?: string;
  counters: {
    total: number;
    done: number;
  };
}) => {
  // Вычисляем процент. Если total равен 0, то процент равен 0.
  const percentage = counters.total > 0
    ? Math.round((counters.done / counters.total) * 100)
    : 0;

  // Рассчитываем количество закрашенных символов
  const filledLength = Math.round((percentage / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(Math.max(0, barLength - filledLength));

  return `${bar} ${percentage}% ${postfix}${counters.total > 0 ? ` (${counters.done}/${counters.total})` : ''}`;
}
