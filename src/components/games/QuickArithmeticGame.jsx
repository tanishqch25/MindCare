import { useState } from 'react'
import { Calculator, CheckCircle2 } from 'lucide-react'
import GameShell from './GameShell'

const MATH_QUESTIONS = [
  { equation: '14 + 18 = ?', answer: 32, options: [30, 32, 34, 28] },
  { equation: '50 − 16 = ?', answer: 34, options: [32, 34, 36, 38] },
  { equation: '7 × 6 = ?', answer: 42, options: [40, 42, 44, 48] },
  { equation: '36 ÷ 4 = ?', answer: 9, options: [7, 8, 9, 12] },
  { equation: '25 + 27 = ?', answer: 52, options: [50, 52, 54, 48] },
]

export default function QuickArithmeticGame({ onBack }) {
  const [qIdx, setQIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState('')

  const current = MATH_QUESTIONS[qIdx]

  const startNewGame = () => {
    setQIdx(0)
    setScore(0)
    setIsCompleted(false)
    setFeedback('')
  }

  const handleSelect = (choice) => {
    if (isCompleted) return

    if (choice === current.answer) {
      setScore((s) => s + 1)
      setFeedback('✓ Accurate calculation!')
    } else {
      setFeedback(`Not quite — the answer was ${current.answer}`)
    }

    setTimeout(() => {
      setFeedback('')
      if (qIdx + 1 < MATH_QUESTIONS.length) {
        setQIdx((q) => q + 1)
      } else {
        setIsCompleted(true)
      }
    }, 700)
  }

  return (
    <GameShell
      title="Quick Arithmetic"
      category="Language and problem-solving"
      description="Practice gentle mental arithmetic calculations at your own comfortable pace."
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      stats={[
        { label: 'Problem', value: `${qIdx + 1} / ${MATH_QUESTIONS.length}`, icon: Calculator },
        { label: 'Score', value: `${score} / ${MATH_QUESTIONS.length}`, icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Problems Solved', value: `${MATH_QUESTIONS.length} of ${MATH_QUESTIONS.length}` },
        { label: 'Arithmetic Accuracy', value: `${Math.round((score / MATH_QUESTIONS.length) * 100)}%` },
      ]}
    >
      <div className="flex flex-col items-center">
        {/* Equation Display Box */}
        <div className="flex flex-col items-center justify-center rounded-3xl border border-line bg-white p-8 shadow-soft w-full max-w-sm mb-6 text-center">
          <span className="text-[11px] font-semibold text-teal uppercase tracking-wider">
            Calculation {qIdx + 1} of {MATH_QUESTIONS.length}
          </span>
          <p className="mt-4 font-mono text-3xl font-bold tracking-tight text-ink">{current.equation}</p>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
          Choose the correct result:
        </p>

        {/* 4 Choices */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {current.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              className="rounded-2xl border border-line bg-white py-3.5 text-center font-mono text-base font-bold text-ink shadow-soft hover:border-teal hover:bg-[#faf8ee] hover:scale-105 active:scale-95 transition"
            >
              {opt}
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
