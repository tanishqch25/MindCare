import { useEffect, useState } from 'react'
import { Check, CheckCircle2, ListOrdered, Target } from 'lucide-react'
import GameShell from './GameShell'

export default function SequenceTappingGame({ onBack }) {
  const [nextExpected, setNextExpected] = useState(1)
  const [bubbles, setBubbles] = useState([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState('Tap number 1 to begin.')
  const totalCount = 8

  const generateBoard = () => {
    // Generate numbers 1 to 8
    const nums = Array.from({ length: totalCount }, (_, i) => i + 1)
    // Shuffle positions
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = nums[i]
      nums[i] = nums[j]
      nums[j] = temp
    }
    setBubbles(nums)
    setNextExpected(1)
    setIsCompleted(false)
    setFeedback('Tap number 1 to begin.')
  }

  useEffect(() => {
    generateBoard()
  }, [])

  const handleTap = (num) => {
    if (isCompleted) return

    if (num === nextExpected) {
      const nextNum = nextExpected + 1
      setNextExpected(nextNum)
      if (nextNum > totalCount) {
        setIsCompleted(true)
        setFeedback('All numbers tapped in perfect sequence!')
      } else {
        setFeedback(`Good! Next find and tap: ${nextNum}`)
      }
    } else {
      setFeedback(`Look for number ${nextExpected}!`)
    }
  }

  return (
    <GameShell
      title="Sequence Tapping"
      category="Speed and spatial skills"
      description="Scan the field and tap the scattered numbers in ascending order from 1 to 8."
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={generateBoard}
      onBack={onBack}
      stats={[
        { label: 'Next Number', value: nextExpected <= totalCount ? `${nextExpected}` : 'Done', icon: Target },
        { label: 'Tapped', value: `${nextExpected - 1} / ${totalCount}`, icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Numbers Tapped', value: `${totalCount} of ${totalCount}` },
        { label: 'Sequence Order', value: '1 to 8 Ascending' },
      ]}
    >
      <div className="flex flex-col items-center">
        {/* Active Target Banner */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-3 shadow-soft">
          <span className="text-xs font-semibold text-muted">Next number to tap:</span>
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal font-mono text-sm font-bold text-white shadow-sm">
            {nextExpected <= totalCount ? nextExpected : '✓'}
          </span>
          <span className="text-xs text-muted font-medium">{feedback}</span>
        </div>

        {/* Scattered 4x2 Grid of numbered bubbles */}
        <div className="grid grid-cols-4 gap-3.5 sm:gap-4 max-w-md w-full">
          {bubbles.map((num) => {
            const isAlreadyTapped = num < nextExpected
            const isCurrentTarget = num === nextExpected

            return (
              <button
                key={num}
                type="button"
                onClick={() => handleTap(num)}
                disabled={isAlreadyTapped || isCompleted}
                aria-label={`Number ${num}${isAlreadyTapped ? ', tapped' : ''}`}
                className={`flex aspect-square items-center justify-center rounded-2xl border-2 font-mono text-xl font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal ${
                  isAlreadyTapped
                    ? 'border-line/40 bg-line/20 text-muted/30 cursor-default'
                    : isCurrentTarget
                    ? 'border-teal bg-mint/50 text-teal scale-105 shadow-md cursor-pointer animate-pulse'
                    : 'border-line bg-white text-ink shadow-soft hover:border-teal/50 hover:scale-105 active:scale-95 cursor-pointer'
                }`}
              >
                {isAlreadyTapped ? <Check size={20} className="text-teal" /> : num}
              </button>
            )
          })}
        </div>
      </div>
    </GameShell>
  )
}
