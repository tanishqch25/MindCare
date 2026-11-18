import { useState } from 'react'
import { CheckCircle2, Circle, Palette, Shuffle, Square, Star, Triangle } from 'lucide-react'
import GameShell from './GameShell'

const SHAPES = [
  { name: 'Circle', icon: Circle },
  { name: 'Square', icon: Square },
  { name: 'Triangle', icon: Triangle },
  { name: 'Star', icon: Star },
]

const COLORS = [
  { name: 'Teal', bg: 'bg-teal', text: 'text-teal' },
  { name: 'Gold', bg: 'bg-[#C4BF71]', text: 'text-[#716F32]' },
  { name: 'Rose', bg: 'bg-rose-400', text: 'text-rose-600' },
]

export default function ColorShapeSortGame({ onBack }) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState('')

  // Generate 8 trials with shifting rules
  const trials = [
    { rule: 'COLOR', targetColor: 'Teal', shape: 'Circle', color: 'Teal' },
    { rule: 'COLOR', targetColor: 'Teal', shape: 'Square', color: 'Gold' },
    { rule: 'SHAPE', targetShape: 'Square', shape: 'Square', color: 'Teal' },
    { rule: 'SHAPE', targetShape: 'Square', shape: 'Triangle', color: 'Teal' },
    { rule: 'COLOR', targetColor: 'Gold', shape: 'Star', color: 'Gold' },
    { rule: 'COLOR', targetColor: 'Gold', shape: 'Circle', color: 'Rose' },
    { rule: 'SHAPE', targetShape: 'Circle', shape: 'Circle', color: 'Rose' },
    { rule: 'SHAPE', targetShape: 'Circle', shape: 'Triangle', color: 'Gold' },
  ]

  const currentTrial = trials[round]

  const startNewGame = () => {
    setRound(0)
    setScore(0)
    setIsCompleted(false)
    setFeedback('')
  }

  const handleSortChoice = (choiceMatchesRule) => {
    if (isCompleted) return

    // Determine correct answer: Does item match target?
    const isTargetItem =
      currentTrial.rule === 'COLOR'
        ? currentTrial.color === currentTrial.targetColor
        : currentTrial.shape === currentTrial.targetShape

    const isCorrect = choiceMatchesRule === isTargetItem

    if (isCorrect) {
      setScore((s) => s + 1)
      setFeedback('✓ Correct sort!')
    } else {
      setFeedback('Missed rule match')
    }

    setTimeout(() => {
      setFeedback('')
      if (round + 1 < trials.length) {
        setRound((r) => r + 1)
      } else {
        setIsCompleted(true)
      }
    }, 700)
  }

  const ShapeIcon =
    SHAPES.find((s) => s.name === currentTrial.shape)?.icon || Circle
  const colorDef =
    COLORS.find((c) => c.name === currentTrial.color) || COLORS[0]

  return (
    <GameShell
      title="Color and Shape Sort"
      category="Attention and focus"
      description="Categorize objects based on the dynamic rule. Pay attention when the rule switches!"
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      stats={[
        { label: 'Trial', value: `${round + 1} / ${trials.length}`, icon: Shuffle },
        { label: 'Score', value: `${score} / ${trials.length}`, icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Trials Sorted', value: `${trials.length} of ${trials.length}` },
        { label: 'Accuracy', value: `${Math.round((score / trials.length) * 100)}%` },
      ]}
    >
      <div className="flex flex-col items-center">
        {/* Dynamic rule pill */}
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-line bg-mint/50 px-5 py-2.5 text-teal shadow-soft">
          <Palette size={18} />
          <span className="text-xs font-semibold">
            ACTIVE RULE:{' '}
            <span className="font-bold uppercase tracking-wider">
              {currentTrial.rule === 'COLOR'
                ? `Is this item ${currentTrial.targetColor}?`
                : `Is this item a ${currentTrial.targetShape}?`}
            </span>
          </span>
        </div>

        {/* Current item card */}
        <div className="flex flex-col items-center justify-center rounded-3xl border border-line bg-white p-8 shadow-soft w-56 aspect-square mb-6">
          <span className={`grid h-20 w-20 place-items-center rounded-2xl ${colorDef.bg} text-white shadow-sm`}>
            <ShapeIcon size={44} strokeWidth={2.5} fill="currentColor" />
          </span>
          <span className="mt-4 text-xs font-semibold text-ink">
            {currentTrial.color} {currentTrial.shape}
          </span>
        </div>

        {/* Binary Sort Action Buttons */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <button
            onClick={() => handleSortChoice(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3.5 text-xs font-semibold text-white shadow-soft hover:bg-teal-700 active:scale-95 transition"
          >
            YES (Matches rule)
          </button>
          <button
            onClick={() => handleSortChoice(false)}
            className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 py-3.5 text-xs font-semibold text-ink shadow-soft hover:bg-[#faf8ee] active:scale-95 transition"
          >
            NO (Does not match)
          </button>
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
