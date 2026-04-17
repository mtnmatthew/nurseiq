export const NURSING_CURRICULUM = {
  pharmacology: {
    label: 'Pharmacology',
    topics: [
      { id: 'beta_blockers', label: 'Beta Blockers', subtopics: ['Mechanism of action', 'Selective vs non-selective', 'Nursing considerations', 'Hold parameters', 'Side effects', 'Metoprolol tartrate vs succinate'] },
      { id: 'ace_arb', label: 'ACE Inhibitors & ARBs', subtopics: ['Mechanism', 'Drug names', 'Cough and angioedema', 'Renal monitoring', 'Potassium effects'] },
      { id: 'diuretics', label: 'Diuretics', subtopics: ['Loop diuretics', 'Thiazides', 'Potassium-sparing', 'Electrolyte monitoring', 'Furosemide nursing care'] },
      { id: 'anticoagulants', label: 'Anticoagulants', subtopics: ['Heparin vs warfarin', 'INR monitoring', 'Antidotes', 'DVT prophylaxis', 'Bleeding precautions', 'Direct oral anticoagulants'] },
      { id: 'antibiotics', label: 'Antibiotics', subtopics: ['Penicillins', 'Cephalosporins', 'Aminoglycosides', 'Fluoroquinolones', 'Macrolides', 'C diff risk', 'Allergy cross-reactivity'] },
      { id: 'insulin', label: 'Insulin & Diabetes Meds', subtopics: ['Rapid acting insulin', 'Long acting insulin', 'Insulin peak and duration', 'Hypoglycemia management', 'Metformin', 'SGLT2 inhibitors'] },
      { id: 'pain_opioids', label: 'Pain & Opioids', subtopics: ['Opioid mechanisms', 'Naloxone use', 'Respiratory depression', 'PCA pumps', 'Non-opioid analgesics', 'Equianalgesic dosing'] },
      { id: 'cardiac_drugs', label: 'Cardiac Medications', subtopics: ['Digoxin toxicity', 'Antiarrhythmics', 'Nitrates', 'Calcium channel blockers', 'Statins', 'Amiodarone'] },
      { id: 'psych_meds', label: 'Psychiatric Medications', subtopics: ['Antipsychotics', 'SSRIs and SNRIs', 'Lithium toxicity', 'Benzodiazepines', 'MAOIs', 'Serotonin syndrome'] },
    ]
  },
  medsurg: {
    label: 'Med-Surg',
    topics: [
      { id: 'cardiac_ms', label: 'Cardiac Disorders', subtopics: ['Heart failure left vs right', 'MI STEMI NSTEMI', 'Angina types', 'Cardiac output', 'BNP and troponin', 'Post-MI care'] },
      { id: 'respiratory_ms', label: 'Respiratory Disorders', subtopics: ['COPD pathophysiology', 'Asthma vs COPD', 'Pneumonia types', 'Pulmonary embolism', 'ARDS', 'Oxygen therapy'] },
      { id: 'renal_ms', label: 'Renal & Urinary', subtopics: ['AKI vs CKD', 'GFR and creatinine', 'Dialysis types', 'Urinary catheters', 'Electrolyte disturbances in renal failure'] },
      { id: 'neuro_ms', label: 'Neurological Disorders', subtopics: ['Stroke ischemic vs hemorrhagic', 'FAST assessment', 'tPA criteria', 'ICP management', 'Seizure care', 'Spinal cord injury'] },
      { id: 'endocrine_ms', label: 'Endocrine Disorders', subtopics: ['DKA vs HHS', 'Thyroid storm', 'Cushing vs Addison', 'Diabetes insipidus vs SIADH', 'Hypoglycemia'] },
      { id: 'gi_ms', label: 'GI Disorders', subtopics: ['GI bleed upper vs lower', 'Liver cirrhosis', 'Hepatic encephalopathy', 'Pancreatitis', 'Bowel obstruction', 'Ostomy care'] },
    ]
  },
  nclex_strategy: {
    label: 'NCLEX Strategy',
    topics: [
      { id: 'priority', label: 'Priority & ABCs', subtopics: ['Airway priority', 'Maslow hierarchy', 'Acute vs chronic', 'Unstable vs stable', 'Which patient first'] },
      { id: 'delegation', label: 'Delegation & Assignment', subtopics: ['RN vs LPN scope', 'CNA tasks', 'Unsafe delegation', 'Charge nurse role', 'Float nurse limits'] },
      { id: 'labs', label: 'Critical Lab Values', subtopics: ['Potassium critical values', 'Sodium ranges', 'Glucose critical', 'INR therapeutic range', 'ABG interpretation', 'CBC interpretation'] },
      { id: 'fluids_electrolytes', label: 'Fluids & Electrolytes', subtopics: ['Hypokalemia signs', 'Hyperkalemia signs', 'Hyponatremia', 'Hypocalcemia', 'IV fluid types', 'Fluid overload vs deficit'] },
      { id: 'safety', label: 'Safety & Infection Control', subtopics: ['Isolation types', 'PPE sequence', 'Fall prevention', 'Restraints', 'Medication safety', 'Never events'] },
    ]
  },
  specialty: {
    label: 'Specialty Nursing',
    topics: [
      { id: 'obgyn', label: 'OB/GYN & Maternity', subtopics: ['Fetal heart rate patterns', 'Postpartum hemorrhage', 'Preeclampsia vs eclampsia', 'Magnesium toxicity', 'Labor stages', 'Newborn assessment'] },
      { id: 'peds', label: 'Pediatrics', subtopics: ['Vital sign norms by age', 'Growth and development', 'Pediatric drug dosing', 'Respiratory distress in children', 'Common childhood illnesses'] },
      { id: 'psych_specialty', label: 'Psychiatric Nursing', subtopics: ['Therapeutic communication', 'Suicide risk assessment', 'Restraint use', 'Schizophrenia care', 'Eating disorders', 'Substance withdrawal'] },
      { id: 'critical_care', label: 'Critical Care', subtopics: ['Hemodynamic monitoring', 'Ventilator settings', 'Sepsis bundle', 'Swan-Ganz catheter', 'ACLS rhythms', 'Shock types'] },
    ]
  }
}

export const PRENURSING_CURRICULUM = {
  anp1: {
    label: 'A&P 1',
    topics: [
      { id: 'cell_biology', label: 'Cell Biology', subtopics: ['Cell membrane structure', 'Organelles and functions', 'Cell transport mechanisms', 'Osmosis and diffusion', 'Active vs passive transport', 'Cell cycle and mitosis'] },
      { id: 'tissues', label: 'Tissues & Histology', subtopics: ['Epithelial tissue types', 'Connective tissue types', 'Muscle tissue types', 'Nervous tissue', 'Tissue repair and healing'] },
      { id: 'integumentary', label: 'Integumentary System', subtopics: ['Skin layers epidermis dermis', 'Skin appendages', 'Skin functions', 'Burns classification', 'Wound healing'] },
      { id: 'skeletal', label: 'Skeletal System', subtopics: ['Bone tissue types compact vs spongy', 'Bone cells osteoblast osteoclast osteocyte', 'Ossification endochondral vs intramembranous', 'Axial skeleton skull vertebrae ribs', 'Appendicular skeleton limbs girdles', 'Bone markings foramina condyles', 'Joints classification synarthrosis amphiarthrosis diarthrosis', 'Synovial joint structure', 'Joint movements flexion extension rotation', 'Bone remodeling calcium homeostasis', 'Fracture types and healing', 'Skeletal muscle attachment tendons ligaments'] },
      { id: 'muscular', label: 'Muscular System', subtopics: ['Muscle fiber structure sarcomere', 'Sliding filament theory', 'Neuromuscular junction', 'Motor unit recruitment', 'Muscle contraction types isotonic isometric', 'ATP production aerobic anaerobic', 'Muscle fatigue and recovery', 'Major muscle groups origin insertion', 'Smooth vs skeletal vs cardiac muscle', 'Muscle tone and posture'] },
      { id: 'nervous_basic', label: 'Nervous System', subtopics: ['Neuron structure axon dendrite', 'Resting membrane potential', 'Action potential generation', 'Synaptic transmission', 'CNS vs PNS divisions', 'Brain regions and functions', 'Spinal cord structure', 'Reflex arcs', 'Sympathetic vs parasympathetic', 'Neurotransmitters'] },
      { id: 'special_senses', label: 'Special Senses', subtopics: ['Eye anatomy', 'Vision and photoreception', 'Ear anatomy', 'Hearing and equilibrium', 'Taste and smell', 'Sensory receptors'] },
    ]
  },
  anp2: {
    label: 'A&P 2',
    topics: [
      { id: 'cardiovascular', label: 'Cardiovascular System', subtopics: ['Heart chambers and valves', 'Cardiac cycle systole diastole', 'Conduction system SA AV node', 'ECG basics P wave QRS T wave', 'Blood pressure regulation', 'Blood vessel types arteries veins capillaries', 'Coronary circulation', 'Fetal circulation', 'Blood flow and resistance', 'Cardiac output stroke volume heart rate', 'Blood pressure regulation baroreceptors', 'Lymphatic system'] },
      { id: 'respiratory_anp', label: 'Respiratory System', subtopics: ['Upper vs lower respiratory tract', 'Lung anatomy lobes pleura', 'Mechanics of breathing', 'Lung volumes and capacities', 'Gas exchange alveolar', 'Oxygen transport hemoglobin', 'Carbon dioxide transport', 'Respiratory control centers', 'Ventilation perfusion ratio', 'Acid base balance respiratory'] },
      { id: 'digestive', label: 'Digestive System', subtopics: ['GI tract layers mucosa submucosa', 'Oral cavity and esophagus', 'Stomach anatomy and function', 'Small intestine absorption', 'Large intestine colon', 'Liver bile production', 'Pancreas enzymes', 'Nutrient absorption carbs proteins fats', 'GI hormones gastrin secretin CCK', 'Defecation reflex'] },
      { id: 'urinary', label: 'Urinary System', subtopics: ['Kidney anatomy cortex medulla', 'Nephron structure glomerulus tubules', 'Glomerular filtration GFR', 'Tubular reabsorption', 'Tubular secretion', 'Urine concentration loop of Henle', 'Renin angiotensin aldosterone', 'ADH and water reabsorption', 'Acid base regulation kidney', 'Micturition reflex'] },
      { id: 'endocrine_anp', label: 'Endocrine System', subtopics: ['Hormone types steroid peptide', 'Negative feedback loops', 'Pituitary gland anterior posterior', 'Thyroid hormones T3 T4', 'Parathyroid calcium regulation', 'Adrenal cortex aldosterone cortisol', 'Adrenal medulla epinephrine', 'Pancreas insulin glucagon', 'Reproductive hormones', 'Stress response HPA axis'] },
      { id: 'immune', label: 'Lymphatic & Immunity', subtopics: ['Innate vs adaptive immunity', 'Leukocyte types and functions', 'Antigen antibody response', 'B cells and antibodies', 'T cells cytotoxic helper', 'Inflammatory response', 'Complement system', 'Active vs passive immunity', 'Vaccines mechanism', 'Autoimmunity hypersensitivity'] },
      { id: 'reproductive', label: 'Reproductive System', subtopics: ['Male anatomy and spermatogenesis', 'Female anatomy and oogenesis', 'Menstrual cycle phases', 'Hormonal regulation FSH LH', 'Fertilization and implantation', 'Pregnancy and placenta'] },
    ]
  },
  microbiology: {
    label: 'Microbiology',
    topics: [
      { id: 'cell_structure_micro', label: 'Microbial Cell Structure', subtopics: ['Prokaryote vs eukaryote', 'Bacterial cell wall gram positive negative', 'Bacterial capsule flagella pili', 'Endospore formation', 'Plasmids and chromosomes', 'Archaeal characteristics'] },
      { id: 'gram_staining', label: 'Gram Staining & Classification', subtopics: ['Gram stain procedure steps', 'Gram positive organisms', 'Gram negative organisms', 'Acid fast staining', 'Bacterial morphology cocci bacilli', 'Arrangement pairs clusters chains'] },
      { id: 'microbial_growth', label: 'Microbial Growth', subtopics: ['Growth curve lag log stationary death', 'Binary fission', 'Environmental factors temperature pH', 'Aerobic vs anaerobic growth', 'Culture media types', 'Sterilization vs disinfection'] },
      { id: 'microbial_genetics', label: 'Microbial Genetics', subtopics: ['DNA replication in bacteria', 'Mutation types and causes', 'Transformation transduction conjugation', 'Antibiotic resistance mechanisms', 'Plasmid transfer', 'CRISPR basics'] },
      { id: 'immune_response_micro', label: 'Host Immune Response', subtopics: ['First line barriers skin mucous membranes', 'Innate immune response', 'Phagocytosis neutrophils macrophages', 'Adaptive immunity B and T cells', 'Antibody types IgG IgM IgA', 'Complement activation', 'Inflammation mediators', 'Fever mechanism pyrogens'] },
      { id: 'pathogens', label: 'Common Pathogens', subtopics: ['Staphylococcus aureus MRSA', 'Streptococcus types', 'E coli pathogenic strains', 'Pseudomonas', 'Clostridium difficile', 'Mycobacterium tuberculosis', 'Influenza virus', 'HIV lifecycle', 'Fungal pathogens Candida', 'Parasitic infections basics'] },
      { id: 'antimicrobials', label: 'Antimicrobials', subtopics: ['Beta lactam antibiotics mechanism', 'Aminoglycoside toxicity', 'Macrolide mechanism', 'Fluoroquinolone mechanism', 'Antifungal drugs', 'Antiviral mechanisms', 'Resistance mechanisms', 'Antimicrobial stewardship'] },
    ]
  },
  chemistry: {
    label: 'Chemistry',
    topics: [
      { id: 'atomic_structure', label: 'Atomic Structure', subtopics: ['Protons neutrons electrons', 'Atomic number mass number', 'Isotopes', 'Electron configuration', 'Periodic table trends', 'Valence electrons'] },
      { id: 'chemical_bonding', label: 'Chemical Bonding', subtopics: ['Ionic bonds', 'Covalent bonds polar nonpolar', 'Hydrogen bonds', 'Electronegativity', 'Molecular geometry', 'Intermolecular forces'] },
      { id: 'chemical_reactions', label: 'Chemical Reactions', subtopics: ['Balancing equations', 'Reaction types synthesis decomposition', 'Oxidation reduction redox', 'Reaction rates kinetics', 'Energy activation energy', 'Equilibrium Le Chateliers principle'] },
      { id: 'acids_bases', label: 'Acids, Bases & pH', subtopics: ['Arrhenius Bronsted-Lowry definitions', 'Strong vs weak acids bases', 'pH scale calculation', 'Buffer systems', 'Titration', 'Henderson-Hasselbalch', 'Body pH and acid base balance'] },
      { id: 'organic_chem', label: 'Organic Chemistry', subtopics: ['Carbon bonding hybridization', 'Functional groups hydroxyl carboxyl amino', 'Isomers structural optical', 'Hydrocarbons alkanes alkenes', 'Reactions substitution addition', 'Chirality biological importance'] },
      { id: 'biochem', label: 'Biochemistry', subtopics: ['Carbohydrate structure monosaccharides', 'Lipid types phospholipids triglycerides', 'Protein structure primary to quaternary', 'Enzyme kinetics Michaelis-Menten', 'ATP and energy metabolism', 'DNA and RNA structure', 'Nucleotides bases pairs'] },
    ]
  }
}

export function getCurriculum(mode) {
  return mode === 'prenursing' ? PRENURSING_CURRICULUM : NURSING_CURRICULUM
}

export function loadMastery() {
  try { return JSON.parse(localStorage.getItem('nurseiq_mastery') || '{}') } catch { return {} }
}

export function saveMastery(data) {
  localStorage.setItem('nurseiq_mastery', JSON.stringify(data))
}

export function loadMistakes() {
  try { return JSON.parse(localStorage.getItem('nurseiq_mistakes') || '[]') } catch { return [] }
}

export function saveMistakes(mistakes) {
  localStorage.setItem('nurseiq_mistakes', JSON.stringify(mistakes.slice(-500)))
}

export function loadStreak() {
  try {
    const data = JSON.parse(localStorage.getItem('nurseiq_streak') || '{"streak":0,"lastDate":null,"todayQuestions":0}')
    const today = new Date().toDateString()
    if (data.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      if (data.lastDate !== yesterday) data.streak = 0
      data.todayQuestions = 0
    }
    return data
  } catch { return { streak: 0, lastDate: null, todayQuestions: 0 } }
}

export function updateStreak(questionsAnswered) {
  const today = new Date().toDateString()
  const data = loadStreak()
  if (data.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    if (data.lastDate === yesterday) data.streak += 1
    else data.streak = 1
    data.lastDate = today
    data.todayQuestions = 0
  }
  data.todayQuestions += questionsAnswered
  localStorage.setItem('nurseiq_streak', JSON.stringify(data))
  return data
}

// Mastery now requires 40 correct at 85%+ accuracy
export const MASTERY_MIN_CORRECT = 40
export const MASTERY_MIN_PCT = 0.85

export function getMasteryLevel(correct, total) {
  if (total === 0) return { pct: 0, status: 'not_started', label: 'Not started', color: '#888780' }
  const pct = correct / total
  const pctDisplay = Math.round(pct * 100)
  if (correct >= MASTERY_MIN_CORRECT && pct >= MASTERY_MIN_PCT) {
    return { pct: pctDisplay, status: 'mastered', label: 'Mastered', color: '#1D9E75' }
  }
  if (pct >= 0.85) {
    // High accuracy but not enough questions yet — still show green-ish
    return { pct: pctDisplay, status: 'learning', label: 'High accuracy', color: '#1D9E75' }
  }
  if (pct >= 0.7 && total >= 5) {
    return { pct: pctDisplay, status: 'learning', label: 'Learning', color: '#BA7517' }
  }
  if (total > 0 && total < 5) {
    return { pct: pctDisplay, status: 'started', label: 'Just started', color: '#BA7517' }
  }
  return { pct: pctDisplay, status: 'weak', label: 'Needs work', color: '#E24B4A' }
}

export function getMasteryProgress(correct, total) {
  return {
    correctNeeded: Math.max(0, MASTERY_MIN_CORRECT - correct),
    pct: total > 0 ? Math.round((correct / total) * 100) : 0,
    correct,
    total,
    isMastered: correct >= MASTERY_MIN_CORRECT && total > 0 && correct / total >= MASTERY_MIN_PCT,
  }
}

export function getWeakTopics(mastery, curriculum) {
  const weak = []
  Object.entries(curriculum).forEach(([catId, cat]) => {
    cat.topics.forEach(topic => {
      const key = catId + '_' + topic.id
      const m = mastery[key]
      const level = getMasteryLevel(m?.correct || 0, m?.total || 0)
      if (level.status !== 'mastered') {
        weak.push({ key, catId, topic, mastery: m || { correct: 0, total: 0 }, level })
      }
    })
  })
  return weak.sort((a, b) => {
    const scoreA = a.mastery.total > 0 ? a.mastery.correct / a.mastery.total : -1
    const scoreB = b.mastery.total > 0 ? b.mastery.correct / b.mastery.total : -1
    return scoreA - scoreB
  })
}

// Question bank
export function loadQuestionBank(topicKey) {
  try {
    const raw = localStorage.getItem('nurseiq_bank_' + topicKey)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveQuestionBank(topicKey, questions) {
  try { localStorage.setItem('nurseiq_bank_' + topicKey, JSON.stringify(questions)) } catch {}
}

export function getNextQuestions(topicKey, count) {
  const bank = loadQuestionBank(topicKey)
  if (!bank || bank.questions.length === 0) return null
  const answered = new Set(bank.answeredIndices || [])
  const unanswered = bank.questions.map((q, i) => i).filter(i => !answered.has(i))
  if (unanswered.length < count) {
    // Reset answered if we've gone through them all
    bank.answeredIndices = []
    saveQuestionBank(topicKey, bank)
    return bank.questions.slice(0, count)
  }
  const selected = unanswered.sort(() => Math.random() - 0.5).slice(0, count)
  bank.answeredIndices = [...(bank.answeredIndices || []), ...selected]
  saveQuestionBank(topicKey, bank)
  return selected.map(i => bank.questions[i])
}

export function markQuestionsAnswered(topicKey, indices) {
  const bank = loadQuestionBank(topicKey)
  if (!bank) return
  const existing = new Set(bank.answeredIndices || [])
  indices.forEach(i => existing.add(i))
  bank.answeredIndices = [...existing]
  saveQuestionBank(topicKey, bank)
}

// Custom topics
export function loadCustomTopics() {
  try { return JSON.parse(localStorage.getItem('nurseiq_custom_topics') || '[]') } catch { return [] }
}

export function saveCustomTopics(topics) {
  localStorage.setItem('nurseiq_custom_topics', JSON.stringify(topics))
}

export function addCustomTopic(topic) {
  const topics = loadCustomTopics()
  const exists = topics.find(t => t.id === topic.id)
  if (!exists) { topics.push(topic); saveCustomTopics(topics) }
  return topics
}

export function renameCustomTopic(topicId, newLabel) {
  const topics = loadCustomTopics()
  const updated = topics.map(t => t.id === topicId ? { ...t, label: newLabel } : t)
  saveCustomTopics(updated)
  return updated
}

export function getCustomCategories() {
  try { return JSON.parse(localStorage.getItem('nurseiq_custom_categories') || '{}') } catch { return {} }
}

export function saveCustomCategories(cats) {
  localStorage.setItem('nurseiq_custom_categories', JSON.stringify(cats))
}

export function addTopicToCategory(catId, topic) {
  const cats = getCustomCategories()
  if (!cats[catId]) cats[catId] = { label: topic.categoryLabel || catId, topics: [] }
  const exists = cats[catId].topics.find(t => t.id === topic.id)
  if (!exists) cats[catId].topics.push(topic)
  saveCustomCategories(cats)
  return cats
}

export function resetSkillMap() {
  localStorage.removeItem('nurseiq_mastery')
  localStorage.removeItem('nurseiq_custom_topics')
  localStorage.removeItem('nurseiq_custom_categories')
  localStorage.removeItem('nurseiq_mistakes')
  // Clear all question banks
  Object.keys(localStorage).filter(k => k.startsWith('nurseiq_bank_')).forEach(k => localStorage.removeItem(k))
}

export function getCurriculumCategoryLabels(mode) {
  const cur = getCurriculum(mode)
  return Object.entries(cur).map(([id, cat]) => ({
    id,
    label: cat.label,
    topicLabels: cat.topics.map(t => t.label)
  }))
}

// ─── SPACED REPETITION (SM-2 algorithm) ───────────────────────────────────
export function loadSRSData() {
  try { return JSON.parse(localStorage.getItem('nurseiq_srs') || '{}') } catch { return {} }
}

export function saveSRSData(data) {
  localStorage.setItem('nurseiq_srs', JSON.stringify(data))
}

// SM-2 algorithm: returns next review interval in days
function sm2(card, quality) {
  // quality: 0-2 = fail, 3 = hard, 4 = good, 5 = easy
  let { interval = 1, repetitions = 0, efactor = 2.5 } = card
  if (quality >= 3) {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * efactor)
    repetitions += 1
  } else {
    repetitions = 0
    interval = 1
  }
  efactor = Math.max(1.3, efactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)
  return { interval, repetitions, efactor, nextReview: nextReview.toISOString(), lastReview: new Date().toISOString() }
}

export function updateSRS(topicKey, questionIndex, isCorrect, timeSeconds) {
  const data = loadSRSData()
  const cardKey = topicKey + '_' + questionIndex
  const card = data[cardKey] || {}
  // Convert performance to SM-2 quality score
  let quality
  if (!isCorrect) quality = 1
  else if (timeSeconds < 10) quality = 5  // fast and correct = easy
  else if (timeSeconds < 30) quality = 4  // normal = good
  else quality = 3                         // slow = hard
  data[cardKey] = { ...card, ...sm2(card, quality), topicKey }
  saveSRSData(data)
}

export function getDueCards(topicKey, count = 5) {
  const data = loadSRSData()
  const now = new Date()
  const due = []
  const bank = loadQuestionBank(topicKey)
  if (!bank) return []
  bank.questions.forEach((q, i) => {
    const cardKey = topicKey + '_' + i
    const card = data[cardKey]
    if (!card || new Date(card.nextReview) <= now) {
      due.push({ index: i, question: q, card: card || null })
    }
  })
  // Sort: overdue first, then new cards
  due.sort((a, b) => {
    if (!a.card && !b.card) return 0
    if (!a.card) return 1
    if (!b.card) return -1
    return new Date(a.card.nextReview) - new Date(b.card.nextReview)
  })
  return due.slice(0, count).map(d => d.question)
}

export function getSRSStats(topicKey) {
  const data = loadSRSData()
  const now = new Date()
  const bank = loadQuestionBank(topicKey)
  if (!bank) return { due: 0, learning: 0, mastered: 0, total: 0 }
  let due = 0, learning = 0, mastered = 0
  bank.questions.forEach((q, i) => {
    const card = data[topicKey + '_' + i]
    if (!card) { due++; return }
    if (new Date(card.nextReview) <= now) due++
    else if (card.interval >= 21) mastered++
    else learning++
  })
  return { due, learning, mastered, total: bank.questions.length }
}

// ─── PROGRESS HISTORY ─────────────────────────────────────────────────────
export function loadProgressHistory() {
  try { return JSON.parse(localStorage.getItem('nurseiq_progress_history') || '[]') } catch { return [] }
}

export function recordDailyProgress(correct, total, topicsStudied) {
  const history = loadProgressHistory()
  const today = new Date().toDateString()
  const existing = history.find(h => h.date === today)
  if (existing) {
    existing.correct += correct
    existing.total += total
    existing.topicsStudied = [...new Set([...existing.topicsStudied, ...topicsStudied])]
    existing.accuracy = Math.round((existing.correct / existing.total) * 100)
  } else {
    history.push({
      date: today,
      dateISO: new Date().toISOString(),
      correct,
      total,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      topicsStudied: topicsStudied || [],
    })
  }
  // Keep last 90 days
  const trimmed = history.slice(-90)
  localStorage.setItem('nurseiq_progress_history', JSON.stringify(trimmed))
  return trimmed
}

// ─── DAILY GOAL ───────────────────────────────────────────────────────────
export function loadDailyGoal() {
  try { return JSON.parse(localStorage.getItem('nurseiq_daily_goal') || '{"target":20}') } catch { return { target: 20 } }
}

export function saveDailyGoal(target) {
  localStorage.setItem('nurseiq_daily_goal', JSON.stringify({ target }))
}

export function getTodayProgress() {
  const history = loadProgressHistory()
  const today = new Date().toDateString()
  return history.find(h => h.date === today) || { correct: 0, total: 0, accuracy: 0, topicsStudied: [] }
}
