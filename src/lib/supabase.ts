import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = url && key ? createClient(url, key) : null

export interface WorkoutLog {
  workout_date: string
  day_key: string
  title: string
  completed_exercises: string[]
  duration_minutes: number
  is_lazy_mode: boolean
}

const LS_KEY = 'coral_workout_logs'

/** Saves to Supabase; falls back to localStorage when unconfigured or on error. */
export async function saveWorkoutLog(log: WorkoutLog): Promise<'supabase' | 'local'> {
  if (supabase) {
    const { error } = await supabase.from('workout_logs').insert(log)
    if (!error) return 'supabase'
    console.warn('Supabase insert failed, falling back to localStorage:', error.message)
  }
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
    all.push({ ...log, created_at: new Date().toISOString() })
    localStorage.setItem(LS_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
  return 'local'
}
