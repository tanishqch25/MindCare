import { useState } from 'react'
import {
  CheckCircle2,
  Circle,
  Diamond,
  Grid,
  Hexagon,
  Square,
  Star,
  Triangle,
} from 'lucide-react'
import GameShell from './GameShell'

const PATTERNS = [
  {
    sequence: [Circle, Square, Circle, Square],
    options: [Circle, Triangle, Star, Hexagon],
    answerIndex: 0, // Circle
    ruleDesc: 'Alternating: Circle, Square, Circle, Square…',
  },
  {
    sequence: [Triangle, Triangle, Star, Triangle, Triangle],
    options: [Star, Square, Circle, Diamond],
    answerIndex: 0, // Star
    ruleDesc: 'Two Triangles, then One Star…',
  },
  {
    sequence: [Square, Diamond, Hexagon, Square, Diamond],
    options: [Hexagon, Circle, Triangle, Star],
    answerIndex: 0, // Hexagon
    ruleDesc: 'Cycle of three: Square, Diamond, Hexagon…',
  },
  {
    sequence: [Circle, Diamond, Circle, Diamond],
    options: [Circle, Star, Triangle, Square],
    answerIndex: 0, // Circle
    ruleDesc: 'Alternating shapes…',
  },
]

export default function PatternCompletionGame({ onBack }) {
  const [patternIdx, setPatternIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState('')

  const currentPattern = PATTERNS[patternIdx]

  const startNewGame = () => {
    setPatternIdx(0)
    setScore(0)
    setIsCompleted(false)
    setFeedback('')
  }

  const handleSelectOption = (idx) => {
    if (isCompleted) return

    if (idx === currentPattern.answerIndex) {
      setScore((s) => s + 1)
      setFeedback('✓ Pattern solved!')
    } else {
      setFeedback('Not this piece')
    }

    setTimeout(() => {
      setFeedback('')
      if (patternIdx + 1 < PATTERNS.length) {
        setPatternIdx((p) => p + 1)
      } else {
        setIsCompleted(true)
      }
    }, 700)
  }

  return (
    <GameShell
      title="Pattern Completion"
      category="Logic and reasoning"
      description="Inspect the sequence of shapes to identify the rule, then pick what comes next."
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      stats={[
        { label: 'Pattern', value: `${patternIdx + 1} / ${PATTERNS.length}`, icon: Grid },
        { label: 'Score', value: `${score} / ${PATTERNS.length}`, icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Patterns Completed', value: `${PATTERNS.length} of ${PATTERNS.length}` },
        { label: 'Reasoning Score', value: `${Math.round((score / PATTERNS.length) * 100)}%` },
      ]}
    >
      <div className="flex flex-col items-center">
        {/* Sequence Display with Missing slot (?) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-3xl border border-line bg-white p-6 shadow-soft w-full max-w-lg mb-8">
          {currentPattern.sequence.map((ShapeComponent, i) => (
            <div
              key={i}
              className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-[#faf8ee] border border-line text-teal"
            >
              <ShapeComponent size={26} strokeWidth={2.2} />
            </div>
          ))}

          {/* Missing slot */}
          <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl border-2 border-dashed border-teal bg-mint/30 text-teal font-bold text-lg animate-pulse">
            ?
          </div>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
          Choose the shape that completes the sequence:
        </p>

        {/* 4 Choices */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-md">
          {currentPattern.options.map((OptionShape, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              aria-label={`Choice ${idx + 1}`}
              className="flex aspect-square items-center justify-center rounded-2xl border border-line bg-white text-ink shadow-soft hover:border-teal hover:scale-105 active:scale-95 transition"
            >
              <OptionShape size={28} strokeWidth={2} />
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
