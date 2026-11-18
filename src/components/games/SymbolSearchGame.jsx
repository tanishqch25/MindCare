import { useState } from 'react'
import {
  Bell,
  CheckCircle2,
  CircleDot,
  Heart,
  Key,
  Layers,
  Leaf,
  Moon,
  Shield,
  Sparkles,
  Star,
  Sun,
} from 'lucide-react'
import GameShell from './GameShell'

const ALL_SYMBOLS = [
  { id: 'sun', icon: Sun },
  { id: 'moon', icon: Moon },
  { id: 'star', icon: Star },
  { id: 'heart', icon: Heart },
  { id: 'leaf', icon: Leaf },
  { id: 'bell', icon: Bell },
  { id: 'shield', icon: Shield },
  { id: 'key', icon: Key },
]

export default function SymbolSearchGame({ onBack }) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState('')

  const roundsData = [
    { targetId: 'sun', row: ['moon', 'star', 'leaf', 'sun', 'bell'], hasTarget: true },
    { targetId: 'heart', row: ['key', 'shield', 'leaf', 'star', 'moon'], hasTarget: false },
    { targetId: 'bell', row: ['bell', 'heart', 'sun', 'moon', 'shield'], hasTarget: true },
    { targetId: 'star', row: ['leaf', 'moon', 'key', 'bell', 'heart'], hasTarget: false },
    { targetId: 'shield', row: ['sun', 'key', 'star', 'shield', 'leaf'], hasTarget: true },
    { targetId: 'moon', row: ['heart', 'leaf', 'sun', 'key', 'bell'], hasTarget: false },
  ]

  const current = roundsData[round]
  const TargetIcon = ALL_SYMBOLS.find((s) => s.id === current.targetId)?.icon || Sun

  const startNewGame = () => {
    setRound(0)
    setScore(0)
    setIsCompleted(false)
    setFeedback('')
  }

  const handleChoice = (userSaysYes) => {
    if (isCompleted) return

    const isCorrect = userSaysYes === current.hasTarget
    if (isCorrect) {
      setScore((s) => s + 1)
      setFeedback('✓ Accurate observation!')
    } else {
      setFeedback('Missed row check')
    }

    setTimeout(() => {
      setFeedback('')
      if (round + 1 < roundsData.length) {
        setRound((r) => r + 1)
      } else {
        setIsCompleted(true)
      }
    }, 650)
  }

  return (
    <GameShell
      title="Symbol Search"
      category="Attention and focus"
      description="Scan the horizontal row to determine if the target key symbol appears."
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      stats={[
        { label: 'Round', value: `${round + 1} / ${roundsData.length}`, icon: Layers },
        { label: 'Score', value: `${score} / ${roundsData.length}`, icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Rounds Completed', value: `${roundsData.length} of ${roundsData.length}` },
        { label: 'Search Accuracy', value: `${Math.round((score / roundsData.length) * 100)}%` },
      ]}
    >
      <div className="flex flex-col items-center">
        {/* Target Header */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-3 shadow-soft">
          <span className="text-xs font-semibold text-muted">Target key to search for:</span>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-teal shadow-sm">
            <TargetIcon size={22} strokeWidth={2.2} />
          </div>
        </div>

        {/* Row of 5 Symbols */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 rounded-3xl border border-line bg-white p-6 shadow-soft w-full max-w-md mb-6">
          {current.row.map((symId, idx) => {
            const Icon = ALL_SYMBOLS.find((s) => s.id === symId)?.icon || Sun
            return (
              <div
                key={idx}
                className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-[#faf8ee] border border-line text-ink"
              >
                <Icon size={24} strokeWidth={1.8} />
              </div>
            )
          })}
        </div>

        {/* Answer choices */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <button
            onClick={() => handleChoice(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3 text-xs font-semibold text-white shadow-soft hover:bg-teal-700 active:scale-95 transition"
          >
            YES, it is in the row
          </button>
          <button
            onClick={() => handleChoice(false)}
            className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 py-3 text-xs font-semibold text-ink shadow-soft hover:bg-[#faf8ee] active:scale-95 transition"
          >
            NO, it is absent
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
