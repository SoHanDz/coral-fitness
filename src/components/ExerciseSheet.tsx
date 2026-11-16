import { useState } from 'react'
import { ShieldAlert, X } from 'lucide-react'
import type { Exercise } from '../data/workoutData'

export default function ExerciseSheet({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const [gifFailed, setGifFailed] = useState(false)

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 md:items-center md:p-6" onClick={onClose}>
      <div
        className="animate-sheet max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 md:max-w-lg md:rounded-3xl md:p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={exercise.nameVi}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold leading-snug">{exercise.nameVi}</h2>
            <p className="text-sm text-gray-500">{exercise.nameEn}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
          {gifFailed ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 text-center">
              <span className="text-base font-semibold text-emerald-900">{exercise.nameEn}</span>
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
                {exercise.targetMuscle}
              </span>
            </div>
          ) : (
            <img
              src={exercise.gif ?? `/gifs/${exercise.id}.gif`}
              alt={exercise.nameEn}
              className="h-full w-full object-contain"
              onError={() => setGifFailed(true)}
            />
          )}
        </div>

        <ul className="mb-4 space-y-2">
          {exercise.formCues.map((c, i) => (
            <li key={i} className="flex gap-2 text-[15px] leading-snug">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              {c}
            </li>
          ))}
        </ul>

        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
          <ShieldAlert size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm leading-snug">{exercise.safetyNote}</p>
        </div>
      </div>
    </div>
  )
}
