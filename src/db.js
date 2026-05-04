import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

// ── Auth ──────────────────────────────────────────────────────────
export async function signUp(username, pin) {
  const email = `${username.toLowerCase()}@growinsport.internal`
  const { data, error } = await supabase.auth.signUp({ email, password: pin })
  if (error) throw error
  const { error: pe } = await supabase.from('profiles').insert({
    id: data.user.id,
    username: username.toLowerCase(),
  })
  if (pe) console.error('Profile insert error:', pe)
  return data.user
}

export async function signIn(username, pin) {
  const email = `${username.toLowerCase()}@growinsport.internal`
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pin })
  if (error) throw error
  return data.user
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ── Profile ───────────────────────────────────────────────────────
export async function loadProfile() {
  const { data, error } = await supabase.from('profiles').select('*').single()
  if (error) { console.error('loadProfile error:', error); return null }
  return data
}

export async function saveProfile(updates) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  // Use update (not upsert) so we don't need to re-supply username
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
  if (error) console.error('saveProfile error:', error)
}

// ── Games ─────────────────────────────────────────────────────────
export async function loadGames() {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('date', { ascending: false })
  if (error) { console.error('loadGames error:', error); return [] }
  // Map snake_case DB columns → camelCase JS fields
  return (data || []).map(g => ({
    id:             g.id,
    date:           g.date,
    name:           g.name || '',
    type:           g.type,
    totalMinutes:   g.total_minutes,
    minutesPlayed:  g.minutes_played,
    position:       g.position,
    periods:        g.periods || 1,
    metrics:        g.metrics || {},
    periodMetrics:  g.period_metrics || null,
    events:         g.events || [],
    subs:           g.subs || [],
    targets:        g.targets || {},
    startTime:      g.start_time || null,
    endTime:        g.end_time || null,
    periodLog:      g.period_log || null,
  }))
}

export async function saveGame(game) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  // Build row — only include fields that exist on the game object
  const row = {
    id:             game.id,
    user_id:        user.id,
    date:           game.date,
    name:           game.name || '',
    type:           game.type,
    total_minutes:  game.totalMinutes || game.minutesPlayed || 0,
    minutes_played: game.minutesPlayed || 0,
    position:       game.position || null,
    periods:        game.periods || 1,
    metrics:        game.metrics || {},
    period_metrics: game.periodMetrics || null,
    events:         game.events || [],
    subs:           game.subs || [],
    updated_at:     new Date().toISOString(),
  }

  // New fields — only include if columns exist (added via SQL migration)
  // Safe to include even if null; Supabase ignores extra null columns
  if (game.targets !== undefined)   row.targets    = game.targets || {}
  if (game.startTime !== undefined) row.start_time = game.startTime || null
  if (game.endTime !== undefined)   row.end_time   = game.endTime || null
  if (game.periodLog !== undefined) row.period_log = game.periodLog || null

  const { error } = await supabase.from('games').upsert(row)
  if (error) {
    console.error('saveGame error:', error)
    // If error is about missing column, retry without the new fields
    if (error.message?.includes('column') || error.code === '42703') {
      console.warn('Retrying saveGame without new columns...')
      const safeRow = { ...row }
      delete safeRow.targets
      delete safeRow.start_time
      delete safeRow.end_time
      delete safeRow.period_log
      const { error: e2 } = await supabase.from('games').upsert(safeRow)
      if (e2) throw e2
    } else {
      throw error
    }
  }
}

export async function deleteGame(id) {
  const { error } = await supabase.from('games').delete().eq('id', id)
  if (error) { console.error('deleteGame error:', error); throw error }
}
