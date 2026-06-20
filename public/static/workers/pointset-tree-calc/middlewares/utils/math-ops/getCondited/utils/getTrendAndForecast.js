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
  businessTimeSettings = null,
  _activeStatusPackKey = '-',
  _costSettings = null, // Новый входящий аргумент: { burnRatePerDay: number, currency: string }
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
  // --- ХЕЛПЕР РАСЧЕТА БИЗНЕС-ВРЕМЕНИ ---
  const calculateBusinessHoursStats = (settings) => {
    if (!settings) return { avgHoursPerWorkingDay: 8, workingDaysCount: 5 };
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    let totalHours = 0;
    let workingDaysCount = 0;
    daysOfWeek.forEach(day => {
      const intervals = settings[day];
      if (Array.isArray(intervals) && intervals.length > 0) {
        workingDaysCount++;
        intervals.forEach(interval => {
          const [sh, sm, ss] = interval.start.split(':').map(Number);
          const [eh, em, es] = interval.end.split(':').map(Number);
          const startMinutes = (sh * 60) + sm + (ss / 60);
          const endMinutes = (eh * 60) + em + (es / 60);
          if (endMinutes > startMinutes) {
            totalHours += (endMinutes - startMinutes) / 60;
          }
        });
      }
    });
    return {
      avgHoursPerWorkingDay: workingDaysCount > 0 ? totalHours / workingDaysCount : 8,
      workingDaysCount
    };
  };
  // --- ХЕЛПЕР ФОРМАТИРОВАНИЯ БЮДЖЕТА ---
  const calculateRemainingBudget = (daysLeft) => {
    if (!_costSettings?.burnRatePerDay || daysLeft === Infinity || daysLeft === 0 || isNaN(daysLeft)) {
      return null;
    }
    const { burnRatePerDay, currency = 'RUB' } = _costSettings;
    const amount = daysLeft * burnRatePerDay;
    // Форматируем число с разделением тысяч для красоты (например, 1 250 000 руб.)
    const formattedAmount = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount);
    return {
      amount,
      text: `${formattedAmount} ${currency}`
    };
  };
  const bizStats = calculateBusinessHoursStats(businessTimeSettings);
  const workHoursPerDay = bizStats ? Number(bizStats.avgHoursPerWorkingDay.toFixed(1)) : 24;
  const scheduleTextLinear = bizStats
    ? `С учетом вашего рабочего расписания (~${workHoursPerDay} ч/день для расписания «${_activeStatusPackKey}»), это накладывает жесткий лимит времени непосредственной разработки на задачу.`
    : `Это накладывает ограничение на средний Cycle Time задач в производстве.`;
  const scheduleTextAdaptive = bizStats
    ? `Исходя из рабочего графика (~${workHoursPerDay} ч/день для расписания «${_activeStatusPackKey}»), инженеру нельзя затягивать Cycle Time задач сверх рассчитанного лимита рабочих часов.`
    : `Инженеру важно следить за тем, чтобы Cycle Time новых задач не превышал этот лимит во избежание срыва сроков.`;
  const generateRecommendationsLocal = ({ daysLeft, remainingTasks }) => {
    if (daysLeft === 0) return { tasksPerDay: 0, daysPerTask: 0, hoursPerTask: 0, descr: "Цель достигнута." };
    if (daysLeft === Infinity || isNaN(daysLeft)) return { tasksPerDay: 0, daysPerTask: Infinity, hoursPerTask: Infinity, descr: "Расчет невозможен." };

    const tasksPerDay = Number((remainingTasks / daysLeft).toFixed(2));
    const daysPerTask = tasksPerDay > 0 ? Number((1 / tasksPerDay).toFixed(2)) : Infinity;
    // Перевод в ЧИСТЫЕ РАБОЧИЕ ЧАСЫ инженера на основе сеттингов расписания
    const hoursPerTask = daysPerTask !== Infinity ? Math.round(daysPerTask * workHoursPerDay) : Infinity;
    return {
      tasksPerDay,
      daysPerTask,
      hoursPerTask,
      descr: `Рекомендация для PM: чтобы закрыть оставшиеся ${remainingTasks} задач за ${daysLeft} дн., необходимо сдавать по ${tasksPerDay} задач в день (или тратить не более ${daysPerTask} дн. (~${hoursPerTask} чистых раб. ч) на одну задачу).`
    };
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
    // Считаем бюджет для линейного прогноза
    const budgetLinear = calculateRemainingBudget(daysLeftLinear);
    const budgetTextLinear = budgetLinear
      ? `Ориентировочный бюджет до завершения: ${budgetLinear.text}. `
      : '';
    const comments = [
      `Генеральный линейный расчет для периода «${periodNameRu}» по списку задач за всё время его существования.`,
      `• Осталось: ${remainingPercentage.toFixed(1)}%`,
      `• Глоб. базовая скорость за все время (${totalDaysInSystem} дн.): ${globalBasePercentagePerDay.toFixed(3)}% в день. С учетом коэф. (x${sensedSpeed}): ${linearSpeedPerDay.toFixed(3)}% в день`,
    ];
    if (!!aboutRu) comments.push(aboutRu);
    const linearTargetDateStr = formatDate({ days: daysLeftLinear, nowMs, oneDayMs });
    result.linearForecast = {
      title: {
        analytic: 'Прогноз по целевому темпу',
        engineer: 'Линейный прогноз',
        manager: 'Прогноз по фиксированной скорости',
        pm: 'Стабильный исторический тренд',
        stakeholder: 'Прогноз базовых бизнес-рисков',   // Новое поле
        investor: 'Прогноз окупаемости инвестиций (ROI)'  // Новое поле
      },
      roleDescriptions: {
        analytic: `Экстраполяция генеральной совокупности данных на основе глобального математического ожидания системы за ${totalDaysInSystem} дней с поправочным коэффициентом x${sensedSpeed}. Простыми словами: математический прогноз без эмоций. Мы складываем абсолютно все данные за историю проекта и смотрим на «сухой остаток» — общую картину того, как система живет и дышит на длинной дистанции.`,
        engineer: `Расчет даты релиза на основе среднего сквозного Lead Time / Cycle Time всех задач в бэклоге (входной коэффициент: x${sensedSpeed}). Простыми словами: это технический таймлайн конвейера. Представьте завод: мы берем среднее время, за которое любая деталь проходит от входа до выхода, и прикидываем, когда выйдет последняя. ${scheduleTextLinear}`,
        manager: `Идеализированный долгосрочный план-график, сглаживающий текущую волатильность и локальные задержки команды. Простыми словами: прогноз по «крейсерской скорости» проекта. Он игнорирует тот факт, что на этой неделе кто-то заболел или ушел в отпуск, показывая стабильный средний темп работы всей системы.`,
        pm: `Смысл для PM: «Что будет, если команда пойдет со своей средней исторической скоростью, скорректированной на x${sensedSpeed}, без учета локальных всплесков последней недели или месяца?» 👉 ${linearTargetDateStr}`,
        stakeholder: `Анализ стратегических дедлайнов верхнего уровня. Оценка базового сценария поставки ценности конечным пользователям без учета краткосрочных кризисов. ` +
          `Простыми словами: стратегический ориентир для бизнеса. Показывает наиболее вероятный и спокойный сценарий выхода на рынок (Time-to-Market), если в компании не произойдет глобальных изменений. На эту дату можно опираться при долгосрочном планировании маркетинговых кампаний.`,
        investor: [
          `Оценка стабильности капиталовложений. Расчет базового темпа сжигания бюджета (Burn Rate) на основе долгосрочной эффективности команды.`,
          `Простыми словами: проверка инвестиционной надежности. Этот прогноз подтверждает, способна ли команда стабильно и предсказуемо превращать деньги в готовый продукт. Он сглаживает панику от локальных просадок и показывает реальную долгосрочную емкость и живучесть вашего актива.`,
          budgetTextLinear || '(без расчета бюджета)',
        ].join(' ')
      },
      daysLeft: linearSpeedPerDay === 0 && remainingPercentage > 0 ? 0 : (daysLeftLinear === Infinity ? 0 : daysLeftLinear),
      text: linearTargetDateStr,
      descr: comments,
      recommendations: generateRecommendationsLocal({ daysLeft: daysLeftLinear, remainingTasks }),
      budget: budgetLinear,
    };
    result.linearForecast.asciiMobileView = generateMobileAscii({
      forecastObj: result.linearForecast,
      roundedPercentage,
      remainingTasks,
      doneTasks: condited,
      totalTasks,
    });

    // --- АДАПТИВНЫЙ ПРОГНОЗ ---
    const tasksPerDayInPeriod = currentCount / daysInPeriod;
    const basePercentagePerDay = totalTasks > 0 ? (tasksPerDayInPeriod / totalTasks) * 100 : 0;
    const actualSpeedPerDay = basePercentagePerDay * sensedSpeed;
    let _daysLeft2 = Infinity;
    let _text2 = "Бесконечность (текущая скорость равна 0)";
    let _descr2 = [`Динамический расчет на основе периода «${periodNameRu}»:`];
    let daysLeftAdaptive = Infinity;
    if (actualSpeedPerDay > 0) {
      daysLeftAdaptive = Math.ceil(remainingPercentage / actualSpeedPerDay);
      _daysLeft2 = Math.ceil(remainingPercentage / actualSpeedPerDay);
      _text2 = formatDate({ days: _daysLeft2, nowMs, oneDayMs });
      _descr2.push(`• Текущий результат: ${currentCount} закр. задач за ${daysInPeriod} дн.`)
      _descr2.push(`• Базовая скорость периода: ${basePercentagePerDay.toFixed(3)}% в день. С учетом коэф. (x${sensedSpeed}): ${actualSpeedPerDay.toFixed(3)}% в день.`)
      if (!!aboutRu) _descr2.push(aboutRu)
    } else if (remainingPercentage === 0) {
      daysLeftAdaptive = 0;
      _daysLeft2 = 0;
      _text2 = formatDate({ days: 0, nowMs, oneDayMs });
      _descr2.push(`• Текущий результат: Цель в 100% уже достигнута, осталось задач: 0%`)
    } else {
      _descr2.push(`Динамический расчет невозможен:`)
      _descr2.push(`• За период "${periodNameRu}" закрыто 0 задач`)
      _descr2.push(`• Модифицированная скорость: 0% в день`)
    }
    // Считаем бюджет для адаптивного прогноза
    const budgetAdaptive = calculateRemainingBudget(daysLeftAdaptive);
    const budgetTextAdaptive = budgetAdaptive ? `Необходимый оперативный бюджет до закрытия целей: ${budgetAdaptive.text}` : '';
    result.adaptiveForecast = {
      title: {
        analytic: 'Прогноз по текущему темпу',
        engineer: 'Адаптивный прогноз',
        manager: 'Прогноз по исторической скорости',
        pm: 'Динамический краткосрочный прогноз',
        stakeholder: 'Оперативный аудит бизнес-метрик', // Новое поле
        investor: 'Прогноз инвестиционных рисков'       // Новое поле
      },
      roleDescriptions: {
        analytic: `Локальный регрессионный анализ краткосрочного тренда за интервал в ${daysInPeriod} дней. Демонстрирует мгновенное ускорение/замедление процессов адаптации. Замер пульса прямо сейчас. Мы смотрим только на свежий отрезок времени, чтобы понять, куда качнулся маятник — команда разгоняется или, наоборот, начинает буксовать.`,
        engineer: `Оперативный Velocity-прогноз на основе Velocity текущего спринта/периода с учетом изменения пропускной способности конвейера (множитель: x${sensedSpeed}). Простыми словами: прогноз по темпу текущего спринта. Если команда горит идеей и закрывает задачи пачками, этот расчет сразу покажет, как это влияет на дедлайн. ${scheduleTextAdaptive}`,
        manager: `Реалистичная оценка даты завершения работ, основанная на актуальном фокусе и текущей доступности ресурсов команды. Простыми словами: прогноз по «текущей скорости» прямо сейчас. Если процессы в последний месяц изменились, этот график мгновенно пересчитает дату под новые жесткие реалии.`,
        pm: `Смысл для PM: «Что будет, если текущий темп работы команды изменится на x${sensedSpeed}?» 👉 ${_text2}`,
        stakeholder: `Мгновенный срез рисков нарушения текущих контрактных обязательств (SLA) и срыва операционных дедлайнов. ` +
          `Простыми словами: антикризисный датчик для бизнеса. Если текущая дата сильно уплыла вправо относительно линейного прогноза — это жесткий сигнал, что бизнес-процессы прямо сейчас работают неэффективно, ломаются договоренности с клиентами и продукт теряет темп.`,
        investor: [
          `Анализ динамики окупаемости (ROI) и операционных рисков кассового разрыва. Показывает, насколько эффективно капитал осваивается командой прямо сейчас.`,
          `Простыми словами: оценка эффективности операционных расходов. Если тренд падает, это значит, что деньги инвестора прямо сейчас сжигаются быстрее, чем создается ценность. Это триггер для аудита менеджмента или корректировки объема финансирования.`,
          budgetTextAdaptive || '(без расчета бюджета)',
        ].join(' '),
      },
      daysLeft: actualSpeedPerDay === 0 && remainingPercentage > 0 ? 0 : (_daysLeft2 === Infinity ? 0 : _daysLeft2),
      text: _text2,
      descr: _descr2,
      recommendations: generateRecommendationsLocal({ daysLeft: _daysLeft2, remainingTasks }),
      budget: budgetAdaptive,
    };
    result.adaptiveForecast.asciiMobileView = generateMobileAscii({ forecastObj: result.adaptiveForecast, roundedPercentage, remainingTasks, doneTasks: condited, totalTasks })
  }
  return result;
};
