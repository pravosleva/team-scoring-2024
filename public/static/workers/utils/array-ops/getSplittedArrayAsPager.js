const loggerFactory = ({ label, cb }) => {
  let c = 0
  return (msg) => {
    c += 1
    return cb(`${c}. ${msg}`)
  }
}

/**
 * Общая информация (к примеру, для заголовка)
 *
 * @param {*} arg 
 * @param {number} arg.currentPageIndex Запрошенный индекс страницы
 * @param {number} arg.pageLimit Лимит элементов на странице
 * @param {number} arg.totalPages Всего страниц
 * @param {number} arg.totalItems Всег элементов
 * @returns {string} Output (пример: "1-10 of 293")
 */
const getRangeInfo = ({ currentPageIndex, pageLimit, totalPages, totalItems }) => {
  return [
    currentPageIndex * pageLimit + 1,
    '-',
    totalItems > pageLimit * (currentPageIndex + 1)
      ? pageLimit * (currentPageIndex + 1)
      : totalItems,
    'of',
    totalItems,
  ].join(' ')
}


/**
 * @typedef {Object} TPagination
 * @property {string} itemsRangeInfo - Info about range
 * @property {number} pageLimit - Page limit
 * @property {number} totalItems - Total items
 * @property {number} totalPages - Total pages
 * @property {number} currentPageIndex - Current page index
 * @property {number} currentPage - Current page
 * @property {number|null} nextPageIndex - Next page index
 * @property {number|null} nextPage - Next page
 * @property {number|null} prevPageIndex - Prev page index
 * @property {number|null} prevPage - Prev page
 * @property {boolean} isCurrentPageFirst - Is cur page first
 * @property {boolean} isCurrentPageLast - Is cur page last
 */

/**
 * @typedef {Object} TResult
 * @property {boolean} ok - Service success indicator
 * @property {string} message - Service message (optional)
 * @property {string[]} logs - Service logs
 * @property {*} result - Pager { pager: unknown[][] }
 * @property {TPagination} pagination - The user's address details.
 */

/**
 * Группировка массива (pager)
 *
 * @param {*} arg  Опции
 * @param {number} arg.pageLimit Лимит элементов на странице
 * @param {unknown[]} arg.list Целевой массив элементов
 * @param {*} arg.options 
 * @param {number} arg.options.requiredPageIndex Запрошенный индекс страницы (более приоритетный)
 * @param {number} arg.options.requiredCurrentIndex Запрошенный индекс элемента (менее приоритентый)
 * @returns {TResult} Result output object
 */
const getSplittedArrayAsPager = ({ pageLimit, list, options }) => {
  const _service = {
    ok: true,
    message: 'Not handled case',
    logs: [],
    result: null,
  }
  const log = loggerFactory({ label: 'debug', cb: (msg) => _service.logs.unshift(msg) })
  log('⬆️ Function called')
  const { requiredPageIndex, requiredCurrentIndex } = options
  // NOTE: 1. Create new Array
  const finalPager = new Array(Math.ceil(list.length / pageLimit))

  let _currentPageIndex = -1
  for (let i = 0, max = finalPager.length; i < max; i++) {
    if (requiredCurrentIndex >= i * pageLimit && requiredCurrentIndex < (i + 1) * pageLimit) {
      _currentPageIndex = i
      log(`Page _currentPageIndex=${_currentPageIndex} includes requiredCurrentIndex=${requiredCurrentIndex}`)
    }
    // finalPager[i] = list.splice(0, pageLimit)
    finalPager[i] = list.slice(i * pageLimit, (i + 1) * pageLimit)
  }

  // NOTE: 2. Etc
  switch (true) {
    case typeof requiredPageIndex === 'number':
      // NOTE: 2.1 Target page index requested
      log(`Case 2.1: Target page index ${requiredPageIndex} requested`)
      if (requiredPageIndex <= finalPager.length - 1) {
        log(`✅ Requested page index (${requiredPageIndex}) exists in pager (finalPager.length=${finalPager.length})`)
        log('Page which included target item will be set')
        _currentPageIndex = requiredPageIndex
        _service.message = 'Ok'
      } else {
        log(`⛔ Requested page index (${requiredPageIndex}) doesnt exists in pager (finalPager.length=${finalPager.length})`)
        log('First page will be set (by default)')
        _currentPageIndex = 0
        _service.message = 'Ok'
      }
      break
    case typeof requiredCurrentIndex === 'number':
      // NOTE: 2.2 Target list item requested (_currentPageIndex is ready)
      log(`Case 2.2: Target list item requested: requiredCurrentIndex=${requiredCurrentIndex}`)
      if (requiredCurrentIndex === -1) {
        log('Case 2.2.1')
        log('⛔ Target list item value is incorrect')
        log('First page will be set (by default)')
        _currentPageIndex = 0
      } else {
        log('Case 2.2.2')
        if (_currentPageIndex !== requiredPageIndex) {
          log(`⚠️ _currentPageIndex=${_currentPageIndex} !== requiredPageIndex=${requiredPageIndex}`)
        }
        if (_currentPageIndex !== -1) {
          // If exists, we send it
          log('Case 2.2.2.1')
          log(`✅ Page _currentPageIndex=${_currentPageIndex} includes target item ${requiredCurrentIndex} (already detected and exists)`)
          log(`Target page will be taken from finalPager[${_currentPageIndex}]`)
          // currentPage = finalPager[_currentPageIndex]
          _service.message = 'Ok'
        } else {
          log('Case 2.2.2.2')
          log(`⛔ Pages not includes target item (requiredCurrentIndex=${requiredCurrentIndex}). So page could not be taken from list`)
          log('First page will be set')
          _currentPageIndex = 0
          _service.message = 'Ok'
        }
      }
      break
    default:
      // NOTE: 2.3 Default logic
      log('Case 2.3: Unknown case (no requiredPageIndex, no requiredCurrentIndex)')
      log('⚠️ First page will be set')
      _currentPageIndex = 0
      _service.message = 'Unknown case'
      break
  }

  const isCurrentPageFirst = _currentPageIndex === 0
  const isCurrentPageLast = _currentPageIndex === finalPager.length - 1
  const nextPage = (!isCurrentPageLast && _currentPageIndex !== -1)
    ? finalPager[_currentPageIndex + 1]
    : null
  const prevPage = (!isCurrentPageFirst && _currentPageIndex !== -1)
    ? finalPager[_currentPageIndex - 1]
    : null

  _service.result = {
    pager: finalPager,
    pagination: {
      itemsRangeInfo: getRangeInfo({
        currentPageIndex: _currentPageIndex,
        pageLimit,
        totalPages: finalPager.length,
        totalItems: list.length,
      }),
      pageLimit,
      totalItems: list.length,
      totalPages: finalPager.length,
      currentPageIndex: _currentPageIndex,
      currentPage: _currentPageIndex + 1,
      nextPageIndex: !!nextPage ? _currentPageIndex + 1 : null,
      nextPage: !!nextPage ? _currentPageIndex + 2 : null,
      prevPageIndex: !!prevPage ? _currentPageIndex - 1 : null,
      prevPage: !!prevPage ? _currentPageIndex : null,
      isCurrentPageFirst,
      isCurrentPageLast,
    },
    currentPage: finalPager[_currentPageIndex],
    nextPage,
    prevPage,
  }

  return _service
}
