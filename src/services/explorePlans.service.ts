import { supabase } from '../lib/supabase/client'
import type { Tables } from '../lib/supabase/database.types'

export type ExplorePlanRow = Tables<'explore_plans'>

export interface ExplorePlanFilters {
  category?: string
  city?: string
  ageMonths?: number
  search?: string
}

export async function listPlans(filters?: ExplorePlanFilters): Promise<ExplorePlanRow[]> {
  let query = supabase
    .from('explore_plans')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.city) {
    query = query.eq('city', filters.city)
  }
  if (filters?.ageMonths != null) {
    query = query.lte('age_min_months', filters.ageMonths)
    query = query.or(`age_max_months.is.null,age_max_months.gte.${filters.ageMonths}`)
  }
  if (filters?.search?.trim()) {
    const term = `%${filters.search.trim()}%`
    query = query.or(`title.ilike.${term},description.ilike.${term}`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as ExplorePlanRow[]
}

export interface PlanInteractionRow {
  id: string
  user_id: string
  child_id: string
  plan_id: string
  status: 'saved' | 'hidden'
  notes: string | null
  created_at: string
}

export async function getInteractions(childId: string): Promise<Map<string, 'saved' | 'hidden'>> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !childId) return new Map()

  const { data, error } = await supabase
    .from('explore_plan_interactions')
    .select('plan_id, status')
    .eq('user_id', user.id)
    .eq('child_id', childId)

  if (error) throw error
  const map = new Map<string, 'saved' | 'hidden'>()
  for (const row of data ?? []) {
    map.set((row as { plan_id: string; status: 'saved' | 'hidden' }).plan_id, (row as { plan_id: string; status: 'saved' | 'hidden' }).status)
  }
  return map
}

export async function setInteraction(
  planId: string,
  childId: string,
  status: 'saved' | 'hidden'
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('explore_plan_interactions')
    .upsert(
      {
        user_id: user.id,
        child_id: childId,
        plan_id: planId,
        status,
      },
      { onConflict: 'user_id,child_id,plan_id' }
    )

  if (error) throw error
}

export async function removeInteraction(planId: string, childId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('explore_plan_interactions')
    .delete()
    .eq('user_id', user.id)
    .eq('child_id', childId)
    .eq('plan_id', planId)

  if (error) throw error
}
