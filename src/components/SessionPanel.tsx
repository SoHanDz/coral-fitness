import { Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { fmtClock, unlockAudio, type useStopwatch } from '../lib/hooks'

type SW = ReturnType<typeof useStopwatch>

/** Desktop session clock: start button, then clock with pause and reset. */
export default function SessionPanel({ sw }: { sw: SW }) {
  if (!sw.started) {
    return (
      <button
        onClick={() => {
          unlockAudio()
          sw.start()
        }}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-base font-bold text-white transition-colors hover:bg-emerald-700 active:scale-[0.98]"
      >
        <Play size={20} fill="currentColor" /> Bắt đầu tập
      </button>
    )
  }
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-2 text-emerald-900">
      <div className="flex flex-1 items-center justify-center gap-2">
        <Timer size={20} />
        <span className={`text-2xl font-bold tabular-nums ${sw.running ? '' : 'opacity-60'}`}>
          {fmtClock(sw.seconds)}
        </span>
      </div>
      <button
        onClick={sw.running ? sw.pause : sw.start}
        className="flex h-11 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 font-semibold text-white active:scale-[0.98]"
      >
        {sw.running ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
        {sw.running ? 'Dừng' : 'Tiếp tục'}
      </button>
      <button
        onClick={sw.reset}
        aria-label="Đặt lại thời gian"
        className="flex h-11 items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 font-semibold active:scale-[0.98]"
      >
        <RotateCcw size={18} /> Reset
      </button>
    </div>
  )
}
