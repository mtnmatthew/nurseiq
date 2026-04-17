import React, { useState } from 'react'
import { callClaude, NURSING_QUIZ_SYSTEM, PRENURSING_QUIZ_SYSTEM } from '../lib/api'
import styles from './QuizPage.module.css'

const NURSING_TOPICS = [
  'Cardiac medications', 'Priority & delegation', 'Fluid & electrolytes',
  'Respiratory nursing', 'Neuro assessment', 'OB/postpartum', 'Pediatric vitals',
  'Psych nursing', 'Infection control', 'Lab values',
]

const PRENURSING_TOPICS = [
  'Cardiac cycle & heart anatomy', 'Skeletal system & bones', 'Muscle physiology',
  'Nervous system & neurons', 'Bacterial cell structure', 'Immune response',
  'Respiratory system', 'Renal physiology', 'Endocrine system', 'Cell division',
]

export default function QuizPage({ mode }) {
  const QUIZ_SYSTEM = mode === 'prenursing' ? PRENURSING_QUIZ_SYSTEM : NURSING_QUIZ_SYSTEM
  const TOPICS = mode === 'prenursing' ? PRENURSING_TOPICS : NURSING_TOPICS

  const [input, setInput] = useState('')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState({})
  const [showRationale, setShowRationale] = useState({})
  const [error, setError] = useState('')
  const [activeTopic, setActiveTopic] = useState(null)

  async function generate() {
    if (!input.trim() || loading) return
    setLoading(true)
    setQuestions([])
    setAnswers({})
    setShowRationale({})
    setError('')
    try {
      const raw = await callClaude({
        system: QUIZ_SYSTEM,
        messages: [{ role: 'user', content: 'Generate 5 ' + (mode === 'prenursing' ? 'science exam' : 'NCLEX-style') + ' questions on: ' + input }],
        maxTokens: 1500,
      })
      const clean = raw.replace(/```json|```/g, '').trim()
      setQuestions(JSON.parse(clean))
    } catch { setError('Could not generate questions. Try again.') }
    setLoading(false)
  }

  function answer(qi, optIndex) {
    if (answers[qi] !== undefined) return
    setAnswers(prev => ({ ...prev, [qi]: optIndex }))
  }

  const score = Object.keys(answers).filter(qi => answers[qi] === questions[qi]?.correct).length

  return (
    <div className={styles.layout}>
      <div className={styles.topbar}>
        <div>
          <div className={styles.topTitle}>Practice Questions</div>
          <div className={styles.topMeta}>{mode === 'prenursing' ? 'Science exam-style questions with rationales' : 'NCLEX-style questions with clinical rationales'}</div>
        </div>
        {questions.length > 0 && (
          <span className={styles.badge}>{score}/{Object.keys(answers).length} correct</span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.sidebar}>
          <div className={styles.sectionLabel}>Topics</div>
          {TOPICS.map(t => (
            <button key={t} className={`${styles.topicBtn} ${activeTopic === t ? styles.topicActive : ''}`}
              onClick={() => { setActiveTopic(t); setInput(t) }}>
              {t}
            </button>
          ))}
          <div className={styles.sectionLabel} style={{ marginTop: 16 }}>Custom topic</div>
          <textarea className={styles.textarea} value={input} onChange={e => { setInput(e.target.value); setActiveTopic(null) }} rows={2} placeholder="Any topic..." />
          <button className={styles.buildBtn} onClick={generate} disabled={loading || !input.trim()}>
            {loading ? 'Generating...' : 'Generate 5 questions'}
          </button>
          {error && <div className={styles.error}>{error}</div>}
          {questions.length > 0 && (
            <div className={styles.scoreCard}>
              <div className={styles.scoreLabel}>Score</div>
              <div className={styles.scoreVal}>{score} / {Object.keys(answers).length}</div>
              <div className={styles.scoreSub}>{questions.length - Object.keys(answers).length} remaining</div>
            </div>
          )}
        </div>

        <div className={styles.questionsArea}>
          {!questions.length && !loading && (
            <div className={styles.empty}>
              <div className={styles.emptyText}>Pick a topic to start practicing</div>
              <div className={styles.emptySub}>{mode === 'prenursing' ? '5 science exam questions with explanations' : '5 NCLEX-style questions with clinical rationales'}</div>
            </div>
          )}
          {loading && (
            <div className={styles.empty}>
              <div className={styles.emptyText}>Writing your questions...</div>
              <div className={styles.loadingDots}><span /><span /><span /></div>
            </div>
          )}
          {questions.map((q, qi) => {
            const answered = answers[qi] !== undefined
            const isCorrect = answered && answers[qi] === q.correct
            return (
              <div key={qi} className={styles.questionCard}>
                <div className={styles.qHeader}>
                  <span className={styles.qNum}>Question {qi + 1}</span>
                  {answered && <span className={isCorrect ? styles.correctBadge : styles.wrongBadge}>{isCorrect ? 'Correct' : 'Incorrect'}</span>}
                </div>
                <div className={styles.qText}>{q.question}</div>
                <div className={styles.options}>
                  {q.options.map((opt, oi) => {
                    let cls = styles.option
                    if (answered) {
                      if (oi === q.correct) cls = `${styles.option} ${styles.optCorrect}`
                      else if (oi === answers[qi] && oi !== q.correct) cls = `${styles.option} ${styles.optWrong}`
                      else cls = `${styles.option} ${styles.optDim}`
                    }
                    return (
                      <button key={oi} className={cls} onClick={() => answer(qi, oi)} disabled={answered}>
                        <span className={styles.optLetter}>{String.fromCharCode(65 + oi)}</span>
                        {opt.replace(/^[A-D]\.\s*/, '')}
                      </button>
                    )
                  })}
                </div>
                {answered && (
                  <button className={styles.rationaleToggle} onClick={() => setShowRationale(prev => ({ ...prev, [qi]: !prev[qi] }))}>
                    {showRationale[qi] ? 'Hide rationale' : 'Show rationale'}
                  </button>
                )}
                {answered && showRationale[qi] && (
                  <div className={styles.rationale}>
                    <div className={styles.rationaleLabel}>Rationale</div>
                    {q.rationale}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
