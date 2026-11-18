import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, ListOrdered, Play, Sparkles } from 'lucide-react'
import GameShell from './GameShell'

const TILE_COLORS = [
  { id: 0, name: 'Calla Green', color: 'bg-teal', activeColor: 'bg-teal-700 ring-4 ring-teal/30 scale-105' },
  { id: 1, name: 'Pear Sorbet', color: 'bg-mint', activeColor: 'bg-[#e5d89e] ring-4 ring-mint/60 scale-105' },
  { id: 2, name: 'Linden Green', color: 'bg-sky', activeColor: 'bg-sky-700 ring-4 ring-sky/50 scale-105' },
  { id: 3, name: 'Sage Olive', color: 'bg-[#9a985c]', activeColor: 'bg-[#7c7b44] ring-4 ring-[#9a985c]/40 scale-105' },
]

export default function SequenceRecallGame({ onBack }) {
  const [difficulty, setDifficulty] = useState('Gentle') // Gentle (4 steps), Moderate (5 steps), Challenging (6 steps)
  const targetLength = difficulty === 'Gentle' ? 4 : difficulty === 'Moderate' ? 5 : 6

  const [sequence, setSequence] = useState([])
  const [userStep, setUserStep] = useState(0)
  const [activeTile, setActiveTile] = useState(null)
  const [isPlayingSeq, setIsPlayingSeq] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [message, setMessage] = useState('Press "Start sequence" to observe the pattern.')
  const [hasStarted, setHasStarted] = useState(false)

  const generateSequence = () => {
    const seq = []
    for (let i = 0; i < targetLength; i++) {
      seq.push(Math.floor(Math.random() * 4))
    }
    return seq
  }

  const playSequence = (seqToPlay) => {
    setIsPlayingSeq(true)
    setUserStep(0)
    setMessage('Watch carefully…')
    let i = 0
    const interval = setInterval(() => {
      if (i < seqToPlay.length) {
        const tileId = seqToPlay[i]
        setActiveTile(tileId)
        setTimeout(() => setActiveTile(null), 450)
        i++
      } else {
        clearInterval(interval)
        setIsPlayingSeq(false)
        setMessage(`Your turn! Tap the ${seqToPlay.length} tiles in order.`)
      }
    }, 750)
  }

  const startNewGame = () => {
    const newSeq = generateSequence()
    setSequence(newSeq)
    setHasStarted(true)
    setIsCompleted(false)
    playSequence(newSeq)
  }

  const handleTileClick = (tileId) => {
    if (isPlayingSeq || isCompleted || !hasStarted) return

    // Flash tile on tap
    setActiveTile(tileId)
    setTimeout(() => setActiveTile(null), 200)

    if (tileId === sequence[userStep]) {
      const nextStep = userStep + 1
      setUserStep(nextStep)
      if (nextStep === sequence.length) {
        setIsCompleted(true)
        setMessage('Great recall! You reproduced the complete sequence.')
      } else {
        setMessage(`Good! Step ${nextStep} of ${sequence.length}.`)
      }
    } else {
      // Wrong tile, let them re-watch
      setMessage('Not quite. Take a breath and watch again!')
      setTimeout(() => {
        playSequence(sequence)
      }, 900)
    }
  }

  return (
    <GameShell
      title="Sequence Recall"
      category="Memory and recall"
      description="Observe the sequence of glowing tiles, then tap them in the exact same order."
      dbKey="memory-match"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      difficulty={difficulty}
      onDifficultyChange={(d) => {
        setDifficulty(d)
        setHasStarted(false)
        setIsCompleted(false)
        setMessage('Press "Start sequence" to play.')
      }}
      stats={[
        { label: 'Length', value: `${sequence.length || targetLength} steps`, icon: ListOrdered },
        { label: 'Progress', value: `${userStep} / ${sequence.length || targetLength}`, icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Sequence Length', value: `${targetLength} tiles` },
        { label: 'Difficulty', value: difficulty },
      ]}
    >
      <div className="flex flex-col items-center">
        {/* Status prompt */}
        <p className="mb-6 text-sm font-medium text-ink bg-white border border-line px-4 py-2 rounded-xl shadow-soft">
          {message}
        </p>

        {/* 4 Colored Tiles Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 w-64 sm:w-72 aspect-square">
          {TILE_COLORS.map((tile) => {
            const isActive = activeTile === tile.id
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleTileClick(tile.id)}
                disabled={isPlayingSeq || isCompleted || !hasStarted}
                aria-label={`Tile ${tile.name}`}
                className={`rounded-3xl transition-all duration-200 border-2 border-line/50 shadow-soft focus:outline-none ${
                  isActive ? tile.activeColor : `${tile.color} hover:opacity-90 active:scale-95`
                } ${!hasStarted || isPlayingSeq ? 'cursor-default' : 'cursor-pointer'}`}
              />
            )
          })}
        </div>

        {/* Start button if game not started */}
        {!hasStarted && (
          <button
            onClick={startNewGame}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition"
          >
            <Play size={14} fill="currentColor" /> Start sequence
          </button>
        )}
      </div>
    </GameShell>
  )
}
