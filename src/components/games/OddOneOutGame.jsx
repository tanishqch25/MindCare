import { useState } from 'react'
import {
  Compass,
  Eye,
  Heart,
  Leaf,
  Moon,
  Search,
  Sparkles,
  Sun,
  Target,
} from 'lucide-react'
import GameShell from './GameShell'

const ROUNDS = [
  {
    instruction: 'Find the symbol that is different from all the others.',
    baseIcon: Leaf,
    oddIcon: Sparkles,
    baseColor: 'text-teal bg-mint',
    oddColor: 'text-teal bg-mint',
    gridSize: 9,
  },
  {
    instruction: 'One sun has a different color tone. Can you spot it?',
    baseIcon: Sun,
    oddIcon: Sun,
    baseColor: 'text-[#807846] bg-[#f5efda]',
    oddColor: 'text-[#55582A] bg-teal/20',
    gridSize: 9,
  },
  {
    instruction: 'Find the compass pointing in a rotated direction.',
    baseIcon: Compass,
    oddIcon: Compass,
    baseColor: 'text-[#716F32] bg-[#f1f0df]',
    oddColor: 'text-[#716F32] bg-[#f1f0df] rotate-90',
    gridSize: 9,
  },
  {
    instruction: 'Spot the single different night symbol.',
    baseIcon: Moon,
    oddIcon: Heart,
    baseColor: 'text-sky-700 bg-sky/30',
    oddColor: 'text-sky-700 bg-sky/30',
    gridSize: 9,
  },
]

export default function OddOneOutGame({ onBack }) {
  const [roundIdx, setRoundIdx] = useState(0)
  const [oddPosition, setOddPosition] = useState(() => Math.floor(Math.random() * 9))
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState('')

  const currentRound = ROUNDS[roundIdx]

  const startNewGame = () => {
    setRoundIdx(0)
    setOddPosition(Math.floor(Math.random() * 9))
    setIsCompleted(false)
    setFeedback('')
  }

  const handleTileClick = (index) => {
    if (isCompleted) return

    if (index === oddPosition) {
      setFeedback('✓ You found it!')
      setTimeout(() => {
        setFeedback('')
        if (roundIdx + 1 < ROUNDS.length) {
          setRoundIdx((r) => r + 1)
          setOddPosition(Math.floor(Math.random() * 9))
        } else {
          setIsCompleted(true)
        }
      }, 700)
    } else {
      setFeedback('Not that one — look closely!')
      setTimeout(() => setFeedback(''), 1000)
    }
  }

  return (
    <GameShell
      title="Odd One Out"
      category="Attention and focus"
      description="Scan the grid to spot the single item that does not match the rest."
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      stats={[
        { label: 'Round', value: `${roundIdx + 1} of ${ROUNDS.length}`, icon: Search },
        { label: 'Status', value: feedback || 'Observing', icon: Eye },
      ]}
      completionStats={[
        { label: 'Rounds Completed', value: `${ROUNDS.length} of ${ROUNDS.length}` },
        { label: 'Attention Focus', value: '100%' },
      ]}
    >
      <div className="flex flex-col items-center">
        <p className="mb-6 text-sm font-medium text-ink bg-white border border-line px-5 py-2.5 rounded-xl shadow-soft">
          {currentRound.instruction}
        </p>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-72 sm:w-80 aspect-square">
          {Array.from({ length: currentRound.gridSize }).map((_, index) => {
            const isOdd = index === oddPosition
            const Icon = isOdd ? currentRound.oddIcon : currentRound.baseIcon
            const colorClass = isOdd ? currentRound.oddColor : currentRound.baseColor

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleTileClick(index)}
                aria-label={`Tile ${index + 1}`}
                className="flex aspect-square items-center justify-center rounded-2xl border border-line bg-white shadow-soft transition-all duration-200 hover:border-teal/50 hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal"
              >
                <span className={`grid h-12 w-12 place-items-center rounded-xl transition ${colorClass}`}>
                  <Icon size={24} />
                </span>
              </button>
            )
          })}
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
