import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { chatWithNani } from './_nani-prompt.mjs';
import type { NaniTurnInput } from './_nani-prompt.mjs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, parent, child, home, memoryFacts = [], planContext = null } =
    req.body as NaniTurnInput;

  if (!messages || !parent || !child) {
    return res.status(400).json({ error: 'Missing required fields: messages, parent, child' });
  }

  try {
    const { reply, newFacts } = await chatWithNani(anthropic, {
      messages,
      parent,
      child,
      home,
      memoryFacts,
      planContext,
    });

    return res.status(200).json({ reply, newFacts });
  } catch (error) {
    console.error('Nani API error:', error);
    return res.status(500).json({ error: 'Error al comunicarse con Nani. Intenta de nuevo.' });
  }
}
