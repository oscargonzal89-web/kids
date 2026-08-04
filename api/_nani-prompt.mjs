/**
 * Núcleo compartido de Nani — personalidad, contexto y memoria.
 *
 * Único lugar donde vive el system prompt. Lo importan:
 *   - api/chat.ts        → producción (Vercel Function)
 *   - api/dev-server.mjs → desarrollo local
 *
 * Cambiar el tono de Nani aquí afecta a los dos. Antes estaba escrito dos
 * veces y las versiones podían divergir sin que nadie lo notara (ítems A4 + C2
 * de PRIORIZACION_NANI.md).
 *
 * ESM plano a propósito: `dev-server.mjs` lo corre `node` directamente, sin
 * transpilar, así que no puede ser TypeScript. Los tipos viven en el .d.ts
 * de al lado. El prefijo `_` evita que Vercel lo trate como endpoint.
 */

/** Modelo de Claude que usa Nani. Cambiarlo aquí lo cambia en local y en producción. */
export const NANI_MODEL = 'claude-haiku-4-5-20251001';

/** Tokens máximos por respuesta de Nani en el chat. */
const MAX_TOKENS_REPLY = 500;

/** Tokens máximos para la extracción de hechos (devuelve JSON corto). */
const MAX_TOKENS_FACTS = 200;

/** Mensajes de historial que se envían como contexto de la conversación. */
const HISTORY_WINDOW = 20;

/** Mensajes recientes que se analizan para extraer hechos nuevos. */
const EXTRACTION_WINDOW = 4;

export function calculateAgeMonths(birthDate) {
  const birth = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

function formatAge(child) {
  const ageMonths = child.birthDate ? calculateAgeMonths(child.birthDate) : child.ageMonths;
  if (ageMonths === undefined) return 'edad no especificada';
  return ageMonths >= 12
    ? `${Math.floor(ageMonths / 12)} año(s) y ${ageMonths % 12} mes(es)`
    : `${ageMonths} mes(es)`;
}

/**
 * Sección de planes del prompt. Cubre dos ítems:
 *   D5 — Nani conoce el catálogo real y puede recomendar (rol "Conectora" del PRD).
 *   C3 — Nani nota qué planes guardó u ocultó el padre/madre.
 *
 * Las reglas son deliberadamente estrictas en un punto: Nani NO debe inventar
 * lugares, horarios ni precios. Un plan inventado en una app de crianza no es
 * un detalle: es alguien saliendo con un bebé a un sitio que no existe.
 */
function buildPlansSection(planContext, childLabel, city) {
  if (!planContext) return '';
  const { available = [], saved = [], hidden = [] } = planContext;
  if (available.length === 0 && saved.length === 0 && hidden.length === 0) return '';

  let section = '';

  if (available.length > 0) {
    const list = available
      .map((p) => {
        const meta = [p.category, p.costLevel, p.durationMinutes ? `~${p.durationMinutes} min` : null]
          .filter(Boolean)
          .join(', ');
        return `- ${p.title}${meta ? ` (${meta})` : ''}${p.description ? `: ${p.description}` : ''}`;
      })
      .join('\n');

    section += `

Planes reales disponibles${city ? ` en ${city}` : ''}, ya filtrados para la edad de ${childLabel}:
${list}

Reglas sobre los planes:
1. Recomiéndalos solo cuando venga al caso: si te preguntan qué hacer, piden ideas de actividades, o mencionan que tienen un rato libre o un fin de semana. No los saques de la nada.
2. Máximo 2 por respuesta, y explica por qué le sirven a ${childLabel} a su edad.
3. NUNCA inventes planes, lugares, horarios ni precios. Si ninguno de la lista encaja con lo que te piden, dilo con naturalidad y da una idea general sin nombrar un lugar específico.`;
  }

  if (saved.length > 0) {
    section += `

Planes que ${childLabel === 'tu hij@' ? 'ya guardaron' : 'ya guardaron para ' + childLabel}: ${saved.join(', ')}.
Le interesaron, así que prioriza planes parecidos a estos.`;
  }

  if (hidden.length > 0) {
    section += `

Planes que descartaron: ${hidden.join(', ')}.
No los recomiendes ni insistas con planes muy parecidos.`;
  }

  return section;
}

export function buildSystemPrompt(parent, child, home, memoryFacts = [], planContext = null) {
  const ageText = formatAge(child);

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
${memorySection}${buildPlansSection(planContext, child.nickname || child.name || 'tu hij@', child.city || home?.city)}

Reglas estrictas:
1. NUNCA diagnostiques enfermedades ni recomiendas medicamentos.
2. Ante síntomas preocupantes o emergencias, di: "Te recomiendo que contactes a tu pediatra o vayas a urgencias. Yo puedo ayudarte con muchas cosas, pero esto necesita un profesional."
3. No contradigas indicaciones de profesionales de salud.
4. Si no tienes información suficiente para dar un buen consejo, pregunta con empatía antes de responder.
5. Adapta tus respuestas a la edad del niño. Lo que aplica para un bebé de 3 meses no aplica para uno de 2 años.`;
}

function buildExtractionPrompt(childName, existingFacts = []) {
  const existingFactsText = existingFacts.length > 0
    ? `\n\nHechos YA guardados (NO los repitas ni crees variaciones de estos):\n${existingFacts.map((f) => `- ${f.key}: ${f.value}`).join('\n')}`
    : '';

  return `Analiza esta conversación sobre ${childName} y extrae SOLO hechos NUEVOS, concretos y relevantes que valgan la pena recordar para futuras conversaciones.

Reglas estrictas:
1. Responde ÚNICAMENTE en formato JSON: un array de objetos con "key" y "value".
2. "key" debe ser una categoría corta y única en snake_case (ej: "alergia_lactosa", "primer_diente", "miedo_oscuridad")
3. NO crees keys diferentes para el mismo hecho (ej: NO uses "hora_dormir" Y "horario_sueño" para lo mismo)
4. Si un hecho ya existe pero con información actualizada, usa la MISMA key para que se actualice
5. Si NO hay hechos nuevos, responde: []
6. NO extraigas: saludos, preguntas genéricas, opiniones o recomendaciones de Nani
7. Solo extrae información que viene del padre/madre, no inferencias de Nani

Hechos relevantes: hitos del desarrollo, alergias, preferencias alimentarias, problemas de sueño, enfermedades, logros, miedos, rutinas confirmadas por el padre/madre.${existingFactsText}`;
}

function textOf(response) {
  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');
}

async function extractFacts(anthropic, messages, childName, existingFacts = []) {
  // Sin un intercambio completo no hay nada que extraer.
  if (messages.length < 2) return [];

  const conversation = messages
    .slice(-EXTRACTION_WINDOW)
    .map((m) => `${m.role === 'user' ? 'Padre/madre' : 'Nani'}: ${m.content}`)
    .join('\n');

  try {
    const response = await anthropic.messages.create({
      model: NANI_MODEL,
      max_tokens: MAX_TOKENS_FACTS,
      system: buildExtractionPrompt(childName, existingFacts),
      messages: [{ role: 'user', content: conversation }],
    });

    const jsonMatch = textOf(response).match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    return JSON.parse(jsonMatch[0]).filter((f) => f.key && f.value);
  } catch (error) {
    console.error('Error extracting facts:', error);
    return [];
  }
}

/**
 * Una vuelta completa de conversación con Nani: responde y actualiza memoria.
 * Los handlers HTTP solo validan la petición y serializan lo que devuelve esto.
 */
export async function chatWithNani(
  anthropic,
  { messages, parent, child, home, memoryFacts = [], planContext = null }
) {
  const response = await anthropic.messages.create({
    model: NANI_MODEL,
    max_tokens: MAX_TOKENS_REPLY,
    system: buildSystemPrompt(parent, child, home, memoryFacts, planContext),
    messages: messages.slice(-HISTORY_WINDOW),
  });

  const reply = textOf(response);

  const newFacts = await extractFacts(
    anthropic,
    [...messages.slice(-EXTRACTION_WINDOW), { role: 'assistant', content: reply }],
    child.nickname || child.name,
    memoryFacts
  );

  return { reply, newFacts };
}
