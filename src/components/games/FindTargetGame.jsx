import { useEffect, useState } from 'react'
import { CheckCircle2, Heart, Leaf, Sparkles, Star, Sun, Target } from 'lucide-react'
import GameShell from './GameShell'

const SYMBOLS = [
  { id: 'heart', label: 'Heart', icon: Heart },
  { id: 'star', label: 'Star', icon: Star },
  { id: 'sun', label: 'Sun', icon: Sun },
  { id: 'leaf', label: 'Leaf', icon: Leaf },
  { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
]

export default function FindTargetGame({ onBack }) {
  const [targetSymbol, setTargetSymbol] = useState(SYMBOLS[0])
  const [gridItems, setGridItems] = useState([])
  const [foundIds, setFoundIds] = useState([])
  const [isCompleted, setIsCompleted] = useState(false)
  const totalTargetCount = 5

  const generateBoard = () => {
    // Pick random target
    const target = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    setTargetSymbol(target)

    // Build 20 items (5 target, 15 distractors)
    const items = []
    for (let i = 0; i < totalTargetCount; i++) {
      items.push({ id: `t-${i}`, isTarget: true, symbol: target })
    }
    const distractors = SYMBOLS.filter((s) => s.id !== target.id)
    for (let i = 0; i < 15; i++) {
      const dist = distractors[Math.floor(Math.random() * distractors.length)]
      items.push({ id: `d-${i}`, isTarget: false, symbol: dist })
    }

    // Shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = items[i]
      items[i] = items[j]
      items[j] = temp
    }

    setGridItems(items)
    setFoundIds([])
    setIsCompleted(false)
  }

  useEffect(() => {
    generateBoard()
  }, [])

  const handleItemClick = (item) => {
    if (isCompleted || foundIds.includes(item.id)) return

    if (item.isTarget) {
      const nextFound = [...foundIds, item.id]
      setFoundIds(nextFound)
      if (nextFound.length === totalTargetCount) {
        setIsCompleted(true)
      }
    }
  }

  const TargetIcon = targetSymbol.icon

  return (
    <GameShell
      title="Find the Target"
      category="Attention and focus"
      description={`Scan the field and tap every ${targetSymbol.label} symbol.`}
      dbKey="focus-flow"
      isCompleted={isCompleted}
      onRestart={generateBoard}
      onBack={onBack}
      stats={[
        { label: 'Target', value: targetSymbol.label, icon: Target },
        { label: 'Found', value: `${foundIds.length} / ${totalTargetCount}`, icon: CheckCircle2 },
      ]}
      completionStats={[
        { label: 'Target Symbol', value: targetSymbol.label },
        { label: 'Total Located', value: `${totalTargetCount} of ${totalTargetCount}` },
      ]}
    >
      <div className="flex flex-col items-center">
        {/* Banner with Target */}
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-3 shadow-soft">
          <span className="text-xs font-semibold text-muted">Target to find:</span>
          <div className="flex items-center gap-2 rounded-xl bg-mint px-3 py-1.5 text-xs font-bold text-teal">
            <TargetIcon size={18} />
            <span>{targetSymbol.label}</span>
          </div>
          <span className="text-xs text-muted">
            ({totalTargetCount - foundIds.length} remaining)
          </span>
        </div>

        {/* 5x4 Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-w-md w-full">
          {gridItems.map((item) => {
            const Icon = item.symbol.icon
            const isFound = foundIds.includes(item.id)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                disabled={isFound || isCompleted}
                aria-label={item.symbol.label}
                className={`flex aspect-square items-center justify-center rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal ${
                  isFound
                    ? 'border-teal bg-mint/50 text-teal scale-95 shadow-none'
                    : 'border-line bg-white text-muted hover:border-teal/40 hover:text-ink hover:bg-[#faf8ee] shadow-soft'
                }`}
              >
                <Icon size={24} strokeWidth={isFound ? 2.5 : 1.8} />
              </button>
            )
          })}
        </div>
      </div>
    </GameShell>
  )
}
