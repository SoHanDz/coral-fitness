import { useState } from 'react'
import { AlarmClock, BellOff, Pause, Pencil, Play, RotateCcw, X } from 'lucide-react'
import { fmtClock } from '../lib/hooks'
import type { CountdownTimerState } from '../lib/useCountdownTimer'

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

export default function CountdownTimer({ ct, onClose }: { ct: CountdownTimerState; onClose?: () => void }) {
  const [custom, setCustom] = useState(false)
  const [min, setMin] = useState('')
  const [sec, setSec] = useState('')

  const applyCustom = () => {
    const total = Math.max(0, parseInt(min || '0', 10)) * 60 + Math.max(0, parseInt(sec || '0', 10))
    if (total > 0) {
      ct.pick(Math.min(total, 99 * 60 + 59))
      setMin('')
      setSec('')
      setCustom(false)
    }
  }

  const chip = 'h-10 rounded-full px-3.5 text-sm font-semibold transition-colors active:scale-[0.98]'
  const finished = ct.remaining === 0 && !ct.running

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold">
          <AlarmClock size={20} className="text-emerald-600" /> Bấm giờ
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="-mr-2 -mt-2 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div
        className={`mb-3 flex items-center gap-3 rounded-xl px-4 py-3 ${
          ct.ringing ? 'animate-pulse bg-red-50 text-red-600' : 'bg-gray-50'
        }`}
      >
        <div>
          <div className="text-3xl font-bold tabular-nums leading-none">{fmtClock(ct.remaining)}</div>
          {ct.ringing && <div className="mt-1 text-xs font-semibold">Hết giờ!</div>}
        </div>
        <div className="ml-auto flex gap-2">
          {ct.ringing ? (
            <button
              onClick={ct.stopAlarm}
              className="flex h-11 items-center gap-1.5 rounded-xl bg-red-600 px-4 font-semibold text-white"
            >
              <BellOff size={18} /> Tắt chuông
            </button>
          ) : (
            <>
              {ct.running ? (
                <button
                  onClick={ct.pause}
                  className="flex h-11 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 font-semibold text-white active:scale-[0.98]"
                >
                  <Pause size={18} /> Dừng
                </button>
              ) : (
                <button
                  onClick={ct.start}
                  disabled={finished}
                  className="flex h-11 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 font-semibold text-white active:scale-[0.98] disabled:opacity-40"
                >
                  <Play size={18} fill="currentColor" /> {ct.remaining < ct.total ? 'Tiếp tục' : 'Bắt đầu'}
                </button>
              )}
              <button
                onClick={ct.reset}
                aria-label="Đặt lại"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-300 bg-white active:scale-[0.98]"
              >
                <RotateCcw size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.sec}
            onClick={() => ct.pick(p.sec)}
            className={`${chip} ${
              ct.total === p.sec
                ? 'bg-emerald-600 text-white'
                : 'border border-gray-200 bg-white text-gray-700 md:hover:bg-gray-50'
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setCustom(!custom)}
          aria-pressed={custom}
          className={`${chip} flex items-center gap-1.5 border ${
            custom ? 'border-emerald-600 text-emerald-700' : 'border-dashed border-gray-300 text-gray-700'
          }`}
        >
          <Pencil size={14} /> Tự nhập
        </button>
      </div>

      {custom && (
        <form
          className="mt-3 flex items-center gap-2"
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
            autoFocus
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
          <button type="submit" className="h-11 shrink-0 rounded-xl bg-gray-900 px-4 font-semibold text-white">
            Đặt
          </button>
        </form>
      )}
    </section>
  )
}
