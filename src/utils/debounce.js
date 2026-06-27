/**
 * Debounce & Throttle — Timing utilities for high-frequency events.
 *
 * debounce: Delays execution until `delay` ms after the LAST call.
 *   Use for: search input, window resize, autosave.
 *
 * throttle: Executes at most once per `limit` ms window.
 *   Use for: scroll handlers, mouse move, real-time updates.
 */

/**
 * Returns a debounced version of `fn`.
 * The function only fires once `delay` ms have passed since the last invocation.
 *
 * @param {Function} fn — Function to debounce.
 * @param {number} delay — Milliseconds to wait.
 * @returns {Function} Debounced function with a `.cancel()` method.
 */
export function debounce(fn, delay) {
  let timer = null

  const debounced = (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }

  /** Cancel any pending invocation. */
  debounced.cancel = () => {
    clearTimeout(timer)
    timer = null
  }

  return debounced
}

/**
 * Returns a throttled version of `fn`.
 * The function executes immediately, then ignores calls for `limit` ms.
 *
 * @param {Function} fn — Function to throttle.
 * @param {number} limit — Minimum ms between executions.
 * @returns {Function} Throttled function.
 */
export function throttle(fn, limit) {
  let inThrottle = false

  return (...args) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}
