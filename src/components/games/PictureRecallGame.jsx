import { useState } from 'react'
import {
  Apple,
  CheckCircle2,
  Clock3,
  Cloud,
  Coffee,
  Feather,
  Flower2,
  Heart,
  HelpCircle,
  Leaf,
  Moon,
  Sparkles,
  Sun,
  Umbrella,
} from 'lucide-react'
import GameShell from './GameShell'

const SCENES = [
  {
    items: [
      { name: 'Golden Sun', icon: Sun, color: 'text-[#807846] bg-[#f5efda]' },
      { name: 'Fresh Leaf', icon: Leaf, color: 'text-teal bg-mint' },
      { name: 'Cozy Coffee', icon: Coffee, color: 'text-[#716F32] bg-[#f1f0df]' },
      { name: 'Gentle Cloud', icon: Cloud, color: 'text-sky-700 bg-sky/30' },
      { name: 'Caring Heart', icon: Heart, color: 'text-rose-700 bg-rose-50' },
    ],
    questions: [
      {
        text: 'Which warm beverage was pictured?',
        options: ['Tea', 'Cozy Coffee', 'Hot Cocoa', 'Soup'],
        answer: 'Cozy Coffee',
      },
      {
        text: 'Which weather element was in the scene?',
        options: ['Rainbow', 'Snowflake', 'Gentle Cloud', 'Thunder'],
        answer: 'Gentle Cloud',
      },
      {
        text: 'Was there an Umbrella shown?',
        options: ['No, there was not', 'Yes, it was blue', 'Yes, it was green'],
        answer: 'No, there was not',
      },
    ],
  },
  {
    items: [
      { name: 'Blooming Flower', icon: Flower2, color: 'text-teal bg-mint' },
      { name: 'Crisp Apple', icon: Apple, color: 'text-rose-700 bg-rose-50' },
      { name: 'Night Moon', icon: Moon, color: 'text-[#807846] bg-[#f5efda]' },
      { name: 'Soft Feather', icon: Feather, color: 'text-[#716F32] bg-[#f1f0df]' },
      { name: 'Sturdy Umbrella', icon: Umbrella, color: 'text-sky-700 bg-sky/30' },
    ],
    questions: [
      {
        text: 'Which fruit was displayed in the scene?',
        options: ['Orange', 'Crisp Apple', 'Banana', 'Pear'],
        answer: 'Crisp Apple',
      },
      {
        text: 'What celestial symbol was present?',
        options: ['Night Moon', 'Shooting Star', 'Sun', 'Comet'],
        answer: 'Night Moon',
      },
      {
        text: 'Which garden item was shown?',
        options: ['Tree', 'Cactus', 'Blooming Flower', 'Grass'],
        answer: 'Blooming Flower',
      },
    ],
  },
]

export default function PictureRecallGame({ onBack }) {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [phase, setPhase] = useState('study') // 'study' | 'quiz'
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState('')

  const activeScene = SCENES[sceneIndex]
  const currentQuestion = activeScene.questions[currentQIndex]

  const startNewGame = () => {
    setSceneIndex((prev) => (prev + 1) % SCENES.length)
    setPhase('study')
    setCurrentQIndex(0)
    setCorrectCount(0)
    setIsCompleted(false)
    setSelectedFeedback('')
  }

  const handleAnswer = (option) => {
    const isCorrect = option === currentQuestion.answer
    if (isCorrect) {
      setCorrectCount((c) => c + 1)
      setSelectedFeedback('✓ Correct recall!')
    } else {
      setSelectedFeedback(`Not quite — it was ${currentQuestion.answer}`)
    }

    setTimeout(() => {
      setSelectedFeedback('')
      if (currentQIndex + 1 < activeScene.questions.length) {
        setCurrentQIndex((i) => i + 1)
      } else {
        setIsCompleted(true)
      }
    }, 1100)
  }

  return (
    <GameShell
      title="Picture Recall"
      category="Memory and recall"
      description="Study the collection of visual objects, then answer calm recall questions."
      dbKey="memory-match"
      isCompleted={isCompleted}
      onRestart={startNewGame}
      onBack={onBack}
      stats={[
        { label: 'Phase', value: phase === 'study' ? 'Observing' : `Q ${currentQIndex + 1}/3`, icon: HelpCircle },
        { label: 'Score', value: `${correctCount} / 3`, icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Questions Answered', value: '3 of 3' },
        { label: 'Recall Accuracy', value: `${Math.round((correctCount / 3) * 100)}%` },
      ]}
    >
      <div className="flex flex-col items-center">
        {phase === 'study' ? (
          <div className="w-full max-w-lg text-center animate-fadeIn">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-teal">
              Study the 5 items below
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {activeScene.items.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white p-4 shadow-soft"
                  >
                    <span className={`grid h-12 w-12 place-items-center rounded-xl ${item.color}`}>
                      <Icon size={26} />
                    </span>
                    <span className="mt-2 text-xs font-semibold text-ink">{item.name}</span>
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => setPhase('quiz')}
              className="mt-6 rounded-xl bg-teal px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition"
            >
              I have memorized them → Start Questions
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md animate-fadeIn">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-soft text-center">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Question {currentQIndex + 1} of {activeScene.questions.length}
              </span>
              <h3 className="mt-2 text-base font-semibold text-ink">{currentQuestion.text}</h3>

              <div className="mt-5 space-y-2.5">
                {currentQuestion.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    className="w-full rounded-xl border border-line bg-white p-3 text-left text-xs font-medium text-ink hover:border-teal hover:bg-[#fbf9f0] transition shadow-sm"
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {selectedFeedback && (
                <p role="status" className="mt-4 text-xs font-semibold text-teal animate-fadeIn">
                  {selectedFeedback}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </GameShell>
  )
}
