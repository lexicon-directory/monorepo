import { once } from 'node:events'
import { createServer } from 'node:http'

/** @param {{ signal?: AbortSignal; env?: Record<string, string | undefined> }} [options] */
export async function main({ signal, env = process.env } = {}) {
  const config = {
    http: {
      port: 'PORT' in env ? Number(env['PORT']) : 3000,
    },
  }

  const server = createServer((req, res) => {
    res.end('Hello, World!')
  })

  server.listen(config.http.port)

  signal?.addEventListener('abort', () => void server.close(), { once: true })

  return once(server, 'close')
}
