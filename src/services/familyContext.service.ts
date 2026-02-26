import { supabase } from '../lib/supabase/client'

export interface FamilyContextRow {
  id: string
  user_id: string
  home_type: string | null
  city: string | null
  climate: string | null
  pets: unknown[]
  sleep_time: string | null
  meal_time: string | null
  created_at: string
}

export async function getFamilyContext(): Promise<FamilyContextRow | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('family_context')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as FamilyContextRow
}

export async function upsertFamilyContext(payload: {
  city?: string | null
  home_type?: string | null
  climate?: string | null
  pets?: unknown[]
  sleep_time?: string | null
  meal_time?: string | null
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('family_context')
    .upsert(
      {
        user_id: user.id,
        city: payload.city ?? null,
        home_type: payload.home_type ?? null,
        climate: payload.climate ?? null,
        pets: Array.isArray(payload.pets) ? payload.pets : [],
        sleep_time: payload.sleep_time ?? null,
        meal_time: payload.meal_time ?? null,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data as FamilyContextRow
}
