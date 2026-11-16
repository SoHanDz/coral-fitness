import CountdownTimer from './CountdownTimer'
import type { CountdownTimerState } from '../lib/useCountdownTimer'

export default function TimerSheet({ ct, onClose }: { ct: CountdownTimerState; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 lg:hidden" onClick={onClose}>
      <div
        className="animate-sheet w-full max-w-md rounded-t-3xl bg-white p-2 pb-[max(1rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <CountdownTimer ct={ct} onClose={onClose} />
      </div>
    </div>
  )
}
