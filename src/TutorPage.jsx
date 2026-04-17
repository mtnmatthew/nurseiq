import React, { useState, useRef, useEffect } from 'react'
import { callClaude, NURSING_TUTOR_SYSTEM, PRENURSING_TUTOR_SYSTEM } from '../lib/api'
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
  'How does gram staining work in microbiology?',
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
    .replace(/^[-•]\s+(.+)$/gm, '<span class="nurseiq-bullet">$1</span>')
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
  return { __html: '<span class="nurseiq-response">' + html + '</span>' }
}

function loadHistory(subject, mode) {
  try { return JSON.parse(localStorage.getItem('nurseiq_history_' + mode + '_' + (subject || 'general')) || '[]') } catch { return [] }
}

function saveHistory(subject, mode, messages) {
  try { localStorage.setItem('nurseiq_history_' + mode + '_' + (subject || 'general'), JSON.stringify(messages.slice(-40))) } catch {}
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function TutorPage({ subject, mode }) {
  const subjectLabels = mode === 'prenursing' ? prenursingSubjectLabels : nursingSubjectLabels
  const SYSTEM = mode === 'prenursing' ? PRENURSING_TUTOR_SYSTEM : NURSING_TUTOR_SYSTEM
  const PROMPTS = mode === 'prenursing' ? PRENURSING_PROMPTS : NURSING_PROMPTS

  const getWelcome = (sub) => {
    if (mode === 'prenursing') {
      return sub && subjectLabels[sub]
        ? 'Let\'s work on **' + subjectLabels[sub] + '**.\n\nWhat concept are you struggling with, or would you like me to quiz you on key topics?'
        : 'Welcome to NurseIQ pre-nursing mode.\n\nI can help you master A&P, Microbiology, Chemistry, Biology, and your other pre-nursing courses. You can also upload your lecture slides or notes and I\'ll study them with you.\n\nWhat are we working on today?'
    }
    return sub && subjectLabels[sub]
      ? 'Let\'s focus on **' + subjectLabels[sub] + '**.\n\nWhat do you want to tackle first, or should I quiz you?'
      : 'Welcome back. I\'m your NurseIQ clinical tutor.\n\nI know NCLEX-RN, pharmacology, pathophysiology, care plans, and clinical reasoning. You can also upload lecture slides or notes and I\'ll study them with you.\n\nWhat are we working on today?'
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
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const fileRef = useRef(null)
  const prevSubject = useRef(subject)
  const prevMode = useRef(mode)

  useEffect(() => {
    if (subject !== prevSubject.current || mode !== prevMode.current) {
      prevSubject.current = subject
      prevMode.current = mode
      const history = loadHistory(subject, mode)
      if (history.length > 0) { setMessages(history); setHasHistory(true) }
      else { setMessages([{ role: 'ai', text: getWelcome(subject) }]); setHasHistory(false) }
      setCount(0); setInput(''); setUploadedFile(null)
    }
  }, [subject, mode])

  useEffect(() => { if (messages.length > 1) saveHistory(subject, mode, messages) }, [messages])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  function clearHistory() {
    const welcome = [{ role: 'ai', text: getWelcome(subject) }]
    setMessages(welcome); setHasHistory(false); setCount(0)
    localStorage.removeItem('nurseiq_history_' + mode + '_' + (subject || 'general'))
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadLoading(true)
    setUploadedFile({ name: file.name, type: file.type })

    try {
      const base64 = await fileToBase64(file)
      const isImage = file.type.startsWith('image/')
      const isPDF = file.type === 'application/pdf'

      let userMessage
      if (isImage || isPDF) {
        userMessage = {
          role: 'user',
          content: [
            { type: isPDF ? 'document' : 'image', source: { type: 'base64', media_type: file.type, data: base64 } },
            { type: 'text', text: 'I\'ve uploaded my lecture slides/notes. Please analyze this content and give me a summary of the key concepts, then ask me what I\'d like to focus on — whether that\'s a full explanation, flashcards, practice questions, or a study guide.' }
          ]
        }
      } else {
        userMessage = { role: 'user', content: 'I uploaded a file called "' + file.name + '" but it could not be read directly. Please let me know what formats work best.' }
      }

      setMessages(prev => [...prev, { role: 'user', text: 'Uploaded: ' + file.name }, { role: 'ai', text: '' }])

      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
      history.push(userMessage)

      await callClaude({
        system: SYSTEM,
        messages: history,
        maxTokens: 1500,
        onChunk: (text) => {
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'ai', text }
            return updated
          })
        }
      })
    } catch(e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Could not process the file. Try a PDF, image, or paste your notes directly.' }])
    }
    setUploadLoading(false)
    e.target.value = ''
  }

  async function send(text) {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setCount(c => c + 1)
    setLoading(true)
    try {
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
      history.push({ role: 'user', content: msg })
      setMessages(prev => [...prev, { role: 'ai', text: '' }])
      await callClaude({
        system: SYSTEM, messages: history, maxTokens: 1200,
        onChunk: (text) => {
          setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'ai', text }; return u })
        }
      })
    } catch(e) {
      setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'ai', text: 'Connection error. Please try again.' }; return u })
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  return (
    <div className={styles.layout}>
      <div className={styles.topbar}>
        <div className={styles.topLeft}>
          <div className={styles.topTitle}>{subject ? subjectLabels[subject] : (mode === 'prenursing' ? 'Pre-Nursing Tutor' : 'AI Tutor')}</div>
          <div className={styles.modelPill}>NurseIQ {mode === 'prenursing' ? 'Pre-Nursing' : 'Tutor'} <ChevronIcon /></div>
          {hasHistory && <div className={styles.memoryBadge}>Memory on</div>}
        </div>
        <div className={styles.topBadges}>
          {hasHistory && <button className={styles.clearBtn} onClick={clearHistory}>Clear history</button>}
          {mode === 'nursing' && <span className={styles.badgeAmber}>NCLEX prep mode</span>}
          {mode === 'prenursing' && <span className={styles.badgePurple}>Pre-nursing mode</span>}
          <span className={styles.badgeTeal}>{count} this session</span>
        </div>
      </div>

      <div className={styles.chatScroll}>
        <div className={styles.chatInner}>
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
                  {m.text === '' ? <div className={styles.typing}><span /><span /><span /></div> : <span dangerouslySetInnerHTML={renderText(m.text)} />}
                </div>
                {i > 0 && m.text !== '' && (
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

      <div className={styles.inputArea}>
        <div className={styles.inputWrap}>
          {uploadedFile && (
            <div className={styles.uploadedFile}>
              <FileIcon /> {uploadedFile.name}
              <button onClick={() => setUploadedFile(null)}>x</button>
            </div>
          )}
          <div className={styles.inputOuter}>
            <div className={styles.inputPills}>
              {PROMPTS.map((p, i) => (
                <button key={i} className={styles.pill} onClick={() => send(p)}>{p}</button>
              ))}
            </div>
            <textarea
              ref={inputRef}
              className={styles.inputBox}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              rows={2}
              placeholder={mode === 'prenursing' ? 'Ask about A&P, Micro, Chemistry, Biology...' : 'Ask about meds, patho, care plans, NCLEX strategies...'}
            />
            <div className={styles.inputFooter}>
              <div className={styles.inputLeft}>
                <input ref={fileRef} type="file" accept=".pdf,.pptx,.docx,image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                <button className={styles.uploadIconBtn} onClick={() => fileRef.current.click()} disabled={uploadLoading} title={uploadLoading ? 'Processing...' : 'Upload PDF, DOCX, PPTX or image'}>
                  {uploadLoading ? <SpinnerIcon /> : <UploadIcon />}
                </button>
                <div className={styles.memoryNote}><MemoryIcon /> Saved locally</div>
              </div>
              <button className={styles.sendBtn} onClick={() => send()} disabled={loading || !input.trim()}><SendIcon /></button>
            </div>
          </div>
          <div className={styles.inputHint}>NurseIQ — always verify clinical decisions with your institution</div>
        </div>
      </div>
    </div>
  )
}

function ChevronIcon() { return <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 6l4 4 4-4"/></svg> }
function SendIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l10-5-5 10V8H3z"/></svg> }
function MemoryIcon() { return <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg> }
function UploadIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> }
function SpinnerIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{animation:"spin 1s linear infinite"}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> }
function FileIcon() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z"/><path d="M9 2v4h4"/></svg> }
