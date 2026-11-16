import { useCallback, useEffect, useRef, useState } from 'react'
import { startAlarm, unlockAudio, useCountdown } from './hooks'

/** Countdown + alarm state, kept in App so it keeps running when the timer sheet is closed. */
export function useCountdownTimer() {
  const [ringing, setRinging] = useState(false)
  const stopRef = useRef<(() => void) | null>(null)

  const stopAlarm = useCallback(() => {
    stopRef.current?.()
    stopRef.current = null
  }, [])

  const cd = useCountdown(() => {
    stopAlarm()
    setRinging(true)
    stopRef.current = startAlarm(() => setRinging(false))
  })

  useEffect(() => stopAlarm, [stopAlarm])

  const { setDuration, start, reset } = cd
  return {
    total: cd.total,
    remaining: cd.remaining,
    running: cd.running,
    ringing,
    stopAlarm,
    pick: useCallback(
      (s: number) => {
        stopAlarm()
        setDuration(s)
      },
      [stopAlarm, setDuration],
    ),
    start: useCallback(() => {
      unlockAudio() // lets the alarm sound later on mobile browsers
      stopAlarm()
      start()
    }, [stopAlarm, start]),
    pause: cd.pause,
    reset: useCallback(() => {
      stopAlarm()
      reset()
    }, [stopAlarm, reset]),
  }
}

export type CountdownTimerState = ReturnType<typeof useCountdownTimer>
