import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

export async function signUp(username, pin) {
  const email = `${username.toLowerCase()}@growinsport.internal`
  const { data, error } = await supabase.auth.signUp({ email, password: pin })
  if (error) throw error
  await supabase.from('profiles').insert({ id: data.user.id, username: username.toLowerCase() })
  return data.user
}
export async function signIn(username, pin) {
  const email = `${username.toLowerCase()}@growinsport.internal`
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pin })
  if (error) throw error
  return data.user
}
export async function signOut() { await supabase.auth.signOut() }
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
export async function loadProfile() {
  const { data } = await supabase.from('profiles').select('*').single()
  return data
}
export async function saveProfile(updates) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('profiles').upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })
}
export async function loadGames() {
  const { data } = await supabase.from('games').select('*').order('date', { ascending: false })
  return data || []
}
export async function saveGame(game) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('games').upsert({
    id: game.id, user_id: user.id, date: game.date, name: game.name||'',
    type: game.type, total_minutes: game.totalMinutes||game.minutesPlayed,
    minutes_played: game.minutesPlayed, position: game.position||null,
    periods: game.periods||1, metrics: game.metrics||{},
    period_metrics: game.periodMetrics||null, events: game.events||[], subs: game.subs||[],
    updated_at: new Date().toISOString()
  })
}
export async function deleteGame(id) {
  await supabase.from('games').delete().eq('id', id)
}