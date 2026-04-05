import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChildContext {
  name: string;
  nickname?: string;
  birthDate?: string;
  ageMonths?: number;
  favorites?: { color?: string; animal?: string };
  city?: string;
}

interface ParentContext {
  name: string;
  relationship?: string;
}

interface HomeContext {
  hasPets?: boolean;
  sleepTime?: string;
  mealTime?: string;
  city?: string;
}

interface MemoryFact {
  key: string;
  value: string;
}

interface ChatRequestBody {
  messages: { role: 'user' | 'assistant'; content: string }[];
  parent: ParentContext;
  child: ChildContext;
  home?: HomeContext;
  memoryFacts?: MemoryFact[];
}

function calculateAgeMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

function buildSystemPrompt(
  parent: ParentContext,
  child: ChildContext,
  home: HomeContext | undefined,
  memoryFacts: MemoryFact[]
): string {
  const ageMonths = child.birthDate ? calculateAgeMonths(child.birthDate) : child.ageMonths;
  const ageText = ageMonths !== undefined
    ? ageMonths >= 12
      ? `${Math.floor(ageMonths / 12)} año(s) y ${ageMonths % 12} mes(es)`
      : `${ageMonths} mes(es)`
    : 'edad no especificada';

  let memorySection = '';
  if (memoryFacts.length > 0) {
    const factsText = memoryFacts.map((f) => `- ${f.key}: ${f.value}`).join('\n');
    memorySection = `

Cosas que ya sabes de esta familia (memoria de conversaciones anteriores):
${factsText}

Usa esta información para dar respuestas más personalizadas y contextuales. No repitas estos datos a menos que sean relevantes para la pregunta.`;
  }

  return `Eres Nani, una asistente de crianza cálida, empática y práctica dentro de la app KIDS.

Tu personalidad:
- Hablas como una amiga cercana que sabe mucho de niños, no como una doctora ni una enciclopedia.
- Usas siempre el nombre del niño (${child.nickname || child.name}) y del padre/madre (${parent.name}).
- Das consejos cortos, concretos y accionables.
- Respondes en español latinoamericano, con tono cercano y cariñoso.
- Puedes usar emojis con moderación para dar calidez.
- Tus respuestas deben ser concisas: máximo 3-4 oraciones por mensaje, a menos que el tema requiera más detalle.

Contexto de la familia:
- Padre/madre: ${parent.name} (${parent.relationship || 'padre/madre'})
- Niño/a: ${child.nickname || child.name}, ${ageText}
- Ciudad: ${child.city || home?.city || 'no especificada'}
- Color favorito: ${child.favorites?.color || 'no especificado'}
- Animal favorito: ${child.favorites?.animal || 'no especificado'}
${home ? `- Mascotas en casa: ${home.hasPets ? 'sí' : 'no'}` : ''}
${home?.sleepTime ? `- Hora de dormir: ${home.sleepTime}` : ''}
${home?.mealTime ? `- Hora de comidas: ${home.mealTime}` : ''}
${memorySection}

Reglas estrictas:
1. NUNCA diagnostiques enfermedades ni recomiendas medicamentos.
2. Ante síntomas preocupantes o emergencias, di: "Te recomiendo que contactes a tu pediatra o vayas a urgencias. Yo puedo ayudarte con muchas cosas, pero esto necesita un profesional."
3. No contradigas indicaciones de profesionales de salud.
4. Si no tienes información suficiente para dar un buen consejo, pregunta con empatía antes de responder.
5. Adapta tus respuestas a la edad del niño. Lo que aplica para un bebé de 3 meses no aplica para uno de 2 años.`;
}

async function extractFacts(
  messages: { role: 'user' | 'assistant'; content: string }[],
  childName: string,
  existingFacts: MemoryFact[] = []
): Promise<MemoryFact[]> {
  // Solo extraer si hay al menos 2 mensajes (un intercambio completo)
  if (messages.length < 2) return [];

  // Tomar los últimos 4 mensajes para la extracción
  const recentMessages = messages.slice(-4);
  const conversation = recentMessages
    .map((m) => `${m.role === 'user' ? 'Padre/madre' : 'Nani'}: ${m.content}`)
    .join('\n');

  const existingFactsText = existingFacts.length > 0
    ? `\n\nHechos YA guardados (NO los repitas ni crees variaciones de estos):\n${existingFacts.map((f) => `- ${f.key}: ${f.value}`).join('\n')}`
    : '';

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: `Analiza esta conversación sobre ${childName} y extrae SOLO hechos NUEVOS, concretos y relevantes que valgan la pena recordar para futuras conversaciones.

Reglas estrictas:
1. Responde ÚNICAMENTE en formato JSON: un array de objetos con "key" y "value".
2. "key" debe ser una categoría corta y única en snake_case (ej: "alergia_lactosa", "primer_diente", "miedo_oscuridad")
3. NO crees keys diferentes para el mismo hecho (ej: NO uses "hora_dormir" Y "horario_sueño" para lo mismo)
4. Si un hecho ya existe pero con información actualizada, usa la MISMA key para que se actualice
5. Si NO hay hechos nuevos, responde: []
6. NO extraigas: saludos, preguntas genéricas, opiniones o recomendaciones de Nani
7. Solo extrae información que viene del padre/madre, no inferencias de Nani

Hechos relevantes: hitos del desarrollo, alergias, preferencias alimentarias, problemas de sueño, enfermedades, logros, miedos, rutinas confirmadas por el padre/madre.${existingFactsText}`,
      messages: [{ role: 'user', content: conversation }],
    });

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    // Extraer JSON del texto
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const facts: MemoryFact[] = JSON.parse(jsonMatch[0]);
    return facts.filter((f) => f.key && f.value);
  } catch (error) {
    console.error('Error extracting facts:', error);
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, parent, child, home, memoryFacts = [] } = req.body as ChatRequestBody;

    if (!messages || !parent || !child) {
      return res.status(400).json({ error: 'Missing required fields: messages, parent, child' });
    }

    const systemPrompt = buildSystemPrompt(parent, child, home, memoryFacts);

    // 1. Obtener respuesta de Nani
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages: messages.slice(-20),
    });

    const reply = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    // 2. Extraer hechos nuevos (con contexto de hechos existentes para evitar duplicados)
    const messagesWithReply = [...messages.slice(-4), { role: 'assistant' as const, content: reply }];
    const newFacts = await extractFacts(messagesWithReply, child.nickname || child.name, memoryFacts);

    return res.status(200).json({ reply, newFacts });
  } catch (error) {
    console.error('Nani API error:', error);
    return res.status(500).json({ error: 'Error al comunicarse con Nani. Intenta de nuevo.' });
  }
}
