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

/** Cuántos planes se le pasan a Nani como máximo, para no inflar cada mensaje. */
const MAX_PLANS_FOR_NANI = 8

export interface NaniPlanContext {
  /** Planes que Nani puede recomendar: filtrados por edad y ciudad, sin los ocultos. */
  available: {
    title: string
    description: string | null
    category: string | null
    costLevel: string | null
    durationMinutes: number | null
  }[]
  /** Títulos que el padre/madre guardó (ítem C3). */
  saved: string[]
  /** Títulos que ocultó, para que Nani no insista con ellos (ítem C3). */
  hidden: string[]
}

/**
 * Contexto de planes para el chat con Nani.
 *
 * Resuelve dos ítems a la vez:
 *   D5 — `available`: Nani conoce el catálogo real y puede recomendar planes
 *        pertinentes en vez de responder de memoria general.
 *   C3 — `saved` / `hidden`: Nani nota qué le gustó y qué no.
 *
 * Devuelve un contexto vacío en vez de lanzar si algo falla: que el chat siga
 * funcionando importa más que tener planes en el prompt.
 */
export async function getPlanContextForNani(
  childId: string | undefined,
  ageMonths: number | undefined,
  city: string | undefined
): Promise<NaniPlanContext> {
  const empty: NaniPlanContext = { available: [], saved: [], hidden: [] }

  try {
    const [plans, interactions] = await Promise.all([
      listPlans({ ageMonths, city: city?.trim() || undefined }),
      childId ? getInteractions(childId) : Promise.resolve(new Map<string, 'saved' | 'hidden'>()),
    ])

    if (plans.length === 0) return empty

    const saved: string[] = []
    const hidden: string[] = []
    for (const plan of plans) {
      const status = interactions.get(plan.id)
      if (status === 'saved') saved.push(plan.title)
      else if (status === 'hidden') hidden.push(plan.title)
    }

    const available = plans
      // No recomendar algo que el usuario ocultó explícitamente.
      .filter((p) => interactions.get(p.id) !== 'hidden')
      .sort((a, b) => {
        // Primero lo que guardó: es la señal más fuerte de lo que le gusta.
        const aSaved = interactions.get(a.id) === 'saved' ? 1 : 0
        const bSaved = interactions.get(b.id) === 'saved' ? 1 : 0
        if (aSaved !== bSaved) return bSaved - aSaved
        // Después, lo más ajustado a la edad: un plan que arranca a los 6 meses
        // es más pertinente para un bebé de 9 que uno que arranca a los 0.
        return b.age_min_months - a.age_min_months
      })
      .slice(0, MAX_PLANS_FOR_NANI)
      .map((p) => ({
        title: p.title,
        description: p.description,
        category: p.category,
        costLevel: p.cost_level,
        durationMinutes: p.duration_minutes,
      }))

    return { available, saved, hidden }
  } catch (err) {
    console.error('Error building plan context for Nani:', err)
    return empty
  }
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
