import React, { useState } from 'react'
import { ACCENT_THEMES, loadSettings, saveSettings, applyAccentTheme } from '../lib/settings'
import styles from './ProfilePanel.module.css'

export default function ProfilePanel({ settings, onSettingsChange }) {
  const [expanded, setExpanded] = useState(false)
  const [view, setView] = useState('menu') // menu | settings | about

  function handleAccentChange(key) {
    const newSettings = { ...settings, accent: key }
    saveSettings(newSettings)
    applyAccentTheme(key)
    onSettingsChange(newSettings)
  }

  function handleNameChange(e) {
    const newSettings = { ...settings, userName: e.target.value }
    saveSettings(newSettings)
    onSettingsChange(newSettings)
  }

  function close() { setExpanded(false); setView('menu') }

  const initials = (settings.userName || 'NS').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className={styles.wrap}>
      {expanded && (
        <div className={styles.panel}>
          {view === 'menu' && (
            <div className={styles.menu}>
              <button className={styles.menuItem} onClick={() => setView('settings')}>
                <SettingsIcon /> Settings
              </button>
              <button className={styles.menuItem} onClick={() => setView('about')}>
                <InfoIcon /> About NurseIQ
              </button>
              <div className={styles.menuDivider} />
              <button className={styles.menuItem} onClick={() => { window.open('https://form.typeform.com/to/fTTQmtRG', '_blank'); close() }}>
                <FeedbackIcon /> Share feedback
              </button>
            </div>
          )}

          {view === 'settings' && (
            <div className={styles.settingsPanel}>
              <div className={styles.panelHeader}>
                <button className={styles.backBtn} onClick={() => setView('menu')}><BackIcon /> Settings</button>
              </div>
              <div className={styles.settingSection}>
                <div className={styles.settingLabel}>Display name</div>
                <input
                  className={styles.nameInput}
                  value={settings.userName || ''}
                  onChange={handleNameChange}
                  placeholder="Your name"
                />
              </div>
              <div className={styles.settingSection}>
                <div className={styles.settingLabel}>Interface color</div>
                <div className={styles.colorGrid}>
                  {Object.entries(ACCENT_THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      className={`${styles.colorSwatch} ${settings.accent === key ? styles.colorSwatchActive : ''}`}
                      style={{ background: theme.hex }}
                      onClick={() => handleAccentChange(key)}
                      title={theme.label}
                    >
                      {settings.accent === key && <CheckIcon />}
                    </button>
                  ))}
                </div>
                <div className={styles.colorLabels}>
                  {Object.entries(ACCENT_THEMES).map(([key, theme]) => (
                    <span key={key} className={styles.colorLabel} style={{ color: settings.accent === key ? theme.hex : 'var(--text-muted)' }}>
                      {theme.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'about' && (
            <div className={styles.settingsPanel}>
              <div className={styles.panelHeader}>
                <button className={styles.backBtn} onClick={() => setView('menu')}><BackIcon /> About</button>
              </div>
              <div className={styles.aboutContent}>
                <div className={styles.aboutLogo}>
                  <div className={styles.aboutLogoMark}>
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>
                  </div>
                  <span className={styles.aboutLogoText}>NurseIQ</span>
                </div>
                <div className={styles.aboutVersion}>Version 4.0</div>
                <div className={styles.aboutDesc}>AI-powered study companion for nursing and pre-nursing students. Built to help you master your coursework, track your progress, and pass your exams.</div>
                <div className={styles.aboutLinks}>
                  <a href="https://form.typeform.com/to/fTTQmtRG" target="_blank" rel="noopener noreferrer" className={styles.aboutLink}>Share feedback</a>
                  <a href="https://www.ncsbn.org/exams.page" target="_blank" rel="noopener noreferrer" className={styles.aboutLink}>NCSBN NCLEX</a>
                  <a href="https://openstax.org/subjects/science" target="_blank" rel="noopener noreferrer" className={styles.aboutLink}>OpenStax Sciences</a>
                </div>
                <div className={styles.aboutDisclaimer}>NurseIQ is a study aid. Always verify clinical information with your institution and licensed instructors.</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={styles.userRow} onClick={() => { setExpanded(e => !e); setView('menu') }}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{settings.userName || 'Nursing Student'}</div>
          <div className={styles.userPlan}>Pro · Active</div>
        </div>
        <div className={`${styles.chevron} ${expanded ? styles.chevronUp : ''}`}><ChevronIcon /></div>
      </div>
    </div>
  )
}

function SettingsIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg> }
function InfoIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 5.5v.5"/></svg> }
function FeedbackIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H2a1 1 0 00-1 1v9a1 1 0 001 1h3l3 2 3-2h3a1 1 0 001-1V3a1 1 0 00-1-1z"/></svg> }
function BackIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 4l-4 4 4 4"/></svg> }
function ChevronIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 6l4 4 4-4"/></svg> }
function CheckIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M3 8l4 4 6-6"/></svg> }
