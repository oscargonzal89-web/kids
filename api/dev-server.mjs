/**
 * Servidor local de desarrollo para probar las serverless functions.
 * Uso: node api/dev-server.mjs
 * Corre en puerto 3001 y Vite hace proxy desde /api/* hacia aquí.
 *
 * La lógica de Nani vive en `_nani-prompt.mjs`, el mismo módulo que importa
 * `chat.ts` en producción. Este archivo es solo el adaptador HTTP local.
 */
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { chatWithNani } from './_nani-prompt.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cargar .env.local
const envPath = resolve(__dirname, '..', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      process.env[trimmed.slice(0, eqIndex)] = trimmed.slice(eqIndex + 1);
    }
  }
} catch { /* no env file */ }

const Anthropic = (await import('@anthropic-ai/sdk')).default;
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function handleChat(req, res) {
  let body = '';
  for await (const chunk of req) body += chunk;

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return json(res, 400, { error: 'Invalid JSON body' });
  }

  const { messages, parent, child, home, memoryFacts = [] } = payload;

  if (!messages || !parent || !child) {
    return json(res, 400, { error: 'Missing required fields' });
  }

  try {
    const result = await chatWithNani(anthropic, { messages, parent, child, home, memoryFacts });
    return json(res, 200, result);
  } catch (error) {
    console.error('Nani API error:', error);
    return json(res, 500, { error: 'Error al comunicarse con Nani. Intenta de nuevo.' });
  }
}

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    await handleChat(req, res);
  } else {
    json(res, 404, { error: 'Not found' });
  }
});

server.listen(3001, () => {
  console.log('🤖 Nani API dev server running on http://localhost:3001');
  console.log('   Memory facts: enabled');
  console.log('   Prompt: api/_nani-prompt.mjs (compartido con producción)');
});
