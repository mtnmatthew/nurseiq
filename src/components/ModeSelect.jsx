import React from 'react'
import styles from './ModeSelect.module.css'

export default function ModeSelect({ onSelect, dark }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>
          </div>
          <div className={styles.logoText}>NurseIQ</div>
        </div>
        <div className={styles.heading}>What best describes you?</div>
        <div className={styles.sub}>We'll personalize your experience based on where you are in your journey.</div>
        <div className={styles.options}>
          <button className={styles.option} onClick={() => onSelect('prenursing')}>
            <div className={styles.optionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div className={styles.optionContent}>
              <div className={styles.optionTitle}>Pre-nursing student</div>
              <div className={styles.optionDesc}>Taking A&P, Microbiology, Chemistry, Bio — working toward nursing school admission</div>
            </div>
            <ArrowIcon />
          </button>
          <button className={styles.option} onClick={() => onSelect('nursing')}>
            <div className={styles.optionIcon} style={{ background: 'var(--teal-50)', color: 'var(--teal-600)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div className={styles.optionContent}>
              <div className={styles.optionTitle}>Nursing student</div>
              <div className={styles.optionDesc}>In nursing school and preparing for the NCLEX-RN — clinical reasoning, pharmacology, care plans</div>
            </div>
            <ArrowIcon />
          </button>
        </div>
        <div className={styles.footer}>You can switch modes at any time from the sidebar.</div>
      </div>
    </div>
  )
}

function ArrowIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 4l4 4-4 4"/></svg>
}
