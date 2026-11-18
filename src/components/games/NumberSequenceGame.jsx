import { useState } from 'react'
import { CheckCircle2, Hash } from 'lucide-react'
import GameShell from './GameShell'

const SEQUENCES = [
  { numbers: [3, 6, 9, 12], answer: 15, options: [14, 15, 16, 18], rule: 'Add 3' },
  { numbers: [20, 16, 12, 8], answer: 4, options: [2, 4, 6, 5], rule: 'Subtract 4' },
  { numbers: [2, 4, 8, 16], answer: 32, options: [24, 28, 30, 32], rule: 'Multiply by 2' },
  { numbers: [1, 4, 9, 16], answer: 25, options: [20, 24, 25, 36], rule: 'Square numbers' },
  { numbers: [5, 10, 20, 40], answer: 80, options: [60, 70, 75, 80], rule: 'Double each step' },
]

export default function NumberSequenceGame({ onBack }) {
  const [seqIdx, setSeqIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState('')

  const current = SEQUENCES[seqIdx]

  const startNewGame = () => {
    setSeqIdx(0)
    setScore(0)
    setIsCompleted(false)
    setFeedback('')
  }

  const handleSelect = (val) => {
    if (isCompleted) return

    if (val === current.answer) {
      setScore((s) => s + 1)
      setFeedback(`✓ Correct! Rule: ${current.rule}`)
    } else {
      setFeedback(`Not quite — the answer was ${current.answer}`)
    }

    setTimeout(() => {
      setFeedback('')
      if (seqIdx + 1 < SEQUENCES.length) {
        setSeqIdx((s) => s + 1)
      } else {
        setIsCompleted(true)
      }
    }, 900)
  }

  return (
    <GameShell
      title="Number Sequence"
      category="Logic and reasoning"
      description="Find the logical mathematical pattern and identify the missing number."
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      stats={[
        { label: 'Puzzle', value: `${seqIdx + 1} / ${SEQUENCES.length}`, icon: Hash },
        { label: 'Score', value: `${score} / ${SEQUENCES.length}`, icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Puzzles Solved', value: `${SEQUENCES.length} of ${SEQUENCES.length}` },
        { label: 'Accuracy', value: `${Math.round((score / SEQUENCES.length) * 100)}%` },
      ]}
    >
      <div className="flex flex-col items-center">
        {/* Sequence Numbers Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 rounded-3xl border border-line bg-white p-6 shadow-soft w-full max-w-lg mb-8">
          {current.numbers.map((num, i) => (
            <div
              key={i}
              className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-[#faf8ee] border border-line text-ink font-mono text-lg font-bold"
            >
              {num}
            </div>
          ))}

          {/* Missing Box */}
          <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl border-2 border-dashed border-teal bg-mint/30 text-teal font-mono text-lg font-bold animate-pulse">
            ?
          </div>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
          Select the next number in this sequence:
        </p>

        {/* 4 Choices */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-md">
          {current.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(option)}
              className="rounded-2xl border border-line bg-white py-3.5 text-center font-mono text-base font-bold text-ink shadow-soft hover:border-teal hover:bg-[#faf8ee] hover:scale-105 active:scale-95 transition"
            >
              {option}
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
