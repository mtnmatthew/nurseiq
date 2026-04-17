import React, { useState, useEffect, useRef } from 'react'
import { callClaude, NURSING_QUIZ_SYSTEM, PRENURSING_QUIZ_SYSTEM, MODEL_HAIKU } from '../lib/api'
import { backgroundSync } from '../lib/supabase'
import {
  getCurriculum, loadMastery, saveMastery, loadMistakes, saveMistakes,
  updateStreak, getMasteryLevel, getMasteryProgress, getWeakTopics,
  loadQuestionBank, saveQuestionBank, getNextQuestions, MASTERY_MIN_CORRECT,
  updateSRS, getDueCards, recordDailyProgress, loadProgressHistory, loadStreak
} from '../lib/curriculum'
import styles from './AdaptiveQuizPage.module.css'

const BANK_SIZE = 5 // generate 5 at a time — reliable and fast

export default function AdaptiveQuizPage({ mode, quizType, topicKey, topicLabel, onBack, userId }) {
  const curriculum = getCurriculum(mode)
  const QUIZ_SYSTEM = mode === 'prenursing' ? PRENURSING_QUIZ_SYSTEM : NURSING_QUIZ_SYSTEM

  const [phase, setPhase] = useState('config')
  const [studyMode, setStudyMode] = useState('study')
  const [questionCount, setQuestionCount] = useState(5)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showRationale, setShowRationale] = useState(false)
  const [popup, setPopup] = useState(null)
  // { word, x, y, definition }
  const [loadingDef, setLoadingDef] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bankLoading, setBankLoading] = useState(false)
  const [bankProgress, setBankProgress] = useState('')
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(null)
  const [sessionResults, setSessionResults] = useState(null)
  const [masteryProgress, setMasteryProgress] = useState(null)
  const timerRef = useRef(null)
  const questionStartTime = useRef(Date.now())

  function getQuizTitle() {
    if (quizType === 'adaptive') return 'Study weak areas'
    if (quizType === 'daily') return 'Daily quiz'
    if (quizType === 'mistakes') return 'Mistake review'
    if (quizType === 'topic') return topicLabel
    return 'Quiz'
  }

  function getTopicInfo() {
    if (quizType !== 'topic' || !topicKey) return null
    for (const [catId, cat] of Object.entries(curriculum)) {
      const topic = cat.topics.find(t => catId + '_' + t.id === topicKey)
      if (topic) return { topic, catId, cat }
    }
    return null
  }

  const topicInfo = getTopicInfo()
  const mastery = loadMastery()
  const topicMastery = topicKey ? (mastery[topicKey] || { correct: 0, total: 0 }) : null
  const progress = topicMastery ? getMasteryProgress(topicMastery.correct, topicMastery.total) : null

  async function generateBankForTopic(key, topicLabelStr, subtopics) {
    setBankLoading(true)
    setBankProgress('Generating questions for ' + topicLabelStr + '...')

    const subtopicStr = subtopics ? subtopics.slice(0, 4).join(', ') : topicLabelStr
    const prompt = 'Generate exactly 5 exam-style questions on: ' + topicLabelStr + '. Focus on: ' + subtopicStr + '. Return ONLY valid JSON array, no markdown: [{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correct":0,"rationale":"..."}]'

    let questions = []
    try {
      const raw = await callClaude({
        system: QUIZ_SYSTEM,
        model: MODEL_HAIKU,
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 1500,
      })
      const clean = raw.replace(/```json|```/g, '').trim()
      questions = JSON.parse(clean)
    } catch(e) {
      console.error('Bank generation error:', e)
    }

    saveQuestionBank(key, { questions, answeredIndices: [], generated: Date.now() })
    setBankLoading(false)
    setBankProgress('')
    return questions
  }

  async function startQuiz() {
    setPhase('loading')
    setLoading(true)
    setError('')

    try {
      let qs = []
      const count = quizType === 'daily' ? 10 : questionCount

      if (quizType === 'topic' && topicKey && topicInfo) {
        // Try to use question bank
        let bank = loadQuestionBank(topicKey)
        if (!bank || bank.questions.length < 10) {
          setBankLoading(true)
          qs = await generateBankForTopic(topicKey, topicLabel, topicInfo.topic.subtopics)
          setBankLoading(false)
          qs = qs.slice(0, count)
        } else {
          qs = getNextQuestions(topicKey, count) || []
          if (qs.length < count) {
            // Regenerate bank
            setBankLoading(true)
            qs = await generateBankForTopic(topicKey, topicLabel, topicInfo.topic.subtopics)
            setBankLoading(false)
            qs = qs.slice(0, count)
          }
        }
      } else if (quizType === 'mistakes') {
        const mistakes = loadMistakes()
        if (mistakes.length === 0) {
          setError('No mistakes saved yet. Answer some questions first!')
          setPhase('config'); setLoading(false); return
        }
        const sample = mistakes.sort(() => Math.random() - 0.5).slice(0, Math.min(10, mistakes.length))
        const raw = await callClaude({
          system: QUIZ_SYSTEM,
          model: MODEL_HAIKU,
          messages: [{ role: 'user', content: 'Generate ' + count + ' questions on these topics that were previously answered incorrectly. Vary the questions from the originals: ' + sample.map(m => m.topic + ': ' + m.question.slice(0, 80)).join(' | ') }],
          maxTokens: 3000
        })
        try { qs = JSON.parse(raw.replace(/```json|```/g, '').trim()) } catch(e) { qs = [] }
      } else if (quizType === 'adaptive') {
        const weak = getWeakTopics(loadMastery(), curriculum).slice(0, 3)
        const topicStr = weak.length > 0 ? weak.map(w => w.topic.label).join(', ') : 'mixed topics'
        const raw = await callClaude({
          system: QUIZ_SYSTEM,
          model: MODEL_HAIKU,
          messages: [{ role: 'user', content: 'Generate ' + count + ' questions on: ' + topicStr }],
          maxTokens: 2000
        })
        try { qs = JSON.parse(raw.replace(/```json|```/g, '').trim()) } catch(e) { qs = [] }
      } else {
        // Daily quiz
        const cats = Object.values(curriculum)
        const allTopics = cats.flatMap(c => c.topics)
        const shuffled = allTopics.sort(() => Math.random() - 0.5).slice(0, 3)
        const raw = await callClaude({
          system: QUIZ_SYSTEM,
          model: MODEL_HAIKU,
          messages: [{ role: 'user', content: 'Generate ' + count + ' questions covering: ' + shuffled.map(t => t.label).join(', ') }],
          maxTokens: 2000
        })
        try { qs = JSON.parse(raw.replace(/```json|```/g, '').trim()) } catch(e) { qs = [] }
      }

      if (!qs || qs.length === 0) {
        setError('Could not generate questions. Please try again.')
        setPhase('config')
        setLoading(false)
        return
      }

      setQuestions(qs)

      if (studyMode === 'test') {
        setTimeLeft(qs.length * 90)
        timerRef.current = setInterval(() => {
          setTimeLeft(t => {
            if (t <= 1) { clearInterval(timerRef.current); return 0 }
            return t - 1
          })
        }, 1000)
      }
      setPhase('quiz')
    } catch(e) {
      setError('Could not generate questions. Try again.')
      setPhase('config')
    }
    setLoading(false)
  }

  function answer(optIndex) {
    if (answers[current] !== undefined) return
    async function handleWordClick(word, e) {
    if (popup && popup.word === word) { setPopup(null); return }
    const rect = e.target.getBoundingClientRect()
    setPopup({ word, x: Math.min(rect.left, window.innerWidth - 280), y: rect.bottom + 8, definition: '', fixed: true })
    setLoadingDef(true)
    try {
      const raw = await callClaude({
        system: 'You are a medical dictionary. Define the given term in exactly 1-2 sentences. Be concise and precise. No fluff.',
        messages: [{ role: 'user', content: 'Define this medical/science term briefly: ' + word }],
        maxTokens: 100,
        model: MODEL_HAIKU,
      })
      setPopup(prev => prev && prev.word === word ? { ...prev, definition: raw.trim() } : prev)
    } catch(e) {
      setPopup(prev => prev && prev.word === word ? { ...prev, definition: 'Could not load definition.' } : prev)
    }
    setLoadingDef(false)
  }

  const q = questions[current]
    const isCorrect = optIndex === q.correct
    const newAnswers = { ...answers, [current]: optIndex }
    setAnswers(newAnswers)
    setShowRationale(false)
    setPopup(null)

    // Update mastery
    const mastery = loadMastery()
    const key = topicKey || ('general_' + (quizType || 'quiz'))
    if (!mastery[key]) mastery[key] = { correct: 0, total: 0 }
    mastery[key].total += 1
    if (isCorrect) mastery[key].correct += 1
    saveMastery(mastery)

    // Save mistake
    if (!isCorrect) {
      const mistakes = loadMistakes()
      mistakes.push({
        question: q.question,
        correct: q.options[q.correct],
        userAnswer: q.options[optIndex],
        rationale: q.rationale,
        topic: topicLabel || quizType,
        date: new Date().toLocaleDateString()
      })
      saveMistakes(mistakes)
    }
  }

  function next() {
    setShowRationale(false)
    setPopup(null)
    questionStartTime.current = Date.now()
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
    } else {
      clearInterval(timerRef.current)
      finishQuiz()
    }
  }

  function finishQuiz() {
    const correct = Object.keys(answers).filter(i => Number(answers[i]) === questions[Number(i)]?.correct).length
    const total = Object.keys(answers).length
    updateStreak(total)
    recordDailyProgress(correct, total, topicKey ? [topicKey] : [])

    const mastery = loadMastery()
    const key = topicKey || 'general'
    const m = mastery[key] || { correct: 0, total: 0 }
    setMasteryProgress(getMasteryProgress(m.correct, m.total))
    setSessionResults({ correct, total, pct: Math.round((correct / total) * 100) })
    setPhase('results')
    // Sync to cloud in background
    console.log('NurseIQ sync: userId =', userId)
    if (userId) {
      backgroundSync(userId, {
        mastery: loadMastery(),
        mistakes: loadMistakes(),
        progress: loadProgressHistory(),
        streak: loadStreak(),
      }).then(() => console.log('NurseIQ sync: success')).catch(e => console.error('NurseIQ sync error:', e))
    } else {
      console.log('NurseIQ sync: skipped - no userId')
    }
  }

  useEffect(() => { return () => clearInterval(timerRef.current) }, [])

  const q = questions[current]
  const answered = answers[current] !== undefined
  const mins = timeLeft ? String(Math.floor(timeLeft / 60)).padStart(2, '0') : '00'
  const secs = timeLeft ? String(timeLeft % 60).padStart(2, '0') : '00'

  if (phase === 'config') return (
    <div className={styles.layout}>
      <div className={styles.topbar}>
        <button className={styles.backBtn} onClick={onBack}>{'← Back'}</button>
        <div className={styles.topTitle}>{getQuizTitle()}</div>
      </div>
      <div className={styles.configBody}>
        <div className={styles.configCard}>
          <div className={styles.configTitle}>{getQuizTitle()}</div>

          {progress && (
            <div className={styles.masteryCard}>
              <div className={styles.masteryRow}>
                <span className={styles.masteryLabel}>Mastery progress</span>
                <span className={styles.masteryPct} style={{ color: getMasteryLevel(topicMastery.correct, topicMastery.total).color }}>
                  {topicMastery.correct} / {MASTERY_MIN_CORRECT} correct needed
                </span>
              </div>
              <div className={styles.masteryBar}>
                <div className={styles.masteryFill} style={{ width: Math.min(100, Math.round((topicMastery.correct / MASTERY_MIN_CORRECT) * 100)) + '%', background: getMasteryLevel(topicMastery.correct, topicMastery.total).color }} />
              </div>
              <div className={styles.masteryHint}>
                {progress.isMastered ? '🎉 Topic mastered!' : progress.correctNeeded + ' more correct answers needed to master this topic'}
              </div>
              {topicInfo?.topic?.subtopics && (
                <div className={styles.subtopicList}>
                  <div className={styles.subtopicLabel}>Covers:</div>
                  {topicInfo.topic.subtopics.map((s, i) => <span key={i} className={styles.subtopicChip}>{s}</span>)}
                </div>
              )}
            </div>
          )}

          <div className={styles.modeLabel}>Choose your mode</div>
          <div className={styles.modeCards}>
            <button className={styles.modeCard + (studyMode === 'study' ? ' ' + styles.modeActive : '')} onClick={() => setStudyMode('study')}>
              <div className={styles.modeTitle}>Study mode</div>
              <div className={styles.modeSub}>See rationale after each answer · No time limit</div>
            </button>
            <button className={styles.modeCard + (studyMode === 'test' ? ' ' + styles.modeActive : '')} onClick={() => setStudyMode('test')}>
              <div className={styles.modeTitle}>Test mode</div>
              <div className={styles.modeSub}>Timed · No hints · Exam simulation</div>
            </button>
          </div>
          <div className={styles.countRow}>
            <div className={styles.modeLabel}>Number of questions</div>
            <div className={styles.countBtns}>
              {[5, 10, 20, 30, 50].map(n => (
                <button key={n} className={styles.countBtn + (questionCount === n ? ' ' + styles.countBtnActive : '')} onClick={() => setQuestionCount(n)}>{n}</button>
              ))}
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.startBtn} onClick={startQuiz}>Start quiz</button>
        </div>
      </div>
    </div>
  )

  if (phase === 'loading') return (
    <div className={styles.layout}>
      <div className={styles.topbar}><button className={styles.backBtn} onClick={onBack}>{'← Back'}</button><div className={styles.topTitle}>{getQuizTitle()}</div></div>
      <div className={styles.configBody}>
        <div className={styles.loadingCard} style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center'}}>
          <style>{`@keyframes rollStop{0%{transform:rotate(0deg)}15%{transform:rotate(180deg)}35%{transform:rotate(180deg)}50%{transform:rotate(360deg)}100%{transform:rotate(360deg)}}.qz-loader{animation:rollStop 2s ease-in-out infinite}`}</style>
          <div className="qz-loader" style={{width:52,height:52,background:'var(--teal-400)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20,boxShadow:'0 4px 20px rgba(29,158,117,0.3)'}}>
            <svg width="26" height="26" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
          </div>
          <div className={styles.loadingText}>{bankLoading ? bankProgress : quizType === 'adaptive' ? 'Finding your weak areas...' : quizType === 'mistakes' ? 'Loading your mistake bank...' : quizType === 'daily' ? 'Building your daily quiz...' : 'Preparing your questions...'}</div>
          {bankLoading && <div className={styles.loadingHint}>Building a question bank — this only happens once, future quizzes load instantly.</div>}
        </div>
      </div>
    </div>
  )

  if (phase === 'results') return (
    <div className={styles.layout}>
      <div className={styles.topbar}><button className={styles.backBtn} onClick={onBack}>{'← Back to dashboard'}</button><div className={styles.topTitle}>Results</div></div>
      <div className={styles.configBody}>
        <div className={styles.resultsCard}>
          <div className={styles.resultsPct} style={{ color: sessionResults.pct >= 70 ? '#1D9E75' : '#E24B4A' }}>{sessionResults.pct}%</div>
          <div className={styles.resultsLabel}>{sessionResults.correct} of {sessionResults.total} correct this session</div>

          {masteryProgress && topicKey && (
            <div className={styles.masteryCard} style={{ marginTop: 20 }}>
              <div className={styles.masteryRow}>
                <span className={styles.masteryLabel}>Overall mastery</span>
                <span className={styles.masteryPct}>{masteryProgress.correct} / {MASTERY_MIN_CORRECT} correct</span>
              </div>
              <div className={styles.masteryBar}>
                <div className={styles.masteryFill} style={{ width: Math.min(100, Math.round((masteryProgress.correct / MASTERY_MIN_CORRECT) * 100)) + '%', background: masteryProgress.isMastered ? '#1D9E75' : '#BA7517' }} />
              </div>
              <div className={styles.masteryHint}>
                {masteryProgress.isMastered ? '🎉 Topic mastered! You can move on.' : masteryProgress.correctNeeded + ' more correct answers needed to master this topic'}
              </div>
            </div>
          )}

          <div className={styles.resultsMsg}>
            {sessionResults.pct >= 85 ? 'Excellent work.' : sessionResults.pct >= 70 ? 'Good progress. Keep going.' : 'Review the rationales and try again.'}
          </div>
          <div className={styles.resultsBtns}>
            <button className={styles.startBtn} onClick={() => { setPhase('config'); setCurrent(0); setAnswers({}); setQuestions([]) }}>Keep practicing</button>
            <button className={styles.outlineBtn} onClick={onBack}>Back to dashboard</button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.layout}>
      <div className={styles.topbar}>
        <button className={styles.backBtn} onClick={onBack}>{'← Back'}</button>
        <div className={styles.topTitle}>{getQuizTitle()}</div>
        <div className={styles.topRight}>
          {studyMode === 'test' && <div className={styles.timer} style={{ color: timeLeft < 30 ? '#E24B4A' : 'var(--text-primary)' }}>{mins}:{secs}</div>}
          <div className={styles.progress}>{current + 1} / {questions.length}</div>
          <div className={styles.modeBadge}>{studyMode === 'test' ? 'Test mode' : 'Study mode'}</div>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: ((current + (answered ? 1 : 0)) / questions.length * 100) + '%' }} />
      </div>

      <div className={styles.quizBody}>
        {q && (
          <div className={styles.questionCard}>
            <div className={styles.qNum}>Question {current + 1}</div>
            <div className={styles.qText}>
              {q.question}
            </div>
            <div className={styles.options}>
              {q.options.map((opt, oi) => {
                let cls = styles.option
                if (answered && studyMode === 'study') {
                  if (oi === q.correct) cls = styles.option + ' ' + styles.optCorrect
                  else if (oi === answers[current]) cls = styles.option + ' ' + styles.optWrong
                  else cls = styles.option + ' ' + styles.optDim
                } else if (answered && studyMode === 'test') {
                  cls = styles.option + ' ' + styles.optDim
                }
                const optText = opt.replace(/^[A-D]\.\s*/, '')
                return (
                  <button key={oi} className={cls} onClick={() => answer(oi)} disabled={answered}>
                    <span className={styles.optLetter}>{String.fromCharCode(65 + oi)}</span>
                    <span>{optText}</span>
                  </button>
                )
              })}
            </div>
            {popup && (
              <div className={styles.popup} style={{ position: 'fixed', top: popup.y, left: popup.x, zIndex: 9999 }} onClick={e => e.stopPropagation()}>
                <div className={styles.popupWord}>{popup.word}</div>
                {loadingDef ? (
                  <div className={styles.popupLoading}><span/><span/><span/></div>
                ) : (
                  <div className={styles.popupDef}>{popup.definition}</div>
                )}
                <button className={styles.popupClose} onClick={() => setPopup(null)}>✕</button>
              </div>
            )}

            {answered && studyMode === 'study' && (
              <div className={styles.rationaleSection}>
                <button className={styles.rationaleToggle} onClick={() => setShowRationale(r => !r)}>
                  {showRationale ? 'Hide rationale' : 'Show rationale'}
                </button>
                {showRationale && (
                  <div className={styles.rationale}>
                    <div className={styles.rationaleLabel}>Rationale</div>
                    {q.rationale}
                  </div>
                )}
              </div>
            )}

            {answered && (
              <button className={styles.nextBtn} onClick={next}>
                {current < questions.length - 1 ? 'Next question →' : 'See results →'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Highlights medical keywords — nouns and technical terms likely to benefit from definitions
const SKIP_WORDS = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','as','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','can','not','this','that','these','those','which','who','what','when','where','how','if','than','then','also','its','their','they','them','it','he','she','we','you','your','our','his','her','play','plays','role','used','into','onto','through','between','among','each','more','most','only','both','all','each','any','such','during','after','before','between','under','over','out','up','down','off','part','type'])

function HighlightedText({ text, onWordClick, styles }) {
  if (!text) return null
  const words = text.split(/(s+|[,;:.!?()])/)
  return (
    <span>
      {words.map((word, i) => {
        const clean = word.replace(/[^a-zA-Z-]/g, '')
        const isKeyword = clean.length > 4 && !SKIP_WORDS.has(clean.toLowerCase()) && /[a-zA-Z]/.test(clean)
        if (isKeyword) {
          return (
            <span
              key={i}
              className={styles.keyword}
              onClick={e => { e.stopPropagation(); e.preventDefault(); onWordClick(clean, e) }}
            >
              {word}
            </span>
          )
        }
        return <span key={i}>{word}</span>
      })}
    </span>
  )
}

