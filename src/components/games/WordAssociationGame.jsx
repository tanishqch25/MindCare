import { useState } from 'react'
import { CheckCircle2, Split } from 'lucide-react'
import GameShell from './GameShell'

const QUESTIONS = [
  { prompt: 'OCEAN', options: ['WAVES', 'BRICK', 'WALLET', 'PENCIL'], answer: 'WAVES' },
  { prompt: 'FOREST', options: ['CANOPY', 'HIGHWAY', 'AIRPORT', 'LAPTOP'], answer: 'CANOPY' },
  { prompt: 'MORNING', options: ['SUNRISE', 'MIDNIGHT', 'SHADOW', 'FLASHLIGHT'], answer: 'SUNRISE' },
  { prompt: 'KINDNESS', options: ['COMPASSION', 'CLOCK', 'WHEEL', 'ENGINE'], answer: 'COMPASSION' },
  { prompt: 'LIBRARY', options: ['READING', 'SUBWAY', 'HAMMER', 'FACTORY'], answer: 'READING' },
]

export default function WordAssociationGame({ onBack }) {
  const [qIdx, setQIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState('')

  const current = QUESTIONS[qIdx]

  const startNewGame = () => {
    setQIdx(0)
    setScore(0)
    setIsCompleted(false)
    setFeedback('')
  }

  const handleSelect = (option) => {
    if (isCompleted) return

    if (option === current.answer) {
      setScore((s) => s + 1)
      setFeedback('✓ Thoughtful connection!')
    } else {
      setFeedback(`Not quite — the connection was ${current.answer}`)
    }

    setTimeout(() => {
      setFeedback('')
      if (qIdx + 1 < QUESTIONS.length) {
        setQIdx((q) => q + 1)
      } else {
        setIsCompleted(true)
      }
    }, 750)
  }

  return (
    <GameShell
      title="Word Association"
      category="Language and problem-solving"
      description="Identify the word most meaningfully linked to the central concept."
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      stats={[
        { label: 'Question', value: `${qIdx + 1} / ${QUESTIONS.length}`, icon: Split },
        { label: 'Score', value: `${score} / ${QUESTIONS.length}`, icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Pairs Associated', value: `${QUESTIONS.length} of ${QUESTIONS.length}` },
        { label: 'Association Accuracy', value: `${Math.round((score / QUESTIONS.length) * 100)}%` },
      ]}
    >
      <div className="flex flex-col items-center">
        {/* Central Concept Prompt Card */}
        <div className="flex flex-col items-center justify-center rounded-3xl border border-line bg-white p-7 shadow-soft w-full max-w-sm mb-6 text-center">
          <span className="text-[11px] font-semibold text-teal uppercase tracking-wider">
            Target Concept
          </span>
          <p className="mt-3 text-2xl font-bold tracking-tight text-ink">{current.prompt}</p>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Select the most closely associated word:
        </p>

        {/* 4 Choices */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {current.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              className="rounded-2xl border border-line bg-white p-4 text-center text-xs font-semibold text-ink shadow-soft hover:border-teal hover:bg-[#faf8ee] hover:scale-105 active:scale-95 transition"
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
