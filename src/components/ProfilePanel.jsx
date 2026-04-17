import React, { useState } from 'react'
import { ACCENT_THEMES, loadSettings, saveSettings, applyAccentTheme } from '../lib/settings'
import styles from './ProfilePanel.module.css'

export default function ProfilePanel({ settings, onSettingsChange, user, displayName, onSignIn, onSignOut, onChangeName }) {
  const [expanded, setExpanded] = useState(false)
  const [view, setView] = useState('menu')
  const [showSettings, setShowSettings] = useState(false)
  const [editingName, setEditingName] = useState(displayName || '')
  const [newsletter, setNewsletter] = useState(settings.newsletter || false)
  const [nameSaved, setNameSaved] = useState(false)

  React.useEffect(() => { setEditingName(displayName || '') }, [displayName])

  function getInitials(name) {
    if (!name) return 'NS'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  const initials = getInitials(displayName || settings.userName)

  function handleAccentChange(key) {
    const newSettings = { ...settings, accent: key }
    saveSettings(newSettings)
    applyAccentTheme(key)
    onSettingsChange(newSettings)
  }

  function handleNewsletterChange(checked) {
    setNewsletter(checked)
    const newSettings = { ...settings, newsletter: checked }
    saveSettings(newSettings)
    onSettingsChange(newSettings)
  }

  function close() { setExpanded(false); setView('menu') }

  async function saveDisplayName() {
    if (!editingName.trim() || !user) return
    try {
      if (onChangeName) await onChangeName(editingName.trim())
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 2000)
    } catch(e) {}
  }

  return (
    <div className={styles.wrap}>

      {/* Settings modal */}
      {showSettings && (
        <div className={styles.settingsOverlay} onClick={() => setShowSettings(false)}>
          <div className={styles.settingsModal} onClick={e => e.stopPropagation()}>
            <div className={styles.settingsHeader}>
              <div className={styles.settingsTitle}>Settings</div>
              <button className={styles.settingsClose} onClick={() => setShowSettings(false)}>✕</button>
            </div>

            <div className={styles.settingsSection}>
              <div className={styles.settingsSectionTitle}>Profile</div>
              {user ? (
                <>
                  <div className={styles.profileRow}>
                    <div className={styles.profileBigInitials}>{initials}</div>
                    <div className={styles.profileRowInfo}>
                      <div className={styles.profileRowName}>{displayName || 'No name set'}</div>
                      <div className={styles.profileRowEmail}>{user.email}</div>
                    </div>
                  </div>
                  <div className={styles.nameRow}>
                    <input
                      className={styles.nameInput}
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      placeholder="What should we call you?"
                      onKeyDown={e => e.key === 'Enter' && saveDisplayName()}
                    />
                    <button className={styles.saveNameBtn} onClick={saveDisplayName} disabled={!editingName.trim()}>
                      {nameSaved ? '✓ Saved' : 'Save'}
                    </button>
                  </div>
                </>
              ) : (
                <button className={styles.signInProfileBtn} onClick={() => { onSignIn && onSignIn(); setShowSettings(false) }}>
                  Sign in with Google to sync your progress →
                </button>
              )}
            </div>

            <div className={styles.settingsDivider} />

            <div className={styles.settingsSection}>
              <div className={styles.settingsSectionTitle}>Accent color</div>
              <div className={styles.colorGrid}>
                {Object.entries(ACCENT_THEMES).map(([key, theme]) => (
                  <button key={key}
                    className={`${styles.colorSwatch} ${settings.accent === key ? styles.colorSwatchActive : ''}`}
                    style={{ background: theme.hex }}
                    onClick={() => handleAccentChange(key)}
                    title={theme.label}>
                    {settings.accent === key && <CheckIcon />}
                  </button>
                ))}
              </div>
              <div className={styles.colorLabels}>
                {Object.entries(ACCENT_THEMES).map(([key, theme]) => (
                  <span key={key} className={styles.colorLabel}
                    style={{ color: settings.accent === key ? theme.hex : 'var(--text-muted)' }}>
                    {theme.label}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.settingsDivider} />

            <div className={styles.settingsSection}>
              <div className={styles.settingsSectionTitle}>Updates</div>
              <label className={styles.checkRow}>
                <input type="checkbox" className={styles.checkbox} checked={newsletter}
                  onChange={e => handleNewsletterChange(e.target.checked)} />
                <div className={styles.checkInfo}>
                  <div className={styles.checkLabel}>NurseIQ newsletter</div>
                  <div className={styles.checkSub}>New features, study tips, and NCLEX updates. No spam.</div>
                </div>
              </label>
            </div>

            {user && (
              <>
                <div className={styles.settingsDivider} />
                <div className={styles.settingsSection}>
                  <button className={styles.signOutBtn} onClick={() => { onSignOut && onSignOut(); setShowSettings(false) }}>
                    <SignOutIcon /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Dropdown */}
      {expanded && (
        <div className={styles.panel}>
          {view === 'menu' && (
            <div className={styles.menu}>
              <button className={styles.menuItem} onClick={() => { setShowSettings(true); close() }}>
                <SettingsIcon /> Settings
              </button>
              <button className={styles.menuItem} onClick={() => setView('about')}>
                <InfoIcon /> About NurseIQ
              </button>
              <div className={styles.menuDivider} />
              <button className={styles.menuItem} onClick={() => { window.open('https://form.typeform.com/to/fTTQmtRG', '_blank'); close() }}>
                <FeedbackIcon /> Share feedback
              </button>
              <div className={styles.menuDivider} />
              {user ? (
                <>
                  <div className={styles.menuUser}>
                    <div className={styles.menuUserName}>{displayName || 'No name set'}</div>
                    <div className={styles.menuUserEmail}>{user.email}</div>
                  </div>
                  <button className={styles.menuItemDanger} onClick={() => { onSignOut && onSignOut(); close() }}>
                    <SignOutIcon /> Sign out
                  </button>
                </>
              ) : (
                <button className={styles.menuItem} onClick={() => { onSignIn && onSignIn(); close() }}>
                  <SignOutIcon /> Sign in to sync
                </button>
              )}
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

      <div className={styles.userRow} onClick={() => { setExpanded(e => !e); if (expanded) setView('menu') }}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{displayName || settings.userName || 'Nursing Student'}</div>
          <div className={styles.userPlan}>{user ? 'Signed in' : 'Pro · Active'}</div>
        </div>
        <div className={`${styles.chevron} ${expanded ? styles.chevronUp : ''}`}><ChevronIcon /></div>
      </div>

      {!user && (
        <button className={styles.signInBanner} onClick={e => { e.stopPropagation(); onSignIn && onSignIn() }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3 2.5-5 6-5s6 2 6 5"/></svg>
          Sign in to sync your progress
        </button>
      )}
    </div>
  )
}

function SettingsIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg> }
function InfoIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 5.5v.5"/></svg> }
function FeedbackIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H2a1 1 0 00-1 1v9a1 1 0 001 1h3l3 2 3-2h3a1 1 0 001-1V3a1 1 0 00-1-1z"/></svg> }
function BackIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 4l-4 4 4 4"/></svg> }
function SignOutIcon() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 3H3v10h3M10 5l3 3-3 3M6 8h7"/></svg> }
function ChevronIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 6l4 4 4-4"/></svg> }
function CheckIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M3 8l4 4 6-6"/></svg> }
