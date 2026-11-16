import { AlarmClock, BellOff, Check, Pause, Play, RotateCcw } from 'lucide-react'
import { fmtClock, unlockAudio, type useStopwatch } from '../lib/hooks'
import type { CountdownTimerState } from '../lib/useCountdownTimer'

type SW = ReturnType<typeof useStopwatch>

interface Props {
  sw: SW
  ct: CountdownTimerState
  strength: boolean
  canTimer: boolean
  saving: boolean
  onFinish: () => void
  onOpenTimer: () => void
}

const icon = 'flex h-12 w-11 shrink-0 items-center justify-center rounded-xl active:scale-[0.98]'

/** Phone-only bottom bar: every frequent action stays reachable without scrolling. */
export default function MobileDock({ sw, ct, strength, canTimer, saving, onFinish, onOpenTimer }: Props) {
  const showClock = strength && sw.started
  const timerActive = ct.running || ct.remaining < ct.total

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-3">
        {strength && !sw.started && (
          <button
            onClick={() => {
              unlockAudio()
              sw.start()
            }}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-white active:scale-[0.98]"
          >
            <Play size={18} fill="currentColor" /> Bắt đầu tập
          </button>
        )}

        {showClock && (
          <>
            <span
              className={`min-w-14 text-center text-lg font-bold tabular-nums ${sw.running ? '' : 'opacity-50'}`}
              aria-label="Thời gian tập"
            >
              {fmtClock(sw.seconds)}
            </span>
            <button
              onClick={sw.running ? sw.pause : sw.start}
              aria-label={sw.running ? 'Tạm dừng' : 'Tiếp tục'}
              className={`${icon} bg-emerald-600 text-white`}
            >
              {sw.running ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            </button>
            <button
              onClick={sw.reset}
              aria-label="Đặt lại thời gian"
              className={`${icon} border border-gray-300 bg-white`}
            >
              <RotateCcw size={18} />
            </button>
          </>
        )}

        {canTimer &&
          (ct.ringing ? (
            <button
              onClick={ct.stopAlarm}
              className="flex h-12 animate-pulse items-center gap-1.5 rounded-xl bg-red-600 px-3 font-semibold text-white"
            >
              <BellOff size={18} /> Tắt chuông
            </button>
          ) : (
            <button
              onClick={onOpenTimer}
              aria-label="Bấm giờ"
              className={`flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 active:scale-[0.98] ${
                timerActive ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-gray-300 bg-white'
              }`}
            >
              <AlarmClock size={18} />
              {timerActive && <span className="text-sm font-bold tabular-nums">{fmtClock(ct.remaining)}</span>}
            </button>
          ))}

        {(!strength || sw.started) && (
          <button
            onClick={onFinish}
            disabled={saving}
            aria-label="Hoàn thành buổi tập"
            className="flex h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-600 font-bold text-emerald-700 active:scale-[0.98] disabled:opacity-50"
          >
            <Check size={18} strokeWidth={3} /> {strength ? 'Xong' : 'Hoàn thành buổi tập'}
          </button>
        )}
      </div>
    </div>
  )
}
