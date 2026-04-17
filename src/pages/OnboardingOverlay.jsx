import React from 'react'
import { setOnboarded } from '../lib/settings'
import styles from './OnboardingOverlay.module.css'

export default function OnboardingOverlay({ onDismiss }) {
  function dismiss() {
    setOnboarded()
    onDismiss()
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M8 3v10M3 8h10"/>
          </svg>
        </div>
        <div className={styles.title}>Welcome to NurseIQ</div>
        <div className={styles.subtitle}>Your skill map grows as you study</div>

        <div className={styles.tips}>
          <div className={styles.tip}>
            <div className={styles.tipIcon}><UploadIcon /></div>
            <div>
              <div className={styles.tipTitle}>Upload your own material</div>
              <div className={styles.tipDesc}>Go to AI Tutor and upload your lecture slides, notes, or syllabus. NurseIQ will detect the topic and ask if you want to add it to your skill map — with mastery tracking built in.</div>
            </div>
          </div>
          <div className={styles.tip}>
            <div className={styles.tipIcon}><MapIcon /></div>
            <div>
              <div className={styles.tipTitle}>Skill map tracks your mastery</div>
              <div className={styles.tipDesc}>Every topic chip on this dashboard shows your real accuracy. You need 40+ correct answers at 85%+ to master a topic. Click any chip to start quizzing.</div>
            </div>
          </div>
          <div className={styles.tip}>
            <div className={styles.tipIcon}><BrainIcon /></div>
            <div>
              <div className={styles.tipTitle}>Adaptive quizzes target your gaps</div>
              <div className={styles.tipDesc}>"Study weak areas" always finds your lowest-scoring topics and quizzes you there first. The more you study, the smarter it gets.</div>
            </div>
          </div>
        </div>

        <button className={styles.btn} onClick={dismiss}>Got it, let's study</button>
      </div>
    </div>
  )
}

function UploadIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> }
function MapIcon() { return <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg> }
function BrainIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 3"/></svg> }
