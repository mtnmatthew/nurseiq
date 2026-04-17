import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TutorPage from './pages/TutorPage'
import FlashcardsPage from './pages/FlashcardsPage'
import StudyGuidePage from './pages/StudyGuidePage'
import DashboardPage from './pages/DashboardPage'
import AdaptiveQuizPage from './pages/AdaptiveQuizPage'
import ImagePage from './pages/ImagePage'
import ModeSelect from './components/ModeSelect'
import AuthModal from './components/AuthModal'
import DisplayNameModal from './components/DisplayNameModal'
import Footer from './components/Footer'
import styles from './App.module.css'
import { loadSettings, saveSettings, applyAccentTheme } from './lib/settings'
import { loadMastery, saveMastery, loadMistakes, saveMistakes } from './lib/curriculum'
import { supabase, signOut, getDisplayName, setDisplayName as saveDisplayName, loadAndMergeCloudData } from './lib/supabase'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [subject, setSubject] = useState(null)
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [mode, setMode] = useState(() => localStorage.getItem('nurseiq_mode') || null)
  const [triggerAddClass, setTriggerAddClass] = useState(false)
  const [quizConfig, setQuizConfig] = useState(null)
  const [settings, setSettings] = useState(loadSettings)
  const [imageQuery, setImageQuery] = useState('')
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [showNameModal, setShowNameModal] = useState(false)

  // Auth loading
  useEffect(() => {
    const hardTimeout = window.setTimeout(() => setAuthLoading(false), 5000)
    let resolved = false

    async function loadUser(u) {
      if (!u) return
      try {
        const name = await getDisplayName(u.id)
        if (name) setDisplayName(name)
        else setShowNameModal(true)
      } catch(e) {}
    }

    function resolve(u) {
      if (resolved) return
      resolved = true
      window.clearTimeout(hardTimeout)
      setUser(u || null)
      if (u) loadUser(u)
      setAuthLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadAndMergeCloudData(session.user.id, { saveMastery, saveMistakes, loadMastery, loadMistakes }).catch(() => {})
      resolve(session?.user || null)
    }).catch(() => resolve(null))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user || null
      if (event === 'SIGNED_IN') {
        setUser(u)
        setShowAuth(false)
        await loadUser(u)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setDisplayName('')
      }
      if (!resolved) resolve(u)
    })

    return () => { subscription.unsubscribe(); window.clearTimeout(hardTimeout) }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    applyAccentTheme(settings.accent || 'teal')
  }, [settings.accent])

  function selectMode(m) {
    setMode(m); localStorage.setItem('nurseiq_mode', m)
    setSubject(null); setPage('dashboard')
  }

  function switchMode() {
    setMode(null); localStorage.removeItem('nurseiq_mode')
    setSubject(null); setPage('dashboard')
  }

  function startQuiz(type, topicKey, topicLabel) {
    setQuizConfig({ type, topicKey, topicLabel }); setPage('quiz')
  }

  function handleSettingsChange(newSettings) {
    setSettings(newSettings)
  }

  async function handleSaveName(name) {
    if (!name) { setShowNameModal(false); return }
    if (name && user) {
      await saveDisplayName(user.id, name)
      setDisplayName(name)
    }
    setShowNameModal(false)
  }

  async function handleChangeName(name) {
    if (name && user) {
      await saveDisplayName(user.id, name)
      setDisplayName(name)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
    } catch(e) {}
    setUser(null)
    setDisplayName('')
  }

  if (authLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)' }}>
        <style>{`
          @keyframes rollStop {
            0%   { transform: rotate(0deg); }
            15%  { transform: rotate(180deg); }
            35%  { transform: rotate(180deg); }
            50%  { transform: rotate(360deg); }
            100% { transform: rotate(360deg); }
          }
          .nurseiq-loader { animation: rollStop 2s ease-in-out infinite; }
        `}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="nurseiq-loader" style={{ width: 48, height: 48, background: 'var(--teal-400)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(29,158,117,0.3)' }}>
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, letterSpacing: '0.02em' }}>NurseIQ</div>
        </div>
      </div>
    )
  }

  if (!mode) return (
    <>
      <ModeSelect onSelect={selectMode} dark={dark} />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />
      }{showNameModal && <DisplayNameModal existingName={displayName} onSave={handleSaveName} />}
    </>
  )

  const sidebarProps = {
    activePage: page,
    onNavigate: p => { setPage(p); setQuizConfig(null) },
    activeSubject: subject,
    onSubject: s => { setSubject(s); setPage('tutor') },
    dark, onToggleDark: () => setDark(d => !d),
    mode, onSwitchMode: switchMode,
    onAddClass: () => { setPage('tutor'); setTriggerAddClass(true) },
    settings, onSettingsChange: handleSettingsChange,
    user, displayName, onSignIn: () => setShowAuth(true), onSignOut: handleSignOut, onChangeName: handleChangeName,
  }

  if (page === 'quiz' && quizConfig) {
    return (
      <div className={styles.app}>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        <Sidebar {...sidebarProps} />
        <main className={styles.main}>
          <AdaptiveQuizPage
            mode={mode}
            quizType={quizConfig.type}
            topicKey={quizConfig.topicKey}
            topicLabel={quizConfig.topicLabel}
            onBack={() => setPage('dashboard')}
            userId={user?.id}
          />
          <Footer />
        </main>
      </div>
    )
  }

  const pages = {
    dashboard: <DashboardPage mode={mode} onNavigate={setPage} onStartQuiz={startQuiz} />,
    tutor: <TutorPage subject={subject} mode={mode} triggerAddClass={triggerAddClass} onAddClassDone={() => setTriggerAddClass(false)} onNavigateTo={(pg, q) => { setPage(pg); if (q) setImageQuery(q) }} />,
    flashcards: <FlashcardsPage mode={mode} />,
    studyguide: <StudyGuidePage mode={mode} />,
    images: <ImagePage mode={mode} initialQuery={imageQuery} onNavigate={(pg) => setPage(pg)} onQueryUsed={() => setImageQuery('')} />,
  }

  return (
    <div className={styles.app}>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <Sidebar {...sidebarProps} />
      <main className={styles.main}>
        {pages[page] || pages.dashboard}
        <Footer />
      </main>
    </div>
  )
}
