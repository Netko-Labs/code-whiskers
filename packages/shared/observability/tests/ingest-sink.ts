/** A stand-in for code-whiskers' ingest: records what the SDK posts, answers like whiskers. */
export function createIngestSink(port: number) {
  const hits: { path: string; search: string; body: string }[] = []
  const server = Bun.serve({
    port,
    async fetch(request) {
      const url = new URL(request.url)
      let bytes = new Uint8Array(await request.arrayBuffer())
      if (request.headers.get('content-encoding') === 'gzip') bytes = Bun.gunzipSync(bytes)
      hits.push({ path: url.pathname, search: url.search, body: new TextDecoder().decode(bytes) })
      return Response.json({ id: 'ok' })
    },
  })
  return { hits, stop: () => server.stop(true) }
}
