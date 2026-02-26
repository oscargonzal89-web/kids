import { supabase } from '../lib/supabase/client'
import type { Tables } from '../lib/supabase/database.types'

const MOMENT_KEY = 'moment'

export type MomentRow = Tables<'child_memory_facts'>

export interface MomentInput {
  title: string
  date: string
  emoji?: string
  note?: string
}

/** Lista momentos del niño (child_memory_facts con key = 'moment'). */
export async function getMoments(childId: string): Promise<MomentRow[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('child_memory_facts')
    .select('*')
    .eq('user_id', user.id)
    .eq('child_id', childId)
    .eq('key', MOMENT_KEY)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as MomentRow[]
}

/** Crea un momento (insert en child_memory_facts). */
export async function addMoment(childId: string, input: MomentInput): Promise<MomentRow> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('child_memory_facts')
    .insert({
      user_id: user.id,
      child_id: childId,
      key: MOMENT_KEY,
      value: input.title,
      meta: {
        date: input.date,
        emoji: input.emoji ?? '💕',
        note: input.note ?? null,
      },
    })
    .select()
    .single()

  if (error) throw error
  return data as MomentRow
}
