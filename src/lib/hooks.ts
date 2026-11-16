import { useCallback, useEffect, useRef, useState } from 'react'

let sharedCtx: AudioContext | null = null

/** Create/resume the shared AudioContext. Call from a user gesture so later alarms are allowed to play. */
export function unlockAudio() {
  try {
    if (!sharedCtx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      sharedCtx = new Ctx()
    }
    if (sharedCtx.state === 'suspended') void sharedCtx.resume()
  } catch {
    /* audio unavailable */
  }
}

function tone(freq: number, dur: number, vol = 0.25) {
  const ctx = sharedCtx
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + dur)
}

export function beep() {
  unlockAudio()
  tone(880, 0.5)
}

/** Repeating triple-beep alarm (+ vibration). Returns a stop function; auto-stops after maxSeconds. */
export function startAlarm(onEnd?: () => void, maxSeconds = 20): () => void {
  unlockAudio()
  const ring = () => {
    tone(988, 0.18, 0.35)
    setTimeout(() => tone(988, 0.18, 0.35), 250)
    setTimeout(() => tone(988, 0.18, 0.35), 500)
    try {
      navigator.vibrate?.([200, 100, 200, 100, 200])
    } catch {
      /* ignore */
    }
  }
  ring()
  const id = setInterval(ring, 1200)
  let stopped = false
  const stop = () => {
    if (stopped) return
    stopped = true
    clearInterval(id)
    clearTimeout(t)
    onEnd?.()
  }
  const t = setTimeout(stop, maxSeconds * 1000)
  return stop
}

/** Keeps the screen awake while `active`; silently no-ops when unsupported. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const request = async () => {
      try {
        const s = await navigator.wakeLock.request('screen')
        if (cancelled) void s.release()
        else sentinel = s
      } catch {
        /* denied or unsupported */
      }
    }
    void request()
    // Lock is released when tab is hidden; re-acquire on return.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void sentinel?.release()
    }
  }, [active])
}

/** Pausable stopwatch (session timer). */
export function useStopwatch() {
  const [acc, setAcc] = useState(0) // ms accumulated before the current run
  const [runStart, setRunStart] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (runStart == null) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [runStart])

  const ms = acc + (runStart != null ? Math.max(0, now - runStart) : 0)
  const start = useCallback(() => setRunStart(Date.now()), [])
  const pause = useCallback(() => {
    if (runStart == null) return
    setAcc((a) => a + Date.now() - runStart)
    setRunStart(null)
  }, [runStart])
  const reset = useCallback(() => {
    setAcc(0)
    setRunStart(null)
  }, [])

  return { seconds: Math.floor(ms / 1000), running: runStart != null, started: runStart != null || acc > 0, start, pause, reset }
}

/** Pausable countdown with a fixed duration. Calls onDone when it reaches 0. */
export function useCountdown(onDone: () => void) {
  const [total, setTotal] = useState(60)
  const [pausedLeft, setPausedLeft] = useState<number | null>(60_000)
  const [endAt, setEndAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (endAt == null) return
    const tick = () => {
      const t = Date.now()
      setNow(t)
      if (t >= endAt) {
        setEndAt(null)
        setPausedLeft(0)
        doneRef.current()
      }
    }
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [endAt])

  const remaining = endAt != null ? Math.max(0, Math.ceil((endAt - now) / 1000)) : Math.ceil((pausedLeft ?? 0) / 1000)

  const setDuration = useCallback((sec: number) => {
    setTotal(sec)
    setPausedLeft(sec * 1000)
    setEndAt(null)
  }, [])
  const start = useCallback(() => {
    if (pausedLeft && pausedLeft > 0) {
      setEndAt(Date.now() + pausedLeft)
      setPausedLeft(null)
    }
  }, [pausedLeft])
  const pause = useCallback(() => {
    if (endAt == null) return
    setPausedLeft(Math.max(0, endAt - Date.now()))
    setEndAt(null)
  }, [endAt])
  const reset = useCallback(() => {
    setPausedLeft(total * 1000)
    setEndAt(null)
  }, [total])

  return { total, remaining, running: endAt != null, setDuration, start, pause, reset }
}

/** Countdown based on an end timestamp so it stays accurate in background tabs. */
export function useRestTimer() {
  const [endAt, setEndAt] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)
  const beeped = useRef(false)

  const start = useCallback((seconds: number) => {
    beeped.current = false
    setEndAt(Date.now() + seconds * 1000)
    setRemaining(seconds)
  }, [])
  const addTime = useCallback((s: number) => setEndAt((e) => (e == null ? e : e + s * 1000)), [])
  const skip = useCallback(() => setEndAt(null), [])

  useEffect(() => {
    if (endAt == null) return
    const tick = () => {
      const left = Math.ceil((endAt - Date.now()) / 1000)
      if (left <= 0) {
        if (!beeped.current) {
          beeped.current = true
          beep()
        }
        setRemaining(0)
        setEndAt(null)
      } else setRemaining(left)
    }
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [endAt])

  return { active: endAt != null, remaining, start, addTime, skip }
}

export function fmtClock(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
