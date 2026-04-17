import React, { useState } from 'react'
import { callClaude, NURSING_FLASHCARD_SYSTEM, PRENURSING_FLASHCARD_SYSTEM, MODEL_HAIKU } from '../lib/api'
import styles from './FlashcardsPage.module.css'

const QUICK_TOPICS = {
  nursing: ['Beta blockers', 'Insulin types', 'Heart failure', 'Electrolytes', 'NCLEX priority', 'Anticoagulants', 'Stroke care', 'Sepsis'],
  prenursing: ['Skeletal system', 'Cardiac cycle', 'Gram staining', 'Cell organelles', 'Acid-base', 'Immune response', 'Muscle contraction', 'Nephron'],
}

function loadDecks() {
  try { return JSON.parse(localStorage.getItem('nurseiq_decks') || '[]') } catch { return [] }
}
function saveDecks(decks) {
  localStorage.setItem('nurseiq_decks', JSON.stringify(decks))
}

export default function FlashcardsPage({ mode }) {
  const SYSTEM = mode === 'prenursing' ? PRENURSING_FLASHCARD_SYSTEM : NURSING_FLASHCARD_SYSTEM
  const topics = mode === 'prenursing' ? QUICK_TOPICS.prenursing : QUICK_TOPICS.nursing

  const [tab, setTab] = useState('generate')
  const [input, setInput] = useState('')
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [cardCount, setCardCount] = useState(8)
  const [error, setError] = useState('')
  const [deckName, setDeckName] = useState('')
  const [decks, setDecks] = useState(loadDecks)
  const [studyDeck, setStudyDeck] = useState(null)
  const [savedFeedback, setSavedFeedback] = useState(false)

  // Study mode state
  const [currentCard, setCurrentCard] = useState(0)
  const [flipped, setFlipped] = useState(false)

  async function generate(topic) {
    const t = topic || input.trim()
    if (!t || loading) return
    setLoading(true); setError(''); setCards([]); setDeckName(t)
    try {
      const raw = await callClaude({
        system: SYSTEM,
        messages: [{ role: 'user', content: 'Generate ' + cardCount + ' flashcards on: ' + t }],
        model: MODEL_HAIKU,
        maxTokens: 1000,
      })
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      setCards(parsed)
    } catch { setError('Could not generate cards. Try again.') }
    setLoading(false)
  }

  function saveDeck() {
    if (!cards.length || !deckName.trim()) return
    const deck = { id: Date.now(), name: deckName, cards, created: new Date().toLocaleDateString() }
    const updated = [deck, ...decks]
    setDecks(updated); saveDecks(updated)
    setCards([])
    setInput('')
    setTab('decks')
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2000)
  }

  function deleteDeck(id) {
    const updated = decks.filter(d => d.id !== id)
    setDecks(updated); saveDecks(updated)
  }

  function startStudy(deck) {
    setStudyDeck(deck); setCurrentCard(0); setFlipped(false)
  }

  function exportAnki(deck) {
    const text = deck.cards.map(c => c.term + '\t' + c.definition).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = deck.name + '.txt'
    a.click()
  }

  function prevCard() { setCurrentCard(c => Math.max(0, c - 1)); setFlipped(false) }
  function nextCard() { setCurrentCard(c => Math.min((studyDeck?.cards || cards).length - 1, c + 1)); setFlipped(false) }

  // Study mode — full screen single card
  const activeCards = studyDeck ? studyDeck.cards : cards
  if (studyDeck || (cards.length > 0 && tab === 'generate')) {
    const card = activeCards[currentCard]
    if (!card) return null
    return (
      <div className={styles.studyLayout}>
        <div className={styles.studyTopbar}>
          <button className={styles.backBtn} onClick={() => {
            setStudyDeck(null); setFlipped(false); setCurrentCard(0)
            if (!studyDeck) { setCards([]); setInput('') }
          }}>
            ← {studyDeck ? 'Back to decks' : 'Back'}
          </button>
          <div className={styles.studyTitle}>{studyDeck ? studyDeck.name : deckName}</div>
          <div className={styles.studyCount}>{currentCard + 1} / {activeCards.length}</div>
        </div>

        <div className={styles.studyBody}>
          <div className={styles.cardScene} onClick={() => setFlipped(f => !f)}>
            <div className={`${styles.card} ${flipped ? styles.flipped : ''}`}>
              <div className={styles.cardFront}>
                <div className={styles.cardSide}>TERM</div>
                <div className={styles.cardContent}>{card.term}</div>
                <div className={styles.cardHint}>Click to flip</div>
              </div>
              <div className={styles.cardBack}>
                <div className={styles.cardSide}>DEFINITION</div>
                <div className={styles.cardContent}>{card.definition}</div>
                <div className={styles.cardHint}>Click to flip back</div>
              </div>
            </div>
          </div>

          <div className={styles.navRow}>
            <button className={styles.navBtn} onClick={prevCard} disabled={currentCard === 0}>←</button>
            <div className={styles.progressDots}>
              {activeCards.map((_, i) => (
                <button key={i} className={`${styles.dot} ${i === currentCard ? styles.dotActive : ''}`} onClick={() => { setCurrentCard(i); setFlipped(false) }} />
              ))}
            </div>
            <button className={styles.navBtn} onClick={nextCard} disabled={currentCard === activeCards.length - 1}>→</button>
          </div>

          {!studyDeck && cards.length > 0 && (
            <div className={styles.saveRow}>
              <button className={styles.saveBtn} onClick={saveDeck}>
                {savedFeedback ? '✓ Saved!' : 'Save deck'}
              </button>
              <button className={styles.exportBtn} onClick={() => exportAnki({ name: deckName, cards })}>Export to Anki</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      <div className={styles.topbar}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'generate' ? styles.tabActive : ''}`} onClick={() => setTab('generate')}>Generate</button>
          <button className={`${styles.tab} ${tab === 'decks' ? styles.tabActive : ''}`} onClick={() => setTab('decks')}>
            My decks {decks.length > 0 && <span className={styles.tabBadge}>{decks.length}</span>}
          </button>
        </div>
      </div>

      {tab === 'generate' && (
        <div className={styles.body}>
          <div className={styles.generateWrap}>
            <div className={styles.quickTopics}>
              {topics.map(t => (
                <button key={t} className={styles.topicChip} onClick={() => generate(t)}>{t}</button>
              ))}
            </div>
            <div className={styles.inputRow}>
              <input
                className={styles.input}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate()}
                placeholder="Enter any topic to generate flashcards..."
              />
              <button className={styles.generateBtn} onClick={() => generate()} disabled={loading || !input.trim()}>
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            {loading && (
              <div className={styles.loadingState} style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center'}}>
                <style>{`@keyframes rollStop{0%{transform:rotate(0deg)}15%{transform:rotate(180deg)}35%{transform:rotate(180deg)}50%{transform:rotate(360deg)}100%{transform:rotate(360deg)}}.fc-loader{animation:rollStop 2s ease-in-out infinite}`}</style>
                <div className="fc-loader" style={{width:48,height:48,background:'var(--teal-400)',borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,boxShadow:'0 4px 20px rgba(29,158,117,0.25)'}}>
                  <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
                </div>
                <div className={styles.loadingText}>Generating your flashcards...</div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'decks' && (
        <div className={styles.body}>
          {decks.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyText}>No saved decks yet</div>
              <div className={styles.emptySub}>Generate flashcards and save them here</div>
            </div>
          ) : (
            <div className={styles.deckList}>
              {decks.map(deck => (
                <div key={deck.id} className={styles.deckCard}>
                  <div className={styles.deckInfo}>
                    <div className={styles.deckName}>{deck.name}</div>
                    <div className={styles.deckMeta}>{deck.cards.length} cards · {deck.created}</div>
                  </div>
                  <div className={styles.deckActions}>
                    <button className={styles.studyBtn} onClick={() => startStudy(deck)}>Study</button>
                    <button className={styles.exportBtn} onClick={() => exportAnki(deck)}>Anki</button>
                    <button className={styles.deleteBtn} onClick={() => deleteDeck(deck.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
