import { Timer } from 'lucide-react'
import { fmtClock } from '../lib/hooks'

export default function RestTimerBar({
  remaining,
  onAdd,
  onSkip,
}: {
  remaining: number
  onAdd: () => void
  onSkip: () => void
}) {
  return (
    <div className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-3 shadow-[0_8px_24px_rgba(17,24,39,0.12)] lg:bottom-6">
      <div className="flex items-center gap-3">
        <Timer className="text-emerald-600" size={22} />
        <div className="flex-1">
          <div className="text-xs text-gray-500">Nghỉ</div>
          <div className="text-2xl font-bold leading-tight tabular-nums">{fmtClock(remaining)}</div>
        </div>
        <button onClick={onAdd} className="h-11 rounded-xl border border-gray-200 px-4 font-semibold active:scale-[0.98]">
          +15s
        </button>
        <button
          onClick={onSkip}
          className="h-11 rounded-xl bg-emerald-600 px-4 font-semibold text-white active:scale-[0.98]"
        >
          Bỏ qua
        </button>
      </div>
    </div>
  )
}
