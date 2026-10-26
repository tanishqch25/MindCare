import {
  Activity,
  AlertCircle,
  Brain,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Clock3,
  Heart,
  Home,
  Leaf,
  LogOut,
  Menu,
  MessageCircle,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { activities as sampleActivities, weeklyProgress as sampleWeeklyProgress } from './data/mockData'
import WorkspacePage from './components/WorkspacePage'
import AuthScreen from './components/AuthScreen'
import { supabase, supabaseConfigured } from './supabaseClient'

const navItems = [
  { label: 'Overview', icon: Home, active: true },
  { label: 'Exercises', icon: Brain, badge: '2' },
  { label: 'Mood check-in', icon: Heart },
  { label: 'My progress', icon: TrendingUp },
  { label: 'My care circle', icon: MessageCircle },
]

const EXERCISES_META = {
  'memory-match': { title: 'Memory match', defaultMinutes: 6, icon: Brain, color: 'bg-mint text-teal' },
  'focus-flow': { title: 'Focus flow', defaultMinutes: 5, icon: Target, color: 'bg-[#f1f0df] text-[#6A6F34]' },
  'mindful-breathing': { title: 'Mindful breathing', defaultMinutes: 3, icon: Sparkles, color: 'bg-[#f5efda] text-[#807846]' },
}

const DEFAULT_EXERCISE = { title: 'Practice exercise', defaultMinutes: 5, icon: Activity, color: 'bg-mint text-teal' }

function formatActivityTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (isToday) return `Today, ${timeStr}`
  if (isYesterday) return `Yesterday, ${timeStr}`
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`
}

function dateKey(value) {
  const d = new Date(value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function Sidebar({ open, onClose, active, onNavigate, user, onSignOut }) {
  return (
    <>
      {open && <button aria-label="Close navigation overlay" className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[258px] shrink-0 flex-col border-r border-line bg-white px-5 py-6 transition-transform lg:static lg:min-h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-1">
          <a href="#overview" className="flex items-center gap-3" aria-label="MindCare AI home">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-teal text-white">
              <Leaf size={22} />
            </span>
            <span>
              <span className="block text-[16px] font-bold tracking-tight">MindCare<span className="text-teal"> AI</span></span>
              <span className="block text-[10px] font-medium tracking-[.16em] text-muted">WELLNESS, TOGETHER</span>
            </span>
          </a>
          <button aria-label="Close navigation" className="rounded-lg p-2 text-muted hover:bg-mint lg:hidden" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="mt-8 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#929079]">Workspace</div>
        <nav className="mt-3 space-y-1" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon, badge }) => (
            <button
              key={label}
              onClick={() => onNavigate(label)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium transition ${active === label ? 'bg-mint text-teal' : 'text-muted hover:bg-[#fbf9f0] hover:text-ink'}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className="flex-1">{label}</span>
              {badge && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] text-teal shadow-sm">{badge}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-9 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#929079]">Your support</div>
        <button onClick={() => onNavigate('Appointments')} className="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium text-muted hover:bg-[#fbf9f0]">
          <CalendarDays size={18} strokeWidth={1.8} />
          <span>Appointments</span>
        </button>
        <div className="mt-auto rounded-2xl bg-[#f3f8f7] p-4">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-teal shadow-sm">
            <CircleHelp size={18} />
          </div>
          <p className="mt-3 text-sm font-semibold">Here for you</p>
          <p className="mt-1 text-xs leading-5 text-muted">Small steps count. Find gentle guidance whenever you need it.</p>
          <button className="mt-3 flex items-center gap-1 text-xs font-semibold text-teal">
            Explore resources <ChevronRight size={14} />
          </button>
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-line pt-5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#eeecd9] text-xs font-semibold text-[#527170]">
            {user?.email?.slice(0, 2).toUpperCase() || 'JD'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{user?.email?.split('@')[0] || 'Jordan Davis'}</p>
            <p className="text-[11px] text-muted">{user ? 'Personal space' : 'Demo space'}</p>
          </div>
          {onSignOut && (
            <button aria-label="Sign out" onClick={onSignOut} className="rounded-lg p-2 text-muted hover:bg-mint">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

function StatCard({ icon: Icon, iconStyle, label, value, helper, loading, isDemo }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${iconStyle}`}>
          <Icon size={19} />
        </span>
        {isDemo ? (
          <span className="rounded-full bg-mint/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-teal">
            Sample
          </span>
        ) : (
          <button aria-label={`More about ${label}`} className="rounded-lg p-1 text-[#929079] hover:bg-[#fbf9f0]">
            <MoreHorizontal size={19} />
          </button>
        )}
      </div>
      <p className="mt-4 text-[12px] font-medium text-muted">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        {loading ? (
          <span className="animate-pulse text-[27px] font-semibold tracking-tight text-muted/40">…</span>
        ) : (
          <span className="text-[27px] font-semibold tracking-tight">{value}</span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-muted">{helper}</p>
    </article>
  )
}

function CustomChartTooltip({ active, payload, label, isDemo }) {
  if (!active || !payload || !payload.length) return null
  const exercises = payload.find(p => p.dataKey === 'exercises')?.value ?? 0
  const checkins = payload.find(p => p.dataKey === 'checkins')?.value ?? 0
  const dateLabel = payload[0]?.payload?.dateLabel
  return (
    <div className="rounded-xl border border-line bg-white p-3 text-xs shadow-soft">
      <p className="font-semibold text-ink">
        {label} {dateLabel ? `· ${dateLabel}` : ''}
      </p>
      <div className="mt-2 space-y-1.5">
        <p className="flex items-center gap-2 text-ink">
          <span className="h-2 w-2 rounded-full bg-teal" />
          Completed exercises: <span className="font-semibold">{exercises}</span>
        </p>
        <p className="flex items-center gap-2 text-ink">
          <span className="h-2 w-2 rounded-full bg-[#C4BF71]" />
          Mood check-ins: <span className="font-semibold">{checkins}</span>
        </p>
      </div>
      <p className="mt-2.5 border-t border-line/60 pt-1.5 text-[10px] text-muted">
        {isDemo ? 'Sample activity data · Demo mode' : 'Activity counts only · Not clinical scores'}
      </p>
    </div>
  )
}

function ProgressChart({ data, loading, error, isDemo, onRetry }) {
  const maxCount = useMemo(() => {
    if (!data || !data.length) return 3
    const highest = Math.max(...data.map(d => Math.max(d.exercises || 0, d.checkins || 0)))
    return Math.max(highest, 3)
  }, [data])

  const totalActivities = useMemo(() => {
    if (!data || !data.length) return 0
    return data.reduce((acc, d) => acc + (d.exercises || 0) + (d.checkins || 0), 0)
  }, [data])

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6" aria-labelledby="progress-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="progress-title" className="text-[15px] font-semibold">Your gentle progress</h2>
          <p className="mt-1 text-xs text-muted">
            {isDemo ? 'Sample 7-day practice activity' : 'A 7-day look at your saved practice sessions'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDemo ? (
            <span className="rounded-full bg-mint px-2.5 py-1 text-[10px] font-semibold text-teal">
              Sample data
            </span>
          ) : (
            <span className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted">
              Last 7 days
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-teal" />
          Completed exercises
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#C4BF71]" />
          Mood check-ins
        </span>
        <span className="ml-auto text-[10px] text-[#929079]">
          {isDemo ? 'Illustrative counts · Not clinical scores' : 'Activity counts · Not clinical scores'}
        </span>
      </div>
      {loading ? (
        <div className="mt-4 flex h-[210px] w-full flex-col items-center justify-center text-xs text-muted">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal border-t-transparent" />
          <p className="mt-2">Loading activity chart…</p>
        </div>
      ) : error ? (
        <div role="alert" className="mt-4 flex h-[210px] w-full flex-col items-center justify-center rounded-xl bg-amber-50/70 p-4 text-center text-xs">
          <p className="font-semibold text-amber-900">Activity chart unavailable</p>
          <p className="mt-1 text-[11px] text-amber-800">{error}</p>
          {onRetry && (
            <button onClick={onRetry} className="mt-2 inline-flex items-center gap-1 font-semibold text-teal hover:underline">
              <RefreshCw size={12} /> Retry
            </button>
          )}
        </div>
      ) : (
        <div className="relative mt-4 h-[210px] w-full">
          {!isDemo && totalActivities === 0 && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/75 p-4 text-center backdrop-blur-[1px]">
              <p className="text-xs font-semibold text-ink">No saved activity in the last 7 days</p>
              <p className="mt-1 text-[11px] text-muted">
                Complete an exercise or save a mood check-in to see your counts here.
              </p>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="exerciseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6A6F34" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6A6F34" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="checkinFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C4BF71" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#C4BF71" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#ece8d8" strokeDasharray="3 3" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#929079', fontSize: 11 }} dy={10} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#929079', fontSize: 10 }}
                allowDecimals={false}
                domain={[0, maxCount + 1]}
              />
              <Tooltip content={<CustomChartTooltip isDemo={isDemo} />} />
              <Area type="monotone" dataKey="exercises" name="Completed exercises" stroke="#6A6F34" strokeWidth={2.5} fill="url(#exerciseFill)" />
              <Area type="monotone" dataKey="checkins" name="Mood check-ins" stroke="#C4BF71" strokeWidth={2.5} fill="url(#checkinFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

function ActivityList({ items, loading, error, isDemo, onNavigate, onRetry }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6" aria-labelledby="activity-title">
      <div className="flex items-center justify-between">
        <div>
          <h2 id="activity-title" className="text-[15px] font-semibold">Recent activity</h2>
          <p className="mt-1 text-xs text-muted">
            {isDemo ? 'Sample moments of practice' : 'Your saved exercises and check-ins'}
          </p>
        </div>
        <button onClick={() => onNavigate('My progress')} className="text-xs font-semibold text-teal hover:text-teal-700">
          See all
        </button>
      </div>
      {loading ? (
        <div className="py-10 text-center text-xs text-muted">
          <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-teal border-t-transparent" />
          <p className="mt-2">Loading recent activity…</p>
        </div>
      ) : error ? (
        <div role="alert" className="my-4 rounded-xl bg-amber-50/70 p-4 text-center text-xs">
          <p className="font-semibold text-amber-900">Activity records unavailable</p>
          <p className="mt-1 text-[11px] text-amber-800">{error}</p>
          {onRetry && (
            <button onClick={onRetry} className="mt-2 inline-flex items-center gap-1 font-semibold text-teal hover:underline">
              <RefreshCw size={12} /> Retry
            </button>
          )}
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-mint text-teal">
            <Activity size={18} />
          </div>
          <p className="mt-2.5 text-xs font-semibold text-ink">No saved activity yet</p>
          <p className="mt-1 text-[11px] text-muted">Completed exercises and mood check-ins will appear here.</p>
          <div className="mt-3.5 flex justify-center gap-2">
            <button onClick={() => onNavigate('Exercises')} className="rounded-lg bg-teal px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-teal-700">
              Start exercise
            </button>
            <button onClick={() => onNavigate('Mood check-in')} className="rounded-lg border border-line bg-white px-3 py-1.5 text-[11px] font-medium text-ink hover:bg-[#fbf9f0]">
              Check in
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 divide-y divide-line">
          {items.map(item => {
            const Icon = item.icon || Activity
            return (
              <div key={item.id} className="flex items-center gap-3 py-3.5">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.color}`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">{item.type}</p>
                  <p className="mt-1 truncate text-[11px] text-muted">{item.detail}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-[11px] font-medium text-ink">{item.score}</p>
                  <p className="mt-1 text-[10px] text-muted">{item.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function Dashboard({ user, onSignOut }) {
  const [mobileNav, setMobileNav] = useState(false)
  const [active, setActive] = useState('Overview')
  const navigate = (label) => {
    setActive(label)
    setMobileNav(false)
  }

  const isDemo = !supabaseConfigured || !user

  const [sessions, setSessions] = useState([])
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(Boolean(supabaseConfigured && user))
  const [dbError, setDbError] = useState('')
  const [quickSaving, setQuickSaving] = useState(false)
  const [quickFeedback, setQuickFeedback] = useState('')

  const fetchOverviewData = useCallback(async () => {
    if (!supabaseConfigured || !user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setDbError('')
    try {
      const [exerciseResult, moodResult] = await Promise.all([
        supabase
          .from('exercise_sessions')
          .select('id,exercise_key,duration_minutes,created_at')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('mood_checkins')
          .select('id,mood,created_at')
          .order('created_at', { ascending: false })
          .limit(100),
      ])

      if (exerciseResult.error || moodResult.error) {
        const errorMsg =
          exerciseResult.error?.message ||
          moodResult.error?.message ||
          'Could not load activity records. Please confirm database setup in Supabase.'
        setDbError(errorMsg)
      } else {
        setSessions(exerciseResult.data || [])
        setCheckins(moodResult.data || [])
      }
    } catch (err) {
      setDbError(err.message || 'Network error fetching activity records')
    } finally {
      setLoading(false)
    }
  }, [user])

  const handleQuickMood = async (label) => {
    if (!supabaseConfigured || !user) {
      navigate('Mood check-in')
      return
    }
    setQuickSaving(true)
    setQuickFeedback('')
    try {
      const { error } = await supabase.from('mood_checkins').insert({ mood: label })
      if (error) {
        setQuickFeedback('Could not save check-in. Confirm database tables are set up.')
      } else {
        setQuickFeedback(`Recorded: ${label}`)
        await fetchOverviewData()
      }
    } catch {
      setQuickFeedback('Unable to save check-in right now.')
    } finally {
      setQuickSaving(false)
    }
  }

  useEffect(() => {
    if (active === 'Overview' && supabaseConfigured && user) {
      fetchOverviewData()
    }
  }, [active, user, fetchOverviewData])

  // 7-day chart data based on actual saved records
  const chartDays = useMemo(() => {
    if (isDemo) {
      return sampleWeeklyProgress
    }
    return Array.from({ length: 7 }, (_, index) => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - (6 - index))
      const key = dateKey(d)
      const dayExercises = sessions.filter(item => dateKey(item.created_at) === key).length
      const dayCheckins = checkins.filter(item => dateKey(item.created_at) === key).length
      return {
        key,
        day: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(d),
        dateLabel: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d),
        exercises: dayExercises,
        checkins: dayCheckins,
        total: dayExercises + dayCheckins,
      }
    })
  }, [isDemo, sessions, checkins])

  // Real metric calculations for the 7-day window
  const metrics = useMemo(() => {
    if (isDemo) {
      return {
        exercisesCount: 4,
        practiceMinutes: 23,
        moodCount: 5,
        activeDays: 4,
        rhythm: 'Gentle',
        exercisesHelper: 'Sample data (demo mode)',
        minutesHelper: 'Sample data (demo mode)',
        moodHelper: 'Sample data (demo mode)',
        rhythmHelper: 'Sample data (demo mode)',
      }
    }

    const dayKeys = new Set(chartDays.map(d => d.key))
    const weekSessions = sessions.filter(s => dayKeys.has(dateKey(s.created_at)))
    const weekCheckins = checkins.filter(c => dayKeys.has(dateKey(c.created_at)))

    const exercisesCount = weekSessions.length
    const practiceMinutes = weekSessions.reduce((acc, s) => acc + (Number(s.duration_minutes) || 0), 0)
    const moodCount = weekCheckins.length

    const activeDaysSet = new Set([
      ...weekSessions.map(s => dateKey(s.created_at)),
      ...weekCheckins.map(c => dateKey(c.created_at)),
    ])
    const activeDays = activeDaysSet.size

    let rhythm = 'Resting'
    if (activeDays >= 4 || (exercisesCount + moodCount) >= 6) {
      rhythm = 'Steady'
    } else if (activeDays >= 1 || (exercisesCount + moodCount) >= 1) {
      rhythm = 'Gentle'
    }

    return {
      exercisesCount,
      practiceMinutes,
      moodCount,
      activeDays,
      rhythm,
      exercisesHelper: exercisesCount === 0
        ? 'No sessions logged in the last 7 days'
        : `${exercisesCount} session${exercisesCount === 1 ? '' : 's'} across the last 7 days`,
      minutesHelper: exercisesCount === 0
        ? 'Estimated from exercise duration'
        : `Across ${exercisesCount} short session${exercisesCount === 1 ? '' : 's'} in the last 7 days`,
      moodHelper: moodCount === 0
        ? 'No check-ins saved this week yet'
        : `${activeDays} active day${activeDays === 1 ? '' : 's'} with check-ins`,
      rhythmHelper: activeDays === 0
        ? 'Ready whenever you are'
        : `${activeDays} of 7 days with saved activity`,
    }
  }, [isDemo, chartDays, sessions, checkins])

  // Recent activity list items ordered newest first
  const recentActivities = useMemo(() => {
    if (isDemo) {
      return sampleActivities.map(item => ({
        ...item,
        icon: item.type.toLowerCase().includes('memory')
          ? Brain
          : item.type.toLowerCase().includes('focus')
          ? Target
          : Heart,
      }))
    }

    const exerciseItems = sessions.map(item => {
      const meta = EXERCISES_META[item.exercise_key] || DEFAULT_EXERCISE
      return {
        id: `exercise-${item.id}`,
        rawDate: new Date(item.created_at),
        type: meta.title,
        detail: `${item.duration_minutes || meta.defaultMinutes} min · Completed`,
        score: 'Completed',
        time: formatActivityTime(item.created_at),
        color: meta.color,
        icon: meta.icon,
      }
    })

    const moodItems = checkins.map(item => ({
      id: `mood-${item.id}`,
      rawDate: new Date(item.created_at),
      type: 'Mood check-in',
      detail: 'Daily reflection',
      score: item.mood,
      time: formatActivityTime(item.created_at),
      color: 'bg-[#f5efda] text-[#807846]',
      icon: Heart,
    }))

    const combined = [...exerciseItems, ...moodItems]
    combined.sort((a, b) => b.rawDate - a.rawDate)
    return combined.slice(0, 5)
  }, [isDemo, sessions, checkins])

  const todayDateStr = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(new Date()).toUpperCase()
  }, [])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const displayName = isDemo
    ? 'Jordan'
    : user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'friend')

  return (
    <div className="min-h-screen bg-[#fbf9f0] text-ink lg:flex">
      <Sidebar
        open={mobileNav}
        onClose={() => setMobileNav(false)}
        active={active}
        onNavigate={navigate}
        user={user}
        onSignOut={onSignOut}
      />
      <main id="overview" className="min-h-screen min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-line bg-[#fbf9f0]/95 px-5 backdrop-blur sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button aria-label="Open navigation" onClick={() => setMobileNav(true)} className="rounded-lg p-2 text-muted hover:bg-white lg:hidden">
              <Menu size={20} />
            </button>
            <div className="hidden items-center gap-2 text-xs text-muted sm:flex">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <span className="font-semibold text-ink">{active}</span>
            </div>
            <h1 className="text-sm font-semibold sm:hidden">{active}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-xs text-[#929079] md:flex">
              <Search size={15} />
              <span>Search</span>
              <span className="ml-8 rounded border border-line px-1.5 py-0.5 text-[10px]">⌘ K</span>
            </div>
            <button
              aria-label="Refresh dashboard data"
              title="Refresh dashboard data"
              onClick={fetchOverviewData}
              disabled={loading}
              className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white text-muted hover:bg-[#fbf9f0] disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-teal' : ''} />
            </button>
            <button aria-label="Notifications" className="relative grid h-9 w-9 place-items-center rounded-xl border border-line bg-white text-muted">
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-teal" />
              <Activity size={17} />
            </button>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#eee9c7] text-[11px] font-semibold text-[#6A6F34]">
              {user?.email?.slice(0, 2).toUpperCase() || 'JD'}
            </div>
          </div>
        </header>

        {active === 'Overview' ? (
          <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-6 sm:px-8 lg:px-9 lg:pt-7">
            {isDemo && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-mint/40 px-4 py-3 text-xs text-muted">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-teal text-[11px] font-bold text-white">
                    i
                  </span>
                  <p>
                    <span className="font-semibold text-ink">Demo mode active:</span> Supabase is not configured. The metrics, 7-day chart, and recent activity below are sample data.
                  </p>
                </div>
                <span className="text-[11px] font-medium text-teal">Connect Supabase to save real records</span>
              </div>
            )}

            {dbError && (
              <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 px-4 py-3 text-xs text-amber-900">
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={18} className="shrink-0 text-amber-700" />
                  <p>
                    <span className="font-semibold">Database error:</span> {dbError}
                  </p>
                </div>
                <button
                  onClick={fetchOverviewData}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-900"
                >
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-teal">{todayDateStr}</p>
                <h2 className="mt-2 text-[26px] font-semibold tracking-tight sm:text-[30px]">
                  {greeting}, {displayName} <span aria-hidden="true">☀️</span>
                </h2>
                <p className="mt-1.5 text-sm text-muted">A little progress is still progress. How are you feeling today?</p>
              </div>
              <button
                onClick={() => navigate('Mood check-in')}
                className="flex items-center gap-2 rounded-xl bg-teal px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                <Heart size={15} /> Check in today
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Target}
                iconStyle="bg-sky text-[#716F32]"
                label="Exercises this week"
                value={metrics.exercisesCount}
                helper={metrics.exercisesHelper}
                loading={loading}
                isDemo={isDemo}
              />
              <StatCard
                icon={Clock3}
                iconStyle="bg-mint text-teal"
                label="Time for yourself"
                value={`${metrics.practiceMinutes} min`}
                helper={metrics.minutesHelper}
                loading={loading}
                isDemo={isDemo}
              />
              <StatCard
                icon={Heart}
                iconStyle="bg-[#f5efda] text-[#807846]"
                label="Mood check-ins"
                value={metrics.moodCount}
                helper={metrics.moodHelper}
                loading={loading}
                isDemo={isDemo}
              />
              <StatCard
                icon={Sparkles}
                iconStyle="bg-[#eeecd9] text-[#6A6F34]"
                label="Your weekly rhythm"
                value={metrics.rhythm}
                helper={metrics.rhythmHelper}
                loading={loading}
                isDemo={isDemo}
              />
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
              <section className="relative flex min-h-[208px] flex-col justify-center overflow-hidden rounded-2xl bg-[#F3EAC3] p-6 sm:p-8">
                <div className="relative z-10 max-w-[440px]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.1em] text-teal">
                    <Sparkles size={12} /> A moment for you
                  </span>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-[23px]">Make room for a mindful pause</h2>
                  <p className="mt-2 max-w-sm text-xs leading-5 text-[#666849]">
                    Try a short, low-pressure activity. You can pause or stop whenever you like.
                  </p>
                  <button
                    onClick={() => navigate('Exercises')}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-teal shadow-sm hover:bg-white/70"
                  >
                    Explore exercises <ChevronRight size={15} />
                  </button>
                </div>
                <div className="pointer-events-none absolute -right-6 -top-10 h-48 w-48 rounded-full border-[22px] border-white/40 sm:right-8 sm:top-1 sm:h-56 sm:w-56" />
                <div className="pointer-events-none absolute right-8 top-12 h-32 w-32 rounded-full bg-[#E8E2B5] sm:right-20 sm:top-10 sm:h-40 sm:w-40" />
                <div className="pointer-events-none absolute right-[68px] top-[78px] grid h-16 w-16 place-items-center rounded-[22px] bg-white text-teal shadow-soft sm:right-[112px] sm:top-[86px] sm:h-[72px] sm:w-[72px]">
                  <Brain size={34} strokeWidth={1.5} />
                </div>
              </section>

              <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5efda] text-[#807846]">
                    <Heart size={19} />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold">A quick check-in</h2>
                    <p className="mt-1 text-[11px] text-muted">There’s no right or wrong answer</p>
                  </div>
                </div>
                <p className="mt-5 text-sm font-medium">How does this moment feel?</p>
                <div className="mt-3 flex justify-between gap-1">
                  {[
                    ['😔', 'Low'],
                    ['😕', 'A little low'],
                    ['😐', 'Okay'],
                    ['🙂', 'Good'],
                    ['😊', 'Great'],
                  ].map(([emoji, label]) => (
                    <button
                      key={label}
                      onClick={() => handleQuickMood(label)}
                      disabled={quickSaving}
                      aria-label={`I feel ${label.toLowerCase()}`}
                      className="group flex flex-col items-center gap-1.5 rounded-xl px-2 py-2 transition hover:bg-mint disabled:opacity-50"
                    >
                      <span className="text-[23px] transition group-hover:scale-110">{emoji}</span>
                      <span className="text-[9px] text-muted">{label}</span>
                    </button>
                  ))}
                </div>
                {quickFeedback && (
                  <p role="status" className="mt-2 text-[11px] font-medium text-teal">
                    ✓ {quickFeedback}
                  </p>
                )}
                <p className="mt-3 text-[10px] leading-4 text-muted">
                  {isDemo
                    ? 'Demo mode: check-ins are not saved yet. Connect Supabase to save your check-ins.'
                    : 'Your check-in is optional. Tap any mood to record directly, or open Mood check-in for details.'}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-[1.45fr_1fr]">
              <ProgressChart
                data={chartDays}
                loading={loading}
                error={dbError}
                isDemo={isDemo}
                onRetry={fetchOverviewData}
              />
              <ActivityList
                items={recentActivities}
                loading={loading}
                error={dbError}
                isDemo={isDemo}
                onNavigate={navigate}
                onRetry={fetchOverviewData}
              />
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#e7e2c9] bg-white px-4 py-4">
              <span className="mt-0.5 text-teal">
                <ShieldCheck size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold">A supportive tool, not a diagnosis</p>
                <p className="mt-1 max-w-4xl text-[11px] leading-5 text-muted">
                  MindCare AI is a wellness and habit tracking tool. Logged activities and progress counts are for your personal reference only and cannot diagnose or treat any condition. For health concerns, please speak with a qualified healthcare professional. If you need urgent help, contact local emergency services.
                </p>
              </div>
            </div>

            <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-[#929079]">
              <span>MindCare AI · A little care, every day.</span>
              <span>
                {isDemo
                  ? 'Demo dashboard · Showing sample data (connect Supabase to save personal records)'
                  : 'Private personal space · Saved securely in your Supabase account'}
              </span>
            </footer>
          </div>
        ) : (
          <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-6 sm:px-8 lg:px-9 lg:pt-7">
            <WorkspacePage active={active} />
          </div>
        )}
      </main>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(supabaseConfigured)

  useEffect(() => {
    if (!supabaseConfigured) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!supabaseConfigured) return <Dashboard />
  if (authLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fbf9f0] text-sm text-muted">
        Loading your secure session…
      </main>
    )
  }
  if (!session) return <AuthScreen />
  return <Dashboard user={session.user} onSignOut={() => supabase.auth.signOut()} />
}
