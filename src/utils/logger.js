/**
 * Logger — Structured console logging with namespace prefixes.
 *
 * Every service and module creates its own logger via `logger.create('Storage')`,
 * which produces output like `[DevNotes][Storage] Note saved`.
 *
 * This makes console output filterable and traceable without a logging library.
 *
 * Log levels: debug < info < warn < error
 * In production you can raise the minimum level to suppress debug output.
 */

const PREFIX = '[DevNotes]'

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 }

/** Current minimum level — change this to suppress verbose output. */
let minLevel = LEVELS.debug

function shouldLog(level) {
  return LEVELS[level] >= minLevel
}

function format(namespace, level) {
  const ns = namespace ? `${PREFIX}[${namespace}]` : PREFIX
  return `${ns} (${level.toUpperCase()})`
}

/**
 * Creates a namespaced logger.
 *
 * @param {string} namespace — Module name (e.g. 'Storage', 'Tabs').
 * @returns {{ debug, info, warn, error }}
 */
function create(namespace) {
  return {
    debug: (...args) => {
      if (shouldLog('debug'))
        console.debug(format(namespace, 'debug'), ...args)
    },
    info: (...args) => {
      if (shouldLog('info'))
        console.info(format(namespace, 'info'), ...args)
    },
    warn: (...args) => {
      if (shouldLog('warn'))
        console.warn(format(namespace, 'warn'), ...args)
    },
    error: (...args) => {
      if (shouldLog('error'))
        console.error(format(namespace, 'error'), ...args)
    },
  }
}

/** Root logger (no namespace). */
const logger = {
  ...create(null),
  create,
  setLevel(level) {
    if (LEVELS[level] !== undefined) minLevel = LEVELS[level]
  },
}

export default logger
