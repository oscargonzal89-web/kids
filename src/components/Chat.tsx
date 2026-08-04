import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Cloud, Send, Loader2 } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { getOrCreateSession, getMessages, addMessage, type ChatMessageRow } from '../services/chat.service';
import { sendToNani, type NaniContext, type MemoryFact } from '../services/nani.service';
import { getMemoryFacts, saveMemoryFacts } from '../services/memory.service';
import { getPlanContextForNani, type NaniPlanContext } from '../services/explorePlans.service';
import { ageMonthsOrUndefined } from '../lib/age';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'nani';
  timestamp: Date;
}

export interface ChatProps {
  parentName?: string;
  childName?: string;
  childId?: string;
  naniContext?: NaniContext;
  onNavigate?: (route: string) => void;
}

function messageFromRow(row: ChatMessageRow): Message {
  return {
    id: row.id,
    text: row.content,
    sender: row.role === 'user' ? 'user' : 'nani',
    timestamp: new Date(row.created_at),
  };
}

export const Chat: React.FC<ChatProps> = ({ parentName, childName, childId, naniContext, onNavigate }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(!!childId);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [memoryFacts, setMemoryFacts] = useState<MemoryFact[]>([]);
  // D5 + C3: el catálogo de planes y las preferencias del usuario, para que Nani
  // pueda recomendar lugares reales en vez de responder de memoria general.
  const [planContext, setPlanContext] = useState<NaniPlanContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const welcomeMessage: Message = {
    id: 'welcome',
    text: `Hola ${parentName || 'mamá'}, Saludame a ${childName || 'tu hij@'} 💙 ¿En qué te puedo ayudar?`,
    sender: 'nani',
    timestamp: new Date(),
  };

  // Cargar sesión, mensajes y memoria
  useEffect(() => {
    if (!childId) {
      setMessages([welcomeMessage]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getOrCreateSession(childId),
      getMemoryFacts(childId),
      // D5 + C3. Nunca lanza: si falla, devuelve contexto vacío y el chat sigue.
      getPlanContextForNani(
        childId,
        ageMonthsOrUndefined(naniContext?.child?.birthDate),
        naniContext?.child?.city || naniContext?.home?.city
      ),
    ])
      .then(async ([session, facts, plans]) => {
        if (cancelled) return;
        setSessionId(session.id);
        setMemoryFacts(facts.map((f) => ({ key: f.key, value: f.value })));
        setPlanContext(plans);

        const rows = await getMessages(session.id);
        if (cancelled) return;
        if (rows && rows.length > 0) {
          setMessages(rows.map(messageFromRow));
        } else {
          setMessages([welcomeMessage]);
        }
      })
      .catch((err) => {
        if (!cancelled) console.error('Error loading chat:', err);
        setMessages([welcomeMessage]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // Deliberadamente solo depende de childId, no de naniContext: ese objeto se
    // reconstruye en cada render y meterlo aquí dispararía una recarga infinita.
    // El contexto de planes se refresca solo, porque al navegar a Explorar y
    // volver este componente se desmonta y se vuelve a montar.
  }, [childId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /** Construye el historial de mensajes en formato Claude API */
  function buildChatHistory(currentMessages: Message[]): { role: 'user' | 'assistant'; content: string }[] {
    return currentMessages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({
        role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text,
      }));
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;
    const text = inputText.trim();
    setInputText('');
    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    try {
      // Guardar mensaje del usuario en Supabase
      if (sessionId && childId) {
        const userRow = await addMessage(sessionId, childId, 'user', text);
        setMessages((prev) => prev.map((m) => m.id === userMessage.id ? messageFromRow(userRow) : m));
      }

      // Obtener respuesta de Nani (IA real o fallback)
      let naniReply: string;
      let newFacts: MemoryFact[] = [];

      if (naniContext) {
        const history = buildChatHistory([...messages, userMessage]);
        const response = await sendToNani(history, naniContext, memoryFacts, planContext);
        naniReply = response.reply;
        newFacts = response.newFacts;
      } else {
        naniReply = `¡Hola ${parentName || ''}! Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy? 💙`;
      }

      // Guardar respuesta de Nani en Supabase y mostrarla
      if (sessionId && childId) {
        const assistantRow = await addMessage(sessionId, childId, 'assistant', naniReply);
        setMessages((prev) => [...prev, messageFromRow(assistantRow)]);

        // Guardar nuevos hechos en Supabase (en background, no bloquea UI)
        if (newFacts.length > 0) {
          saveMemoryFacts(childId, newFacts)
            .then(() => {
              setMemoryFacts((prev) => {
                const updated = [...prev];
                for (const fact of newFacts) {
                  const existing = updated.findIndex((f) => f.key === fact.key);
                  if (existing >= 0) {
                    updated[existing] = fact;
                  } else {
                    updated.push(fact);
                  }
                }
                return updated;
              });
            })
            .catch((err) => console.error('Error saving memory facts:', err));
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: naniReply,
            sender: 'nani',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('No pude conectar con Nani. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  const handleQuickAction = (label: string) => {
    setInputText(label);
  };

  const quickActions = [
    { label: 'Tips de sueño', action: 'sueño' },
    { label: 'Ideas de actividades', action: 'actividades' },
    { label: 'Alimentación', action: 'alimentación' },
    { label: 'Desarrollo del bebé', action: 'desarrollo' },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-lavender-100 to-pink-100 flex flex-col pb-20">
        <div className="bg-white/90 backdrop-blur-sm border-b border-lavender-200 p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
          <Avatar className="bg-lavender-200 w-12 h-12">
            <AvatarFallback>
              <Cloud className="w-7 h-7 text-lavender-600" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 font-nunito text-lg">Nani</p>
            <p className="text-xs text-gray-500">
              {sending ? 'Escribiendo...' : 'Asistente personal • En línea'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-lavender-500" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl p-4 ${
                      message.sender === 'user'
                        ? 'bg-lavender-400 text-white'
                        : 'bg-white text-gray-800 shadow-md'
                    }`}
                  >
                    <p className="font-nunito text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-lavender-100' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-white text-gray-800 shadow-md rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-lavender-400" />
                      <p className="font-nunito text-sm text-gray-400">Nani está pensando...</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className="px-4 pb-2">
                <p className="text-sm text-red-500 text-center font-nunito">{error}</p>
              </div>
            )}

            {messages.length <= 2 && !sending && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.action}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action.label)}
                      className="rounded-full bg-white/90 border-lavender-300 text-gray-700 hover:bg-lavender-100 font-nunito"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <form onSubmit={handleSend} className="bg-white/90 backdrop-blur-sm border-t border-lavender-200 p-4 sticky bottom-0">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe un mensaje a Nani..."
              className="rounded-full border-lavender-200 focus:border-lavender-400 flex-1"
              disabled={sending}
            />
            <Button
              type="submit"
              className="rounded-full bg-lavender-400 hover:bg-lavender-500 text-white p-3 shadow-lg"
              disabled={sending || !inputText.trim()}
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </form>
      </div>
      <BottomNav
        currentRoute="chat"
        onNavigate={onNavigate || (() => {})}
      />
    </>
  );
};
