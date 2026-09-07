import { useState } from 'react'
import { auth } from './firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { Code2, Mail, Lock, User } from 'lucide-react'

function Auth({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(userCredential.user, { displayName: username })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-lg bg-yellow-400 grid place-items-center text-slate-900">
            <Code2 size={22} strokeWidth={2.8} />
          </div>
          <div>
            <div className="font-extrabold text-xl">Py<span className="text-sky-400">Quest</span></div>
            <div className="text-[10px] text-slate-500 tracking-wide uppercase">learn. play. master.</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-bold mb-1">{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
          <p className="text-slate-500 text-sm mb-6">{isSignUp ? 'Start your Python journey today' : 'Log in to continue your quest'}</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div>
                <label className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5"><User size={13} /> Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-sky-400"
                  placeholder="e.g. binil_codes"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5"><Mail size={13} /> Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-sky-400"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5"><Lock size={13} /> Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-sky-400"
                placeholder="At least 6 characters"
              />
            </div>

            {error && <p className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 rounded-lg p-3">{error}</p>}

            <button type="submit" disabled={loading} className="bg-sky-400 text-slate-900 font-bold py-3 rounded-xl hover:brightness-110 transition disabled:opacity-50">
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setError('') }} className="text-sky-400 font-semibold">
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth