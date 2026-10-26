import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Cloud,
  Heart,
  Leaf,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Smile,
  Sparkles,
  Sun,
  Target,
  Trophy,
} from 'lucide-react'
import { supabase, supabaseConfigured } from '../supabaseClient'

const CARD_SYMBOLS = [
  { pairId: 'leaf', label: 'Leaf', icon: Leaf, tint: 'bg-[#f1f0df] text-[#6A6F34]' },
  { pairId: 'sun', label: 'Sun', icon: Sun, tint: 'bg-[#f5efda] text-[#807846]' },
  { pairId: 'heart', label: 'Heart', icon: Heart, tint: 'bg-mint text-teal' },
  { pairId: 'sparkles', label: 'Sparkles', icon: Sparkles, tint: 'bg-[#eeecd9] text-[#6A6F34]' },
  { pairId: 'cloud', label: 'Cloud', icon: Cloud, tint: 'bg-sky/30 text-sky-700' },
  { pairId: 'smile', label: 'Smile', icon: Smile, tint: 'bg-mint text-teal' },
]

function createShuffledDeck() {
  const deck = []
  CARD_SYMBOLS.forEach((sym) => {
    deck.push({ id: `${sym.pairId}-a`, pairId: sym.pairId, label: sym.label, icon: sym.icon, tint: sym.tint })
    deck.push({ id: `${sym.pairId}-b`, pairId: sym.pairId, label: sym.label, icon: sym.icon, tint: sym.tint })
  })

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = deck[i]
    deck[i] = deck[j]
    deck[j] = temp
  }
  return deck
}

function formatTimer(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function formatFriendlyDuration(totalSeconds) {
  if (totalSeconds < 60) {
    return `${totalSeconds} seconds`
  }
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes} min`
}

export default function MemoryMatchGame({ onBack, onComplete }) {
  const [cards, setCards] = useState(() => createShuffledDeck())
  const [flippedIds, setFlippedIds] = useState([])
  const [matchedPairs, setMatchedPairs] = useState([])
  const [moves, setMoves] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  // Supabase save states
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error' | 'demo'
  const [saveError, setSaveError] = useState('')
  const hasSavedRef = useRef(false)
  const timerRef = useRef(null)

  // Start timer when game starts and stop when completed
  useEffect(() => {
    if (gameStarted && !isCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [gameStarted, isCompleted])

  // Save exercise session to Supabase
  const saveSession = useCallback(
    async (finalSeconds) => {
      if (hasSavedRef.current) return
      hasSavedRef.current = true

      // Calculate estimated minutes (between 1 and 30 to comply with DB check constraint)
      const durationMinutes = Math.max(1, Math.min(30, Math.ceil(finalSeconds / 60)))

      if (!supabaseConfigured) {
        setSaveStatus('demo')
        return
      }

      setSaveStatus('saving')
      setSaveError('')
      try {
        const { error } = await supabase.from('exercise_sessions').insert({
          exercise_key: 'memory-match',
          duration_minutes: durationMinutes,
        })

        if (error) {
          setSaveStatus('error')
          setSaveError(error.message || 'Could not save session.')
          hasSavedRef.current = false // Allow retry
        } else {
          setSaveStatus('saved')
          if (onComplete) onComplete()
        }
      } catch (err) {
        setSaveStatus('error')
        setSaveError(err.message || 'Network error saving session.')
        hasSavedRef.current = false
      }
    },
    [onComplete]
  )

  // Handle card click
  const handleCardClick = (card) => {
    if (isChecking) return
    if (isCompleted) return
    if (matchedPairs.includes(card.pairId)) return
    if (flippedIds.includes(card.id)) return

    // Start timer on first card interaction
    if (!gameStarted) {
      setGameStarted(true)
    }

    if (flippedIds.length === 0) {
      // First card chosen
      setFlippedIds([card.id])
    } else if (flippedIds.length === 1) {
      // Second card chosen
      const firstCardId = flippedIds[0]
      const firstCard = cards.find((c) => c.id === firstCardId)
      setFlippedIds([firstCardId, card.id])
      setMoves((m) => m + 1)

      if (firstCard && firstCard.pairId === card.pairId) {
        // MATCH!
        const newMatched = [...matchedPairs, card.pairId]
        setMatchedPairs(newMatched)
        setFlippedIds([])

        // Check if all pairs matched
        if (newMatched.length === CARD_SYMBOLS.length) {
          setIsCompleted(true)
          clearInterval(timerRef.current)
          const finalDuration = elapsedSeconds + 1
          setElapsedSeconds(finalDuration)
          saveSession(finalDuration)
        }
      } else {
        // NO MATCH -> flip back after a brief pause
        setIsChecking(true)
        setTimeout(() => {
          setFlippedIds([])
          setIsChecking(false)
        }, 900)
      }
    }
  }

  // Restart game
  const handleRestart = () => {
    clearInterval(timerRef.current)
    setCards(createShuffledDeck())
    setFlippedIds([])
    setMatchedPairs([])
    setMoves(0)
    setElapsedSeconds(0)
    setGameStarted(false)
    setIsCompleted(false)
    setIsChecking(false)
    setSaveStatus('idle')
    setSaveError('')
    hasSavedRef.current = false
  }

  return (
    <div className="mx-auto max-w-3xl pb-10">
      {/* Navigation and Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="group mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition"
          >
            <ArrowLeft size={15} className="transition group-hover:-translate-x-0.5" />
            Back to all exercises
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Memory Match</h2>
            <span className="rounded-full bg-mint px-2.5 py-0.5 text-[10px] font-semibold text-teal uppercase tracking-wider">
              Recall Practice
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Flip cards to find matching wellness symbols. Play gently at your own pace.
          </p>
        </div>
        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-semibold text-muted hover:bg-[#fbf9f0] hover:text-ink shadow-sm transition"
        >
          <RotateCcw size={14} /> Restart
        </button>
      </div>

      {/* Screen Reader Announcements */}
      <div aria-live="polite" className="sr-only">
        {isCompleted
          ? `Game completed in ${moves} moves and ${formatTimer(elapsedSeconds)}.`
          : `Matched ${matchedPairs.length} of ${CARD_SYMBOLS.length} pairs. ${moves} moves taken.`}
      </div>

      {/* Live Stats Bar */}
      <div className="mb-5 grid grid-cols-3 gap-3 rounded-2xl border border-line bg-white p-4 shadow-soft sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-mint text-teal">
            <Clock3 size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Time</p>
            <p className="font-mono text-sm font-bold text-ink">{formatTimer(elapsedSeconds)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#eeecd9] text-[#6A6F34]">
            <Target size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Moves</p>
            <p className="font-mono text-sm font-bold text-ink">{moves}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f5efda] text-[#807846]">
            <Sparkles size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Matched</p>
            <p className="font-mono text-sm font-bold text-ink">
              {matchedPairs.length} / {CARD_SYMBOLS.length}
            </p>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative">
        <div
          role="region"
          aria-label="Memory match card board"
          className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4"
        >
          {cards.map((card, index) => {
            const isFlipped = flippedIds.includes(card.id)
            const isMatched = matchedPairs.includes(card.pairId)
            const isFaceUp = isFlipped || isMatched
            const Icon = card.icon

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card)}
                disabled={isMatched || isChecking || isCompleted}
                aria-label={`Card ${index + 1}: ${isFaceUp ? card.label : 'Face down'}${isMatched ? ', matched' : ''}`}
                aria-pressed={isFaceUp}
                className={`relative flex aspect-[4/5] sm:aspect-square flex-col items-center justify-center rounded-2xl border p-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 ${
                  isMatched
                    ? 'border-teal bg-mint/40 shadow-none cursor-default'
                    : isFlipped
                    ? 'border-teal bg-white shadow-soft scale-[1.02]'
                    : 'border-line bg-white shadow-soft hover:-translate-y-0.5 hover:border-teal/40 hover:bg-[#faf8ee] cursor-pointer'
                }`}
              >
                {isFaceUp ? (
                  <div className="flex flex-col items-center justify-center animate-fadeIn">
                    <span className={`grid h-12 w-12 place-items-center rounded-xl ${card.tint} sm:h-14 sm:w-14`}>
                      <Icon size={26} strokeWidth={2} />
                    </span>
                    <span className="mt-2 text-[11px] font-semibold tracking-tight text-ink sm:text-xs">
                      {card.label}
                    </span>
                    {isMatched && (
                      <span className="mt-1 flex items-center gap-0.5 text-[9px] font-medium text-teal">
                        <CheckCircle2 size={10} /> Matched
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted/30">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f7f5e7] text-[#9a985c]/60">
                      <Sparkles size={18} />
                    </div>
                    <span className="mt-2 text-[10px] font-medium text-muted/60">Tap to flip</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Completion Modal / Overlay */}
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
                You matched all {CARD_SYMBOLS.length} pairs. Taking a gentle pause for focus and recall is a great daily habit.
              </p>

              {/* Stats Review */}
              <div className="my-5 grid grid-cols-2 gap-3 rounded-2xl border border-line bg-[#fbf9f0] p-4 text-left">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Total Time</p>
                  <p className="mt-0.5 font-mono text-base font-bold text-ink">
                    {formatFriendlyDuration(elapsedSeconds)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Moves</p>
                  <p className="mt-0.5 font-mono text-base font-bold text-ink">{moves} moves</p>
                </div>
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
                  onClick={handleRestart}
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
            MindCare AI memory exercises are designed for mindful relaxation and casual practice. They do not diagnose, assess, or treat cognitive or medical conditions.
          </p>
        </div>
      </div>
    </div>
  )
}
