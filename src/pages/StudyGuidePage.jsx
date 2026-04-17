import React, { useState } from 'react'
import { callClaude, NURSING_STUDYGUIDE_SYSTEM, PRENURSING_STUDYGUIDE_SYSTEM, MODEL_HAIKU } from '../lib/api'
import styles from './StudyGuidePage.module.css'

const NURSING_TOPICS = [
  'Heart failure', 'Sepsis & septic shock', 'Stroke (CVA)', 'Myocardial infarction',
  'Diabetic ketoacidosis (DKA)', 'Pulmonary embolism', 'Acute kidney injury',
  'Postpartum hemorrhage', 'Increased intracranial pressure', 'COPD exacerbation',
]

const PRENURSING_TOPICS = [
  'The cardiac cycle', 'Skeletal muscle contraction', 'Action potentials',
  'Gram positive vs gram negative bacteria', 'The immune response',
  'Acid-base chemistry', 'DNA replication', 'The nephron and urine formation',
  'Respiratory gas exchange', 'Hormonal regulation',
]

const SECTIONS = ['OVERVIEW','PATHOPHYSIOLOGY','SIGNS & SYMPTOMS','PRIORITY NURSING INTERVENTIONS','KEY MEDICATIONS','PATIENT & FAMILY EDUCATION','HIGH-YIELD NCLEX POINTS']

function cacheKey(mode, topic) {
  return 'nurseiq_guide_' + mode + '_' + topic.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}
function loadCached(mode, topic) {
  try { const r = localStorage.getItem(cacheKey(mode, topic)); return r ? JSON.parse(r) : null } catch { return null }
}
function saveToCache(mode, topic, data) {
  try { localStorage.setItem(cacheKey(mode, topic), JSON.stringify(data)) } catch {}
}

function renderMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:var(--surface-2);padding:1px 5px;border-radius:4px;font-size:0.9em">$1</code>')
}

export default function StudyGuidePage({ mode, generatingGuide, onGuideReady }) {
  const SYSTEM = mode === 'prenursing' ? PRENURSING_STUDYGUIDE_SYSTEM : NURSING_STUDYGUIDE_SYSTEM
  const topicList = mode === 'prenursing' ? PRENURSING_TOPICS : NURSING_TOPICS

  const [input, setInput] = useState('')
  const [guide, setGuide] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cached, setCached] = useState(false)
  const [error, setError] = useState('')
  const [activeTopic, setActiveTopic] = useState(null)

  async function generate(topicOverride) {
    const topic = (topicOverride !== undefined ? topicOverride : input).trim()
    if (!topic) return

    // Check cache first
    const hit = loadCached(mode, topic)
    if (hit) {
      setGuide(hit)
      setCached(true)
      setLoading(false)
      setActiveTopic(topic)
      return
    }

    setCached(false)
    setLoading(true)
    setGuide(null)
    setError('')
    setActiveTopic(topic)

    try {
      const text = await callClaude({
        system: SYSTEM,
        messages: [{ role: 'user', content: 'Create a comprehensive study guide for: ' + topic }],
        model: MODEL_HAIKU,
        maxTokens: 1800,
      })
      const parsed = parseGuide(text)
      saveToCache(mode, topic, parsed)
      setGuide(parsed)
    } catch(e) {
      setError('Could not generate. Please try again.')
    }
    setLoading(false)
  }

  function parseGuide(text) {
    const result = {}
    let currentSection = null
    let currentLines = []
    const lines = text.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (SECTIONS.includes(trimmed)) {
        if (currentSection) result[currentSection] = currentLines.join('\n').trim()
        currentSection = trimmed
        currentLines = []
      } else if (currentSection) {
        currentLines.push(line)
      }
    }
    if (currentSection) result[currentSection] = currentLines.join('\n').trim()
    return result
  }

  return (
    <div className={styles.layout}>
      <div className={styles.topbar}>
        <div>
          <div className={styles.topTitle}>Study Guide Builder</div>
          <div className={styles.topMeta}>Full structured study guides — patho, interventions, NCLEX pearls</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {cached && <span className={styles.badgeCached}>⚡ Cached</span>}
          {guide && !cached && <span className={styles.badge}>Ready</span>}
          {loading && <span className={styles.badgeLoading}>Generating...</span>}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.sidebar}>
          <div className={styles.sectionLabel}>Popular topics</div>
          {topicList.map(t => (
            <button
              key={t}
              className={`${styles.topicBtn} ${activeTopic === t ? styles.topicActive : ''}`}
              onClick={() => { setInput(t); generate(t) }}
              disabled={loading}
            >
              {t}
              {loadCached(mode, t) && <span className={styles.cachedDot} title="Cached">⚡</span>}
            </button>
          ))}

          <div className={styles.sectionLabel} style={{ marginTop: 16 }}>Custom topic</div>
          <textarea
            className={styles.textarea}
            value={input}
            onChange={e => { setInput(e.target.value); setActiveTopic(null) }}
            rows={3}
            placeholder="Any topic..."
            disabled={loading}
          />
          <button className={styles.buildBtn} onClick={() => generate()} disabled={loading || !input.trim()}>
            {loading ? 'Generating...' : 'Build study guide'}
          </button>
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.guideArea}>
          {!guide && !loading && (
            <div className={styles.empty}>
              <BookIcon />
              <div className={styles.emptyText}>Select a topic to build your study guide</div>
              <div className={styles.emptySub}>Covers pathophysiology, interventions, medications, and high-yield points</div>
            </div>
          )}
          {loading && (
            <div className={styles.empty}>
              <style>{`@keyframes rollStop{0%{transform:rotate(0deg)}15%{transform:rotate(180deg)}35%{transform:rotate(180deg)}50%{transform:rotate(360deg)}100%{transform:rotate(360deg)}}.sg-loader{animation:rollStop 2s ease-in-out infinite}`}</style>
              <div className="sg-loader" style={{width:48,height:48,background:'var(--teal-400)',borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20,boxShadow:'0 4px 20px rgba(29,158,117,0.25)'}}>
                <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
              </div>
              <div className={styles.loadingDots}><span /><span /><span /></div>
              <div className={styles.emptyText} style={{ marginTop: 12 }}>Building your study guide...</div>
              <div className={styles.emptySub}>This takes about 10-15 seconds</div>
            </div>
          )}
          {guide && !loading && (
            <div className={styles.guide}>
              <div className={styles.guideTitle}>{activeTopic || input}</div>
              {SECTIONS.map(section => guide[section] ? (
                <div key={section} className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <SectionIcon section={section} />
                    {toTitleCase(section)}
                  </div>
                  <div className={styles.sectionContent}>
                    {guide[section].split('\n').map((line, i) => {
                      const trimmed = line.trim()
                      if (!trimmed) return null
                      const isBullet = trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')
                      const text = isBullet ? trimmed.replace(/^[-•*]\s*/, '') : trimmed
                      return (
                        <div key={i} className={isBullet ? styles.bullet : styles.line}
                          dangerouslySetInnerHTML={{ __html: renderMd(text) }} />
                      )
                    })}
                  </div>
                </div>
              ) : null)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function toTitleCase(str) {
  return str.split(' ').map(w => w[0] + w.slice(1).toLowerCase()).join(' ')
}

function SectionIcon({ section }) {
  const icons = {
    'OVERVIEW': '○', 'PATHOPHYSIOLOGY': '⬡', 'SIGNS & SYMPTOMS': '◈',
    'PRIORITY NURSING INTERVENTIONS': '◆', 'KEY MEDICATIONS': '◉',
    'PATIENT & FAMILY EDUCATION': '◎', 'HIGH-YIELD NCLEX POINTS': '★',
    'KEY CONCEPTS': '◉', 'STRUCTURES AND FUNCTIONS': '⬡',
    'PROCESSES AND MECHANISMS': '◈', 'CLINICAL CONNECTIONS': '◆',
    'COMMON EXAM QUESTIONS': '★', 'MEMORY TIPS': '○',
  }
  return <span className={styles.sectionIconChar}>{icons[section] || '○'}</span>
}

function BookIcon() {
  return <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinecap="round"><path d="M8 6h24v28H8z"/><path d="M8 6c0-1 1-2 4-2h12c3 0 4 1 4 2M14 12h12M14 18h12M14 24h8"/></svg>
}
