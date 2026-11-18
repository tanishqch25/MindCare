import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Footprints,
  Maximize2,
  Shield,
  Sparkles,
} from 'lucide-react'
import GameShell from './GameShell'

const MIRROR_PUZZLES = [
  {
    icon: Compass,
    targetTransform: 'rotate-12',
    options: [
      { transform: '-scale-x-100 rotate-12', isMirror: true },
      { transform: 'rotate-12', isMirror: false }, // merely copied
      { transform: '-scale-y-100 rotate-12', isMirror: false }, // vertical flip
    ],
  },
  {
    icon: Footprints,
    targetTransform: 'rotate-45',
    options: [
      { transform: 'rotate-45', isMirror: false },
      { transform: '-scale-x-100 rotate-45', isMirror: true },
      { transform: '-scale-y-100 rotate-45', isMirror: false },
    ],
  },
  {
    icon: Shield,
    targetTransform: 'skew-x-6 rotate-12',
    options: [
      { transform: 'skew-x-6 rotate-12', isMirror: false },
      { transform: '-scale-y-100 rotate-12', isMirror: false },
      { transform: '-scale-x-100 skew-x-6 rotate-12', isMirror: true },
    ],
  },
  {
    icon: Sparkles,
    targetTransform: 'rotate-45 scale-90',
    options: [
      { transform: '-scale-x-100 rotate-45 scale-90', isMirror: true },
      { transform: 'rotate-45 scale-90', isMirror: false },
      { transform: '-scale-y-100 rotate-45 scale-90', isMirror: false },
    ],
  },
]

export default function MirrorImageGame({ onBack }) {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState('')

  const current = MIRROR_PUZZLES[puzzleIdx]
  const Icon = current.icon

  const startNewGame = () => {
    setPuzzleIdx(0)
    setScore(0)
    setIsCompleted(false)
    setFeedback('')
  }

  const handleSelectOption = (isMirror) => {
    if (isCompleted) return

    if (isMirror) {
      setScore((s) => s + 1)
      setFeedback('✓ Accurate mirror reflection identified!')
    } else {
      setFeedback('That was not the true horizontal reflection.')
    }

    setTimeout(() => {
      setFeedback('')
      if (puzzleIdx + 1 < MIRROR_PUZZLES.length) {
        setPuzzleIdx((p) => p + 1)
      } else {
        setIsCompleted(true)
      }
    }, 850)
  }

  return (
    <GameShell
      title="Mirror Image"
      category="Speed and spatial skills"
      description="Identify the true horizontal reflection of the shape as it would appear in a mirror."
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      stats={[
        { label: 'Puzzle', value: `${puzzleIdx + 1} / ${MIRROR_PUZZLES.length}`, icon: Maximize2 },
        { label: 'Score', value: `${score} / ${MIRROR_PUZZLES.length}`, icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Reflections Examined', value: `${MIRROR_PUZZLES.length} of ${MIRROR_PUZZLES.length}` },
        { label: 'Mirror Recognition', value: `${Math.round((score / MIRROR_PUZZLES.length) * 100)}%` },
      ]}
    >
      <div className="flex flex-col items-center">
        {/* Mirror Stage */}
        <div className="flex items-center justify-center gap-6 rounded-3xl border border-line bg-white p-7 shadow-soft max-w-sm w-full mb-6">
          {/* Target side */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
              Original
            </span>
            <div className={`grid h-16 w-16 place-items-center rounded-2xl bg-mint text-teal ${current.targetTransform}`}>
              <Icon size={32} strokeWidth={2.2} />
            </div>
          </div>

          {/* Mirror Axis Line */}
          <div className="flex flex-col items-center h-20 justify-center">
            <div className="h-full border-r-2 border-dashed border-teal/50" />
            <span className="text-[9px] font-semibold uppercase text-teal mt-1">Mirror</span>
          </div>

          {/* Question placeholder */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
              Reflection
            </span>
            <div className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-dashed border-teal bg-mint/20 text-teal font-bold text-lg animate-pulse">
              ?
            </div>
          </div>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
          Which option is the true horizontal mirror image?
        </p>

        {/* 3 Choices */}
        <div className="grid grid-cols-3 gap-3.5 sm:gap-4 w-full max-w-md">
          {current.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt.isMirror)}
              aria-label={`Choice ${idx + 1}`}
              className="flex flex-col items-center justify-center aspect-square rounded-2xl border border-line bg-white p-3 shadow-soft hover:border-teal hover:scale-105 active:scale-95 transition"
            >
              <div className={`grid h-14 w-14 place-items-center rounded-xl bg-[#faf8ee] text-ink ${opt.transform}`}>
                <Icon size={28} strokeWidth={2.2} />
              </div>
              <span className="mt-2 text-[10px] font-semibold text-muted">Choice {idx + 1}</span>
            </button>
          ))}
        </div>

        {feedback && (
          <p role="status" className="mt-4 text-xs font-semibold text-teal animate-fadeIn">
            {feedback}
          </p>
        )}
      </div>
    </GameShell>
  )
}
