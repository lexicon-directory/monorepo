/**
 * @param {(options: { signal: AbortSignal }) => Promise<void>} main
 * @returns {void}
 */
export function run(main, timeout = 30_000) {
  const abortController = new AbortController()
  const { signal } = abortController

  process.on('SIGTERM', abort)
  process.on('SIGINT', abort)

  void (async () => {
    try {
      await main({ signal })
    } catch (err) {
      if (!isCausedBySignal(err, signal)) exit(err)
    } finally {
      process.exit(0)
    }
  })()

  function abort() {
    abortController.abort()
    process.off('SIGTERM', abort)
    process.off('SIGINT', abort)

    setTimeout(exit, timeout, 'Timeout').unref()
    process.on('SIGINT', exit)
    process.on('SIGTERM', exit)
  }

  function exit(message) {
    console.error('Exiting:', message)
    process.exit(1)
  }
}

/**
 * Determines whether the cause of an error is a signal's reason
 *
 * @param {unknown} err
 * @param {AbortSignal} signal
 */
export function isCausedBySignal(err, signal) {
  if (!signal.aborted) return false
  if (signal.reason == null) return false // Ignore nullish reasons
  return (
    err === signal.reason ||
    (err instanceof Error && err.cause === signal.reason)
  )
}
