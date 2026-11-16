import { useEffect, useRef, useState } from 'react'
import { AlarmClock, BellOff, Pause, Play, RotateCcw } from 'lucide-react'
import { fmtClock, startAlarm, unlockAudio, useCountdown } from '../lib/hooks'

const PRESETS: { label: string; sec: number }[] = [
  { label: '30s', sec: 30 },
  { label: '45s', sec: 45 },
  { label: '1 phút', sec: 60 },
  { label: '2 phút', sec: 120 },
  { label: '5 phút', sec: 300 },
  { label: '10 phút', sec: 600 },
  { label: '15 phút', sec: 900 },
  { label: '20 phút', sec: 1200 },
]

export default function CountdownTimer() {
  const [ringing, setRinging] = useState(false)
  const stopRef = useRef<(() => void) | null>(null)
  const [min, setMin] = useState('')
  const [sec, setSec] = useState('')

  const stopAlarm = () => {
    stopRef.current?.()
    stopRef.current = null
  }

  const cd = useCountdown(() => {
    stopAlarm()
    setRinging(true)
    stopRef.current = startAlarm(() => setRinging(false))
  })

  useEffect(() => stopAlarm, [])

  const pick = (s: number) => {
    stopAlarm()
    cd.setDuration(s)
  }

  const applyCustom = () => {
    const total = Math.max(0, parseInt(min || '0', 10)) * 60 + Math.max(0, parseInt(sec || '0', 10))
    if (total > 0) {
      pick(Math.min(total, 99 * 60 + 59))
      setMin('')
      setSec('')
    }
  }

  const onStart = () => {
    unlockAudio() // allow the alarm to sound later on mobile browsers
    stopAlarm()
    cd.start()
  }

  const finished = cd.remaining === 0 && !cd.running

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 flex items-center gap-2 font-bold">
        <AlarmClock size={20} className="text-emerald-600" /> Bấm giờ
      </h3>

      <div className="mb-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.sec}
            onClick={() => pick(p.sec)}
            className={`h-11 rounded-full px-4 text-sm font-semibold transition-colors ${
              cd.total === p.sec
                ? 'bg-emerald-600 text-white'
                : 'border border-gray-200 bg-white text-gray-700 md:hover:bg-gray-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <form
        className="mb-4 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          applyCustom()
        }}
      >
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={99}
          value={min}
          onChange={(e) => setMin(e.target.value)}
          placeholder="Phút"
          aria-label="Phút"
          className="h-11 w-full min-w-0 rounded-xl border border-gray-300 px-3 text-center"
        />
        <span className="font-bold">:</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={59}
          value={sec}
          onChange={(e) => setSec(e.target.value)}
          placeholder="Giây"
          aria-label="Giây"
          className="h-11 w-full min-w-0 rounded-xl border border-gray-300 px-3 text-center"
        />
        <button type="submit" className="h-11 shrink-0 rounded-xl border border-gray-300 px-4 font-semibold">
          Đặt
        </button>
      </form>

      <div
        className={`mb-3 rounded-2xl py-4 text-center text-5xl font-bold tabular-nums ${
          ringing ? 'animate-pulse bg-red-50 text-red-600' : 'bg-gray-50'
        }`}
        aria-live="off"
      >
        {fmtClock(cd.remaining)}
        {ringing && <div className="mt-1 text-base font-semibold">Hết giờ!</div>}
      </div>

      {ringing ? (
        <button
          onClick={stopAlarm}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 font-semibold text-white"
        >
          <BellOff size={20} /> Tắt chuông
        </button>
      ) : (
        <div className="flex gap-2">
          {cd.running ? (
            <button
              onClick={cd.pause}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 font-semibold text-white"
            >
              <Pause size={20} /> Tạm dừng
            </button>
          ) : (
            <button
              onClick={onStart}
              disabled={finished}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 font-semibold text-white disabled:opacity-40"
            >
              <Play size={20} fill="currentColor" /> {cd.remaining < cd.total ? 'Tiếp tục' : 'Bắt đầu'}
            </button>
          )}
          <button
            onClick={() => {
              stopAlarm()
              cd.reset()
            }}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 font-semibold"
          >
            <RotateCcw size={18} /> Đặt lại
          </button>
        </div>
      )}
    </section>
  )
}
