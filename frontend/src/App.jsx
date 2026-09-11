import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { auth, db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import Auth from './Auth'
import { Code2, BookOpen, Trophy, Award, Flame, Zap, Menu, ChevronRight, CircleUserRound, Crown, Terminal, Send, RotateCcw, Sparkles, Target, Check, LockKeyhole, Clock3, ShieldCheck, Lightbulb, Users, Star, LogOut } from 'lucide-react'

const API_URL = 'https://python-tutor-backend-xj9m.onrender.com'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [progressLoaded, setProgressLoaded] = useState(false)
  const [levelProgress, setLevelProgress] = useState({ easy: 1, medium: 1, hard: 1 })
  const [view, setView] = useState('overview')
  const [level, setLevel] = useState(null)
  const [xp, setXp] = useState(0)
  const [questionNum, setQuestionNum] = useState(1)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [userCode, setUserCode] = useState('')
  const [feedback, setFeedback] = useState('')
  const [checking, setChecking] = useState(false)
  const [isHintVisible, setIsHintVisible] = useState(false)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        setProgressLoaded(false)
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (snap.exists()) {
          const data = snap.data()
          setXp(data.xp || 0)
          if (data.progress) {
            setLevelProgress(prev => ({ ...prev, ...data.progress }))
          }
        }
        setProgressLoaded(true)
      }
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (currentUser && progressLoaded) {
      setDoc(doc(db, 'users', currentUser.uid), { xp }, { merge: true })
    }
  }, [xp, currentUser, progressLoaded])

  useEffect(() => {
    if (currentUser && progressLoaded) {
      setDoc(doc(db, 'users', currentUser.uid), { progress: levelProgress }, { merge: true })
    }
  }, [levelProgress, currentUser, progressLoaded])

  const handleLogout = () => signOut(auth)

  const playerLevel = Math.floor(xp / 50) + 1

  const achievements = [
    { title: 'First Steps', desc: 'Answer your first question correctly', icon: <Zap size={20} />, unlocked: xp >= 10, xpNeeded: 10 },
    { title: 'Level 2 Explorer', desc: 'Reach Player Level 2', icon: <Star size={20} />, unlocked: xp >= 50, xpNeeded: 50 },
    { title: 'Century Club', desc: 'Earn 100 total XP', icon: <Trophy size={20} />, unlocked: xp >= 100, xpNeeded: 100 },
    { title: 'Level 5 Master', desc: 'Reach Player Level 5', icon: <Crown size={20} />, unlocked: xp >= 200, xpNeeded: 200 },
    { title: 'XP Legend', desc: 'Earn 500 total XP', icon: <Award size={20} />, unlocked: xp >= 500, xpNeeded: 500 },
  ]

  const startLevel = async (selectedLevel) => {
    setView('practice')
    setLevel(selectedLevel)
    setQuestionNum(levelProgress[selectedLevel] || 1)
    setFeedback('')
    setUserCode('')
    setIsHintVisible(false)
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/get-question?level=${selectedLevel}`)
      const text = await res.text()
      setQuestion(text)
    } catch (err) {
      setQuestion('Error loading question. Make sure your backend is running!')
    }
    setLoading(false)
  }

  const nextQuestion = async () => {
    if (questionNum >= 10) return
    const newNum = questionNum + 1
    setQuestionNum(newNum)
    setLevelProgress(prev => ({ ...prev, [level]: newNum }))
    setFeedback('')
    setUserCode('')
    setIsHintVisible(false)
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/get-question?level=${level}`)
      const text = await res.text()
      setQuestion(text)
    } catch (err) {
      setQuestion('Error loading question.')
    }
    setLoading(false)
  }

  const submitAnswer = async () => {
    setChecking(true)
    setFeedback('')
    try {
      const res = await fetch(`${API_URL}/check-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, code: userCode })
      })
      const text = await res.text()
      setFeedback(text)
      if (text.toLowerCase().includes('correct') && !text.toLowerCase().includes('incorrect')) {
        const points = level === 'easy' ? 10 : level === 'medium' ? 20 : 30
        setXp(prev => prev + points)
      }
    } catch (err) {
      setFeedback('Error checking answer. Try again!')
    }
    setChecking(false)
  }
  const handleCodeKeyDown = (e) => {
    const textarea = e.target
    const { selectionStart, selectionEnd, value } = textarea

    if (e.key === 'Tab') {
      e.preventDefault()
      const newValue = value.substring(0, selectionStart) + '    ' + value.substring(selectionEnd)
      setUserCode(newValue)
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 4
      })
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
      const currentLine = value.substring(lineStart, selectionStart)
      const indentMatch = currentLine.match(/^\s*/)
      let indent = indentMatch ? indentMatch[0] : ''
      if (currentLine.trim().endsWith(':')) {
        indent += '    '
      }
      const newValue = value.substring(0, selectionStart) + '\n' + indent + value.substring(selectionEnd)
      setUserCode(newValue)
      requestAnimationFrame(() => {
        const newPos = selectionStart + 1 + indent.length
        textarea.selectionStart = textarea.selectionEnd = newPos
      })
    }
  }

  const goBack = () => {
    setView('overview')
    setLevel(null)
    setQuestion('')
    setUserCode('')
    setFeedback('')
  }

  const pathLevels = [
    { label: 'Python Basics', subtitle: 'Variables & values', status: 'complete' },
    { label: 'Easy Challenges', subtitle: 'Simple problems', status: level === 'easy' || xp > 0 ? 'current' : 'locked' },
    { label: 'Medium Challenges', subtitle: 'Intermediate logic', status: 'locked' },
    { label: 'Hard Challenges', subtitle: 'Advanced problems', status: 'locked' },
  ]

  const ChallengeCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <button onClick={() => startLevel('easy')} className="text-left bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-800/50 rounded-2xl p-6 hover:-translate-y-1 transition">
        <div className="flex justify-between items-center mb-4">
          <CircleUserRound size={24} className="text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400 tracking-wide">AVAILABLE</span>
        </div>
        <h3 className="text-lg font-bold mb-1">Easy</h3>
        <p className="text-slate-400 text-sm mb-4">Build your foundation</p>
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-1 text-emerald-400"><Zap size={14} fill="currentColor" /> 10 XP</span>
          <ChevronRight size={18} />
        </div>
      </button>

      <button onClick={() => startLevel('medium')} className="text-left bg-gradient-to-br from-yellow-900/40 to-slate-900 border border-yellow-800/50 rounded-2xl p-6 hover:-translate-y-1 transition">
        <div className="flex justify-between items-center mb-4">
          <Zap size={24} className="text-yellow-400" />
          <span className="text-[10px] font-bold text-yellow-400 tracking-wide">AVAILABLE</span>
        </div>
        <h3 className="text-lg font-bold mb-1">Medium</h3>
        <p className="text-slate-400 text-sm mb-4">Put your skills to work</p>
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-1 text-yellow-400"><Zap size={14} fill="currentColor" /> 20 XP</span>
          <ChevronRight size={18} />
        </div>
      </button>

      <button onClick={() => startLevel('hard')} className="text-left bg-gradient-to-br from-red-900/40 to-slate-900 border border-red-800/50 rounded-2xl p-6 hover:-translate-y-1 transition">
        <div className="flex justify-between items-center mb-4">
          <Crown size={24} className="text-red-400" />
          <span className="text-[10px] font-bold text-red-400 tracking-wide">AVAILABLE</span>
        </div>
        <h3 className="text-lg font-bold mb-1">Hard</h3>
        <p className="text-slate-400 text-sm mb-4">For the brave coders</p>
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-1 text-red-400"><Zap size={14} fill="currentColor" /> 30 XP</span>
          <ChevronRight size={18} />
        </div>
      </button>
    </div>
  )

  if (authLoading) {
    return <div className="min-h-screen bg-slate-950 grid place-items-center text-slate-400">Loading...</div>
  }

  if (!currentUser) {
    return <Auth />
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 border-r border-slate-800 p-6 flex-col ${isMenuOpen ? 'flex' : 'hidden md:flex'}`}>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-lg bg-yellow-400 grid place-items-center text-slate-900">
            <Code2 size={20} strokeWidth={2.8} />
          </div>
          <div>
            <div className="font-extrabold text-lg">Code<span className="text-sky-400">Climb</span></div>
            <div className="text-[10px] text-slate-500 tracking-wide uppercase">learn. play. master.</div>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          <button onClick={() => { setView('overview'); setLevel(null) }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm ${view === 'overview' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white transition'}`}>
            <Trophy size={18} /> Overview
          </button>
          <button onClick={() => { setView('practice'); setLevel(null) }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm ${view === 'practice' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white transition'}`}>
            <BookOpen size={18} /> Practice Arena
          </button>
          <button onClick={() => { setView('achievements'); setLevel(null) }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm ${view === 'achievements' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white transition'}`}>
            <Award size={18} /> Achievements
          </button>
        </nav>

        <div className="mt-8 p-4 rounded-xl border border-slate-800 bg-slate-800/50">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Your journey</span><strong className="text-sky-300">{Math.min(100, xp)}%</strong>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-sky-400" style={{ width: `${Math.min(100, xp)}%` }} />
          </div>
        </div>

       <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-800/50 border border-slate-800">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 grid place-items-center text-slate-900 font-bold text-sm shrink-0">
              {(currentUser.displayName || currentUser.email)[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <strong className="block text-sm truncate">{currentUser.displayName || 'Player'}</strong>
              <span className="text-xs text-slate-500 truncate block">{currentUser.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-3 rounded-lg bg-slate-800 text-orange-400 text-sm">
            <Flame size={16} fill="currentColor" /> <span className="text-slate-300">7 day streak</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-red-400 transition text-xs">
            <LogOut size={14} /> Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <header className="h-[70px] flex items-center justify-between px-8 border-b border-slate-800 bg-slate-900/50">
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu size={22} /></button>
          <div className="text-slate-400 text-sm capitalize">{view === 'overview' ? 'Overview' : view === 'practice' ? 'Practice Arena' : 'Achievements'}</div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 text-orange-400 text-sm"><Flame size={16} fill="currentColor" /> <strong className="text-white">7</strong></div>
            <div className="flex items-center gap-1.5 text-sky-400 text-sm"><Zap size={16} fill="currentColor" /> <strong className="text-white">{xp}</strong> XP</div>
            <div className="text-xs bg-slate-800 px-3 py-1 rounded-full">🏆 Lvl {playerLevel}</div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto p-8">

          {/* OVERVIEW PAGE */}
          {view === 'overview' && (
            <div>
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold tracking-wide mb-2">
                <Sparkles size={14} /> {today.toUpperCase()}
              </div>
              <h1 className="text-3xl font-bold">Ready for your next <span className="text-sky-400">climb?</span></h1>
              <p className="text-slate-400 mt-2 mb-6">Small steps today. Big skills tomorrow.</p>

              <div className="relative overflow-hidden bg-gradient-to-br from-sky-950 to-slate-900 border border-sky-900/50 rounded-2xl p-8 mb-8">
                <div className="flex items-center gap-1 text-sky-300 text-xs font-bold tracking-wide mb-2">
                  <Target size={14} /> YOUR CURRENT MISSION
                </div>
                <h2 className="text-2xl font-bold mb-2">Mastering <span className="text-sky-400">Python</span></h2>
                <p className="text-slate-400 text-sm mb-5">Complete a challenge below to earn XP and level up.</p>
                <button onClick={() => setView('practice')} className="flex items-center gap-2 bg-yellow-400 text-slate-900 font-bold px-5 py-3 rounded-xl hover:brightness-110 transition">
                  Continue climbing <ChevronRight size={17} />
                </button>
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Next level</span>
                    <strong className="text-sky-300">{xp % 50} / 50 XP</strong>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-400 to-cyan-300" style={{ width: `${(xp % 50) * 2}%` }} />
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-1">Choose your challenge</h2>
              <p className="text-slate-500 text-sm mb-5">Pick a path and earn XP as you learn.</p>
              <ChallengeCards />

              {/* Learning Path + Daily Challenge */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h2 className="text-lg font-bold">Learning path</h2>
                      <p className="text-slate-500 text-xs mt-1">Your road to Python mastery</p>
                    </div>
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-400">1 / 4</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {pathLevels.map((lvl, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold shrink-0 ${lvl.status === 'complete' ? 'bg-emerald-500 text-slate-900' : lvl.status === 'current' ? 'bg-sky-400 text-slate-900' : 'bg-slate-800 text-slate-500'}`}>
                          {lvl.status === 'complete' ? <Check size={15} strokeWidth={3} /> : lvl.status === 'locked' ? <LockKeyhole size={13} /> : i + 1}
                        </div>
                        <div className="flex-1">
                          <strong className="block text-sm">{lvl.label}</strong>
                          <span className="text-xs text-slate-500">{lvl.subtitle}</span>
                        </div>
                        {lvl.status === 'current' && <span className="text-[10px] font-bold text-sky-400">YOU ARE HERE</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h2 className="text-lg font-bold">Daily challenge</h2>
                      <p className="text-slate-500 text-xs mt-1">A quick win to keep your streak alive</p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-orange-900/40 text-orange-400 grid place-items-center"><Flame size={18} fill="currentColor" /></div>
                  </div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 grid place-items-center"><Terminal size={20} /></div>
                    <div className="flex-1">
                      <strong className="block text-sm">String wizard</strong>
                      <p className="text-xs text-slate-500">Reverse a string without a built-in method</p>
                    </div>
                    <span className="text-xs font-bold text-sky-400">+20 XP</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                    <span className="flex items-center gap-1 text-xs text-slate-500"><Clock3 size={13} /> Resets daily</span>
                    <button onClick={() => startLevel('medium')} className="flex items-center gap-1 text-xs font-bold bg-slate-800 px-3 py-2 rounded-lg hover:bg-slate-700 transition">Take challenge <ChevronRight size={13} /></button>
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <h2 className="text-lg font-bold mt-8 mb-4">Your highlights</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <Zap size={18} className="text-yellow-400 mb-3" />
                  <span className="block text-xs text-slate-500">Total XP</span>
                  <strong className="text-xl">{xp}</strong>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <Trophy size={18} className="text-sky-400 mb-3" />
                  <span className="block text-xs text-slate-500">Player Level</span>
                  <strong className="text-xl">{playerLevel}</strong>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <Award size={18} className="text-red-400 mb-3" />
                  <span className="block text-xs text-slate-500">Badges</span>
                  <strong className="text-xl">{achievements.filter(a => a.unlocked).length}</strong>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <Users size={18} className="text-emerald-400 mb-3" />
                  <span className="block text-xs text-slate-500">Streak</span>
                  <strong className="text-xl">7</strong>
                </div>
              </div>
            </div>
          )}

          {/* PRACTICE ARENA - LEVEL SELECT */}
          {view === 'practice' && !level && (
            <div>
              <h2 className="text-xl font-bold mb-1">Choose your challenge</h2>
              <p className="text-slate-500 text-sm mb-5">Pick a path and earn XP as you learn.</p>
              <ChallengeCards />
            </div>
          )}

          {/* ACHIEVEMENTS PAGE */}
          {view === 'achievements' && (
            <div>
              <h1 className="text-3xl font-bold mb-2">🏆 Achievements</h1>
              <p className="text-slate-400 mb-8">Unlock badges as you earn XP and level up.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {achievements.map((a, i) => (
                  <div key={i} className={`flex items-center gap-4 rounded-2xl p-5 border ${a.unlocked ? 'bg-gradient-to-br from-yellow-900/30 to-slate-900 border-yellow-700/40' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                    <div className={`w-12 h-12 rounded-xl grid place-items-center shrink-0 ${a.unlocked ? 'bg-yellow-400 text-slate-900' : 'bg-slate-800 text-slate-500'}`}>
                      {a.unlocked ? a.icon : <LockKeyhole size={20} />}
                    </div>
                    <div className="flex-1">
                      <strong className="block text-sm">{a.title}</strong>
                      <p className="text-xs text-slate-400 mt-1">{a.desc}</p>
                    </div>
                    {a.unlocked ? (
                      <span className="text-[10px] font-bold text-yellow-400">UNLOCKED</span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500">{a.xpNeeded} XP</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRACTICE ARENA - ACTIVE QUESTION */}
          {level && (
            <div>
              <button onClick={goBack} className="flex items-center gap-2 text-slate-400 text-sm mb-4 hover:text-white">
                <RotateCcw size={14} /> Back to overview
              </button>

              <div className="flex gap-2 mb-5">
                {['easy', 'medium', 'hard'].map(lv => (
                  <button key={lv} onClick={() => startLevel(lv)} className={`px-4 py-2 rounded-lg text-xs font-bold capitalize flex items-center gap-1.5 ${level === lv ? 'bg-sky-400 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                    {lv} {level === lv && <Check size={13} />}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1 capitalize">{level} Level — Question {questionNum}/10</h2>

                  {loading ? (
                    <p className="text-slate-400 mt-4">Loading question...</p>
                  ) : (
                    <>
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-4 text-sm leading-relaxed">
                        <ReactMarkdown>{question}</ReactMarkdown>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-2xl mt-4 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-xs text-slate-400">
                          <Terminal size={14} /> solution.py
                        </div>
                        <textarea
                          className="w-full bg-slate-900 text-slate-100 font-mono text-sm p-4 outline-none resize-none"
                          rows={8}
                          placeholder="Write your Python code here..."
                          value={userCode}
                          onChange={(e) => setUserCode(e.target.value)}
                          onKeyDown={handleCodeKeyDown}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <button onClick={() => setIsHintVisible(!isHintVisible)} className="flex items-center gap-2 text-yellow-400 text-sm font-semibold">
                          <Lightbulb size={16} /> {isHintVisible ? 'Hide hint' : 'Need a hint?'}
                        </button>
                        <button onClick={submitAnswer} disabled={checking} className="flex items-center gap-2 bg-sky-400 text-slate-900 font-bold px-5 py-3 rounded-xl hover:brightness-110 transition disabled:opacity-50">
                          <Send size={16} /> {checking ? 'Checking...' : 'Submit Answer'}
                        </button>
                      </div>

                      {isHintVisible && (
                        <div className="flex gap-3 bg-yellow-950/30 border border-yellow-800/40 rounded-xl p-4 mt-4">
                          <Lightbulb size={17} className="text-yellow-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-sm mb-1">Gentle nudge</strong>
                            <p className="text-xs text-slate-400">Break the problem into small steps, and test with a simple example first.</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {feedback && (
                    <div className="bg-sky-950/40 border border-sky-800/50 rounded-2xl p-6 mt-4 text-sm leading-relaxed">
                      <ReactMarkdown>{feedback}</ReactMarkdown>
                      <div className="mt-4">
                        {questionNum < 10 ? (
                          <button onClick={nextQuestion} className="bg-slate-800 px-4 py-2 rounded-lg text-sm">➡ Next Question ({questionNum}/10)</button>
                        ) : (
                          <div className="bg-yellow-500 text-slate-900 font-bold p-4 rounded-xl">🎉 Level Complete! You finished all 10 questions!</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mission Sidebar */}
                <aside className="flex flex-col gap-5">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-9 h-9 rounded-lg bg-sky-900/40 text-sky-400 grid place-items-center"><Target size={18} /></div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">MISSION</span>
                        <strong className="text-sm">What you'll learn</strong>
                      </div>
                    </div>
                    <ul className="flex flex-col gap-2.5 text-xs text-slate-400">
                      <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-400" /> Use conditional logic</li>
                      <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-400" /> Read and transform input</li>
                      <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-400" /> Make your code respond</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-950/30 border border-yellow-800/40 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-yellow-400 text-sm font-bold mb-2"><Sparkles size={16} /> Pro tip</div>
                    <p className="text-xs text-slate-400">Clean code is happy code. Give your variables names that tell a story.</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span>Quest progress</span><strong className="text-sky-300">{questionNum} / 10</strong>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400" style={{ width: `${questionNum * 10}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-3">Complete this level to unlock the next one.</p>
                  </div>
                </aside>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App