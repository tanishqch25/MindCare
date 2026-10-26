import { useEffect, useState } from 'react'
import { Activity, Brain, CalendarDays, Check, ChevronRight, Clock3, Heart, MessageCircle, Play, ShieldCheck, Sparkles, Target, TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { activities, weeklyProgress } from '../data/mockData'
import { supabase, supabaseConfigured } from '../supabaseClient'
import MemoryMatchGame from './MemoryMatchGame'

const exercises = [
  { key: 'memory-match', title: 'Memory match', description: 'A light matching activity to practice recall.', time: 6, icon: Brain, tint: 'bg-[#f1f0df] text-[#6A6F34]', isInteractive: true },
  { key: 'focus-flow', title: 'Focus flow', description: 'A short attention exercise at your own pace.', time: 5, icon: Target, tint: 'bg-[#f3eac3] text-[#6A6F34]' },
  { key: 'mindful-breathing', title: 'Mindful breathing', description: 'Pause for a few calm, steady breaths.', time: 3, icon: Sparkles, tint: 'bg-[#f5efda] text-[#807846]' },
]
function PageHeading({ eyebrow, title, description, action }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-medium text-teal">{eyebrow}</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2><p className="mt-1.5 text-sm text-muted">{description}</p></div>{action}</div>
}

function ExercisesPage() {
  const [activeGame, setActiveGame] = useState('')
  const [started, setStarted] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  if (activeGame === 'memory-match') {
    return <MemoryMatchGame onBack={() => setActiveGame('')} onComplete={() => setMessage('Memory match saved to your progress!')} />
  }

  async function complete(exercise) {
    if (!supabaseConfigured) { setMessage('Demo mode: connect Supabase to save completed exercises.'); return }
    setBusy(true); setMessage('')
    const {error} = await supabase.from('exercise_sessions').insert({exercise_key:exercise.key,duration_minutes:exercise.time})
    if(error) setMessage('Could not save this session. Run the exercise table setup in Supabase, then try again.')
    else { setMessage(`${exercise.title} saved to your progress.`); setStarted('') }
    setBusy(false)
  }

  return (
    <>
      <PageHeading eyebrow="YOUR PRACTICE" title="Exercises" description="Choose a short activity. Take a break or stop whenever you like." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {exercises.map(({ key, title, description, time, icon: Icon, tint, isInteractive }) => (
          <article key={key} className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${tint}`}>
                <Icon size={20} />
              </span>
              {isInteractive && (
                <span className="rounded-full bg-mint px-2.5 py-0.5 text-[10px] font-semibold text-teal">
                  Interactive
                </span>
              )}
            </div>
            <h3 className="mt-4 text-base font-semibold">{title}</h3>
            <p className="mt-2 min-h-10 text-sm leading-5 text-muted">{description}</p>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <Clock3 size={14} />~{time} min
              </span>
              {isInteractive ? (
                <button
                  onClick={() => setActiveGame(key)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition"
                >
                  <Play size={13} fill="currentColor" /> Play game
                </button>
              ) : (
                <button
                  onClick={() => started === key ? complete(exercises.find(item => item.key === key)) : setStarted(key)}
                  disabled={busy || (!supabaseConfigured && started === key)}
                  className="rounded-lg bg-teal px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {busy && started === key ? 'Saving…' : started === key ? 'Mark complete' : 'Start exercise'}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {message && <p role="status" className="mt-4 rounded-xl bg-white p-4 text-sm text-muted">{message}</p>}
      <p className="mt-5 rounded-xl bg-white p-4 text-xs leading-5 text-muted">
        Sessions record only the exercise name, estimated duration, and completion time. They are recreational cognitive activities and do not measure or evaluate clinical performance.
      </p>
    </>
  )
}
function MoodPage() {
  const [selected, setSelected] = useState('')
  const [history, setHistory] = useState([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const moods = [['😔','Low'],['😕','A little low'],['😐','Okay'],['🙂','Good'],['😊','Great']]

  useEffect(() => {
    if (!supabaseConfigured) return
    supabase.from('mood_checkins').select('id,mood,created_at').order('created_at',{ascending:false}).limit(10)
      .then(({data,error}) => { if(error) setMessage('Could not load check-ins. Confirm the database setup, then reload.'); else setHistory(data || []) })
  }, [])

  async function saveCheckin() {
    if (!selected) return
    setBusy(true); setMessage('')
    const {data,error} = await supabase.from('mood_checkins').insert({mood:selected}).select('id,mood,created_at').single()
    if(error) setMessage('Could not save this check-in. Check that the Supabase table is set up.')
    else { setHistory(previous => [data,...previous].slice(0,10)); setSelected(''); setMessage('Your check-in was saved to your account.') }
    setBusy(false)
  }

  return <><PageHeading eyebrow="A MOMENT FOR YOU" title="Mood check-in" description="Pause and notice how you feel. There’s no right or wrong answer."/><section className="max-w-2xl rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-8"><h3 className="text-base font-semibold">How are you feeling right now?</h3><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">{moods.map(([emoji,label])=><button key={label} onClick={() => {setSelected(label);setMessage('')}} aria-pressed={selected===label} className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${selected===label ? 'border-teal bg-mint' : 'border-line hover:bg-[#fbf9f0]'}`}><span className="text-3xl">{emoji}</span><span className="text-xs text-muted">{label}</span></button>)}</div>{selected && <button onClick={saveCheckin} disabled={busy || !supabaseConfigured} className="mt-5 rounded-xl bg-teal px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save check-in'}</button>}{message && <p role="status" className="mt-4 rounded-xl bg-[#f7f5e7] p-3 text-sm text-ink">{message}</p>}<p className="mt-5 text-xs leading-5 text-muted">Only your selected mood and the time are saved. Avoid adding sensitive details; this is not a clinical record.</p></section>{history.length>0 && <section className="mt-4 max-w-2xl rounded-2xl border border-line bg-white p-5"><h3 className="font-semibold">Your recent check-ins</h3>{history.map(entry=><div key={entry.id} className="flex justify-between border-b border-line py-3 last:border-0"><span className="text-sm">{entry.mood}</span><time className="text-xs text-muted">{new Date(entry.created_at).toLocaleString()}</time></div>)}</section>}{!supabaseConfigured && <p className="mt-4 max-w-2xl rounded-xl bg-white p-4 text-xs leading-5 text-muted">Demo mode: check-ins are not saved yet. Add your Supabase project settings and run the database setup to enable saving.</p>}</>
}
function ProgressPage() {
  const [sessions, setSessions] = useState([])
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabaseConfigured) { setLoading(false); return }
    let active = true
    Promise.all([
      supabase.from('exercise_sessions').select('id,exercise_key,duration_minutes,created_at').order('created_at',{ascending:false}).limit(100),
      supabase.from('mood_checkins').select('id,mood,created_at').order('created_at',{ascending:false}).limit(100),
    ]).then(([exerciseResult,moodResult]) => {
      if (!active) return
      if (exerciseResult.error || moodResult.error) setError('Progress data could not be loaded. Confirm both database tables are set up.')
      else { setSessions(exerciseResult.data || []); setCheckins(moodResult.data || []) }
      setLoading(false)
    })
    return () => {active=false}
  }, [])

  const dateKey = value => { const d=new Date(value); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
  const days = Array.from({length:7},(_,index)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(6-index));const key=dateKey(d);return {key,day:new Intl.DateTimeFormat(undefined,{weekday:'short'}).format(d),exercises:sessions.filter(item=>dateKey(item.created_at)===key).length,checkins:checkins.filter(item=>dateKey(item.created_at)===key).length}})
  const minutes = sessions.reduce((total,item)=>total+item.duration_minutes,0)
  const recent = [...sessions.map(item=>({...item,kind:'exercise',label:exercises.find(e=>e.key===item.exercise_key)?.title||'Exercise'})),...checkins.map(item=>({...item,kind:'mood',label:`Mood check-in · ${item.mood}`}))].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,8)

  return <><PageHeading eyebrow="YOUR JOURNEY" title="My progress" description="A record of your saved activities and check-ins."/><div className="grid gap-4 sm:grid-cols-3"><Metric icon={Activity} label="Completed exercises" value={sessions.length} detail="Your saved sessions"/><Metric icon={Clock3} label="Practice time" value={`${minutes} min`} detail="Estimated from exercise length"/><Metric icon={Heart} label="Mood check-ins" value={checkins.length} detail="Your saved check-ins"/></div><section className="mt-4 rounded-2xl border border-line bg-white p-5 shadow-soft"><h3 className="font-semibold">Your last 7 days</h3><p className="mt-1 text-xs text-muted">Counts of activities you saved; no scores or clinical interpretation.</p>{loading?<p className="py-12 text-center text-sm text-muted">Loading your progress…</p>:error?<p role="alert" className="py-12 text-center text-sm text-muted">{error}</p>:<><div className="mt-4 flex gap-4 text-[11px] text-muted"><span>Exercises</span><span>Check-ins</span></div><div className="mt-2 h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={days}><CartesianGrid vertical={false} stroke="#ece8d8"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:'#929079',fontSize:11}}/><Tooltip/><Area dataKey="exercises" name="Exercises" stroke="#6A6F34" fill="#f3eac3"/><Area dataKey="checkins" name="Mood check-ins" stroke="#9a985c" fill="#f1f0df"/></AreaChart></ResponsiveContainer></div></>}</section><section className="mt-4 rounded-2xl border border-line bg-white p-5"><h3 className="font-semibold">Recent activity</h3>{loading?<p className="py-4 text-sm text-muted">Loading…</p>:recent.length===0?<p className="py-4 text-sm text-muted">No saved activity yet. Your completed exercises and check-ins will appear here.</p>:recent.map(item=><div key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0"><div><p className="text-sm font-medium">{item.label}</p><p className="mt-1 text-xs text-muted">{item.kind==='exercise'?`${item.duration_minutes} min exercise`: 'Mood check-in'}</p></div><time className="shrink-0 text-xs text-muted">{new Date(item.created_at).toLocaleString()}</time></div>)}</section></>
}
function Metric({icon:Icon,label,value,detail}) { return <article className="rounded-2xl border border-line bg-white p-5 shadow-soft"><Icon size={19} className="text-teal"/><p className="mt-4 text-xs text-muted">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted">{detail}</p></article> }

function CarePage({appointments=false}) {
  return <><PageHeading eyebrow={appointments ? 'YOUR SUPPORT' : 'PEOPLE YOU TRUST'} title={appointments ? 'Appointments' : 'My care circle'} description={appointments ? 'Keep track of support you arrange with your care team.' : 'A place for the people you choose to support you.'}/><section className="max-w-2xl rounded-2xl border border-line bg-white p-6 shadow-soft"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-teal">{appointments ? <CalendarDays size={22}/> : <MessageCircle size={22}/>}</span><h3 className="mt-4 text-base font-semibold">{appointments ? 'No appointments added' : 'Your circle is ready when you are'}</h3><p className="mt-2 text-sm leading-6 text-muted">{appointments ? 'This demo has no calendar connection. Later, you can add appointments and reminders here.' : 'In a future version, you can invite trusted people and choose what information to share with them.'}</p><button className="mt-5 inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-xs font-semibold text-muted" disabled><span>{appointments ? 'Add appointment' : 'Invite someone'}</span><span className="text-[10px]">Coming later</span></button></section><p className="mt-5 max-w-2xl text-xs leading-5 text-muted">Your health information should only be shared with people you authorize, with clear controls over what they can see.</p></>
}

export default function WorkspacePage({active}) {
  if (active === 'Exercises') return <ExercisesPage/>
  if (active === 'Mood check-in') return <MoodPage/>
  if (active === 'My progress') return <ProgressPage/>
  if (active === 'Appointments') return <CarePage appointments/>
  return <CarePage/>
}



