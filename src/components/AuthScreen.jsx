import { useState } from 'react'
import { Heart, Leaf, LoaderCircle, LockKeyhole, Mail } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function AuthScreen() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true); setMessage(''); setError('')
    try {
      const result = mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
      if (result.error) throw result.error
      if (mode === 'signup' && !result.data.session) {
        setMessage('Account created. Check your email for a confirmation link, then sign in here.')
      }
    } catch (cause) {
      setError(cause.message || 'Unable to connect. Check your settings and try again.')
    } finally { setBusy(false) }
  }

  return <main className="grid min-h-screen place-items-center bg-[#fbf9f0] px-5 py-10 text-ink">
    <section className="w-full max-w-md rounded-3xl border border-line bg-white p-7 shadow-soft sm:p-9">
      <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal text-white"><Leaf size={22}/></span><div><p className="font-bold">MindCare <span className="text-teal">AI</span></p><p className="text-[10px] tracking-[.14em] text-muted">WELLNESS, TOGETHER</p></div></div>
      <h1 className="mt-8 text-2xl font-semibold">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
      <p className="mt-2 text-sm leading-6 text-muted">{mode === 'signin' ? 'Sign in to continue to your private wellness space.' : 'Create an account to keep your check-ins with you.'}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-xs font-medium">Email address<span className="mt-2 flex items-center gap-2 rounded-xl border border-line px-3 py-3 text-muted"><Mail size={16}/><input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-transparent text-sm text-ink outline-none" placeholder="you@example.com"/></span></label>
        <label className="block text-xs font-medium">Password<span className="mt-2 flex items-center gap-2 rounded-xl border border-line px-3 py-3 text-muted"><LockKeyhole size={16}/><input required minLength={8} type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-transparent text-sm text-ink outline-none" placeholder="At least 8 characters"/></span></label>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        {message && <p role="status" className="rounded-lg bg-mint p-3 text-xs leading-5 text-ink">{message}</p>}
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">{busy && <LoaderCircle className="animate-spin" size={16} />}{mode === 'signin' ? 'Sign in' : 'Create account'}</button>
      </form>
      <p className="mt-5 text-center text-xs text-muted">{mode === 'signin' ? 'New to MindCare AI?' : 'Already have an account?'} <button onClick={()=>{setMode(mode === 'signin' ? 'signup' : 'signin');setMessage('');setError('')}} className="font-semibold text-teal underline-offset-2 hover:underline">{mode === 'signin' ? 'Create account' : 'Sign in'}</button></p>
      <p className="mt-6 flex items-start gap-2 border-t border-line pt-5 text-[11px] leading-5 text-muted"><Heart size={14} className="mt-0.5 shrink-0 text-teal"/>This is a wellness support tool, not a diagnosis or replacement for professional care.</p>
    </section>
  </main>
}

