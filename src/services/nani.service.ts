export interface NaniContext {
  parent: {
    name: string;
    relationship?: string;
  };
  child: {
    name: string;
    nickname?: string;
    birthDate?: string;
    favorites?: { color?: string; animal?: string };
    city?: string;
  };
  home?: {
    hasPets?: boolean;
    sleepTime?: string;
    mealTime?: string;
    city?: string;
  };
}

export interface MemoryFact {
  key: string;
  value: string;
}

/** Contexto de planes que Nani recibe: D5 (catálogo) y C3 (preferencias). */
export type { NaniPlanContext } from './explorePlans.service';
import type { NaniPlanContext } from './explorePlans.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface NaniResponse {
  reply: string;
  newFacts: MemoryFact[];
}

/**
 * Envía mensajes a Nani (Claude) a través del endpoint serverless
 * y devuelve la respuesta + hechos nuevos extraídos.
 */
export async function sendToNani(
  messages: ChatMessage[],
  context: NaniContext,
  memoryFacts: MemoryFact[] = [],
  planContext: NaniPlanContext | null = null
): Promise<NaniResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      parent: context.parent,
      child: context.child,
      home: context.home,
      memoryFacts,
      planContext,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al comunicarse con Nani');
  }

  const data = await response.json();
  return {
    reply: data.reply,
    newFacts: data.newFacts || [],
  };
}
