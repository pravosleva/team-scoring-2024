/**
 * Время пройденное на момент вызова
 *
 * @param {Object} arg 
 * @param {Date|number} arg.dateInput 
 * @param {string} [arg.locale='en'] 
 * @returns {string} Internationalized relative time message as string; See also {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/format MDN}
 */
function getTimeAgo({ dateInput, locale = 'en' }) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

  const MINUTE = 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;
  const WEEK = DAY * 7;
  const MONTH = DAY * 30; // Approximation
  const YEAR = DAY * 365; // Approximation

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (seconds < MINUTE) {
    return rtf.format(-seconds, 'second');
  } else if (seconds < HOUR) {
    return rtf.format(-Math.round(seconds / MINUTE), 'minute');
  } else if (seconds < DAY) {
    return rtf.format(-Math.round(seconds / HOUR), 'hour');
  } else if (seconds < WEEK) {
    return rtf.format(-Math.round(seconds / DAY), 'day');
  } else if (seconds < MONTH) {
    return rtf.format(-Math.round(seconds / WEEK), 'week');
  } else if (seconds < YEAR) {
    return rtf.format(-Math.round(seconds / MONTH), 'month');
  } else {
    return rtf.format(-Math.round(seconds / YEAR), 'year');
  }
}

/* NOTE: Example usage:
const pastDate = new Date('2025-11-07T10:00:00Z');
console.log(timeAgo(pastDate)); // e.g., "1 day ago"

const anotherPastDate = new Date('2025-11-07T12:00:00Z');
console.log(timeAgo(anotherPastDate, 'es')); // e.g., "hace 1 día"

const futureDate = new Date(new Date().getTime() + 5 * 60 * 1000); // 5 minutes in the future
console.log(timeAgo(futureDate)); // e.g., "in 5 minutes"
*/
