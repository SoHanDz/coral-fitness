import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronRight, Droplets, Footprints, Timer, Zap } from 'lucide-react'
import {
  DAY_KEYS,
  exercises,
  schedule,
  todayKey,
  type DayKey,
  type Exercise,
} from './data/workoutData'
import { saveWorkoutLog } from './lib/supabase'
import { useRestTimer, useStopwatch, useWakeLock } from './lib/hooks'
import { useCountdownTimer } from './lib/useCountdownTimer'
import CountdownTimer from './components/CountdownTimer'
import ExerciseSheet from './components/ExerciseSheet'
import MobileDock from './components/MobileDock'
import RestTimerBar from './components/RestTimerBar'
import SessionPanel from './components/SessionPanel'
import SummaryModal from './components/SummaryModal'
import TimerSheet from './components/TimerSheet'

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
}

function loadProgress(): Progress {
  const empty: Progress = { date: isoDate(new Date()), sets: {}, walkDone: {}, walkMinutes: {} }
  try {
    const p = JSON.parse(localStorage.getItem(LS_PROGRESS) ?? 'null') as Progress | null
    if (p && p.date === empty.date) return p
  } catch {
    /* ignore */
  }
  return empty
}

// One container width rule for header and body so they always line up.
const CONTAINER = 'mx-auto max-w-md px-4 md:max-w-3xl md:px-6 lg:max-w-5xl xl:max-w-6xl'

export default function App() {
  const [dayKey, setDayKey] = useState<DayKey>(todayKey())
  const [lazy, setLazy] = useState(false)
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [openEx, setOpenEx] = useState<Exercise | null>(null)
  const [timerOpen, setTimerOpen] = useState(false)
  const [summary, setSummary] = useState<{ text: string; savedTo: 'supabase' | 'local' | null } | null>(null)
  const [saving, setSaving] = useState(false)

  const rest = useRestTimer()
  const sw = useStopwatch()
  const ct = useCountdownTimer()
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
  const isStrength = plan.type === 'strength'
  const canTimer = plan.type !== 'rest'
  const setsFor = (sets: number) => (lazy ? 1 : sets)

  const toggleSet = (exId: string, idx: number, restSeconds: number) => {
    const key = `${dayKey}:${exId}`
    const next = [...(progress.sets[key] ?? [])]
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
      minutes = sw.started ? Math.max(1, Math.round(sw.seconds / 60)) : 0
    } else {
      minutes = progress.walkMinutes[dayKey] ?? 0
      if (plan.type === 'walk') {
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
    <div className="min-h-screen pb-32 lg:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-[#FAFAFA]/95 backdrop-blur">
        <div className={`${CONTAINER} pb-2.5 pt-3`}>
          <div className="mb-2 flex items-baseline justify-between">
            <h1 className="text-lg font-bold md:text-xl">Coral Fitness</h1>
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
                  className={`relative h-11 flex-1 rounded-full text-sm font-semibold transition-colors active:scale-[0.98] ${
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
        </div>
      </header>

      <div className={`${CONTAINER} pt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-6 lg:pt-6`}>
        <main className="space-y-3">
          {/* Day card */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">{plan.label}</p>
            <h2 className="text-lg font-bold leading-snug">{plan.title}</h2>
            {isStrength && (
              <button
                role="switch"
                aria-checked={lazy}
                onClick={() => setLazy(!lazy)}
                className="mt-3 flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-semibold leading-tight">
                  <Zap size={18} className="shrink-0 text-emerald-600" />
                  Chế độ chống lười (1 hiệp/bài)
                </span>
                <span
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    lazy ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      lazy ? 'left-6' : 'left-1'
                    }`}
                  />
                </span>
              </button>
            )}
          </section>

          {/* Strength exercises */}
          {isStrength && plan.items && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
              {plan.items.map((it) => {
                const ex = exercises[it.exerciseId]
                const n = setsFor(it.sets)
                const checks = progress.sets[`${dayKey}:${it.exerciseId}`] ?? []
                const done = checks.slice(0, n).filter(Boolean).length >= n
                return (
                  <article
                    key={it.exerciseId}
                    className={`rounded-2xl border bg-white p-3 transition-colors ${
                      done ? 'border-emerald-300 bg-emerald-50/40' : 'border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => setOpenEx(ex)}
                      aria-label={`Xem hướng dẫn: ${ex.nameVi}`}
                      className="flex min-h-11 w-full items-center gap-2 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="flex items-center gap-1.5 font-bold leading-snug">
                          {done && <Check size={16} strokeWidth={3} className="shrink-0 text-emerald-600" />}
                          {ex.nameVi}
                        </h3>
                        <p className="truncate text-sm text-gray-500">{ex.nameEn}</p>
                      </div>
                      <ChevronRight size={20} className="shrink-0 text-gray-400" />
                    </button>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="whitespace-nowrap rounded-lg bg-gray-100 px-2 py-1 text-sm font-semibold">
                          {n} x {it.reps}
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap rounded-lg bg-emerald-50 px-2 py-1 text-sm font-medium text-emerald-700">
                          <Timer size={14} /> {it.restSeconds}s
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="hidden text-xs text-gray-500 sm:inline">Hiệp</span>
                        {Array.from({ length: n }, (_, i) => {
                          const on = !!checks[i]
                          return (
                            <button
                              key={i}
                              role="checkbox"
                              aria-checked={on}
                              aria-label={`Hiệp ${i + 1}`}
                              onClick={() => toggleSet(it.exerciseId, i, it.restSeconds)}
                              className={`flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-bold transition-colors active:scale-[0.96] ${
                                on
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-gray-300 bg-white text-gray-700 md:hover:border-emerald-600'
                              }`}
                            >
                              {on ? <Check size={18} strokeWidth={3} /> : i + 1}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {/* Walk logger  */}
          {(plan.type === 'walk' || plan.type === 'rest') && (
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
                  className="h-11 w-11 rounded-xl border border-gray-300 text-lg font-bold active:scale-[0.96]"
                >
                  −
                </button>
                <span className="min-w-16 text-center text-lg font-bold tabular-nums">{walkMin} phút</span>
                <button
                  aria-label="Tăng 5 phút"
                  onClick={() => setWalk(walkDone || walkMin + 5 > 0, walkMin + 5)}
                  className="h-11 w-11 rounded-xl border border-gray-300 text-lg font-bold active:scale-[0.96]"
                >
                  +
                </button>
                <button
                  role="checkbox"
                  aria-checked={walkDone}
                  onClick={() => setWalk(!walkDone, walkDone ? walkMin : walkMin || 20)}
                  className={`ml-auto flex h-11 items-center gap-1.5 rounded-xl px-4 font-semibold active:scale-[0.98] ${
                    walkDone ? 'bg-emerald-600 text-white' : 'border border-gray-300'
                  }`}
                >
                  {walkDone && <Check size={16} strokeWidth={3} />} Đã đi bộ
                </button>
              </div>
            </section>
          )}
        </main>

        {/* Desktop control rail: stays in view while scrolling the workout */}
        <aside className="hidden lg:block">
          <div className="sticky top-32 space-y-3">
            {isStrength && <SessionPanel sw={sw} />}
            {canTimer && <CountdownTimer ct={ct} />}
            <button
              onClick={finish}
              disabled={saving}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-emerald-600 text-base font-bold text-emerald-700 transition-colors hover:bg-emerald-50 active:scale-[0.98] disabled:opacity-50"
            >
              <Check size={20} strokeWidth={3} /> Hoàn thành buổi tập
            </button>
          </div>
        </aside>
      </div>

      <MobileDock
        sw={sw}
        ct={ct}
        strength={isStrength}
        canTimer={canTimer}
        saving={saving}
        onFinish={finish}
        onOpenTimer={() => setTimerOpen(true)}
      />

      {rest.active && (
        <RestTimerBar remaining={rest.remaining} onAdd={() => rest.addTime(15)} onSkip={rest.skip} />
      )}
      {timerOpen && <TimerSheet ct={ct} onClose={() => setTimerOpen(false)} />}
      {openEx && <ExerciseSheet exercise={openEx} onClose={() => setOpenEx(null)} />}
      {summary && <SummaryModal {...summary} onClose={() => setSummary(null)} />}
    </div>
  )
}
