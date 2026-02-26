import { supabase } from '../lib/supabase/client'
import type { Tables } from '../lib/supabase/database.types'

export type ChatSessionRow = Tables<'chat_sessions'>
export type ChatMessageRow = Tables<'chat_messages'>

/** Obtiene la sesión activa para user + child, o crea una nueva. */
export async function getOrCreateSession(childId: string): Promise<ChatSessionRow> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: existing } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('child_id', childId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) return existing as ChatSessionRow

  const { data: created, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: user.id,
      child_id: childId,
      title: 'Chat con Nani',
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  return created as ChatSessionRow
}

/** Lista mensajes de una sesión, ordenados por fecha. */
export async function getMessages(sessionId: string): Promise<ChatMessageRow[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as ChatMessageRow[]
}

/** Inserta un mensaje en la sesión. role: 'user' | 'assistant' */
export async function addMessage(
  sessionId: string,
  childId: string,
  role: 'user' | 'assistant',
  content: string,
  meta?: unknown
): Promise<ChatMessageRow> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      user_id: user.id,
      child_id: childId,
      role,
      content,
      meta: meta ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data as ChatMessageRow
}

/** Actualiza updated_at de la sesión (opcional, para “última actividad”). */
export async function touchSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId)
  if (error) throw error
}
