import { supabase } from '../lib/supabase/client'

export interface ProfileRow {
  id: string
  name: string | null
  email: string | null
  tone: string
  relationship: string | null
  created_at: string
}

export async function getProfile(): Promise<ProfileRow | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // no rows
    throw error
  }
  return data as ProfileRow
}

export async function upsertProfile(payload: { name: string; email: string; tone?: string; relationship?: string }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        name: payload.name,
        email: payload.email,
        tone: payload.tone ?? 'calido',
        relationship: payload.relationship ?? null,
      },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (error) throw error
  return data as ProfileRow
}
