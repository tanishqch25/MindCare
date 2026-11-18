import { useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Compass,
  Footprints,
  Star,
} from 'lucide-react'
import GameShell from './GameShell'

// 5x5 grid with obstacles
const GRID_SIZE = 5
const OBSTACLES = [
  { r: 1, c: 1 },
  { r: 1, c: 3 },
  { r: 2, c: 2 },
  { r: 3, c: 0 },
  { r: 3, c: 3 },
]
const START_POS = { r: 0, c: 0 }
const GOAL_POS = { r: 4, c: 4 }

export default function GridPathPuzzleGame({ onBack }) {
  const [currentPos, setCurrentPos] = useState(START_POS)
  const [visited, setVisited] = useState([START_POS])
  const [steps, setSteps] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [message, setMessage] = useState('Navigate around the obstacles to reach the glowing star.')

  const startNewGame = () => {
    setCurrentPos(START_POS)
    setVisited([START_POS])
    setSteps(0)
    setIsCompleted(false)
    setMessage('Navigate around the obstacles to reach the glowing star.')
  }

  const isObstacle = (r, c) => {
    return OBSTACLES.some((obs) => obs.r === r && obs.c === c)
  }

  const moveTo = (newR, newC) => {
    if (isCompleted) return

    // Check bounds
    if (newR < 0 || newR >= GRID_SIZE || newC < 0 || newC >= GRID_SIZE) {
      setMessage('You cannot step outside the boundary.')
      return
    }

    // Check obstacles
    if (isObstacle(newR, newC)) {
      setMessage('Path blocked by an obstacle!')
      return
    }

    const nextPos = { r: newR, c: newC }
    setCurrentPos(nextPos)
    setSteps((s) => s + 1)
    setVisited((prev) => [...prev, nextPos])
    setMessage('Moving steadily toward the goal…')

    // Check goal
    if (newR === GOAL_POS.r && newC === GOAL_POS.c) {
      setIsCompleted(true)
      setMessage('Goal reached! You navigated the path safely.')
    }
  }

  return (
    <GameShell
      title="Grid Path Puzzle"
      category="Logic and reasoning"
      description="Navigate from the starting circle to the goal star while avoiding the blocked cells."
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      stats={[
        { label: 'Steps Taken', value: `${steps}`, icon: Footprints },
        { label: 'Position', value: `R${currentPos.r + 1}, C${currentPos.c + 1}`, icon: Compass },
      ]}
      completionStats={[
        { label: 'Total Steps Taken', value: `${steps} steps` },
        { label: 'Navigation', value: 'Goal Achieved' },
      ]}
    >
      <div className="flex flex-col items-center">
        <p className="mb-5 text-sm font-medium text-ink bg-white border border-line px-5 py-2.5 rounded-xl shadow-soft">
          {message}
        </p>

        {/* 5x5 Board */}
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5 w-72 sm:w-80 aspect-square p-3 rounded-3xl border border-line bg-white shadow-soft mb-6">
          {Array.from({ length: GRID_SIZE }).map((_, r) =>
            Array.from({ length: GRID_SIZE }).map((__, c) => {
              const isCurrent = currentPos.r === r && currentPos.c === c
              const isGoal = GOAL_POS.r === r && GOAL_POS.c === c
              const isObs = isObstacle(r, c)
              const wasVisited = visited.some((v) => v.r === r && v.c === c)

              let cellStyle = 'bg-[#faf8ee] border-line'
              if (isObs) {
                cellStyle = 'bg-line/80 border-line text-muted cursor-not-allowed'
              } else if (isCurrent) {
                cellStyle = 'bg-teal text-white border-teal shadow-md scale-105'
              } else if (isGoal) {
                cellStyle = 'bg-mint text-teal border-teal font-bold animate-pulse'
              } else if (wasVisited) {
                cellStyle = 'bg-mint/30 border-line/60'
              }

              return (
                <div
                  key={`${r}-${c}`}
                  className={`flex items-center justify-center rounded-xl border text-xs transition-all ${cellStyle}`}
                >
                  {isCurrent && <div className="h-3.5 w-3.5 rounded-full bg-white shadow-sm" />}
                  {isGoal && !isCurrent && <Star size={18} fill="currentColor" />}
                  {isObs && <span className="text-[10px] font-bold">✕</span>}
                </div>
              )
            })
          )}
        </div>

        {/* Direction Controls */}
        <div className="flex flex-col items-center gap-1.5 w-48">
          <button
            onClick={() => moveTo(currentPos.r - 1, currentPos.c)}
            disabled={isCompleted}
            aria-label="Move Up"
            className="flex h-10 w-12 items-center justify-center rounded-xl border border-line bg-white shadow-soft hover:bg-mint hover:text-teal active:scale-95 transition"
          >
            <ArrowUp size={18} />
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => moveTo(currentPos.r, currentPos.c - 1)}
              disabled={isCompleted}
              aria-label="Move Left"
              className="flex h-10 w-12 items-center justify-center rounded-xl border border-line bg-white shadow-soft hover:bg-mint hover:text-teal active:scale-95 transition"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => moveTo(currentPos.r + 1, currentPos.c)}
              disabled={isCompleted}
              aria-label="Move Down"
              className="flex h-10 w-12 items-center justify-center rounded-xl border border-line bg-white shadow-soft hover:bg-mint hover:text-teal active:scale-95 transition"
            >
              <ArrowDown size={18} />
            </button>
            <button
              onClick={() => moveTo(currentPos.r, currentPos.c + 1)}
              disabled={isCompleted}
              aria-label="Move Right"
              className="flex h-10 w-12 items-center justify-center rounded-xl border border-line bg-white shadow-soft hover:bg-mint hover:text-teal active:scale-95 transition"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </GameShell>
  )
}
