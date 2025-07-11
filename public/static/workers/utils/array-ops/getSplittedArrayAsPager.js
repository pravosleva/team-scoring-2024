const loggerFactory = ({ label, cb }) => {
  let c = 0
  return (msg) => {
    c += 1
    return cb(`${c}. ${msg}`)
  }
}

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
  let currentPage = null
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
      log(`Case 2.2: Target list item requested requiredCurrentIndex=${requiredCurrentIndex} requested`)
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
          currentPage = finalPager[_currentPageIndex]
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
