import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Play, Zap } from 'lucide-react'
import GameShell from './GameShell'

export default function ReactionTapGame({ onBack }) {
  const [trial, setTrial] = useState(0)
  const [state, setState] = useState('idle') // 'idle' | 'waiting' | 'ready' | 'result'
  const [reactionTimes, setReactionTimes] = useState([])
  const [currentMs, setCurrentMs] = useState(null)
  const [feedback, setFeedback] = useState('Press "Start trial" and wait calmly for the green prompt.')
  const [isCompleted, setIsCompleted] = useState(false)

  const startTimeRef = useRef(null)
  const timeoutRef = useRef(null)
  const totalTrials = 3

  const startTrial = () => {
    setState('waiting')
    setCurrentMs(null)
    setFeedback('Wait for the green circle…')

    // Random delay between 1.8s and 3.5s
    const delay = 1800 + Math.random() * 1700
    timeoutRef.current = setTimeout(() => {
      setState('ready')
      startTimeRef.current = performance.now()
      setFeedback('TAP NOW!')
    }, delay)
  }

  const handleTap = () => {
    if (state === 'waiting') {
      // Tapped too early
      clearTimeout(timeoutRef.current)
      setState('idle')
      setFeedback('Tapped too soon! Take a breath, wait for green.')
      return
    }

    if (state === 'ready') {
      const elapsed = Math.round(performance.now() - startTimeRef.current)
      const nextTimes = [...reactionTimes, elapsed]
      setReactionTimes(nextTimes)
      setCurrentMs(elapsed)
      setState('result')

      if (trial + 1 < totalTrials) {
        setFeedback(`Response: ${elapsed} ms. Next trial ready.`)
        setTimeout(() => {
          setTrial((t) => t + 1)
          startTrial()
        }, 1200)
      } else {
        setIsCompleted(true)
        setFeedback(`All ${totalTrials} trials complete!`)
      }
    }
  }

  const startNewGame = () => {
    clearTimeout(timeoutRef.current)
    setTrial(0)
    setState('idle')
    setReactionTimes([])
    setCurrentMs(null)
    setIsCompleted(false)
    setFeedback('Press "Start trial" to begin.')
  }

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  const averageMs =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0

  return (
    <GameShell
      title="Reaction Tap"
      category="Speed and spatial skills"
      description="Wait calmly for the visual prompt, then tap as promptly as you like."
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      stats={[
        { label: 'Trial', value: `${trial + 1} / ${totalTrials}`, icon: Zap },
        { label: 'Average', value: averageMs ? `${averageMs} ms` : '—', icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Average Speed', value: `${averageMs} ms` },
        { label: 'Trials Completed', value: `${totalTrials} of ${totalTrials}` },
      ]}
    >
      <div className="flex flex-col items-center">
        <p className="mb-6 text-sm font-medium text-ink bg-white border border-line px-5 py-2.5 rounded-xl shadow-soft">
          {feedback}
        </p>

        {/* Reaction Target Circle */}
        <button
          type="button"
          onClick={handleTap}
          disabled={state === 'idle' || isCompleted}
          aria-label={state === 'ready' ? 'Tap now' : 'Wait for green'}
          className={`flex h-64 w-64 items-center justify-center rounded-full border-4 shadow-soft transition-all duration-150 focus:outline-none ${
            state === 'ready'
              ? 'bg-teal border-white text-white scale-105 shadow-xl animate-pulse cursor-pointer'
              : state === 'waiting'
              ? 'bg-[#F3EAC3] border-line text-ink cursor-pointer active:scale-95'
              : state === 'result'
              ? 'bg-mint border-teal text-teal cursor-default'
              : 'bg-[#faf8ee] border-line text-muted cursor-default'
          }`}
        >
          <div className="text-center px-4">
            {state === 'ready' && <span className="text-xl font-bold uppercase tracking-wider">TAP!</span>}
            {state === 'waiting' && (
              <span className="text-sm font-semibold text-muted">Wait for green…</span>
            )}
            {state === 'result' && (
              <div className="animate-fadeIn">
                <span className="text-2xl font-bold font-mono">{currentMs} ms</span>
                <p className="text-[10px] text-muted font-medium mt-1">Gentle reaction time</p>
              </div>
            )}
            {state === 'idle' && (
              <span className="text-xs font-semibold text-muted">Ready when you are</span>
            )}
          </div>
        </button>

        {state === 'idle' && !isCompleted && (
          <button
            onClick={startTrial}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition"
          >
            <Play size={14} fill="currentColor" /> Start trial 1
          </button>
        )}
      </div>
    </GameShell>
  )
}
