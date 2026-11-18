import { useState } from 'react'
import { CheckCircle2, RotateCcw, SpellCheck } from 'lucide-react'
import GameShell from './GameShell'

const WORDS = [
  { word: 'PEACE', scrambled: ['C', 'E', 'A', 'P', 'E'], clue: 'A state of calm and tranquility.' },
  { word: 'FOCUS', scrambled: ['U', 'C', 'S', 'O', 'F'], clue: 'Directed mindful attention.' },
  { word: 'GARDEN', scrambled: ['D', 'E', 'N', 'G', 'A', 'R'], clue: 'A peaceful outdoor space with greenery.' },
  { word: 'BREATHE', scrambled: ['E', 'T', 'H', 'A', 'B', 'R', 'E'], clue: 'Pause and take a mindful inhalation.' },
]

export default function WordScrambleGame({ onBack }) {
  const [wordIdx, setWordIdx] = useState(0)
  const [selectedLetters, setSelectedLetters] = useState([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState('')

  const current = WORDS[wordIdx]

  const startNewGame = () => {
    setWordIdx(0)
    setSelectedLetters([])
    setIsCompleted(false)
    setFeedback('')
  }

  const handleLetterTap = (letter, originalIndex) => {
    if (isCompleted) return
    const isAlreadyPicked = selectedLetters.some((l) => l.index === originalIndex)
    if (isAlreadyPicked) {
      // Unpick
      setSelectedLetters((prev) => prev.filter((l) => l.index !== originalIndex))
      return
    }

    const nextSelected = [...selectedLetters, { letter, index: originalIndex }]
    setSelectedLetters(nextSelected)

    // Check if word complete
    if (nextSelected.length === current.word.length) {
      const formedWord = nextSelected.map((l) => l.letter).join('')
      if (formedWord === current.word) {
        setFeedback('✓ Wonderful unscramble!')
        setTimeout(() => {
          setFeedback('')
          if (wordIdx + 1 < WORDS.length) {
            setWordIdx((w) => w + 1)
            setSelectedLetters([])
          } else {
            setIsCompleted(true)
          }
        }, 800)
      } else {
        setFeedback('Not quite the right order. Tap letters to adjust.')
      }
    }
  }

  const clearSelection = () => {
    setSelectedLetters([])
    setFeedback('')
  }

  return (
    <GameShell
      title="Word Scramble"
      category="Language and problem-solving"
      description="Tap the jumbled letters in sequence to form a tranquil wellness word."
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      stats={[
        { label: 'Word', value: `${wordIdx + 1} / ${WORDS.length}`, icon: SpellCheck },
        { label: 'Target', value: `${current.word.length} letters`, icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Words Unscrambled', value: `${WORDS.length} of ${WORDS.length}` },
        { label: 'Language Focus', value: 'Complete' },
      ]}
    >
      <div className="flex flex-col items-center">
        {/* Clue hint */}
        <div className="mb-6 rounded-2xl border border-line bg-white px-5 py-3 text-center shadow-soft max-w-md">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-teal">Clue</span>
          <p className="mt-1 text-xs text-muted font-medium">{current.clue}</p>
        </div>

        {/* Formed Word Slots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {Array.from({ length: current.word.length }).map((_, i) => {
            const picked = selectedLetters[i]
            return (
              <div
                key={i}
                className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border-2 font-mono text-lg font-bold transition-all ${
                  picked
                    ? 'border-teal bg-mint/40 text-teal shadow-soft'
                    : 'border-dashed border-line bg-white text-transparent'
                }`}
              >
                {picked ? picked.letter : ''}
              </div>
            )
          })}
        </div>

        {/* Jumbled Letter Tiles */}
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Tap letters to place or remove:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-md mb-4">
          {current.scrambled.map((letter, idx) => {
            const isUsed = selectedLetters.some((l) => l.index === idx)
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleLetterTap(letter, idx)}
                disabled={isCompleted}
                aria-label={`Letter ${letter}`}
                className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border font-mono text-base font-bold shadow-soft transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal ${
                  isUsed
                    ? 'border-line/40 bg-line/30 text-muted/40 cursor-pointer'
                    : 'border-line bg-white text-ink hover:border-teal hover:scale-105 active:scale-95'
                }`}
              >
                {letter}
              </button>
            )
          })}
        </div>

        <button
          onClick={clearSelection}
          className="text-xs font-medium text-muted hover:text-ink underline flex items-center gap-1 mt-2"
        >
          <RotateCcw size={12} /> Clear letters
        </button>

        {feedback && (
          <p role="status" className="mt-4 text-xs font-semibold text-teal animate-fadeIn">
            {feedback}
          </p>
        )}
      </div>
    </GameShell>
  )
}
