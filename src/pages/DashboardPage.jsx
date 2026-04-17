import React, { useState, useEffect } from 'react'
import {
  getCurriculum, loadMastery, loadMistakes, saveMistakes, loadStreak,
  getMasteryLevel, getWeakTopics, loadCustomTopics, renameCustomTopic,
  resetSkillMap, loadDailyGoal, saveDailyGoal,
  getTodayProgress, loadProgressHistory
} from '../lib/curriculum'
import { loadSettings } from '../lib/settings'
import { loadOnboarded, setOnboarded } from '../lib/settings'
import OnboardingOverlay from '../components/OnboardingOverlay'
import styles from './DashboardPage.module.css'

// Circular progress ring
function GoalRing({ done, target, size = 80 }) {
  const pct = Math.min(1, done / target)
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--teal-400)" strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
    </svg>
  )
}

// Sparkline chart for last 14 days
function AccuracyChart({ history }) {
  const days = 14
  const today = new Date()
  const points = Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (days - 1 - i))
    const entry = history.find(h => h.date === d.toDateString())
    return { day: i, accuracy: entry?.accuracy || null, total: entry?.total || 0, date: d }
  })

  const w = 300, h = 80, pad = 8
  const maxAcc = 100
  const getY = acc => pad + (h - pad * 2) * (1 - acc / maxAcc)
  const getX = i => pad + (i / (days - 1)) * (w - pad * 2)

  const dataPoints = points.filter(p => p.accuracy !== null)
  const pathD = dataPoints.map((p, i) =>
    (i === 0 ? 'M' : 'L') + getX(p.day) + ',' + getY(p.accuracy)
  ).join(' ')

  return (
    <div className={styles.chartWrap}>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--teal-400)" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="var(--teal-400)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 50, 85, 100].map(v => (
          <line key={v} x1={pad} y1={getY(v)} x2={w-pad} y2={getY(v)}
            stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3"/>
        ))}
        {/* Area fill */}
        {dataPoints.length > 1 && (
          <path d={pathD + ` L${getX(dataPoints[dataPoints.length-1].day)},${h} L${getX(dataPoints[0].day)},${h} Z`}
            fill="url(#accGrad)"/>
        )}
        {/* Line */}
        {dataPoints.length > 1 && (
          <path d={pathD} fill="none" stroke="var(--teal-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        )}
        {/* Dots */}
        {dataPoints.map(p => (
          <circle key={p.day} cx={getX(p.day)} cy={getY(p.accuracy)} r="3"
            fill="var(--teal-400)" stroke="var(--surface)" strokeWidth="2"/>
        ))}
        {/* 85% mastery line */}
        <line x1={pad} y1={getY(85)} x2={w-pad} y2={getY(85)}
          stroke="var(--teal-200)" strokeWidth="1" strokeDasharray="4,2"/>
        <text x={w-pad+2} y={getY(85)+4} fontSize="8" fill="var(--teal-400)">85%</text>
      </svg>
      <div className={styles.chartLabels}>
        <span>14 days ago</span>
        <span>Today</span>
      </div>
    </div>
  )
}

export default function DashboardPage({ mode, onNavigate, onStartQuiz }) {
  const curriculum = getCurriculum(mode)
  const [mastery, setMastery] = useState(loadMastery())
  const [mistakes, setMistakes] = useState(loadMistakes())
  const [streak, setStreak] = useState(loadStreak())
  const [customTopics, setCustomTopics] = useState(loadCustomTopics())
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(() => !loadOnboarded())
  const [dailyGoal, setDailyGoal] = useState(loadDailyGoal)
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState('')
  const [history, setHistory] = useState(loadProgressHistory)
  const [activeTab, setActiveTab] = useState('overview')
  const [mistakeFilter, setMistakeFilter] = useState('all')

  useEffect(() => {
    setMastery(loadMastery())
    setMistakes(loadMistakes())
    setStreak(loadStreak())
    setCustomTopics(loadCustomTopics())
    setHistory(loadProgressHistory())
  }, [mode])

  const todayProgress = getTodayProgress()
  const goalDone = todayProgress.total || 0
  const goalTarget = dailyGoal.target || 20
  const goalPct = Math.min(100, Math.round((goalDone / goalTarget) * 100))
  const goalMet = goalDone >= goalTarget

  const allTopics = Object.entries(curriculum).flatMap(([catId, cat]) =>
    cat.topics.map(t => ({ key: catId + '_' + t.id, ...t, catLabel: cat.label }))
  )
  const mastered = allTopics.filter(t => {
    const m = mastery[t.key]
    return m && m.total > 0 && m.correct / m.total >= 0.85 && m.correct >= 40
  })
  const weak = getWeakTopics(mastery, curriculum).slice(0, 4)
  const totalCorrect = Object.values(mastery).reduce((s, m) => s + (m.correct || 0), 0)
  const totalAnswered = Object.values(mastery).reduce((s, m) => s + (m.total || 0), 0)
  const overallPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  // Mistake bank grouped by topic
  const mistakesByTopic = {}
  mistakes.forEach(m => {
    const t = m.topic || 'General'
    if (!mistakesByTopic[t]) mistakesByTopic[t] = []
    mistakesByTopic[t].push(m)
  })
  const mistakeTopics = Object.keys(mistakesByTopic).sort((a, b) => mistakesByTopic[b].length - mistakesByTopic[a].length)
  const filteredMistakes = mistakeFilter === 'all' ? mistakes : mistakesByTopic[mistakeFilter] || []

  function handleReset() {
    resetSkillMap()
    setMastery({}); setCustomTopics([]); setMistakes([]); setShowResetConfirm(false)
  }

  function confirmRename(id) {
    if (!renameValue.trim()) return
    const updated = renameCustomTopic(id, renameValue.trim())
    setCustomTopics(updated); setRenamingId(null)
  }

  function clearMistake(idx) {
    const updated = [...mistakes]
    updated.splice(idx, 1)
    setMistakes(updated)
    saveMistakes(updated)
  }

  // Custom topic groups
  const customGroups = {}
  customTopics.forEach(topic => {
    const groupKey = topic.categoryId || 'custom_ungrouped'
    const groupLabel = topic.categoryLabel || (curriculum[topic.categoryId]?.label) || 'My uploaded topics'
    if (!customGroups[groupKey]) customGroups[groupKey] = { label: groupLabel, topics: [] }
    customGroups[groupKey].topics.push(topic)
  })

  return (
    <div className={styles.layout}>
      {showOnboarding && <OnboardingOverlay onDismiss={() => { setOnboarded(); setShowOnboarding(false) }} />}
      {showResetConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Reset skill map?</div>
            <div className={styles.modalDesc}>This will clear all mastery data, custom topics, and mistake bank. Cannot be undone.</div>
            <div className={styles.modalBtns}>
              <button className={styles.modalReset} onClick={handleReset}>Yes, reset everything</button>
              <button className={styles.modalCancel} onClick={() => setShowResetConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.topbar}>
        <div className={styles.topLeft}>
          <div className={styles.topTitle}>Dashboard</div>
          <div className={styles.topMeta}>{mode === 'prenursing' ? 'Pre-nursing · A&P, Micro, Chem' : 'Nursing student · NCLEX prep'}</div>
        </div>
        <div className={styles.topRight}>
          <div className={styles.tabs}>
            {['overview', 'progress', 'mistakes', 'skillmap'].map(t => (
              <button key={t} className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`} onClick={() => setActiveTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <button className={styles.resetBtn} onClick={() => setShowResetConfirm(true)}><ResetIcon /> Reset</button>
        </div>
      </div>

      <div className={styles.body}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            {/* Daily goal ring */}
            <div className={styles.goalCard}>
              <div className={styles.goalLeft}>
                <div className={styles.goalRing}>
                  <GoalRing done={goalDone} target={goalTarget} size={88} />
                  <div className={styles.goalCenter}>
                    <div className={styles.goalPct}>{goalPct}%</div>
                  </div>
                </div>
              </div>
              <div className={styles.goalRight}>
                <div className={styles.goalTitle}>{goalMet ? '🎉 Daily goal complete!' : 'Daily goal'}</div>
                <div className={styles.goalSub}>{goalDone} / {goalTarget} questions</div>
                {!editingGoal ? (
                  <button className={styles.goalEdit} onClick={() => { setGoalInput(String(goalTarget)); setEditingGoal(true) }}>
                    Change goal
                  </button>
                ) : (
                  <div className={styles.goalEditRow}>
                    <input className={styles.goalInput} type="number" value={goalInput}
                      onChange={e => setGoalInput(e.target.value)} min="5" max="200" />
                    <button className={styles.goalSave} onClick={() => {
                      const v = parseInt(goalInput)
                      if (v >= 5) { saveDailyGoal(v); setDailyGoal({ target: v }) }
                      setEditingGoal(false)
                    }}>Save</button>
                  </div>
                )}
              </div>
              <div className={styles.streakBadge}>
                <span className={styles.streakFire}>🔥</span>
                <span className={styles.streakNum}>{streak.streak}</span>
                <span className={styles.streakLabel}>day streak</span>
              </div>
            </div>

            {/* Stats row */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Overall accuracy</div>
                <div className={styles.statVal} style={{ color: overallPct >= 70 ? '#1D9E75' : '#E24B4A' }}>{overallPct}%</div>
                <div className={styles.statSub}>{totalAnswered} answered</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Topics mastered</div>
                <div className={styles.statVal} style={{ color: '#1D9E75' }}>{mastered.length}</div>
                <div className={styles.statSub}>of {allTopics.length} topics</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Mistake bank</div>
                <div className={styles.statVal} style={{ color: '#E24B4A' }}>{mistakes.length}</div>
                <div className={styles.statSub}><button className={styles.statLink} onClick={() => setActiveTab('mistakes')}>Review →</button></div>
              </div>
            </div>

            {/* Quick actions */}
            <div className={styles.actionGrid}>
              <button className={`${styles.actionBtn} ${styles.actionPrimary}`} onClick={() => onStartQuiz('adaptive')}>
                <div className={styles.actionIcon}><BrainIcon /></div>
                <div className={styles.actionLabel}>Study weak areas</div>
                <div className={styles.actionDesc}>Adaptive · targets your gaps</div>
              </button>
              <button className={styles.actionBtn} onClick={() => onStartQuiz('daily')}>
                <div className={styles.actionIcon}><DailyIcon /></div>
                <div className={styles.actionLabel}>Daily quiz</div>
                <div className={styles.actionDesc}>10 mixed questions</div>
              </button>
              <button className={styles.actionBtn} onClick={() => onStartQuiz('mistakes')}>
                <div className={styles.actionIcon}><MistakeIcon /></div>
                <div className={styles.actionLabel}>Drill mistakes</div>
                <div className={styles.actionDesc}>{mistakes.length} saved</div>
              </button>
              <button className={styles.actionBtn} onClick={() => onNavigate('tutor')}>
                <div className={styles.actionIcon}><TutorIcon /></div>
                <div className={styles.actionLabel}>AI Tutor</div>
                <div className={styles.actionDesc}>Ask anything</div>
              </button>
            </div>

            {/* Needs attention */}
            {weak.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Needs attention</div>
                {weak.map(w => {
                  const m = getMasteryLevel(w.mastery.correct, w.mastery.total)
                  return (
                    <div key={w.key} className={styles.weakItem} onClick={() => onStartQuiz('topic', w.key, w.topic.label)}>
                      <div className={styles.weakInfo}>
                        <div className={styles.weakLabel}>{w.topic.label}</div>
                        <div className={styles.weakCat}>{w.catLabel}</div>
                      </div>
                      <div className={styles.weakRight}>
                        <div className={styles.weakPct} style={{ color: m.color }}>{w.mastery.total === 0 ? 'Not started' : m.pct + '%'}</div>
                        <div className={styles.weakBar}><div className={styles.weakFill} style={{ width: m.pct + '%', background: m.color }} /></div>
                      </div>
                      <div className={styles.weakArrow}>→</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PROGRESS TAB ── */}
        {activeTab === 'progress' && (
          <div className={styles.progressGrid}>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Accuracy over 14 days</div>
              <div className={styles.sectionSub}>Dashed line shows 85% mastery threshold</div>
              {history.length < 2 ? (
                <div className={styles.emptyChart}>Answer questions to build your progress chart</div>
              ) : (
                <AccuracyChart history={history} />
              )}
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Study sessions</div>
              <div className={styles.historyList}>
                {history.length === 0 ? (
                  <div className={styles.emptyChart}>No sessions recorded yet</div>
                ) : [...history].reverse().slice(0, 14).map((h, i) => (
                  <div key={i} className={styles.historyRow}>
                    <div className={styles.historyDate}>{new Date(h.dateISO || h.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div className={styles.historyBar}>
                      <div className={styles.historyFill} style={{ width: h.accuracy + '%', background: h.accuracy >= 85 ? 'var(--teal-400)' : h.accuracy >= 70 ? '#BA7517' : '#E24B4A' }} />
                    </div>
                    <div className={styles.historyAcc} style={{ color: h.accuracy >= 85 ? 'var(--teal-400)' : h.accuracy >= 70 ? '#BA7517' : '#E24B4A' }}>{h.accuracy}%</div>
                    <div className={styles.historyTotal}>{h.total}q</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Best accuracy</div>
                <div className={styles.statVal} style={{ color: '#1D9E75' }}>
                  {history.length > 0 ? Math.max(...history.map(h => h.accuracy)) + '%' : '—'}
                </div>
                <div className={styles.statSub}>all time</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>7-day average</div>
                <div className={styles.statVal} style={{ color: 'var(--teal-400)' }}>
                  {(() => {
                    const last7 = history.slice(-7).filter(h => h.total > 0)
                    return last7.length > 0 ? Math.round(last7.reduce((s, h) => s + h.accuracy, 0) / last7.length) + '%' : '—'
                  })()}
                </div>
                <div className={styles.statSub}>last 7 sessions</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total sessions</div>
                <div className={styles.statVal}>{history.length}</div>
                <div className={styles.statSub}>study days</div>
              </div>
            </div>
          </div>
        )}

        {/* ── MISTAKES TAB ── */}
        {activeTab === 'mistakes' && (
          <div className={styles.mistakesGrid}>
            <div className={styles.mistakesHeader}>
              <div>
                <div className={styles.sectionTitle}>Mistake bank</div>
                <div className={styles.sectionSub}>{mistakes.length} saved · click a topic to filter · click any mistake to drill it</div>
              </div>
              {mistakes.length > 0 && (
                <button className={styles.drillBtn} onClick={() => onStartQuiz('mistakes')}>
                  <BrainIcon /> Drill all mistakes
                </button>
              )}
            </div>

            {mistakes.length === 0 ? (
              <div className={styles.emptyMistakes}>
                <div className={styles.emptyMistakesIcon}>✓</div>
                <div className={styles.emptyMistakesTitle}>No mistakes saved yet</div>
                <div className={styles.emptyMistakesSub}>Answer some questions — wrong answers will appear here for review</div>
              </div>
            ) : (
              <>
                <div className={styles.mistakeTopics}>
                  <button className={`${styles.mistakeTopic} ${mistakeFilter === 'all' ? styles.mistakeTopicActive : ''}`} onClick={() => setMistakeFilter('all')}>
                    All ({mistakes.length})
                  </button>
                  {mistakeTopics.map(t => (
                    <button key={t} className={`${styles.mistakeTopic} ${mistakeFilter === t ? styles.mistakeTopicActive : ''}`} onClick={() => setMistakeFilter(t)}>
                      {t} ({mistakesByTopic[t].length})
                    </button>
                  ))}
                </div>

                <div className={styles.mistakeList}>
                  {filteredMistakes.slice().reverse().map((m, i) => (
                    <div key={i} className={styles.mistakeCard}>
                      <div className={styles.mistakeQ}>{m.question}</div>
                      <div className={styles.mistakeAnswers}>
                        <div className={styles.mistakeWrong}><span className={styles.mistakeLabel}>Your answer:</span> {m.userAnswer}</div>
                        <div className={styles.mistakeCorrect}><span className={styles.mistakeLabel}>Correct:</span> {m.correct}</div>
                      </div>
                      {m.rationale && <div className={styles.mistakeRationale}>{m.rationale}</div>}
                      <div className={styles.mistakeMeta}>
                        <span className={styles.mistakeTag}>{m.topic}</span>
                        <span className={styles.mistakeDate}>{m.date}</span>
                        <button className={styles.mistakeClear} onClick={() => clearMistake(mistakes.indexOf(m))}>Dismiss</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SKILL MAP TAB ── */}
        {activeTab === 'skillmap' && (
          <div className={styles.skillmapGrid}>
            {Object.entries(curriculum).map(([catId, cat]) => {
              const catTopics = cat.topics
              const catMastered = catTopics.filter(t => {
                const m = mastery[catId + '_' + t.id]
                return m && m.total > 0 && m.correct / m.total >= 0.85 && m.correct >= 40
              }).length
              const catTotal = catTopics.reduce((s, t) => s + (mastery[catId + '_' + t.id]?.correct || 0), 0)
              const catAnswered = catTopics.reduce((s, t) => s + (mastery[catId + '_' + t.id]?.total || 0), 0)
              const catLevel = getMasteryLevel(catTotal, catAnswered)
              return (
                <div key={catId} className={styles.catSection}>
                  <div className={styles.catHeader}>
                    <div className={styles.catLabel}>{cat.label}</div>
                    <div className={styles.catStats}>
                      <span style={{ color: catLevel.color }}>{catAnswered > 0 ? Math.round((catTotal/catAnswered)*100) + '%' : '—'}</span>
                      <span className={styles.catMastered}>{catMastered}/{catTopics.length}</span>
                    </div>
                  </div>
                  <div className={styles.topicGrid}>
                    {catTopics.map(topic => {
                      const key = catId + '_' + topic.id
                      const m = mastery[key]
                      const level = getMasteryLevel(m?.correct || 0, m?.total || 0)
                      return (
                        <button key={key} className={styles.topicChip}
                          style={{ borderColor: level.color + '44', background: level.color + '11' }}
                          onClick={() => onStartQuiz('topic', key, topic.label)}>
                          <div className={styles.topicChipDot} style={{ background: level.color }} />
                          <span className={styles.topicChipLabel}>{topic.label}</span>
                          {m && m.total > 0 && <span className={styles.topicChipPct} style={{ color: level.color }}>{level.pct}%</span>}
                        </button>
                      )
                    })}
                    {customTopics.filter(t => t.categoryId === catId).map(topic => {
                      const m = mastery[topic.id]
                      const level = getMasteryLevel(m?.correct || 0, m?.total || 0)
                      return (
                        <div key={topic.id} style={{ display: 'contents' }}>
                          {renamingId === topic.id ? (
                            <input className={styles.renameInput} value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') confirmRename(topic.id); if (e.key === 'Escape') setRenamingId(null) }}
                              onBlur={() => confirmRename(topic.id)} autoFocus />
                          ) : (
                            <button className={`${styles.topicChip} ${styles.topicChipCustom}`}
                              style={{ borderColor: level.color + '44', background: level.color + '11' }}
                              onClick={() => onStartQuiz('topic', topic.id, topic.label)}
                              onDoubleClick={() => { setRenamingId(topic.id); setRenameValue(topic.label) }}>
                              <div className={styles.topicChipDot} style={{ background: level.color }} />
                              <span className={styles.topicChipLabel}>{topic.label}</span>
                              {m && m.total > 0 && <span className={styles.topicChipPct} style={{ color: level.color }}>{level.pct}%</span>}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {Object.entries(customGroups)
              .filter(([k]) => !curriculum[k] && k !== 'custom_ungrouped')
              .map(([groupKey, group]) => (
                <div key={groupKey} className={styles.catSection}>
                  <div className={styles.catHeader}>
                    <div className={`${styles.catLabel} ${styles.catLabelCustom}`}>{group.label}</div>
                    <div className={styles.catStats}><span className={styles.catMastered}>custom</span></div>
                  </div>
                  <div className={styles.topicGrid}>
                    {group.topics.map(topic => {
                      const m = mastery[topic.id]
                      const level = getMasteryLevel(m?.correct || 0, m?.total || 0)
                      return (
                        <button key={topic.id} className={`${styles.topicChip} ${styles.topicChipCustom}`}
                          style={{ borderColor: level.color + '44', background: level.color + '11' }}
                          onClick={() => onStartQuiz('topic', topic.id, topic.label)}
                          onDoubleClick={() => { setRenamingId(topic.id); setRenameValue(topic.label) }}>
                          <div className={styles.topicChipDot} style={{ background: level.color }} />
                          <span className={styles.topicChipLabel}>{topic.label}</span>
                          {m && m.total > 0 && <span className={styles.topicChipPct} style={{ color: level.color }}>{level.pct}%</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BrainIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 3"/></svg> }
function DailyIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> }
function MistakeIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg> }
function TutorIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> }
function ResetIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 8a6 6 0 1112 0"/><path d="M2 8l2-2M2 8l2 2"/></svg> }
