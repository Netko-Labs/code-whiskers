import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { WHISKERS_QUERY_KEY } from '@/integrations/whiskers'
import {
  CLOSE_NORMAL,
  CLOSE_SESSION_EXPIRED,
  invalidateTopics,
  PONG,
  parseRealtimeMessage,
  realtimeUrl,
  reconnectDelayMs,
} from '../lib'

/**
 * One socket per signed-in user: whiskers' changes mark the matching queries stale, so open views
 * refetch instead of polling. A new user gets a new socket; the old one never outlives them.
 */
export function useRealtimeInvalidation(userId: string | undefined): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return
    let socket: WebSocket | undefined
    let retry: ReturnType<typeof setTimeout> | undefined
    let attempt = 0
    let hasBeenReady = false
    let isStopped = false

    const connect = () => {
      const current = new WebSocket(realtimeUrl())
      socket = current
      current.onmessage = (event) => {
        const message = parseRealtimeMessage(event.data)
        if (message?.type === 'ping') current.send(PONG)
        if (message?.type === 'invalidate') invalidateTopics(queryClient, message.topics)
        if (message?.type === 'ready') {
          // Whatever changed while the socket was down was never announced.
          if (hasBeenReady) void queryClient.invalidateQueries({ queryKey: [WHISKERS_QUERY_KEY] })
          hasBeenReady = true
          attempt = 0
        }
      }
      current.onclose = (event) => {
        if (isStopped || event.code === CLOSE_SESSION_EXPIRED) return
        retry = setTimeout(connect, reconnectDelayMs(attempt))
        attempt += 1
      }
    }

    connect()
    return () => {
      isStopped = true
      clearTimeout(retry)
      socket?.close(CLOSE_NORMAL)
    }
  }, [userId, queryClient])
}
