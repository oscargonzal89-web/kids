/**
 * Tipos de `_nani-prompt.mjs`, para que el editor y `api/chat.ts` sepan
 * qué esperar. El módulo es ESM plano porque `dev-server.mjs` lo corre `node`
 * sin transpilar.
 */
import type Anthropic from '@anthropic-ai/sdk';

export interface ChildContext {
  name: string;
  nickname?: string;
  birthDate?: string;
  ageMonths?: number;
  favorites?: { color?: string; animal?: string };
  city?: string;
}

export interface ParentContext {
  name: string;
  relationship?: string;
}

export interface HomeContext {
  hasPets?: boolean;
  sleepTime?: string;
  mealTime?: string;
  city?: string;
}

export interface MemoryFact {
  key: string;
  value: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Contexto de planes: D5 (`available`) y C3 (`saved` / `hidden`). */
export interface NaniPlanContext {
  available: {
    title: string;
    description: string | null;
    category: string | null;
    costLevel: string | null;
    durationMinutes: number | null;
  }[];
  saved: string[];
  hidden: string[];
}

export interface NaniTurnInput {
  messages: ChatMessage[];
  parent: ParentContext;
  child: ChildContext;
  home?: HomeContext;
  memoryFacts?: MemoryFact[];
  planContext?: NaniPlanContext | null;
}

export interface NaniTurnResult {
  reply: string;
  newFacts: MemoryFact[];
}

export const NANI_MODEL: string;

export function calculateAgeMonths(birthDate: string): number;

export function buildSystemPrompt(
  parent: ParentContext,
  child: ChildContext,
  home?: HomeContext,
  memoryFacts?: MemoryFact[]
): string;

export function chatWithNani(
  anthropic: Anthropic,
  input: NaniTurnInput
): Promise<NaniTurnResult>;
