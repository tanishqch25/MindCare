import { useState } from 'react'
import { CheckCircle2, HelpCircle, Lightbulb } from 'lucide-react'
import GameShell from './GameShell'

const PUZZLES = [
  {
    clue: 'The oak tree is taller than the birch tree. The pine tree is taller than the oak tree. Which tree is the tallest?',
    options: ['Pine tree', 'Oak tree', 'Birch tree', 'They are all equal'],
    answer: 'Pine tree',
  },
  {
    clue: 'Alice arrives at the garden before Bob. Carlos arrives before Alice. Who arrived first?',
    options: ['Carlos', 'Alice', 'Bob', 'Alice and Bob together'],
    answer: 'Carlos',
  },
  {
    clue: 'The blue mug holds more water than the green mug. The yellow mug holds less water than the green mug. Which mug holds the least water?',
    options: ['Yellow mug', 'Green mug', 'Blue mug', 'Cannot be determined'],
    answer: 'Yellow mug',
  },
  {
    clue: 'A knit sweater is warmer than a linen shirt. A winter parka is warmer than a knit sweater. Which garment provides the most warmth?',
    options: ['Winter parka', 'Knit sweater', 'Linen shirt', 'All three equal'],
    answer: 'Winter parka',
  },
]

export default function LogicalPuzzlesGame({ onBack }) {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState('')

  const current = PUZZLES[puzzleIdx]

  const startNewGame = () => {
    setPuzzleIdx(0)
    setScore(0)
    setIsCompleted(false)
    setFeedback('')
  }

  const handleSelect = (choice) => {
    if (isCompleted) return

    if (choice === current.answer) {
      setScore((s) => s + 1)
      setFeedback('✓ Logical deduction correct!')
    } else {
      setFeedback(`Not quite — the answer is ${current.answer}`)
    }

    setTimeout(() => {
      setFeedback('')
      if (puzzleIdx + 1 < PUZZLES.length) {
        setPuzzleIdx((p) => p + 1)
      } else {
        setIsCompleted(true)
      }
    }, 900)
  }

  return (
    <GameShell
      title="Logical Puzzles"
      category="Logic and reasoning"
      description="Read the premises carefully and deduce the correct conclusion."
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      stats={[
        { label: 'Puzzle', value: `${puzzleIdx + 1} / ${PUZZLES.length}`, icon: Lightbulb },
        { label: 'Score', value: `${score} / ${PUZZLES.length}`, icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Puzzles Solved', value: `${PUZZLES.length} of ${PUZZLES.length}` },
        { label: 'Logical Accuracy', value: `${Math.round((score / PUZZLES.length) * 100)}%` },
      ]}
    >
      <div className="flex flex-col items-center">
        {/* Clue card */}
        <div className="w-full max-w-lg rounded-3xl border border-line bg-white p-7 shadow-soft text-center mb-6">
          <span className="text-[11px] font-semibold text-teal uppercase tracking-wider">
            Deduction Puzzle {puzzleIdx + 1} of {PUZZLES.length}
          </span>
          <p className="mt-4 text-base font-medium text-ink leading-relaxed">{current.clue}</p>
        </div>

        {/* 4 Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
          {current.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(option)}
              className="rounded-2xl border border-line bg-white p-4 text-left text-xs font-semibold text-ink shadow-soft hover:border-teal hover:bg-[#faf8ee] hover:scale-[1.02] active:scale-95 transition"
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
