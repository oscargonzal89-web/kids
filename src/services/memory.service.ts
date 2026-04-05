import { supabase } from '../lib/supabase/client'
import type { Tables } from '../lib/supabase/database.types'

export type MemoryFactRow = Tables<'child_memory_facts'>

export interface MemoryFact {
  key: string
  value: string
}

/** Carga todos los hechos memorizados de un niño */
export async function getMemoryFacts(childId: string): Promise<MemoryFactRow[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('child_memory_facts')
    .select('*')
    .eq('user_id', user.id)
    .eq('child_id', childId)
    .eq('source', 'nani')
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error loading memory facts:', error)
    return []
  }
  return (data ?? []) as MemoryFactRow[]
}

/** Guarda o actualiza un hecho memorizado por Nani */
export async function upsertMemoryFact(
  childId: string,
  key: string,
  value: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Buscar si ya existe un hecho con la misma key
  const { data: existing } = await supabase
    .from('child_memory_facts')
    .select('id')
    .eq('user_id', user.id)
    .eq('child_id', childId)
    .eq('key', key)
    .eq('source', 'nani')
    .maybeSingle()

  if (existing) {
    await supabase
      .from('child_memory_facts')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('child_memory_facts')
      .insert({
        user_id: user.id,
        child_id: childId,
        key,
        value,
        source: 'nani',
        confidence: 0.9,
      })
  }
}

/** Guarda múltiples hechos extraídos por Nani */
export async function saveMemoryFacts(
  childId: string,
  facts: MemoryFact[]
): Promise<void> {
  for (const fact of facts) {
    await upsertMemoryFact(childId, fact.key, fact.value)
  }
}
