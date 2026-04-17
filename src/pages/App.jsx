import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TutorPage from './pages/TutorPage'
import FlashcardsPage from './pages/FlashcardsPage'
import StudyGuidePage from './pages/StudyGuidePage'
import DashboardPage from './pages/DashboardPage'
import AdaptiveQuizPage from './pages/AdaptiveQuizPage'
import ModeSelect from './components/ModeSelect'
import Footer from './components/Footer'
import styles from './App.module.css'
import { loadSettings, saveSettings, applyAccentTheme, loadOnboarded } from './lib/settings'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [subject, setSubject] = useState(null)
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [mode, setMode] = useState(() => localStorage.getItem('nurseiq_mode') || null)
  const [triggerAddClass, setTriggerAddClass] = useState(false)
  const [quizConfig, setQuizConfig] = useState(null)
  const [settings, setSettings] = useState(loadSettings)

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

  if (!mode) return <ModeSelect onSelect={selectMode} dark={dark} />

  const sidebarProps = {
    activePage: page,
    onNavigate: p => { setPage(p); setQuizConfig(null) },
    activeSubject: subject,
    onSubject: s => { setSubject(s); setPage('tutor') },
    dark, onToggleDark: () => setDark(d => !d),
    mode, onSwitchMode: switchMode,
    onAddClass: () => { setPage('tutor'); setTriggerAddClass(true) },
    settings, onSettingsChange: handleSettingsChange,
  }

  if (page === 'quiz' && quizConfig) {
    return (
      <div className={styles.app}>
        <Sidebar {...sidebarProps} />
        <main className={styles.main}>
          <AdaptiveQuizPage
            mode={mode}
            quizType={quizConfig.type}
            topicKey={quizConfig.topicKey}
            topicLabel={quizConfig.topicLabel}
            onBack={() => setPage('dashboard')}
          />
          <Footer />
        </main>
      </div>
    )
  }

  const pages = {
    dashboard: <DashboardPage mode={mode} onNavigate={setPage} onStartQuiz={startQuiz} />,
    tutor: <TutorPage subject={subject} mode={mode} triggerAddClass={triggerAddClass} onAddClassDone={() => setTriggerAddClass(false)} />,
    flashcards: <FlashcardsPage mode={mode} />,
    studyguide: <StudyGuidePage mode={mode} />,
  }

  return (
    <div className={styles.app}>
      <Sidebar {...sidebarProps} />
      <main className={styles.main}>
        {pages[page] || pages.dashboard}
        <Footer />
      </main>
    </div>
  )
}
