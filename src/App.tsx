import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronRight, Footprints, Pause, Play, RotateCcw, ShoppingBasket, Timer, Zap, Droplets } from 'lucide-react'
import {
  DAY_KEYS,
  exercises,
  groceryItems,
  schedule,
  todayKey,
  type DayKey,
  type Exercise,
} from './data/workoutData'
import { saveWorkoutLog } from './lib/supabase'
import { fmtClock, unlockAudio, useRestTimer, useStopwatch, useWakeLock } from './lib/hooks'
import CountdownTimer from './components/CountdownTimer'
import ExerciseSheet from './components/ExerciseSheet'
import RestTimerBar from './components/RestTimerBar'
import SummaryModal from './components/SummaryModal'

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const LS_PROGRESS = 'coral_progress'

function pad(n: number) {
  return String(n).padStart(2, '0')
}
function journalDate(d: Date) {
  return `${WEEKDAYS[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}
function isoDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface Progress {
  date: string
  sets: Record<string, boolean[]> // `${dayKey}:${exerciseId}` → set checks
  walkDone: Record<string, boolean>
  walkMinutes: Record<string, number>
  grocery: Record<string, boolean>
}

function loadProgress(): Progress {
  const empty: Progress = { date: isoDate(new Date()), sets: {}, walkDone: {}, walkMinutes: {}, grocery: {} }
  try {
    const p = JSON.parse(localStorage.getItem(LS_PROGRESS) ?? 'null') as Progress | null
    if (p && p.date === empty.date) return p
  } catch {
    /* ignore */
  }
  return empty
}

export default function App() {
  const [dayKey, setDayKey] = useState<DayKey>(todayKey())
  const [lazy, setLazy] = useState(false)
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [openEx, setOpenEx] = useState<Exercise | null>(null)
  const [summary, setSummary] = useState<{ text: string; savedTo: 'supabase' | 'local' | null } | null>(null)
  const [saving, setSaving] = useState(false)

  const rest = useRestTimer()
  const sw = useStopwatch()
  const elapsed = sw.seconds
  useWakeLock(sw.running)

  useEffect(() => {
    try {
      localStorage.setItem(LS_PROGRESS, JSON.stringify(progress))
    } catch {
      /* ignore */
    }
  }, [progress])

  const plan = schedule[dayKey]
  const today = todayKey()
  const setsFor = (sets: number) => (lazy ? 1 : sets)

  const toggleSet = (exId: string, idx: number, restSeconds: number) => {
    const key = `${dayKey}:${exId}`
    const cur = progress.sets[key] ?? []
    const next = [...cur]
    next[idx] = !next[idx]
    setProgress({ ...progress, sets: { ...progress.sets, [key]: next } })
    if (next[idx]) {
      // Checking a set implicitly begins the session if the user forgot.
      if (!sw.started) sw.start()
      rest.start(restSeconds)
    }
  }

  const completedExercises = useMemo(() => {
    if (plan.type !== 'strength' || !plan.items) return []
    return plan.items
      .filter((it) => {
        const checks = progress.sets[`${dayKey}:${it.exerciseId}`] ?? []
        const need = lazy ? 1 : it.sets
        return checks.slice(0, need).filter(Boolean).length >= need
      })
      .map((it) => exercises[it.exerciseId].nameVi)
  }, [plan, progress.sets, dayKey, lazy])

  const switchDay = (k: DayKey) => {
    setDayKey(k)
    rest.skip()
  }

  const finish = async () => {
    const now = new Date()
    let list: string[] = []
    let minutes = 0
    if (plan.type === 'strength') {
      list = completedExercises
      minutes = sw.started ? Math.max(1, Math.round(elapsed / 60)) : 0
    } else {
      minutes = progress.walkMinutes[dayKey] ?? 0
      if (plan.type === 'walk_grocery') {
        list = [`Đi bộ ${minutes || 20} phút`, ...groceryItems.filter((g) => progress.grocery[g]).map((g) => `Đã mua: ${g}`)]
      } else if (plan.type === 'walk') {
        list = progress.walkDone[dayKey] ? ['Đi bộ nhẹ nhàng'] : []
      } else {
        list = ['Nghỉ ngơi, uống đủ nước']
      }
    }

    const useLazy = plan.type === 'strength' && lazy
    const bullets = list.length ? list.map((x) => `• ${x}`).join('\n') : '• (chưa hoàn thành bài nào)'
    const text = `NHẬT KÝ 📚 Thể dục — ${journalDate(now)}

■ Hôm nay mình tập gì
${plan.title}${useLazy ? ' (Chế độ chống lười)' : ''}

■ Tập những bài nào
${bullets}

■ Thời lượng tập: ${minutes} phút`

    setSaving(true)
    const savedTo = await saveWorkoutLog({
      workout_date: isoDate(now),
      day_key: dayKey,
      title: plan.title,
      completed_exercises: list,
      duration_minutes: minutes,
      is_lazy_mode: useLazy,
    })
    setSaving(false)
    setSummary({ text, savedTo })
    sw.reset()
    rest.skip()
  }

  const walkDone = !!progress.walkDone[dayKey]
  const walkMin = progress.walkMinutes[dayKey] ?? 0
  const setWalk = (done: boolean, minutes: number) =>
    setProgress({
      ...progress,
      walkDone: { ...progress.walkDone, [dayKey]: done },
      walkMinutes: { ...progress.walkMinutes, [dayKey]: minutes },
    })

  return (
    <div className="mx-auto min-h-screen max-w-md pb-32 md:max-w-3xl lg:max-w-5xl">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-[#FAFAFA]/95 px-4 pb-3 pt-4 backdrop-blur md:px-6 md:pt-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h1 className="text-xl font-bold md:text-2xl">Coral Fitness</h1>
          <span className="text-sm text-gray-500">{journalDate(new Date())}</span>
        </div>
        <div className="flex gap-1.5 md:gap-2" role="tablist">
          {DAY_KEYS.map((k) => {
            const active = k === dayKey
            return (
              <button
                key={k}
                role="tab"
                aria-selected={active}
                onClick={() => switchDay(k)}
                className={`relative h-11 flex-1 rounded-full text-sm font-semibold transition-colors ${
                  active ? 'bg-emerald-600 text-white' : 'border border-gray-200 bg-white text-gray-700 md:hover:bg-gray-50'
                }`}
              >
                {k}
                {k === today && !active && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                )}
              </button>
            )
          })}
        </div>
      </header>

      <main className="space-y-3 px-4 pt-4 md:space-y-4 md:px-6 md:pt-6">
        {/* Day card */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">{plan.label}</p>
          <h2 className="text-lg font-bold leading-snug">{plan.title}</h2>
          {plan.type === 'strength' && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-emerald-600" />
                <span className="text-sm font-semibold leading-tight">Chế độ chống lười (1 hiệp/bài)</span>
              </div>
              <button
                role="switch"
                aria-checked={lazy}
                aria-label="Chế độ chống lười"
                onClick={() => setLazy(!lazy)}
                className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
                  lazy ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
                    lazy ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          )}
        </section>

        {/* Strength */}
        {plan.type === 'strength' && plan.items && (
          <>
            {!sw.started ? (
              <button
                onClick={() => {
                  unlockAudio()
                  sw.start()
                }}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-base font-bold text-white active:bg-emerald-700 md:hover:bg-emerald-700"
              >
                <Play size={20} fill="currentColor" /> Bắt đầu tập
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-2 text-emerald-900">
                <div className="flex flex-1 items-center justify-center gap-2">
                  <Timer size={20} />
                  <span className={`text-2xl font-bold tabular-nums ${sw.running ? '' : 'opacity-60'}`}>
                    {fmtClock(elapsed)}
                  </span>
                </div>
                <button
                  onClick={sw.running ? sw.pause : sw.start}
                  aria-label={sw.running ? 'Tạm dừng' : 'Tiếp tục'}
                  className="flex h-11 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 font-semibold text-white"
                >
                  {sw.running ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                  {sw.running ? 'Dừng' : 'Tiếp tục'}
                </button>
                <button
                  onClick={sw.reset}
                  aria-label="Đặt lại thời gian"
                  className="flex h-11 items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 font-semibold"
                >
                  <RotateCcw size={18} /> Reset
                </button>
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            {plan.items.map((it) => {
              const ex = exercises[it.exerciseId]
              const n = setsFor(it.sets)
              const checks = progress.sets[`${dayKey}:${it.exerciseId}`] ?? []
              const done = checks.slice(0, n).filter(Boolean).length >= n
              return (
                <article
                  key={it.exerciseId}
                  className={`rounded-2xl border bg-white p-4 transition-colors ${
                    done ? 'border-emerald-300' : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => setOpenEx(ex)}
                    className="flex min-h-11 w-full items-center gap-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold leading-snug">{ex.nameVi}</h3>
                      <p className="text-sm text-gray-500">{ex.nameEn}</p>
                    </div>
                    <ChevronRight size={20} className="shrink-0 text-gray-400" />
                  </button>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-sm font-semibold">
                      {n} x {it.reps}
                    </span>
                    <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700">
                      <Timer size={14} /> {it.restSeconds}s
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {Array.from({ length: n }, (_, i) => {
                      const on = !!checks[i]
                      return (
                        <button
                          key={i}
                          role="checkbox"
                          aria-checked={on}
                          onClick={() => toggleSet(it.exerciseId, i, it.restSeconds)}
                          className={`flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-colors ${
                            on
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-gray-300 bg-white text-gray-700'
                          }`}
                        >
                          {on && <Check size={16} strokeWidth={3} />}
                          Hiệp {i + 1}
                        </button>
                      )
                    })}
                  </div>
                </article>
              )
            })}
            </div>
          </>
        )}

        {/* Grocery */}
        {plan.type === 'walk_grocery' && (
          <section className="rounded-2xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 font-bold">
              <ShoppingBasket size={20} className="text-emerald-600" /> Đi chợ đồ healthy giá rẻ
            </h3>
            <ul className="space-y-1">
              {groceryItems.map((g) => {
                const on = !!progress.grocery[g]
                return (
                  <li key={g}>
                    <button
                      role="checkbox"
                      aria-checked={on}
                      onClick={() =>
                        setProgress({ ...progress, grocery: { ...progress.grocery, [g]: !on } })
                      }
                      className="flex min-h-11 w-full items-center gap-3 text-left"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                          on ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300'
                        }`}
                      >
                        {on && <Check size={16} strokeWidth={3} />}
                      </span>
                      <span className={on ? 'text-gray-400 line-through' : ''}>{g}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Walk logger (T3 walk, T5, T7) */}
        {(plan.type === 'walk_grocery' || plan.type === 'walk' || plan.type === 'rest') && (
          <section className="rounded-2xl border border-gray-200 bg-white p-4">
            <h3 className="mb-1 flex items-center gap-2 font-bold">
              {plan.type === 'rest' ? (
                <Droplets size={20} className="text-emerald-600" />
              ) : (
                <Footprints size={20} className="text-emerald-600" />
              )}
              {plan.type === 'rest' ? 'Phục hồi' : 'Đi bộ'}
            </h3>
            {plan.description && <p className="mb-3 text-sm text-gray-600">{plan.description}</p>}
            <div className="flex items-center gap-2">
              <button
                aria-label="Giảm 5 phút"
                onClick={() => setWalk(walkDone, Math.max(0, walkMin - 5))}
                className="h-11 w-11 rounded-xl border border-gray-300 text-lg font-bold"
              >
                −
              </button>
              <span className="min-w-16 text-center text-lg font-bold tabular-nums">{walkMin} phút</span>
              <button
                aria-label="Tăng 5 phút"
                onClick={() => setWalk(walkDone || walkMin + 5 > 0, walkMin + 5)}
                className="h-11 w-11 rounded-xl border border-gray-300 text-lg font-bold"
              >
                +
              </button>
              <button
                role="checkbox"
                aria-checked={walkDone}
                onClick={() => setWalk(!walkDone, walkDone ? walkMin : walkMin || 20)}
                className={`ml-auto flex h-11 items-center gap-1.5 rounded-xl px-4 font-semibold ${
                  walkDone ? 'bg-emerald-600 text-white' : 'border border-gray-300'
                }`}
              >
                {walkDone && <Check size={16} strokeWidth={3} />} Đã đi bộ
              </button>
            </div>
          </section>
        )}

        {plan.type !== 'rest' && <CountdownTimer />}

        <button
          onClick={finish}
          disabled={saving}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-emerald-600 text-base font-bold text-emerald-700 disabled:opacity-50 md:hover:bg-emerald-50"
        >
          <Check size={20} strokeWidth={3} /> Hoàn thành buổi tập
        </button>
      </main>

      {rest.active && (
        <RestTimerBar remaining={rest.remaining} onAdd={() => rest.addTime(15)} onSkip={rest.skip} />
      )}
      {openEx && <ExerciseSheet exercise={openEx} onClose={() => setOpenEx(null)} />}
      {summary && <SummaryModal {...summary} onClose={() => setSummary(null)} />}
    </div>
  )
}
