import { useEffect, useState } from 'react'
import { Check, CheckCircle2, LayoutGrid, Play, Sparkles } from 'lucide-react'
import GameShell from './GameShell'

export default function RememberPositionsGame({ onBack }) {
  const [difficulty, setDifficulty] = useState('Gentle')
  const countToMemorize = difficulty === 'Gentle' ? 4 : difficulty === 'Moderate' ? 5 : 6

  const [targetIndices, setTargetIndices] = useState([])
  const [selectedIndices, setSelectedIndices] = useState([])
  const [showTargets, setShowTargets] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [message, setMessage] = useState('Press "Start exercise" to preview the highlighted cells.')

  const startNewGame = () => {
    // Pick random unique indices in 4x4 (0 to 15)
    const indices = []
    while (indices.length < countToMemorize) {
      const rand = Math.floor(Math.random() * 16)
      if (!indices.includes(rand)) indices.push(rand)
    }

    setTargetIndices(indices)
    setSelectedIndices([])
    setShowTargets(true)
    setHasStarted(true)
    setIsCompleted(false)
    setMessage('Memorize the highlighted cells…')

    setTimeout(() => {
      setShowTargets(false)
      setMessage(`Now select the ${countToMemorize} cells you remember.`)
    }, 2800)
  }

  const handleCellClick = (index) => {
    if (!hasStarted || showTargets || isCompleted) return
    if (selectedIndices.includes(index)) return

    const nextSelected = [...selectedIndices, index]
    setSelectedIndices(nextSelected)

    // Check if cell is in targets
    if (targetIndices.includes(index)) {
      // Correct!
      const correctCount = nextSelected.filter((i) => targetIndices.includes(i)).length
      if (correctCount === targetIndices.length) {
        setIsCompleted(true)
        setMessage('Wonderful recall! You located every highlighted position.')
      } else {
        setMessage(`Found ${correctCount} of ${targetIndices.length}. Keep going!`)
      }
    } else {
      // Incorrect cell selected
      setMessage('That cell was not highlighted. Try observing once more!')
      setTimeout(() => {
        setShowTargets(true)
        setSelectedIndices([])
        setTimeout(() => {
          setShowTargets(false)
          setMessage(`Now select the ${countToMemorize} cells you remember.`)
        }, 2200)
      }, 700)
    }
  }

  return (
    <GameShell
      title="Remember the Positions"
      category="Memory and recall"
      description="Memorize which grid cells light up, then tap them once they hide."
      dbKey="memory-match"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      difficulty={difficulty}
      onDifficultyChange={(d) => {
        setDifficulty(d)
        setHasStarted(false)
        setIsCompleted(false)
        setMessage('Press "Start exercise" to preview the cells.')
      }}
      stats={[
        { label: 'Targets', value: `${countToMemorize} cells`, icon: LayoutGrid },
        {
          label: 'Found',
          value: `${selectedIndices.filter((i) => targetIndices.includes(i)).length} / ${countToMemorize}`,
          icon: CheckCircle2,
        },
      ]}
      completionStats={[
        { label: 'Positions Remembered', value: `${countToMemorize} cells` },
        { label: 'Difficulty', value: difficulty },
      ]}
    >
      <div className="flex flex-col items-center">
        <p className="mb-6 text-sm font-medium text-ink bg-white border border-line px-4 py-2 rounded-xl shadow-soft">
          {message}
        </p>

        {/* 4x4 Grid */}
        <div className="grid grid-cols-4 gap-3 w-64 sm:w-80 aspect-square">
          {Array.from({ length: 16 }).map((_, index) => {
            const isTarget = targetIndices.includes(index)
            const isSelected = selectedIndices.includes(index)
            const isHighlighted = showTargets && isTarget
            const isCorrectFound = isSelected && isTarget
            const isWrongFound = isSelected && !isTarget

            let style = 'bg-white border-line hover:border-teal/50 hover:bg-[#faf8ee]'
            if (isHighlighted) {
              style = 'bg-teal border-teal scale-105 shadow-md'
            } else if (isCorrectFound) {
              style = 'bg-mint border-teal text-teal font-bold'
            } else if (isWrongFound) {
              style = 'bg-rose-100 border-rose-300 text-rose-700'
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleCellClick(index)}
                disabled={!hasStarted || showTargets || isCompleted || isSelected}
                aria-label={`Cell ${index + 1}`}
                className={`relative flex items-center justify-center rounded-2xl border-2 transition-all duration-200 shadow-soft focus:outline-none focus:ring-2 focus:ring-teal ${style}`}
              >
                {isHighlighted && <Sparkles size={20} className="text-white animate-spin" />}
                {isCorrectFound && <Check size={22} strokeWidth={2.5} />}
                {isWrongFound && <span className="text-sm font-bold">✕</span>}
              </button>
            )
          })}
        </div>

        {!hasStarted && (
          <button
            onClick={startNewGame}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition"
          >
            <Play size={14} fill="currentColor" /> Start exercise
          </button>
        )}
      </div>
    </GameShell>
  )
}
