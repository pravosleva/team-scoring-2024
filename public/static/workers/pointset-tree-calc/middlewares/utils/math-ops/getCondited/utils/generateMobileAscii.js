// 2. Внутренний хелпер генерации ASCII-текста для мобильных
const generateMobileAscii = ({
  forecastObj,
  roundedPercentage,
  remainingTasks,
  doneTasks,
  totalTasks,
}) => {
  const barLength = 15;
  const filledLength = Math.round((roundedPercentage / barLength));
  const bar = '█'.repeat(filledLength) + '░'.repeat(Math.max(0, barLength - filledLength));
  const rec = forecastObj.recommendations;

  return [
    '📊 КОММЕНТ ДЛЯ АНАЛИТИКА:',
    forecastObj.title.analytic,
    forecastObj.roleDescriptions.analytic,
    `${bar} ${roundedPercentage}% Завершено${totalTasks > 0 ? ` (${doneTasks}/${totalTasks})` : ''}`,
    `• Осталось: ${forecastObj.daysLeft} дн.`,
    `• Ориентировочная дата: ${forecastObj.text}`,
    '',
    `ℹ️ ЛОГИКА РАСЧЕТА:`,
    // wrapText(forecastObj.descr.join(' ')),
    ...forecastObj.descr,
    '',
    `💡 РЕКОМЕНДАЦИИ PM:`,
    `• Скорость: ${rec.tasksPerDay.toFixed(2)} зад./день`,
    `• На задачу: ${rec.daysPerTask.toFixed(2)} дн. (~${rec.hoursPerTask} ч)`,
    wrapText(`Чтобы закрыть оставшиеся ${remainingTasks} задач за ${forecastObj.daysLeft} дн. с текущим темпом, сдавайте по ${rec.tasksPerDay} задач в день (не более ${rec.daysPerTask} дн. на задачу).`),
    forecastObj.roleDescriptions.pm,
    '',
    '⚙️ КОММЕНТ ДЛЯ ИНЖЕНЕРА:',
    forecastObj.title.engineer,
    forecastObj.roleDescriptions.engineer,
    '',
    '📊 КОММЕНТ ДЛЯ МЕНЕДЖЕРА:',
    forecastObj.title.manager,
    forecastObj.roleDescriptions.manager,
  ].join('\n');
};
