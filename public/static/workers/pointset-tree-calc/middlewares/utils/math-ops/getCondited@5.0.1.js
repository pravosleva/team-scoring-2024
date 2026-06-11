function getCondited({ allowedEmojies = [], cfg = {}, fragments = [], pointset = [], currentDate = new Date(), _sensedSpeed: sensedSpeed = null }) {
  const details = {};
  let condited = 0;

  let currentWeekCount = 0;
  let previousWeekCount = 0;

  let currentMonthCount = 0;
  let previousMonthCount = 0;

  let current3MonthCount = 0;
  let previous3MonthCount = 0;

  let currentHalfYearCount = 0;
  let previousHalfYearCount = 0;

  const nowMs = currentDate.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const weekAgo = nowMs - (7 * oneDayMs);
  const twoWeeksAgo = nowMs - (14 * oneDayMs);

  const monthAgo = nowMs - (30 * oneDayMs);
  const twoMonthsAgo = nowMs - (60 * oneDayMs);

  const threeMonthsAgo = nowMs - (90 * oneDayMs);
  const sixMonthsAgo = nowMs - (180 * oneDayMs);
  const twelveMonthsAgo = nowMs - (360 * oneDayMs);

  let earliestDateMs = nowMs;

  const matchers = fragments.map(f => ({
    regex: new RegExp(`^${f.valueFragment.replace(/\*/g, '.*')}`),
    path: f.path
  }));

  const getValueByPath = (obj, path) => {
    return path.split('.').reduce((acc, key) => acc && acc[key], obj);
  };

  pointset.forEach(item => {
    const checkedPaths = [...new Set(fragments.map(f => f.path))];

    let isMatched = false;
    let matchedValue = null;

    for (const path of checkedPaths) {
      const value = getValueByPath(item, path);
      if (!value) continue;

      const matchesRegex = matchers
        .filter(m => m.path === path)
        .some(m => m.regex.test(value));

      const hasAllowedEmoji = cfg[value] &&
        allowedEmojies.includes(cfg[value].emoji);

      if (matchesRegex || hasAllowedEmoji) {
        isMatched = true;
        matchedValue = value;
        break;
      }
    }

    if (isMatched) {
      details[matchedValue] = (details[matchedValue] || 0) + 1;
      condited++;

      if (item.ts?.updated) {
        const itemDateMs = new Date(item.ts.updated).getTime();

        if (itemDateMs < earliestDateMs) {
          earliestDateMs = itemDateMs;
        }

        if (itemDateMs >= weekAgo && itemDateMs <= nowMs) currentWeekCount++;
        if (itemDateMs >= twoWeeksAgo && itemDateMs < weekAgo) previousWeekCount++;

        if (itemDateMs >= monthAgo && itemDateMs <= nowMs) currentMonthCount++;
        if (itemDateMs >= twoMonthsAgo && itemDateMs < monthAgo) previousMonthCount++;

        if (itemDateMs >= threeMonthsAgo && itemDateMs <= nowMs) current3MonthCount++;
        if (itemDateMs >= sixMonthsAgo && itemDateMs < threeMonthsAgo) previous3MonthCount++;

        if (itemDateMs >= sixMonthsAgo && itemDateMs <= nowMs) currentHalfYearCount++;
        if (itemDateMs >= twelveMonthsAgo && itemDateMs < sixMonthsAgo) previousHalfYearCount++;
      }
    }
  });

  const totalTasks = pointset.length;
  const remainingTasks = Math.max(0, totalTasks - condited);
  const conditedPercentage = totalTasks > 0 ? (condited / totalTasks) * 100 : 0;
  const roundedPercentage = Number(conditedPercentage.toFixed(0));
  const remainingPercentage = Math.max(0, 100 - conditedPercentage);

  const totalDaysInSystem = Math.max(1, Math.ceil((nowMs - earliestDateMs) / oneDayMs));
  const globalTasksPerDay = condited / totalDaysInSystem;
  const globalBasePercentagePerDay = totalTasks > 0 ? (globalTasksPerDay / totalTasks) * 100 : 0;

  const formatDate = (days) => {
    if (days === Infinity || isNaN(days)) return "Бесконечность (цель недостижима)";
    const targetDate = new Date(nowMs + (days * oneDayMs));
    const offset = targetDate.getTimezoneOffset();
    const localTargetDate = new Date(targetDate.getTime() - (offset * 60 * 1000));
    return localTargetDate.toISOString().split('T')[0];
  };

  // 1. Внутренний хелпер умного автопереноса слов для мобильных экранов
  const wrapText = (text, limit = 36) => {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length > limit) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });
    if (currentLine) lines.push(currentLine.trim());
    return lines.join('\n');
  };

  // 2. Внутренний хелпер генерации ASCII-текста для мобильных
  const generateMobileAscii = (forecastObj) => {
    const barLength = 15;
    const filledLength = Math.round((roundedPercentage / barLength));
    const bar = '█'.repeat(filledLength) + '░'.repeat(Math.max(0, barLength - filledLength));
    const rec = forecastObj.recommendations;

    return [
      `📊 ${forecastObj.title.manager.toUpperCase()}`,
      `[${bar}] ${roundedPercentage}% Завершено`,
      `• Осталось: ${forecastObj.daysLeft} дн.`,
      `• Ориентировочная дата: ${forecastObj.text}`,
      '',
      `ℹ️ ЛОГИКА РАСЧЕТА:`,
      wrapText(forecastObj.descr),
      '',
      `💡 РЕКОМЕНДАЦИИ PM:`,
      `• Скорость: ${rec.tasksPerDay.toFixed(2)} зад./день`,
      `• На задачу: ${rec.daysPerTask.toFixed(2)} дн. (~${rec.hoursPerTask} ч)`,
      wrapText(`Чтобы закрыть оставшиеся ${remainingTasks} задач за ${forecastObj.daysLeft} дн., сдавайте по ${rec.tasksPerDay} задач в день (не более ${rec.daysPerTask} дн. на задачу).`),
      '',
      forecastObj.title.pm,
    ].join('\n');
  };

  // Хелпер для генерации рекомендаций команде с учетом перевода в часы
  const generateRecommendations = (daysLeft) => {
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

  const calculateTrendAndForecast = (currentCount, previousCount, daysInPeriod, periodNameRu, aboutRu) => {
    let percentage = 0;
    if (previousCount === 0) {
      percentage = currentCount > 0 ? 100 : 0;
    } else {
      const trend = ((currentCount - previousCount) / previousCount) * 100;
      percentage = Number(trend.toFixed(0));
    }

    let text = `${percentage}%`;
    if (percentage > 0) text = `+${percentage}%`;
    const emoji = percentage > 0 ? '📈' : percentage === 0 ? '⏹️' : '📉';

    const result = {
      percentage,
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

      result.linearForecast = {
        title: {
          analytic: 'Прогноз по целевому темпу',
          engineer: 'Линейный прогноз',
          manager: 'Прогноз по фиксированной скорости',
          pm: `Смысл для PM: «Что будет, если команда пойдет со своей средней исторической скоростью, скорректированной на x${sensedSpeed}, без учета локальных всплесков последней недели или месяца?»`,
        },
        daysLeft: daysLeftLinear === Infinity ? 0 : daysLeftLinear,
        text: formatDate(daysLeftLinear),
        descr: `Генеральный линейный расчет для периода «${periodNameRu}» по списку задач за всё время его существования${!!aboutRu ? ` // ${aboutRu}` : ''}. Осталось: ${remainingPercentage.toFixed(1)}%. Глоб. базовая скорость за все время (${totalDaysInSystem} дн.): ${globalBasePercentagePerDay.toFixed(3)}% в день. С учетом коэф. (${sensedSpeed}): ${linearSpeedPerDay.toFixed(3)}% в день.`,
        recommendations: generateRecommendations(daysLeftLinear),
      };
      // Рендерим ASCII сразу в объект
      result.linearForecast.asciiMobileView = generateMobileAscii(result.linearForecast)

      // --- АДАПТИВНЫЙ ПРОГНОЗ ---
      const tasksPerDayInPeriod = currentCount / daysInPeriod;
      const basePercentagePerDay = totalTasks > 0 ? (tasksPerDayInPeriod / totalTasks) * 100 : 0;
      const actualSpeedPerDay = basePercentagePerDay * sensedSpeed;

      let daysLeftAdaptive = Infinity;
      let textAdaptive = "Бесконечность (текущая скорость равна 0)";
      let descrAdaptive = "";

      if (actualSpeedPerDay > 0) {
        daysLeftAdaptive = Math.ceil(remainingPercentage / actualSpeedPerDay);
        textAdaptive = formatDate(daysLeftAdaptive);
        descrAdaptive = `Динамический расчет на основе периода «${periodNameRu}»${!!aboutRu ? ` // ${aboutRu}` : ''} (${currentCount} закр. задач за ${daysInPeriod} дн.). Базовая скорость периода: ${basePercentagePerDay.toFixed(3)}% в день. С учетом коэф. (${sensedSpeed}): ${actualSpeedPerDay.toFixed(3)}% в день.`;
      } else if (remainingPercentage === 0) {
        daysLeftAdaptive = 0;
        textAdaptive = formatDate(0);
        descrAdaptive = `Цель в 100% уже достигнута. Осталось задач: 0%.`;
      } else {
        descrAdaptive = `Динамический расчет невозможен: за период "${periodNameRu}" закрыто 0 задач. Модифицированная скорость: 0% в день.`;
      }

      result.adaptiveForecast = {
        title: {
          analytic: 'Прогноз по текущему темпу',
          engineer: 'Адаптивный прогноз',
          manager: 'Прогноз по исторической скорости',
          pm: `Смысл для PM: «Что будет, если текущий темп работы команды изменится на x${sensedSpeed}?»`,
        },
        daysLeft: daysLeftAdaptive === Infinity ? 0 : daysLeftAdaptive,
        text: textAdaptive,
        descr: descrAdaptive,
        recommendations: generateRecommendations(daysLeftAdaptive),
      };
      // Рендерим ASCII сразу в объект
      result.adaptiveForecast.asciiMobileView = generateMobileAscii(result.adaptiveForecast)
    }

    return result;
  };

  const metrics = {
    lastWeekTrand: calculateTrendAndForecast(currentWeekCount, previousWeekCount, 7, 'Последняя неделя', 'актуально для штурма дедлайнов'),
    lastMonthTrand: calculateTrendAndForecast(currentMonthCount, previousMonthCount, 30, 'Последний месяц', 'наиболее точный базовый прогноз'),
    last3MonthTrand: calculateTrendAndForecast(current3MonthCount, previous3MonthCount, 90, 'Последние 3 месяца', 'макро-планирование'),
    lastHalfYearTrand: calculateTrendAndForecast(currentHalfYearCount, previousHalfYearCount, 180, "Последнее полугодие")
  };

  return {
    analyse: {
      condited,
      conditedPercentage: Number(conditedPercentage.toFixed(0)),
      details,
      metrics,
      __conditionDetails: {
        fragments,
        allowedEmojies,
      },
    }
  };
}
