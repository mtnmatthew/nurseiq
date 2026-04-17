import React, { useState, useEffect, useRef } from 'react'
import ProfilePanel from './ProfilePanel'
import styles from './Sidebar.module.css'

const tools = [
  { id: 'dashboard', label: 'Dashboard', icon: DashIcon },
  { id: 'tutor', label: 'AI Tutor', icon: TutorIcon },
  { id: 'flashcards', label: 'Flashcards', icon: FlashIcon },
  { id: 'studyguide', label: 'Study Guide', icon: GuideIcon },
]

const nursingSubjects = [
  { id: 'pharm', label: 'Pharmacology' },
  { id: 'medsurg', label: 'Med-Surg' },
  { id: 'cardiac', label: 'Cardiac' },
  { id: 'respiratory', label: 'Respiratory' },
  { id: 'neuro', label: 'Neuro' },
  { id: 'obgyn', label: 'OB / GYN' },
  { id: 'peds', label: 'Pediatrics' },
  { id: 'psych', label: 'Psych Nursing' },
  { id: 'critical', label: 'Critical Care' },
]

const prenursingSubjects = [
  { id: 'anp1', label: 'A&P 1' },
  { id: 'anp2', label: 'A&P 2' },
  { id: 'micro', label: 'Microbiology' },
  { id: 'bio', label: 'Biology' },
  { id: 'chem', label: 'Chemistry' },
  { id: 'stats', label: 'Statistics' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'psych101', label: 'Psychology' },
]

const STUDY_MINS = 25
const BREAK_MINS = 5

export default function Sidebar({ activePage, onNavigate, activeSubject, onSubject, dark, onToggleDark, mode, onSwitchMode, onAddClass, settings, onSettingsChange }) {
  const [pomodoroActive, setPomodoroActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [seconds, setSeconds] = useState(STUDY_MINS * 60)
  const [session, setSession] = useState(1)
  const [logoSpinning, setLogoSpinning] = useState(false)
  const intervalRef = useRef(null)
  const totalSeconds = (isBreak ? BREAK_MINS : STUDY_MINS) * 60
  const subjects = mode === 'prenursing' ? prenursingSubjects : nursingSubjects

  useEffect(() => {
    if (pomodoroActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            if (!isBreak) { setIsBreak(true); setSeconds(BREAK_MINS * 60); setPomodoroActive(true) }
            else { setIsBreak(false); setSession(n => n + 1); setSeconds(STUDY_MINS * 60); setPomodoroActive(false) }
            return s
          }
          return s - 1
        })
      }, 1000)
    } else { clearInterval(intervalRef.current) }
    return () => clearInterval(intervalRef.current)
  }, [pomodoroActive, isBreak])

  function reset() { clearInterval(intervalRef.current); setPomodoroActive(false); setIsBreak(false); setSeconds(STUDY_MINS * 60); setSession(1) }
  function skip() { clearInterval(intervalRef.current); setPomodoroActive(false); if (!isBreak) { setIsBreak(true); setSeconds(BREAK_MINS * 60) } else { setIsBreak(false); setSession(n => n + 1); setSeconds(STUDY_MINS * 60) } }

  function handleLogoClick() {
    setLogoSpinning(true)
    setTimeout(() => { setLogoSpinning(false); onSwitchMode() }, 500)
  }

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  const progress = Math.round(((totalSeconds - seconds) / totalSeconds) * 100)

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <button className={`${styles.logoIcon} ${logoSpinning ? styles.logoSpin : ''}`} onClick={handleLogoClick} title={'Switch to ' + (mode === 'prenursing' ? 'nursing student' : 'pre-nursing') + ' mode'}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/>
          </svg>
        </button>
        <div>
          <div className={styles.logoText}>NurseIQ</div>
          <div className={styles.logoSub}>{mode === 'prenursing' ? 'Pre-nursing mode' : 'Nursing student mode'}</div>
        </div>
        <button className={styles.themeToggle} onClick={onToggleDark} title={dark ? 'Light mode' : 'Dark mode'}>
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <button className={styles.newBtn} onClick={() => onNavigate('tutor')}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{flexShrink:0}}>
          <line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/>
        </svg>
        New session
      </button>

      <nav className={styles.nav}>
        <div className={styles.sectionLabel}>Tools</div>
        {tools.map(t => (
          <button key={t.id} className={`${styles.navItem} ${activePage === t.id ? styles.active : ''}`} onClick={() => onNavigate(t.id)}>
            <t.icon />{t.label}
          </button>
        ))}

        <div className={styles.sectionLabelRow} style={{ marginTop: 10 }}>
          <span className={styles.sectionLabel}>{mode === 'prenursing' ? 'My classes' : 'Subjects'}</span>
          {mode === 'prenursing' && (
            <button className={styles.addClassInline} onClick={onAddClass} title="Add a custom class">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>
            </button>
          )}
        </div>
        {subjects.map(s => (
          <button key={s.id} className={`${styles.navItem} ${activeSubject === s.id ? styles.activeSub : ''}`} onClick={() => onSubject(s.id)}>
            <div className={`${styles.dot} ${activeSubject === s.id ? styles.dotActive : ''}`} />{s.label}
          </button>
        ))}
      </nav>

      <div className={`${styles.pomodoro} ${isBreak ? styles.pomodoroBreak : ''}`}>
        <div className={styles.pomHeader}>
          <span className={styles.pomLabel}>Pomodoro</span>
          <span className={`${styles.pomBadge} ${isBreak ? styles.pomBadgeBreak : ''}`}>{isBreak ? 'Break' : 'Study'}</span>
        </div>
        <div className={styles.pomTime}>{mins}:{secs}</div>
        <div className={styles.pomSub}>{isBreak ? 'Break - session ' + session + ' done' : 'Session ' + session + ' - break in ' + mins + 'm'}</div>
        <div className={styles.pomBar}><div className={styles.pomFill} style={{ width: progress + '%' }} /></div>
        <div className={styles.pomBtns}>
          <button className={`${styles.pomBtn} ${styles.pomBtnPrimary}`} onClick={() => setPomodoroActive(a => !a)}>{pomodoroActive ? 'Pause' : 'Start'}</button>
          <button className={styles.pomBtn} onClick={reset}>Reset</button>
          <button className={styles.pomBtn} onClick={skip}>Skip</button>
        </div>
      </div>

      <div className={styles.bottom}>
        <ProfilePanel settings={settings} onSettingsChange={onSettingsChange} />
      </div>
    </aside>
  )
}

function DashIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg> }
function TutorIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg> }
function FlashIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h4"/></svg> }
function GuideIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 4h10M3 8h10M3 12h6"/></svg> }
function SunIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> }
function MoonIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> }
