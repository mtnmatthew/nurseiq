import React, { useState, useRef, useEffect } from 'react'
import { callClaude, MODEL_HAIKU } from '../lib/api'
import styles from './ImagePage.module.css'

// Google Images search URL with large image filter
function googleImagesUrl(query) {
  const encoded = encodeURIComponent(query + ' diagram labeled')
  return `https://www.google.com/search?q=${encoded}&tbm=isch&tbs=isz:l`
}

// Curated search suggestions per topic — opens Google Images with best query
const QUICK_TOPICS = [
  { label: 'Heart anatomy', query: 'heart anatomy chambers valves labeled diagram' },
  { label: 'Cardiac conduction', query: 'cardiac conduction system SA node AV node labeled' },
  { label: 'EKG rhythm strips', query: 'EKG normal sinus rhythm labeled P wave QRS T wave' },
  { label: 'Skeletal system', query: 'human skeletal system labeled diagram' },
  { label: 'Neuron structure', query: 'neuron structure axon dendrite myelin labeled diagram' },
  { label: 'Brain lobes', query: 'brain lobes labeled frontal parietal temporal occipital diagram' },
  { label: 'Nephron kidney', query: 'nephron structure kidney labeled diagram' },
  { label: 'Lung alveoli', query: 'lung alveoli gas exchange labeled diagram' },
  { label: 'Muscle sarcomere', query: 'sarcomere structure actin myosin labeled diagram' },
  { label: 'Cell organelles', query: 'animal cell organelles labeled diagram' },
  { label: 'DNA double helix', query: 'DNA double helix structure labeled diagram' },
  { label: 'Eye anatomy', query: 'human eye anatomy labeled diagram' },
  { label: 'Ear anatomy', query: 'human ear anatomy cochlea labeled diagram' },
  { label: 'Digestive system', query: 'digestive system organs labeled diagram' },
  { label: 'Lymphatic system', query: 'lymphatic system lymph nodes labeled diagram' },
  { label: 'Endocrine glands', query: 'endocrine system glands labeled diagram' },
  { label: 'Blood cell types', query: 'blood cells types RBC WBC platelet labeled diagram' },
  { label: 'Immune response', query: 'immune response B cells T cells antibody diagram' },
  { label: 'Gram staining', query: 'gram stain gram positive negative bacteria diagram' },
  { label: 'Bacterial cell', query: 'bacterial prokaryotic cell structure labeled diagram' },
  { label: 'Viral replication', query: 'virus replication cycle lytic lysogenic diagram' },
  { label: 'Synovial joint', query: 'synovial joint structure labeled diagram' },
  { label: 'Skin layers', query: 'skin layers epidermis dermis hypodermis labeled diagram' },
  { label: 'pH scale', query: 'pH scale acidic alkaline labeled chemistry diagram' },
  { label: 'Enzyme kinetics', query: 'enzyme substrate active site induced fit diagram' },
  { label: 'Wound healing', query: 'wound healing stages hemostasis inflammation proliferation diagram' },
  { label: 'Heart failure', query: 'heart failure left right sided pathophysiology diagram' },
  { label: 'Blood pressure', query: 'blood pressure regulation baroreceptors RAAS diagram' },
  { label: 'Insulin types', query: 'insulin types onset peak duration chart nursing' },
  { label: 'Action potential', query: 'action potential depolarization repolarization labeled diagram' },
  { label: 'Cardiac cycle', query: 'cardiac cycle systole diastole pressure volume diagram' },
  { label: 'Menstrual cycle', query: 'menstrual cycle hormones FSH LH estrogen progesterone diagram' },
  { label: 'Reflex arc', query: 'reflex arc sensory motor neuron spinal cord diagram' },
]

const REFERENCE_SITES = [
  { label: 'Kenhub', url: 'https://www.kenhub.com', desc: 'Interactive anatomy atlas' },
  { label: 'Visible Body', url: 'https://www.visiblebody.com', desc: '3D anatomy models' },
  { label: 'OpenStax A&P', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction', desc: 'Free A&P textbook' },
  { label: 'InnerBody', url: 'https://www.innerbody.com', desc: 'Interactive body systems' },
  { label: 'OpenStax Micro', url: 'https://openstax.org/books/microbiology/pages/1-introduction', desc: 'Free microbiology textbook' },
]

export default function ImagePage({ mode, onNavigate, initialQuery, onQueryUsed }) {
  const [query, setQuery] = useState('')
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [currentQuery, setCurrentQuery] = useState('')
  const searchIdRef = useRef(0)

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      search(initialQuery.trim())
      if (onQueryUsed) onQueryUsed()
    }
  }, [initialQuery])

  async function search(term) {
    const q = (term !== undefined ? term : query).trim()
    if (!q) return
    const myId = ++searchIdRef.current
    setQuery(q)
    setCurrentQuery(q)
    setLoading(true)
    setSearched(true)
    setExplanation('')

    try {
      await callClaude({
        system: 'You are NurseIQ, an expert tutor for nursing, A&P, microbiology, pharmacology, and chemistry students. Give a concise, high-yield explanation in 4-6 sentences. Bold key terms with **term**. End with one high-yield exam tip prefixed with "📌 Exam tip:".',
        messages: [{ role: 'user', content: 'Explain for a nursing or pre-nursing student: ' + q }],
        maxTokens: 400,
        onChunk: t => { if (searchIdRef.current === myId) setExplanation(t) }
      })
    } catch(e) {}

    if (searchIdRef.current === myId) setLoading(false)
  }

  function renderText(text) {
    return {
      __html: text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/📌/g, '<span style="font-size:14px">📌</span>')
        .replace(/\n/g, '<br/>')
    }
  }

  // Find a curated query for a topic if it exists, else build one
  function getGoogleUrl(q) {
    const curated = QUICK_TOPICS.find(t => t.label.toLowerCase() === q.toLowerCase())
    return curated ? `https://www.google.com/search?q=${encodeURIComponent(curated.query)}&tbm=isch&tbs=isz:l` : googleImagesUrl(q)
  }

  return (
    <div className={styles.layout}>
      <div className={styles.topbar}>
        <div className={styles.topTitle}>Visual Learning</div>
        <div className={styles.topMeta}>AI explanations + Google Images — nursing, A&P, micro, pharmacology, chemistry</div>
      </div>

      <div className={styles.body}>
        <div className={styles.searchWrap}>
          <div className={styles.searchRow}>
            <input
              className={styles.searchInput}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Search any concept — heart anatomy, EKG rhythm, gram staining, insulin..."
              autoComplete="off"
            />
            <button className={styles.searchBtn} onClick={() => search()} disabled={!query.trim()}>
              {loading ? <SpinnerIcon /> : 'Search'}
            </button>
          </div>
          <div className={styles.quickRow}>
            {QUICK_TOPICS.map(t => (
              <button
                key={t.label}
                className={`${styles.quickChip} ${currentQuery === t.label ? styles.quickChipActive : ''}`}
                onClick={() => search(t.label)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {!searched && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--teal-400)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="14" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="M3 15l4-4 4 4 3-3 5 5"/></svg>
            </div>
            <div className={styles.emptyText}>Visual learning for every nursing course</div>
            <div className={styles.emptySub}>Search any topic to get an AI explanation and curated image search</div>
            <div className={styles.refSection}>
              <div className={styles.refLabel}>Recommended reference sites</div>
              <div className={styles.refGrid}>
                {REFERENCE_SITES.map(s => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className={styles.refCard}>
                    <div className={styles.refName}>{s.label} ↗</div>
                    <div className={styles.refDesc}>{s.desc}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {searched && (
          <div className={styles.results}>
            {/* Study with buttons */}
            <div className={styles.actionBar}>
              <span className={styles.actionLabel}>Study <strong>{currentQuery}</strong> with:</span>
              <button className={styles.actionBtn} onClick={() => onNavigate && onNavigate('flashcards')}><FlashIcon /> Flashcards</button>
              <button className={styles.actionBtn} onClick={() => onNavigate && onNavigate('studyguide')}><GuideIcon /> Study guide</button>
              <a
                href={getGoogleUrl(currentQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionBtnPrimary}
              >
                <ImgIcon /> Open diagrams in Google Images ↗
              </a>
            </div>

            {/* AI Explanation */}
            <div className={styles.explanationCard}>
              <div className={styles.explanationLabel}><BrainIcon /> AI Explanation</div>
              {loading && !explanation && <div className={styles.loadingDots}><span/><span/><span/></div>}
              {explanation && <div className={styles.explanationText} dangerouslySetInnerHTML={renderText(explanation)} />}
            </div>

            {/* Image search tiles - open in new tab */}
            <div className={styles.imageLinksSection}>
              <div className={styles.imageLinksLabel}>Find diagrams</div>
              <div className={styles.imageLinksGrid}>
                <a href={getGoogleUrl(currentQuery)} target="_blank" rel="noopener noreferrer" className={styles.imageLinkCard + ' ' + styles.imageLinkCardPrimary}>
                  <div className={styles.imageLinkIcon}><GoogleIcon /></div>
                  <div className={styles.imageLinkContent}>
                    <div className={styles.imageLinkTitle}>Google Images — {currentQuery}</div>
                    <div className={styles.imageLinkDesc}>Large labeled diagrams filtered for best quality</div>
                  </div>
                  <div className={styles.imageLinkArrow}>↗</div>
                </a>
                {REFERENCE_SITES.slice(0, 4).map(s => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className={styles.imageLinkCard}>
                    <div className={styles.imageLinkIcon}><LinkIcon /></div>
                    <div className={styles.imageLinkContent}>
                      <div className={styles.imageLinkTitle}>{s.label}</div>
                      <div className={styles.imageLinkDesc}>{s.desc}</div>
                    </div>
                    <div className={styles.imageLinkArrow}>↗</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SpinnerIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" style={{animation:'spin 0.8s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> }
function FlashIcon() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h4"/></svg> }
function GuideIcon() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 4h10M3 8h10M3 12h6"/></svg> }
function BrainIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 3"/></svg> }
function ImgIcon() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3" width="14" height="10" rx="1.5"/><circle cx="5.5" cy="7" r="1"/><path d="M1 11l3.5-3.5 3 3 2.5-2.5 4 4"/></svg> }
function GoogleIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg> }
function LinkIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> }
