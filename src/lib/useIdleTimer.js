import { useEffect, useRef } from 'react'
import { IDLE_LIMIT_MS } from './constants'

const EVENTS = ['click', 'keydown', 'touchstart', 'scroll']

export function useIdleTimer(onIdle, active) {
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active) return undefined

    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(onIdle, IDLE_LIMIT_MS)
    }

    reset()
    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      EVENTS.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [onIdle, active])
}
