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
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t md:bottom-4 md:rounded-2xl md:border border-gray-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <Timer className="text-emerald-600" size={22} />
        <div className="flex-1">
          <div className="text-xs text-gray-500">Nghỉ</div>
          <div className="text-2xl font-bold tabular-nums">{fmtClock(remaining)}</div>
        </div>
        <button onClick={onAdd} className="h-11 rounded-xl border border-gray-200 px-4 font-semibold">
          +15s
        </button>
        <button onClick={onSkip} className="h-11 rounded-xl bg-emerald-600 px-4 font-semibold text-white">
          Bỏ qua
        </button>
      </div>
    </div>
  )
}
