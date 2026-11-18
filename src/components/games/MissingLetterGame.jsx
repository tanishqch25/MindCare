import { useState } from 'react'
import { CheckCircle2, HelpCircle } from 'lucide-react'
import GameShell from './GameShell'

const WORDS = [
  { display: ['S', 'U', 'N', 'S', 'H', '_', 'N', 'E'], answer: 'I', options: ['A', 'E', 'I', 'O'], clue: 'Bright daylight from the sky above.' },
  { display: ['N', 'A', 'T', '_', 'R', 'E'], answer: 'U', options: ['U', 'O', 'E', 'A'], clue: 'The outdoor living world of plants and animals.' },
  { display: ['B', 'R', 'E', 'E', '_', 'E'], answer: 'Z', options: ['S', 'Z', 'D', 'T'], clue: 'A gentle, refreshing and cooling wind.' },
  { display: ['C', 'A', 'L', 'M', '_', 'N', 'G'], answer: 'I', options: ['I', 'E', 'A', 'O'], clue: 'Soothing and peaceful feeling.' },
  { display: ['S', 'E', 'R', 'E', 'N', '_', 'T', 'Y'], answer: 'I', options: ['A', 'I', 'O', 'E'], clue: 'A tranquil state of inner peace.' },
]

export default function MissingLetterGame({ onBack }) {
  const [wordIdx, setWordIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState('')

  const current = WORDS[wordIdx]

  const startNewGame = () => {
    setWordIdx(0)
    setScore(0)
    setIsCompleted(false)
    setFeedback('')
  }

  const handleSelect = (letter) => {
    if (isCompleted) return

    if (letter === current.answer) {
      setScore((s) => s + 1)
      setFeedback('✓ Word completed successfully!')
    } else {
      setFeedback(`Not quite — the missing letter was ${current.answer}`)
    }

    setTimeout(() => {
      setFeedback('')
      if (wordIdx + 1 < WORDS.length) {
        setWordIdx((w) => w + 1)
      } else {
        setIsCompleted(true)
      }
    }, 750)
  }

  return (
    <GameShell
      title="Missing Letter"
      category="Language and problem-solving"
      description="Fill in the blank letter to complete the familiar wellness word."
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      stats={[
        { label: 'Word', value: `${wordIdx + 1} / ${WORDS.length}`, icon: HelpCircle },
        { label: 'Score', value: `${score} / ${WORDS.length}`, icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Words Completed', value: `${WORDS.length} of ${WORDS.length}` },
        { label: 'Spelling Accuracy', value: `${Math.round((score / WORDS.length) * 100)}%` },
      ]}
    >
      <div className="flex flex-col items-center">
        {/* Clue hint */}
        <div className="mb-6 rounded-2xl border border-line bg-white px-5 py-3 text-center shadow-soft max-w-md">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-teal">Clue</span>
          <p className="mt-1 text-xs text-muted font-medium">{current.clue}</p>
        </div>

        {/* Word Display with Blank */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-8 max-w-lg">
          {current.display.map((char, i) => {
            const isBlank = char === '_'
            return (
              <div
                key={i}
                className={`flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-2xl border-2 font-mono text-lg font-bold transition-all ${
                  isBlank
                    ? 'border-dashed border-teal bg-mint/30 text-teal animate-pulse'
                    : 'border-line bg-white text-ink shadow-soft'
                }`}
              >
                {char}
              </div>
            )
          })}
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
          Select the letter that completes the word:
        </p>

        {/* 4 Choices */}
        <div className="grid grid-cols-4 gap-3 w-full max-w-xs">
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
