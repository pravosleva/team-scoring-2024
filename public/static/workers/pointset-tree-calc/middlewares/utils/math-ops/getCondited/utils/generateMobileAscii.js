// 2. Внутренний хелпер генерации ASCII-текста для мобильных
const generateMobileAscii = ({
  forecastObj,
  roundedPercentage,
  remainingTasks,
  doneTasks,
  totalTasks,
}) => {
  const barLength = 15;
  const filledLength = Math.round((roundedPercentage / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(Math.max(0, barLength - filledLength));
  const rec = forecastObj.recommendations;

  return [
    `${bar} ${roundedPercentage}% Завершено${totalTasks > 0 ? ` (${doneTasks}/${totalTasks})` : ''}`,
    `• Осталось: ${forecastObj.daysLeft} дн.`,
    `• Ориентировочная дата: ${forecastObj.text}`,
    '',
    `ℹ️ ЛОГИКА РАСЧЕТА:`,
    ...forecastObj.descr,
    '',
    `🧭 ДЛЯ АНАЛИТИКА: ${forecastObj.title.analytic}`,
    forecastObj.roleDescriptions.analytic,
    '',
    `💡 РЕКОМЕНДАЦИИ PM: ${forecastObj.title.pm}`,
    wrapText(`Чтобы закрыть оставшиеся ${remainingTasks} задач за ${forecastObj.daysLeft} дн. с текущим темпом, сдавайте по ${rec.tasksPerDay} задач в день (не более ${rec.daysPerTask} дн. на задачу).`),
    `• Скорость: ${rec.tasksPerDay.toFixed(2)} зад./день`,
    `• На задачу: ${rec.daysPerTask.toFixed(2)} дн. (~${rec.hoursPerTask} ч)`,
    forecastObj.roleDescriptions.pm,
    '',
    `⚙️ ДЛЯ ИНЖЕНЕРА: ${forecastObj.title.engineer}`,
    forecastObj.roleDescriptions.engineer,
    '',
    `📊 ДЛЯ МЕНЕДЖЕРА: ${forecastObj.title.manager}`,
    forecastObj.roleDescriptions.manager,
    '',
    `🎯 ДЛЯ СТЕЙКХОЛДЕРА: ${forecastObj.title.stakeholder}`,
    forecastObj.roleDescriptions.stakeholder,
    '',
    `🤑 ДЛЯ ИНВЕСТОРА: ${forecastObj.title.investor}`,
    forecastObj.roleDescriptions.investor,
  ].join('\n');
};
