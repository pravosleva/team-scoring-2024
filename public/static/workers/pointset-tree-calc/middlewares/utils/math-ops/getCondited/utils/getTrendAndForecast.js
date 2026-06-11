const formatDate = ({ days, nowMs, oneDayMs }) => {
  if (days === Infinity || isNaN(days)) return "Бесконечность (цель недостижима)";
  const targetDate = new Date(nowMs + (days * oneDayMs));
  const offset = targetDate.getTimezoneOffset();
  const localTargetDate = new Date(targetDate.getTime() - (offset * 60 * 1000));
  return localTargetDate.toISOString().split('T')[0];
};

const getTrendAndForecast = ({
  currentCount,
  previousCount,
  daysInPeriod,
  periodNameRu,
  aboutRu,
  sensedSpeed,
  remainingPercentage,
  totalDaysInSystem,
  globalBasePercentagePerDay,
  remainingTasks,
  roundedPercentage,
  condited,
  totalTasks,
  nowMs,
  oneDayMs,
}) => {
  let _p = 0;
  if (previousCount === 0) _p = currentCount > 0 ? 100 : 0;
  else {
    const trend = ((currentCount - previousCount) / previousCount) * 100;
    _p = Number(trend.toFixed(0));
  }
  let text = `${_p}%`;
  if (_p > 0) text = `+${_p}%`;
  const emoji = _p > 0 ? '📈' : _p === 0 ? '⏹️' : '📉';
  const result = {
    percentage: _p,
    text,
    emoji,
    currentCount,
  };

  if (typeof sensedSpeed === 'number' && sensedSpeed > 0) {
    // --- ЛИНЕЙНЫЙ ПРОГНОЗ ---
    const linearSpeedPerDay = globalBasePercentagePerDay * sensedSpeed;
    let daysLeftLinear = Infinity;

    if (linearSpeedPerDay > 0) {
      daysLeftLinear = Math.ceil(remainingPercentage / linearSpeedPerDay);
    } else if (remainingPercentage === 0) {
      daysLeftLinear = 0;
    }
    const comments = [
      `Генеральный линейный расчет для периода «${periodNameRu}» по списку задач за всё время его существования.`,
      `• Осталось: ${remainingPercentage.toFixed(1)}%`,
      `• Глоб. базовая скорость за все время (${totalDaysInSystem} дн.): ${globalBasePercentagePerDay.toFixed(3)}% в день. С учетом коэф. (x${sensedSpeed}): ${linearSpeedPerDay.toFixed(3)}% в день`,
    ]
    if (!!aboutRu) comments.push(aboutRu)

    const linearTargetDateStr = formatDate({ days: daysLeftLinear, nowMs, oneDayMs });

    result.linearForecast = {
      title: {
        analytic: 'Прогноз по целевому темпу',
        engineer: 'Линейный прогноз',
        manager: 'Прогноз по фиксированной скорости',
        pm: 'Стабильный исторический тренд',
      },
      roleDescriptions: {
        analytic: `Экстраполяция генеральной совокупности данных на основе глобального математического ожидания системы за ${totalDaysInSystem} дней с поправочным коэффициентом x${sensedSpeed}. ` +
          `Простыми словами: математический прогноз без эмоций. Мы складываем абсолютно все данные за историю проекта и смотрим на «сухой остаток» — общую картину того, как система живет и дышит на длинной дистанции.`,
        engineer: `Расчет даты релиза на основе среднего сквозного Lead Time / Cycle Time всех задач в бэклоге (входной коэффициент: x${sensedSpeed}). ` +
          `Простыми словами: это технический таймлайн конвейера. Представьте завод: мы берем среднее время, за которое любая деталь проходит от входа до выхода, и прикидываем, когда выйдет последняя.`,
        manager: `Идеализированный долгосрочный план-график, сглаживающий текущую волатильность и локальные задержки команды. ` +
          `Простыми словами: прогноз по «крейсерской скорости» проекта. Он игнорирует тот факт, что на этой неделе кто-то заболел или ушел в отпуск, показывая стабильный средний темп работы всей системы.`,
        pm: `Смысл для PM: «Что будет, если команда пойдет со своей средней исторической скоростью, скорректированной на x${sensedSpeed}, без учета локальных всплесков последней недели или месяца?» 👉 ${linearTargetDateStr}`,
      },
      daysLeft: linearSpeedPerDay === 0 && remainingPercentage > 0 ? 0 : (daysLeftLinear === Infinity ? 0 : daysLeftLinear),
      text: linearTargetDateStr,
      descr: comments,
      recommendations: generateRecommendations({ daysLeft: daysLeftLinear, remainingTasks }),
    };

    // Рендерим ASCII сразу в объект
    result.linearForecast.asciiMobileView = generateMobileAscii({
      forecastObj: result.linearForecast,
      roundedPercentage,
      remainingTasks,
      doneTasks: condited,
      totalTasks,
    })

    // --- АДАПТИВНЫЙ ПРОГНОЗ ---
    const tasksPerDayInPeriod = currentCount / daysInPeriod;
    const basePercentagePerDay = totalTasks > 0 ? (tasksPerDayInPeriod / totalTasks) * 100 : 0;
    const actualSpeedPerDay = basePercentagePerDay * sensedSpeed;
    let daysLeftAdaptive = Infinity;
    let textAdaptive = "Бесконечность (текущая скорость равна 0)";
    let descrAdaptive = [`Динамический расчет на основе периода «${periodNameRu}»:`];
    if (actualSpeedPerDay > 0) {
      daysLeftAdaptive = Math.ceil(remainingPercentage / actualSpeedPerDay);
      textAdaptive = formatDate({ days: daysLeftAdaptive, nowMs, oneDayMs });
      descrAdaptive.push(`• Текущий результат: ${currentCount} закр. задач за ${daysInPeriod} дн.`)
      descrAdaptive.push(`• Базовая скорость периода: ${basePercentagePerDay.toFixed(3)}% в день. С учетом коэф. (x${sensedSpeed}): ${actualSpeedPerDay.toFixed(3)}% в день.`)
      if (!!aboutRu) descrAdaptive.push(aboutRu)
    } else if (remainingPercentage === 0) {
      daysLeftAdaptive = 0;
      textAdaptive = formatDate({ days: 0, nowMs, oneDayMs });
      descrAdaptive.push(`• Текущий результат: Цель в 100% уже достигнута, осталось задач: 0%`)
    } else {
      descrAdaptive.push(`Динамический расчет невозможен:`)
      descrAdaptive.push(`• За период "${periodNameRu}" закрыто 0 задач`)
      descrAdaptive.push(`• Модифицированная скорость: 0% в день`)
    }

    result.adaptiveForecast = {
      title: {
        analytic: 'Прогноз по текущему темпу',
        engineer: 'Адаптивный прогноз',
        manager: 'Прогноз по исторической скорости',
        pm: 'Динамический краткосрочный прогноз',
      },
      roleDescriptions: {
        analytic: `Локальный регрессионный анализ краткосрочного тренда за интервал в ${daysInPeriod} дней. Демонстрирует мгновенное ускорение/замедление процессов адаптации. ` +
          `Простыми словами: замер пульса прямо сейчас. Мы смотрим только на свежий отрезок времени, чтобы понять, куда качнулся маятник — команда разгоняется или, наоборот, начинает буксовать.`,
        engineer: `Оперативный Velocity-прогноз на основе Velocity текущего спринта/периода с учетом изменения пропускной способности конвейера (множитель: x${sensedSpeed}). ` +
          `Простыми словами: прогноз по темпу текущего спринта. Если команда горит идеей и закрывает задачи пачками (или переключилась на бесконечные созвоны), этот расчет сразу покажет, как это влияет на дедлайн.`,
        manager: `Реалистичная оценка даты завершения работ, основанная на актуальном фокусе и текущей доступности ресурсов команды. ` +
          `Простыми словами: прогноз по «текущей скорости» прямо сейчас. Если процессы в последний месяц изменились, этот график мгновенно пересчитает дату под новые жесткие реалии.`,
        pm: `Смысл для PM: «Что будет, если текущий темп работы команды изменится на x${sensedSpeed}?» 👉 ${textAdaptive}`
      },
      daysLeft: actualSpeedPerDay === 0 && remainingPercentage > 0 ? 0 : (daysLeftAdaptive === Infinity ? 0 : daysLeftAdaptive),
      text: textAdaptive,
      descr: descrAdaptive,
      recommendations: generateRecommendations({ daysLeft: daysLeftAdaptive, remainingTasks }),
    };

    // Рендерим ASCII сразу в объект
    result.adaptiveForecast.asciiMobileView = generateMobileAscii({ forecastObj: result.adaptiveForecast, roundedPercentage, remainingTasks, doneTasks: condited, totalTasks })
  }
  return result;
};
