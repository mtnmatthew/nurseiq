import React, { useState, useEffect } from 'react'
import styles from './DisplayNameModal.module.css'

export default function DisplayNameModal({ onSave, existingName }) {
  const [name, setName] = useState(existingName || '')

  function getInitials(n) {
    if (!n) return '?'
    const parts = n.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.preview}>
          <div className={styles.initials}>{getInitials(name)}</div>
        </div>
        <div className={styles.title}>{existingName ? 'Change your name' : 'What should we call you?'}</div>
        <div className={styles.sub}>This is how you'll appear in NurseIQ. It can be anything — first name, nickname, whatever you prefer.</div>
        <input
          className={styles.input}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name..."
          maxLength={30}
          autoFocus
          onKeyDown={e => e.key === 'Enter' && name.trim() && onSave(name.trim())}
        />
        <button
          className={styles.saveBtn}
          onClick={() => name.trim() && onSave(name.trim())}
          disabled={!name.trim()}
        >
          {existingName ? 'Save' : "Let's go →"}
        </button>
        {existingName && (
          <button className={styles.cancelBtn} onClick={() => onSave(null)}>Cancel</button>
        )}
      </div>
    </div>
  )
}
