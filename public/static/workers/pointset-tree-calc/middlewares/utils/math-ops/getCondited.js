function getCondited({ allowedEmojies = [], cfg = {}, fragments = [], pointset = [], currentDate = new Date() }) {
  const details = {};
  let condited = 0;

  // Инициализируем счетчики для текущих и прошлых периодов
  let currentWeekCount = 0;
  let previousWeekCount = 0;

  let currentMonthCount = 0;
  let previousMonthCount = 0;

  let current3MonthCount = 0;
  let previous3MonthCount = 0;

  let currentHalfYearCount = 0;
  let previousHalfYearCount = 0;

  // Вычисляем границы дат в миллисекундах заранее
  const nowMs = currentDate.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const weekAgo = nowMs - (7 * oneDayMs);
  const twoWeeksAgo = nowMs - (14 * oneDayMs);

  const monthAgo = nowMs - (30 * oneDayMs);
  const twoMonthsAgo = nowMs - (60 * oneDayMs);

  const threeMonthsAgo = nowMs - (90 * oneDayMs);
  const sixMonthsAgo = nowMs - (180 * oneDayMs);
  const twelveMonthsAgo = nowMs - (360 * oneDayMs); // Для тренда полугодия

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

        // Распределение по текущим и прошлым периодам
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

  // Универсальная функция расчета тренда с добавлением текущего результата
  const calculateTrend = (currentCount, previousCount) => {
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

    return {
      percentage,
      text,
      emoji,
      currentCount,
    };
  };

  // Формируем чистый объект метрик согласно новой структуре
  const metrics = {
    lastWeekTrand: calculateTrend(currentWeekCount, previousWeekCount),
    lastMonthTrand: calculateTrend(currentMonthCount, previousMonthCount),
    last3MonthTrand: calculateTrend(current3MonthCount, previous3MonthCount),
    lastHalfYearTrand: calculateTrend(currentHalfYearCount, previousHalfYearCount)
  };

  const conditedPercentage = pointset.length > 0
    ? (condited / pointset.length) * 100
    : 0;

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
