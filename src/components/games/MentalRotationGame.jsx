import { useState } from 'react'
import { CheckCircle2, Move, Navigation, Shield, Star, Triangle } from 'lucide-react'
import GameShell from './GameShell'

// Each puzzle has a base SVG/Icon representation, rotation degrees, and mirrored distractors
const ROTATION_PUZZLES = [
  {
    title: 'Pointer Arrow',
    targetRotation: 'rotate-0',
    options: [
      { label: 'Option A (Rotated 90°)', rotation: 'rotate-90', isMatch: true },
      { label: 'Option B (Mirrored Left)', rotation: '-scale-x-100 rotate-0', isMatch: false },
      { label: 'Option C (Mirrored Inverted)', rotation: '-scale-y-100 rotate-90', isMatch: false },
    ],
  },
  {
    title: 'Compass Wedge',
    targetRotation: 'rotate-45',
    options: [
      { label: 'Option A (Mirrored)', rotation: '-scale-x-100 rotate-45', isMatch: false },
      { label: 'Option B (Rotated 180°)', rotation: 'rotate-[225deg]', isMatch: true },
      { label: 'Option C (Inverted)', rotation: '-scale-y-100 rotate-0', isMatch: false },
    ],
  },
  {
    title: 'Angular Crest',
    targetRotation: 'rotate-0',
    options: [
      { label: 'Option A (Rotated 270°)', rotation: 'rotate-[270deg]', isMatch: true },
      { label: 'Option B (Flipped Horizontal)', rotation: '-scale-x-100 rotate-90', isMatch: false },
      { label: 'Option C (Flipped Diagonal)', rotation: '-scale-x-100 -scale-y-100 rotate-45', isMatch: false },
    ],
  },
  {
    title: 'Chevron Shield',
    targetRotation: 'rotate-90',
    options: [
      { label: 'Option A (Mirrored Horizontal)', rotation: '-scale-x-100 rotate-90', isMatch: false },
      { label: 'Option B (Mirrored Vertical)', rotation: '-scale-y-100 rotate-0', isMatch: false },
      { label: 'Option C (Rotated 180°)', rotation: 'rotate-[270deg]', isMatch: true },
    ],
  },
]

export default function MentalRotationGame({ onBack }) {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState('')

  const current = ROTATION_PUZZLES[puzzleIdx]

  const startNewGame = () => {
    setPuzzleIdx(0)
    setScore(0)
    setIsCompleted(false)
    setFeedback('')
  }

  const handleSelectOption = (isMatch) => {
    if (isCompleted) return

    if (isMatch) {
      setScore((s) => s + 1)
      setFeedback('✓ Accurate spatial rotation match!')
    } else {
      setFeedback('That was a mirrored reflection, not a pure rotation.')
    }

    setTimeout(() => {
      setFeedback('')
      if (puzzleIdx + 1 < ROTATION_PUZZLES.length) {
        setPuzzleIdx((p) => p + 1)
      } else {
        setIsCompleted(true)
      }
    }, 850)
  }

  return (
    <GameShell
      title="Mental Rotation"
      category="Speed and spatial skills"
      description="Mentally rotate the target shape to identify which option is the same shape in a new angle."
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      stats={[
        { label: 'Shape', value: `${puzzleIdx + 1} / ${ROTATION_PUZZLES.length}`, icon: Move },
        { label: 'Score', value: `${score} / ${ROTATION_PUZZLES.length}`, icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Shapes Examined', value: `${ROTATION_PUZZLES.length} of ${ROTATION_PUZZLES.length}` },
        { label: 'Spatial Accuracy', value: `${Math.round((score / ROTATION_PUZZLES.length) * 100)}%` },
      ]}
    >
      <div className="flex flex-col items-center">
        {/* Target Shape Box */}
        <div className="flex flex-col items-center justify-center rounded-3xl border border-line bg-white p-6 shadow-soft w-48 aspect-square mb-6">
          <span className="text-[10px] font-semibold text-teal uppercase tracking-wider mb-3">
            Target Shape
          </span>
          <div className={`grid h-16 w-16 place-items-center rounded-2xl bg-mint text-teal transform ${current.targetRotation}`}>
            <Navigation size={32} strokeWidth={2.5} fill="currentColor" />
          </div>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
          Which option is the SAME shape rotated (not mirrored)?
        </p>

        {/* 3 Options */}
        <div className="grid grid-cols-3 gap-3.5 sm:gap-4 w-full max-w-md">
          {current.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt.isMatch)}
              aria-label={`Option ${idx + 1}`}
              className="flex flex-col items-center justify-center aspect-square rounded-2xl border border-line bg-white p-3 shadow-soft hover:border-teal hover:scale-105 active:scale-95 transition"
            >
              <div className={`grid h-14 w-14 place-items-center rounded-xl bg-[#faf8ee] text-ink transform ${opt.rotation}`}>
                <Navigation size={28} strokeWidth={2.2} fill="currentColor" />
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
