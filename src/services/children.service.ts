import { supabase } from '../lib/supabase/client'
import type { Tables } from '../lib/supabase/database.types'

export type ChildRow = Tables<'children'>

export async function getChildren(): Promise<ChildRow[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as ChildRow[]
}

export async function insertChild(payload: {
  name: string
  nickname?: string
  birthdate: string
  favorites?: { color?: string; animal?: string }
}): Promise<ChildRow> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('children')
    .insert({
      user_id: user.id,
      name: payload.name,
      nickname: payload.nickname || null,
      birthdate: payload.birthdate || null,
      favorites: payload.favorites ?? {},
    })
    .select()
    .single()

  if (error) throw error
  return data as ChildRow
}
