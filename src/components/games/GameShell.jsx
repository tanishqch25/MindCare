import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Trophy,
} from 'lucide-react'
import { supabase, supabaseConfigured } from '../../supabaseClient'

function formatTimer(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function formatFriendlyDuration(totalSeconds) {
  if (totalSeconds < 60) return `${totalSeconds} seconds`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes} min`
}

export default function GameShell({
  title,
  category,
  description,
  dbKey = 'focus-flow',
  isCompleted,
  onRestart,
  onBack,
  stats = [],
  completionStats = [],
  difficulty,
  onDifficultyChange,
  difficulties = ['Gentle', 'Moderate', 'Challenging'],
  children,
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(true)
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error' | 'demo'
  const [saveError, setSaveError] = useState('')
  const hasSavedRef = useRef(false)
  const timerRef = useRef(null)

  // Timer loop
  useEffect(() => {
    if (timerRunning && !isCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timerRunning, isCompleted])

  // Save exercise session on completion
  const saveSession = useCallback(
    async (finalSeconds) => {
      if (hasSavedRef.current) return
      hasSavedRef.current = true

      const durationMinutes = Math.max(1, Math.min(30, Math.ceil(finalSeconds / 60)))

      if (!supabaseConfigured) {
        setSaveStatus('demo')
        return
      }

      setSaveStatus('saving')
      setSaveError('')
      try {
        const { error } = await supabase.from('exercise_sessions').insert({
          exercise_key: dbKey,
          duration_minutes: durationMinutes,
        })

        if (error) {
          setSaveStatus('error')
          setSaveError(error.message || 'Could not save session.')
          hasSavedRef.current = false // Allow retry
        } else {
          setSaveStatus('saved')
        }
      } catch (err) {
        setSaveStatus('error')
        setSaveError(err.message || 'Network error saving session.')
        hasSavedRef.current = false
      }
    },
    [dbKey]
  )

  useEffect(() => {
    if (isCompleted) {
      setTimerRunning(false)
      saveSession(elapsedSeconds)
    }
  }, [isCompleted, elapsedSeconds, saveSession])

  const handleInternalRestart = () => {
    setElapsedSeconds(0)
    setTimerRunning(true)
    setSaveStatus('idle')
    setSaveError('')
    hasSavedRef.current = false
    if (onRestart) onRestart()
  }

  return (
    <div className="mx-auto max-w-3xl pb-10">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="group mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition"
          >
            <ArrowLeft size={15} className="transition group-hover:-translate-x-0.5" />
            Back to all exercises
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
            {category && (
              <span className="rounded-full bg-mint px-2.5 py-0.5 text-[10px] font-semibold text-teal uppercase tracking-wider">
                {category}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          {difficulties && onDifficultyChange && (
            <div className="flex rounded-xl border border-line bg-white p-1 shadow-sm text-xs">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => onDifficultyChange(diff)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                    difficulty === diff ? 'bg-mint text-teal font-semibold' : 'text-muted hover:text-ink'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleInternalRestart}
            aria-label="Restart exercise"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-semibold text-muted hover:bg-[#fbf9f0] hover:text-ink shadow-sm transition"
          >
            <RotateCcw size={14} /> Restart
          </button>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 shadow-soft sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-mint text-teal">
            <Clock3 size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Time</p>
            <p className="font-mono text-sm font-bold text-ink">{formatTimer(elapsedSeconds)}</p>
          </div>
        </div>

        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="flex items-center gap-2.5">
              {Icon && (
                <span className={`grid h-8 w-8 place-items-center rounded-lg ${stat.tint || 'bg-[#eeecd9] text-teal'}`}>
                  <Icon size={16} />
                </span>
              )}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{stat.label}</p>
                <p className="font-mono text-sm font-bold text-ink">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Interactive Board / Content Area */}
      <div className="relative min-h-[300px]">
        {children}

        {/* Completion Modal */}
        {isCompleted && (
          <div
            role="dialog"
            aria-labelledby="completion-title"
            className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-ink/30 backdrop-blur-sm p-4 animate-fadeIn"
          >
            <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-soft text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint text-teal shadow-soft">
                <Trophy size={28} />
              </div>
              <h3 id="completion-title" className="mt-4 text-xl font-bold tracking-tight text-ink sm:text-2xl">
                Exercise Complete!
              </h3>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">
                Well done! Taking mindful time for focus and mental agility is a wonderful daily habit.
              </p>

              {/* Stats Review */}
              <div className="my-5 grid grid-cols-2 gap-3 rounded-2xl border border-line bg-[#fbf9f0] p-4 text-left">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Total Time</p>
                  <p className="mt-0.5 font-mono text-base font-bold text-ink">
                    {formatFriendlyDuration(elapsedSeconds)}
                  </p>
                </div>
                {completionStats.map((cStat, i) => (
                  <div key={i}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{cStat.label}</p>
                    <p className="mt-0.5 font-mono text-base font-bold text-ink">{cStat.value}</p>
                  </div>
                ))}
              </div>

              {/* Save Status Notification */}
              <div className="mb-6">
                {saveStatus === 'saving' && (
                  <p className="inline-flex items-center gap-2 text-xs font-medium text-muted">
                    <Loader2 size={14} className="animate-spin text-teal" />
                    Saving session to your progress…
                  </p>
                )}
                {saveStatus === 'saved' && (
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-teal bg-mint/50 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 size={14} />
                    Saved to your exercise progress!
                  </p>
                )}
                {saveStatus === 'demo' && (
                  <p className="text-[11px] leading-5 text-muted bg-[#f7f5e7] px-3 py-2 rounded-xl">
                    <span className="font-semibold text-ink">Demo mode:</span> Completed! Connect Supabase to save sessions to your personal progress.
                  </p>
                )}
                {saveStatus === 'error' && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
                    <p>{saveError || 'Could not save session to Supabase.'}</p>
                    <button
                      onClick={() => saveSession(elapsedSeconds)}
                      className="mt-1.5 font-semibold text-teal underline"
                    >
                      Try saving again
                    </button>
                  </div>
                )}
              </div>

              {/* Completion Actions */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={handleInternalRestart}
                  className="flex-1 rounded-xl bg-teal px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition"
                >
                  Play again
                </button>
                <button
                  onClick={onBack}
                  className="flex-1 rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink hover:bg-[#fbf9f0] transition"
                >
                  Back to exercises
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Non-Diagnostic Disclaimer */}
      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-4 text-xs">
        <span className="mt-0.5 text-teal">
          <ShieldCheck size={18} />
        </span>
        <div>
          <p className="font-semibold text-ink">Recreational wellness activity</p>
          <p className="mt-1 text-[11px] leading-5 text-muted">
            MindCare AI cognitive exercises are designed for mindful relaxation and casual engagement. They do not diagnose, assess, or treat cognitive or medical conditions.
          </p>
        </div>
      </div>
    </div>
  )
}
