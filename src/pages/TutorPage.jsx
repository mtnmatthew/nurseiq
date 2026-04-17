import React, { useState, useRef, useEffect, useCallback } from 'react'
import { callClaude, NURSING_TUTOR_SYSTEM, PRENURSING_TUTOR_SYSTEM, MODEL_HAIKU } from '../lib/api'
import { loadCustomTopics, addCustomTopic, getCurriculum, getCurriculumCategoryLabels, addTopicToCategory, getCustomCategories } from '../lib/curriculum'
import styles from './TutorPage.module.css'

const NURSING_PROMPTS = [
  'Explain the ABCs priority framework for NCLEX',
  'Quiz me on beta blockers',
  'Explain DKA pathophysiology',
  'What are the 6 rights of medication administration?',
]

const PRENURSING_PROMPTS = [
  'Explain the cardiac cycle step by step',
  'Quiz me on the bones of the axial skeleton',
  'How does gram staining work?',
  'Explain the sodium-potassium pump',
]

const nursingSubjectLabels = {
  pharm: 'Pharmacology', medsurg: 'Med-Surg', cardiac: 'Cardiac',
  respiratory: 'Respiratory', neuro: 'Neuro', obgyn: 'OB/GYN',
  peds: 'Pediatrics', psych: 'Psych Nursing', critical: 'Critical Care',
}

const prenursingSubjectLabels = {
  anp1: 'A&P 1', anp2: 'A&P 2', micro: 'Microbiology',
  bio: 'Biology', chem: 'Chemistry', stats: 'Statistics',
  nutrition: 'Nutrition', psych101: 'Psychology',
}

function renderText(text) {
  const html = text
    .replace(/```([\s\S]+?)```/g, '<span class="nurseiq-code-block">$1</span>')
    .replace(/^#{1,3}\s*(.+)$/gm, '<span class="nurseiq-heading">$1</span>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^[-\u2022]\s+(.+)$/gm, '<span class="nurseiq-bullet">$1</span>')
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
  return { __html: '<span class="nurseiq-response">' + html + '</span>' }
}

function loadHistory(subject, mode) {
  try { return JSON.parse(localStorage.getItem('nurseiq_history_' + mode + '_' + (subject || 'general')) || '[]') } catch { return [] }
}

function saveHistory(subject, mode, messages) {
  try {
    const clean = messages.filter(m => m.text && m.text.trim() !== '')
    localStorage.setItem('nurseiq_history_' + mode + '_' + (subject || 'general'), JSON.stringify(clean.slice(-40)))
  } catch {}
}

function loadCustomClasses() {
  try { return JSON.parse(localStorage.getItem('nurseiq_custom_classes') || '[]') } catch { return [] }
}

function saveCustomClasses(classes) {
  localStorage.setItem('nurseiq_custom_classes', JSON.stringify(classes))
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function extractTopic(text) {
  const lines = text.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.toUpperCase().startsWith('TOPIC:')) {
      return trimmed.replace(/^TOPIC:\s*/i, '').replace(/[\[\]]/g, '').trim()
    }
    if (trimmed.toUpperCase().startsWith('SKILLMAP:')) {
      return trimmed.replace(/^SKILLMAP:\s*/i, '').replace(/[\[\]]/g, '').trim()
    }
  }
  return null
}

function makeTopicId(label) {
  return 'custom_' + label.toLowerCase().split('').filter(c => /[a-z0-9 ]/.test(c)).join('').trim().replace(/ +/g, '_')
}

async function findBestCategory(topicLabel, mode) {
  const curriculum = getCurriculum(mode)
  const catList = Object.entries(curriculum).map(([id, cat]) =>
    id + ': ' + cat.label + ' — topics include: ' + cat.topics.map(t => t.label).join(', ')
  ).join('\n')

  const prompt = 'A student uploaded material on: "' + topicLabel + '"\n\nAvailable curriculum categories:\n' + catList + '\n\nWhich category does this topic best fit? Also suggest 3-5 specific subtopics this material likely covers.\n\nRespond ONLY with valid JSON:\n{"action":"existing","categoryId":"anp2","subtopics":["Topic A","Topic B","Topic C"]}\nOR\n{"action":"new","categoryLabel":"New Section Name","subtopics":["Topic A","Topic B","Topic C"]}\n\nUse "existing" if it clearly belongs in a category. Use "new" only if it genuinely does not fit.'

  try {
    const raw = await callClaude({
      system: 'You are a nursing and pre-nursing curriculum expert. Respond only with valid JSON, no markdown.',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 200,
      model: MODEL_HAIKU,
    })
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return { action: 'new', categoryLabel: topicLabel, subtopics: [] }
  }
}

export default function TutorPage({ subject, mode, triggerAddClass, onAddClassDone, onNavigateTo }) {
  const subjectLabels = mode === 'prenursing' ? prenursingSubjectLabels : nursingSubjectLabels
  const PROMPTS = mode === 'prenursing' ? PRENURSING_PROMPTS : NURSING_PROMPTS

  const SKILL_MAP_ADDON = '\n\nIMPORTANT: When a user asks to add content to their skill map, include on its own line: SKILLMAP: [Topic Name]. Only do this when the user explicitly asks.'
  const SYSTEM = (mode === 'prenursing' ? PRENURSING_TUTOR_SYSTEM : NURSING_TUTOR_SYSTEM) + SKILL_MAP_ADDON

  const getWelcome = (sub) => {
    if (mode === 'prenursing') {
      const label = sub && (subjectLabels[sub] || sub)
      return label
        ? 'Let\'s work on **' + label + '**.\n\nWhat concept are you struggling with, or would you like me to quiz you on key topics? You can also upload your lecture slides or syllabus.'
        : 'Welcome to NurseIQ pre-nursing mode.\n\nI can help you master A&P, Microbiology, Chemistry, Biology, and your other pre-nursing courses. Upload your syllabus or lecture slides and I\'ll tailor everything to your class.\n\nWhat are we working on today?'
    }
    const label = sub && (subjectLabels[sub] || sub)
    return label
      ? 'Let\'s focus on **' + label + '**.\n\nWhat do you want to tackle first, or should I quiz you?'
      : 'Welcome back. I\'m your NurseIQ clinical tutor.\n\nI know NCLEX-RN, pharmacology, pathophysiology, care plans, and clinical reasoning. Upload your lecture slides and I\'ll study them with you.\n\nWhat are we working on today?'
  }

  const getInitialMessages = (sub) => {
    const history = loadHistory(sub, mode)
    if (history.length > 0) return history
    return [{ role: 'ai', text: getWelcome(sub) }]
  }

  const [messages, setMessages] = useState(() => getInitialMessages(subject))
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)
  const [hasHistory, setHasHistory] = useState(() => loadHistory(subject, mode).length > 1)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [showAddClass, setShowAddClass] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [customClasses, setCustomClasses] = useState(loadCustomClasses)
  const [skillMapPrompt, setSkillMapPrompt] = useState(null)
  const [placingTopic, setPlacingTopic] = useState(false)
  const [editLabel, setEditLabel] = useState('')

  const bottomRef = useRef(null)
  const abortRef = useRef(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const fileRef = useRef(null)
  const prevSubject = useRef(subject)
  const prevMode = useRef(mode)
  const isNearBottom = useRef(true)

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    isNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }

  function scrollToBottomIfNear() {
    if (isNearBottom.current) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (subject !== prevSubject.current || mode !== prevMode.current) {
      prevSubject.current = subject
      prevMode.current = mode
      const history = loadHistory(subject, mode)
      if (history.length > 0) { setMessages(history); setHasHistory(true) }
      else { setMessages([{ role: 'ai', text: getWelcome(subject) }]); setHasHistory(false) }
      setCount(0); setInput('')
      isNearBottom.current = true
    }
  }, [subject, mode])

  useEffect(() => { if (messages.length > 1) saveHistory(subject, mode, messages) }, [messages])
  useEffect(() => { scrollToBottomIfNear() }, [messages.length])
  useEffect(() => { if (triggerAddClass) { setShowAddClass(true); onAddClassDone && onAddClassDone() } }, [triggerAddClass])

  function clearHistory() {
    setMessages([{ role: 'ai', text: getWelcome(subject) }])
    setHasHistory(false); setCount(0)
    localStorage.removeItem('nurseiq_history_' + mode + '_' + (subject || 'general'))
  }

  function addCustomClass() {
    if (!newClassName.trim()) return
    const updated = [...customClasses, { id: Date.now(), name: newClassName.trim() }]
    setCustomClasses(updated)
    saveCustomClasses(updated)
    setNewClassName('')
    setShowAddClass(false)
    send('I am taking a class called "' + newClassName.trim() + '". Please introduce yourself and ask what topics we should focus on.')
  }

  async function handleSkillMapDetected(topicLabel) {
    const topicId = makeTopicId(topicLabel)
    const existing = loadCustomTopics()
    const alreadyAdded = existing.find(t => t.id === topicId)
    if (alreadyAdded) return

    setPlacingTopic(true)
    const placement = await findBestCategory(topicLabel, mode)
    setPlacingTopic(false)

    setEditLabel(topicLabel)
    setSkillMapPrompt({
      id: topicId,
      label: topicLabel,
      placement,
    })
  }

  function confirmSkillMapAdd() {
    const finalLabel = editLabel.trim() || skillMapPrompt.label
    const finalId = makeTopicId(finalLabel)
    const { placement } = skillMapPrompt
    const topic = { id: finalId, label: finalLabel, custom: true, questions: 10 }

    if (placement.action === 'existing') {
      addTopicToCategory(placement.categoryId, topic)
      addCustomTopic({ ...topic, categoryId: placement.categoryId })
    } else {
      const newCatId = 'custom_cat_' + (placement.categoryLabel || finalLabel).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      addTopicToCategory(newCatId, { ...topic, categoryLabel: placement.categoryLabel || finalLabel })
      addCustomTopic({ ...topic, categoryId: newCatId, categoryLabel: placement.categoryLabel || finalLabel })
    }

    setSkillMapPrompt(null)
    const catName = placement.action === 'existing'
      ? getCurriculum(mode)[placement.categoryId]?.label || placement.categoryId
      : placement.categoryLabel || finalLabel

    setMessages(prev => [...prev, { role: 'ai', text: '**' + finalLabel + '** has been added to your skill map under **' + catName + '**. You can track your mastery from the Dashboard → Skill Map tab. Want me to quiz you on it now to set a baseline?' }])
  }

  async function processFile(file) {
    if (!file) return
    setUploadLoading(true)
    try {
      const base64 = await fileToBase64(file)
      const isImage = file.type.startsWith('image/')
      const isPDF = file.type === 'application/pdf'
      const isSyllabus = file.name.toLowerCase().includes('syllabus')

      const prompt = isSyllabus
        ? 'I have uploaded my course syllabus. Please: 1) Start your response with TOPIC: [main subject name] 2) List the main topics covered, 3) Summarize major exams and assignments, 4) Ask what I would like to focus on first.'
        : 'I have uploaded my lecture slides or notes. Please: 1) Start your response with TOPIC: [main subject in one phrase, e.g. Lymphatic System] 2) Summarize the key concepts covered. 3) Ask what I would like to focus on.'

      let userMessage
      if (isImage || isPDF) {
        userMessage = {
          role: 'user',
          content: [
            { type: isPDF ? 'document' : 'image', source: { type: 'base64', media_type: file.type, data: base64 } },
            { type: 'text', text: prompt }
          ]
        }
      } else {
        userMessage = { role: 'user', content: 'I uploaded "' + file.name + '". Supported formats are PDF and images (PNG, JPG).' }
      }

      setMessages(prev => [...prev, { role: 'user', text: 'Uploaded: ' + file.name }, { role: 'ai', text: '' }])
      isNearBottom.current = true

      const history = messages
        .filter(m => m.text && m.text.trim() !== '')
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
        .filter((m, i) => !(i === 0 && m.role === 'assistant'))
      history.push(userMessage)

      let finalText = ''
      await callClaude({
        system: SYSTEM, messages: history, maxTokens: 1500,
        onChunk: (text) => { finalText = text; setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'ai', text }; return u }); scrollToBottomIfNear() }
      })

      const detectedTopic = extractTopic(finalText)
      if (detectedTopic) handleSkillMapDetected(detectedTopic)

    } catch(e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Could not process the file. Try a PDF or image.' }])
    }
    setUploadLoading(false)
  }

  function handleFileInput(e) { processFile(e.target.files[0]); e.target.value = '' }

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [messages, SYSTEM])

  function stopGeneration() {
    if (abortRef.current) { abortRef.current(); abortRef.current = null }
    setLoading(false)
    // Clean up the empty trailing message
    setMessages(prev => {
      const last = prev[prev.length - 1]
      if (last && last.role === 'ai' && (!last.text || last.text.trim() === '')) return prev.slice(0, -1)
      return prev
    })
  }

  async function send(text) {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setCount(c => c + 1)
    setLoading(true)
    isNearBottom.current = true
    let cancelled = false
    abortRef.current = () => { cancelled = true }

    try {
      // Build history — filter empty messages, ensure starts with user message
      const history = messages
        .filter(m => m.text && m.text.trim() !== '')
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
        .filter((m, i, arr) => !(i === 0 && m.role === 'assistant')) // drop leading assistant msg
      history.push({ role: 'user', content: msg })
      setMessages(prev => [...prev, { role: 'ai', text: '' }])

      let finalText = ''
      await callClaude({
        system: SYSTEM, messages: history, maxTokens: 1200,
        onChunk: (text) => {
          if (cancelled) return
          finalText = text
          setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'ai', text }; return u })
          scrollToBottomIfNear()
        }
      })

      if (!cancelled) {
        const detectedTopic = extractTopic(finalText)
        if (detectedTopic) handleSkillMapDetected(detectedTopic)
      }
    } catch(e) {
      if (!cancelled) setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'ai', text: 'Anthropic\'s servers are currently busy. Please wait a moment and try again.' }; return u })
    }
    if (!cancelled) { setLoading(false); inputRef.current?.focus() }
    abortRef.current = null
  }

  function onKeyDown(e) {
    if (loading) { e.preventDefault(); return }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const curriculum = getCurriculum(mode)
  const placementLabel = skillMapPrompt?.placement?.action === 'existing'
    ? curriculum[skillMapPrompt.placement.categoryId]?.label || skillMapPrompt.placement.categoryId
    : skillMapPrompt?.placement?.categoryLabel || 'New section'

  return (
    <div
      className={styles.layout + (dragOver ? ' ' + styles.dragOver : '')}
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
    >
      {dragOver && (
        <div className={styles.dropOverlay}>
          <div className={styles.dropMsg}><UploadIcon /><span>Drop your file to upload</span></div>
        </div>
      )}

      <div className={styles.topbar}>
        <div className={styles.topLeft}>
          <div className={styles.topTitle}>{subject ? (subjectLabels[subject] || subject) : (mode === 'prenursing' ? 'Pre-Nursing Tutor' : 'AI Tutor')}</div>
          <div className={styles.modelPill}>NurseIQ {mode === 'prenursing' ? 'Pre-Nursing' : 'Tutor'} <ChevronIcon /></div>
          {hasHistory && <div className={styles.memoryBadge}>Memory on</div>}
        </div>
        <div className={styles.topBadges}>
          <button className={styles.clearBtn} onClick={clearHistory}>Reset chat</button>
          {mode === 'nursing' && <span className={styles.badgeAmber}>NCLEX prep</span>}
          {mode === 'prenursing' && <span className={styles.badgePurple}>Pre-nursing</span>}
          <span className={styles.badgeTeal}>{count} this session</span>
        </div>
      </div>

      {messages.length === 1 && !subject && (
        <div className={styles.uploadBanner}>
          <div className={styles.uploadBannerIcon}><UploadIcon /></div>
          <div className={styles.uploadBannerContent}>
            <div className={styles.uploadBannerTitle}>Add your class materials to personalize your skill map</div>
            <div className={styles.uploadBannerDesc}>Upload lecture slides, notes, or your syllabus — NurseIQ will detect the topics and add them to your dashboard with mastery tracking</div>
          </div>
          <button className={styles.uploadBannerBtn} onClick={() => fileRef.current.click()}>
            Upload material
          </button>
        </div>
      )}

      <div className={styles.chatScroll} ref={scrollRef} onScroll={handleScroll}>
        <div className={styles.chatInner}>
          {mode === 'prenursing' && customClasses.length > 0 && messages.length === 1 && (
            <div className={styles.classChips}>
              <div className={styles.classChipsLabel}>My classes</div>
              <div className={styles.classChipsRow}>
                {customClasses.map(c => (
                  <button key={c.id} className={styles.classChip} onClick={() => send('Let\'s work on my ' + c.name + ' class.')}>{c.name}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => m.role === 'user' ? (
            <div key={i} className={styles.userRow}>
              <div className={styles.userBubble}><span dangerouslySetInnerHTML={renderText(m.text)} /></div>
            </div>
          ) : (
            <div key={i} className={styles.aiRow}>
              <div className={styles.aiAvatar}>NQ</div>
              <div className={styles.aiContent}>
                <div className={styles.aiName}>NurseIQ</div>
                <div className={styles.aiText}>
                  {m.text === '' ? (
                    <div className={styles.typing}><span /><span /><span /></div>
                  ) : (() => {
                    const imgMatch = m.text.match(/SHOW_IMAGE:([^\n]+)/)
                    if (imgMatch) {
                      const query = imgMatch[1].trim()
                      const cleanText = m.text.replace(/\nSHOW_IMAGE:[^\n]+/, '').replace(/SHOW_IMAGE:[^\n]+/, '').trim()
                      return (
                        <div>
                          {cleanText && <span dangerouslySetInnerHTML={renderText(cleanText)} />}
                          <div className={styles.showImageBtn} onClick={() => onNavigateTo && onNavigateTo('images', query)}>
                            <ImgIcon /> View diagram: {query} ↗
                          </div>
                        </div>
                      )
                    }
                    return <span dangerouslySetInnerHTML={renderText(m.text)} />
                  })()}
                </div>
                {i > 0 && m.text !== '' && !loading && (
                  <div className={styles.aiActions}>
                    <button className={styles.aiActionBtn} onClick={() => send('Give me a practice exam question on this topic')}>+ Practice question</button>
                    <button className={styles.aiActionBtn} onClick={() => send('Simplify this explanation')}>Simplify</button>
                    <button className={styles.aiActionBtn} onClick={() => send('Give me a mnemonic for this')}>Mnemonic</button>
                    <button className={styles.aiActionBtn} onClick={() => send('Make flashcards from this')}>Flashcards</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {placingTopic && (
        <div className={styles.skillMapBanner}>
          <SpinnerIcon />
          <div className={styles.skillMapBannerText}>Finding the best place in your skill map...</div>
        </div>
      )}

      {skillMapPrompt && !placingTopic && (
        <div className={styles.skillMapModal}>
          <div className={styles.skillMapModalHeader}>
            <SkillMapIcon />
            <div className={styles.skillMapModalTitle}>Add to skill map</div>
            <button className={styles.skillMapDismiss} onClick={() => setSkillMapPrompt(null)}>✕</button>
          </div>
          <div className={styles.skillMapModalBody}>
            <div className={styles.skillMapField}>
              <label className={styles.skillMapFieldLabel}>Topic name</label>
              <input
                className={styles.skillMapFieldInput}
                value={editLabel}
                onChange={e => setEditLabel(e.target.value)}
                placeholder="Topic name..."
              />
            </div>
            <div className={styles.skillMapField}>
              <label className={styles.skillMapFieldLabel}>Category</label>
              <div className={styles.skillMapCategory}>
                {skillMapPrompt.placement?.action === 'existing' ? (
                  <span className={styles.skillMapCategoryBadge}>
                    {placementLabel}
                  </span>
                ) : (
                  <span className={styles.skillMapCategoryNew}>
                    + New section: {placementLabel}
                  </span>
                )}
              </div>
            </div>
            {skillMapPrompt.placement?.subtopics?.length > 0 && (
              <div className={styles.skillMapField}>
                <label className={styles.skillMapFieldLabel}>Detected subtopics</label>
                <div className={styles.skillMapSubtopics}>
                  {skillMapPrompt.placement.subtopics.map((s, i) => (
                    <span key={i} className={styles.skillMapSubtopic}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className={styles.skillMapModalFooter}>
            <button className={styles.skillMapConfirm} onClick={confirmSkillMapAdd}>
              <SkillMapIcon /> Add to skill map
            </button>
            <button className={styles.skillMapDismissBtn} onClick={() => setSkillMapPrompt(null)}>Cancel</button>
          </div>
        </div>
      )}

      {showAddClass && (
        <div className={styles.addClassBar}>
          <input className={styles.addClassInput} value={newClassName} onChange={e => setNewClassName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCustomClass(); if (e.key === 'Escape') setShowAddClass(false) }}
            placeholder="Class name, e.g. ANP 1, Microbiology 101..." autoFocus />
          <button className={styles.addClassConfirm} onClick={addCustomClass}>Add class</button>
          <button className={styles.addClassCancel} onClick={() => setShowAddClass(false)}>Cancel</button>
        </div>
      )}

      <div className={styles.inputArea}>
        <div className={styles.inputWrap}>
          <div className={styles.inputOuter}>
            <div className={styles.inputPills}>
              {PROMPTS.map((p, i) => (
                <button key={i} className={styles.pill} onClick={() => !loading && send(p)} disabled={loading}>{p}</button>
              ))}
            </div>
            <textarea ref={inputRef} className={styles.inputBox} value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} rows={2}
              placeholder={loading ? 'Generating response...' : (mode === 'prenursing' ? 'Ask about A&P, Micro, Chemistry... or drag a file anywhere' : 'Ask about meds, patho, care plans, NCLEX... or drag a file anywhere')}
              disabled={loading} />
            <div className={styles.inputFooter}>
              <div className={styles.inputLeft}>
                <input ref={fileRef} type="file" accept=".pdf,.pptx,.docx,image/*" style={{ display: 'none' }} onChange={handleFileInput} />
                <button className={styles.uploadIconBtn} onClick={() => fileRef.current.click()} disabled={uploadLoading || loading} title="Upload PDF, DOCX, PPTX, or image">
                  {uploadLoading ? <SpinnerIcon /> : <UploadIcon />}
                </button>

                <div className={styles.memoryNote}><MemoryIcon /> Saved locally</div>
              </div>
              <button className={styles.sendBtn} onClick={() => send()} disabled={loading || !input.trim()}><SendIcon /></button>
            </div>
          </div>
          <div className={styles.inputHint}>
            {loading ? 'Generating — scroll up to read · press nothing to wait' : 'NurseIQ — always verify clinical decisions with your institution · drag files anywhere to upload'}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChevronIcon() { return <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 6l4 4 4-4"/></svg> }
function SendIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l10-5-5 10V8H3z"/></svg> }
function MemoryIcon() { return <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg> }
function UploadIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> }
function SpinnerIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{animation:'spin 1s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> }
function PlusIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg> }
function ImgIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3" width="14" height="10" rx="1.5"/><circle cx="5.5" cy="7" r="1"/><path d="M1 11l3.5-3.5 3 3 2.5-2.5 4 4"/></svg> }
function StopIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="white"><rect x="3" y="3" width="10" height="10" rx="2"/></svg> }
function SkillMapIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg> }
