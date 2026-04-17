import React from 'react'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <span className={styles.text}>Content informed by</span>
        <a href="https://www.ncsbn.org/exams.page" target="_blank" rel="noopener noreferrer" className={styles.link}>NCSBN NCLEX-RN Test Plan</a>
        <span className={styles.dot}>·</span>
        <a href="https://openstax.org/subjects/science" target="_blank" rel="noopener noreferrer" className={styles.link}>OpenStax Sciences</a>
        <span className={styles.dot}>·</span>
        <a href="https://www.cdc.gov/niosh/topics/hierarchy/default.html" target="_blank" rel="noopener noreferrer" className={styles.link}>CDC Clinical Guidelines</a>
        <span className={styles.dot}>·</span>
        <span className={styles.text}>Always verify with your institution</span>
      </div>
      <div className={styles.right}>
        <a href="https://form.typeform.com/to/fTTQmtRG" target="_blank" rel="noopener noreferrer" className={styles.feedback}>
          <FeedbackIcon /> Share feedback
        </a>
      </div>
    </footer>
  )
}

function FeedbackIcon() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H2a1 1 0 00-1 1v9a1 1 0 001 1h3l3 2 3-2h3a1 1 0 001-1V3a1 1 0 00-1-1z"/></svg>
}
