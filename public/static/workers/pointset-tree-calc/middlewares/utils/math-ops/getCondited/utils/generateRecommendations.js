// Хелпер для генерации рекомендаций команде с учетом перевода в часы
const generateRecommendations = ({
  daysLeft,
  remainingTasks,
}) => {
  if (daysLeft === 0) {
    return {
      tasksPerDay: 0,
      daysPerTask: 0,
      hoursPerTask: 0,
      descr: "Цель достигнута. Новых задач для этого пула не требуется."
    };
  }
  if (daysLeft === Infinity || isNaN(daysLeft)) {
    return {
      tasksPerDay: 0,
      daysPerTask: Infinity,
      hoursPerTask: Infinity,
      descr: "Расчет невозможен: скорость равна 0, плановый срок стремится к бесконечности."
    };
  }

  const tasksPerDay = Number((remainingTasks / daysLeft).toFixed(2));
  const daysPerTask = tasksPerDay > 0 ? Number((1 / tasksPerDay).toFixed(2)) : Infinity;

  // Перевод дней в полные часы (24 часа в сутках)
  const hoursPerTask = daysPerTask !== Infinity ? Math.round(daysPerTask * 24) : Infinity;

  return {
    tasksPerDay,
    daysPerTask,
    hoursPerTask,
    descr: `Рекомендация для PM: чтобы закрыть оставшиеся ${remainingTasks} задач за ${daysLeft} дн., необходимо сдавать по ${tasksPerDay} задач в день / или тратить не более ${daysPerTask} дн. (~${hoursPerTask} ч) на одну задачу.`
  };
};
