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
  const getValueByPath = (obj, path) => path.split('.').reduce((acc, key) => acc && acc[key], obj);

  pointset.forEach(item => {
    const checkedPaths = [...new Set(fragments.map(f => f.path))];
    let isMatched = false;
    let matchedValue = null;
    for (const path of checkedPaths) {
      const value = getValueByPath(item, path);
      if (!value) continue;
      const _r = matchers
        .filter(m => m.path === path)
        .some(m => m.regex.test(value));
      const hasAllowedEmoji = cfg[value] &&
        allowedEmojies.includes(cfg[value].emoji);
      if (_r || hasAllowedEmoji) {
        isMatched = true;
        matchedValue = value;
        break;
      }
    }
    if (isMatched) {
      details[matchedValue] = (details[matchedValue] || 0) + 1;
      condited++;
      if (item.ts?.updated) {
        const _ts = new Date(item.ts.updated).getTime();
        if (_ts < earliestDateMs) {
          earliestDateMs = _ts;
        }
        if (_ts >= weekAgo && _ts <= nowMs) currentWeekCount++;
        if (_ts >= twoWeeksAgo && _ts < weekAgo) previousWeekCount++;
        if (_ts >= monthAgo && _ts <= nowMs) currentMonthCount++;
        if (_ts >= twoMonthsAgo && _ts < monthAgo) previousMonthCount++;
        if (_ts >= threeMonthsAgo && _ts <= nowMs) current3MonthCount++;
        if (_ts >= sixMonthsAgo && _ts < threeMonthsAgo) previous3MonthCount++;
        if (_ts >= sixMonthsAgo && _ts <= nowMs) currentHalfYearCount++;
        if (_ts >= twelveMonthsAgo && _ts < sixMonthsAgo) previousHalfYearCount++;
      }
    }
  });
  const totalTasks = pointset.length;
  console.log(`totalTasks= ${totalTasks}, condited= ${condited}`)
  const remainingTasks = Math.max(0, totalTasks - condited);
  const conditedPercentage = totalTasks > 0 ? (condited / totalTasks) * 100 : 0;
  const roundedPercentage = Number(conditedPercentage.toFixed(0));
  const remainingPercentage = Math.max(0, 100 - conditedPercentage);
  const totalDaysInSystem = Math.max(1, Math.ceil((nowMs - earliestDateMs) / oneDayMs));
  const globalTasksPerDay = condited / totalDaysInSystem;
  const globalBasePercentagePerDay = totalTasks > 0 ? (globalTasksPerDay / totalTasks) * 100 : 0;
  const metrics = {
    lastWeekTrand: getTrendAndForecast({
      currentCount: currentWeekCount,
      previousCount: previousWeekCount,
      daysInPeriod: 7,
      periodNameRu: 'Последняя неделя',
      aboutRu: 'Актуально для штурма дедлайнов',
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
    }),
    lastMonthTrand: getTrendAndForecast({
      currentCount: currentMonthCount,
      previousCount: previousMonthCount,
      daysInPeriod: 30,
      periodNameRu: 'Последний месяц',
      aboutRu: 'Наиболее точный базовый прогноз',
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
    }),
    last3MonthTrand: getTrendAndForecast({
      currentCount: current3MonthCount,
      previousCount: previous3MonthCount,
      daysInPeriod: 90,
      periodNameRu: 'Последние 3 месяца',
      aboutRu: 'Макро-планирование',
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
    }),
    lastHalfYearTrand: getTrendAndForecast({
      currentCount: currentHalfYearCount,
      previousCount: previousHalfYearCount,
      daysInPeriod: 180,
      periodNameRu: 'Последнее полугодие',
      aboutRu: undefined,
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
    })
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
