import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xhuqmackurkmhxbeicae.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodXFtYWNrdXJrbWh4YmVpY2FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTgyMTMsImV4cCI6MjA5MTY5NDIxM30.cEUsQ1OkTTn0J5wimNMLVvVTtMRCbXNUvb4ruyAol-M'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
})

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    }
  })
  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ── USER DATA SYNC ─────────────────────────────────────────────────────────
// Each function syncs a piece of data to Supabase, falling back to localStorage

export async function syncMastery(userId, mastery) {
  const { error } = await supabase.from('user_mastery').upsert({
    user_id: userId,
    data: mastery,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' })
  if (error) console.error('syncMastery error:', error.message, error.code)
  else console.log('syncMastery: OK')
}

export async function loadMasteryCloud(userId) {
  const { data } = await supabase
    .from('user_mastery')
    .select('data')
    .eq('user_id', userId)
    .single()
  return data?.data || null
}

export async function syncMistakes(userId, mistakes) {
  await supabase.from('user_mistakes').upsert({
    user_id: userId,
    data: mistakes,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' })
}

export async function loadMistakesCloud(userId) {
  const { data } = await supabase
    .from('user_mistakes')
    .select('data')
    .eq('user_id', userId)
    .single()
  return data?.data || null
}

export async function syncProgress(userId, history) {
  await supabase.from('user_progress').upsert({
    user_id: userId,
    data: history,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' })
}

export async function loadProgressCloud(userId) {
  const { data } = await supabase
    .from('user_progress')
    .select('data')
    .eq('user_id', userId)
    .single()
  return data?.data || null
}

export async function syncStreak(userId, streakData) {
  await supabase.from('user_streaks').upsert({
    user_id: userId,
    data: streakData,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' })
}

export async function loadStreakCloud(userId) {
  const { data } = await supabase
    .from('user_streaks')
    .select('data')
    .eq('user_id', userId)
    .single()
  return data?.data || null
}

export async function saveFlashDeckCloud(userId, deck) {
  await supabase.from('user_flashdecks').upsert({
    user_id: userId,
    deck_id: deck.id,
    name: deck.name,
    cards: deck.cards,
    created_at: deck.created,
  }, { onConflict: 'deck_id' })
}

export async function loadFlashDecksCloud(userId) {
  const { data } = await supabase
    .from('user_flashdecks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function getDisplayName(userId) {
  try {
    const { data, error } = await supabase.from('user_profiles').select('display_name').eq('user_id', userId).maybeSingle()
    if (error) { console.error('getDisplayName error:', error); return null }
    return data?.display_name || null
  } catch(e) { return null }
}

export async function setDisplayName(userId, name) {
  await supabase.from('user_profiles').upsert({ user_id: userId, display_name: name, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
}

// ── BACKGROUND SYNC HELPER ────────────────────────────────────────────────
// Silently syncs all user data to Supabase in the background
// Always writes to localStorage first, then syncs async
// Pass data directly - no dynamic imports needed
export async function backgroundSync(userId, { mastery, mistakes, progress, streak }) {
  if (!userId) return
  console.log('NurseIQ backgroundSync: starting for user', userId)
  try {
    const results = await Promise.allSettled([
      mastery ? syncMastery(userId, mastery) : Promise.resolve(),
      mistakes ? syncMistakes(userId, mistakes) : Promise.resolve(),
      progress ? syncProgress(userId, progress) : Promise.resolve(),
      streak ? syncStreak(userId, streak) : Promise.resolve(),
    ])
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.error('NurseIQ sync item', i, 'failed:', r.reason)
      else console.log('NurseIQ sync item', i, 'ok')
    })
  } catch(e) { console.error('NurseIQ sync error:', e) }
}

export async function loadAndMergeCloudData(userId, { saveMastery, saveMistakes, loadMastery, loadMistakes }) {
  if (!userId) return
  try {
    const [cloudMastery, cloudMistakes, cloudProgress, cloudStreak] = await Promise.all([
      loadMasteryCloud(userId),
      loadMistakesCloud(userId),
      loadProgressCloud(userId),
      loadStreakCloud(userId),
    ])

    if (cloudMastery) {
      const local = loadMastery()
      const merged = { ...local }
      for (const [key, val] of Object.entries(cloudMastery)) {
        if (!merged[key] || val.total > merged[key].total) merged[key] = val
      }
      saveMastery(merged)
    }

    if (cloudMistakes && cloudMistakes.length > loadMistakes().length) {
      saveMistakes(cloudMistakes)
    }

    if (cloudProgress && cloudProgress.length > 0) {
      localStorage.setItem('nurseiq_progress_history', JSON.stringify(cloudProgress))
    }

    if (cloudStreak) {
      const local = JSON.parse(localStorage.getItem('nurseiq_streak') || '{}')
      if ((cloudStreak.streak || 0) >= (local.streak || 0)) {
        localStorage.setItem('nurseiq_streak', JSON.stringify(cloudStreak))
      }
    }
  } catch(e) { console.log('Load cloud error:', e.message) }
}
