import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Cloud, Send, Loader2 } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { getOrCreateSession, getMessages, addMessage, type ChatMessageRow } from '../services/chat.service';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'nani';
  timestamp: Date;
}

interface ChatProps {
  parentName?: string;
  childName?: string;
  childId?: string;
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

const PLACEHOLDER_REPLY = '¡Gracias por tu mensaje! Estoy aquí para ayudarte en todo lo que necesites. ¿Hay algo específico en lo que pueda asistirte hoy? 💙';

export const Chat: React.FC<ChatProps> = ({ parentName, childName, childId, onNavigate }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(!!childId);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const welcomeMessage: Message = {
    id: 'welcome',
    text: `Hola ${parentName || 'mamá'}, Saludame a ${childName || 'tu hij@'} 💙 ¿En qué te puedo ayudar?`,
    sender: 'nani',
    timestamp: new Date(),
  };

  useEffect(() => {
    if (!childId) {
      setMessages([welcomeMessage]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getOrCreateSession(childId)
      .then((session) => {
        if (cancelled) return;
        setSessionId(session.id);
        return getMessages(session.id);
      })
      .then((rows) => {
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
  }, [childId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');

    if (sessionId && childId) {
      setSending(true);
      try {
        const userRow = await addMessage(sessionId, childId, 'user', text);
        setMessages((prev) => [...prev, messageFromRow(userRow)]);

        const assistantRow = await addMessage(sessionId, childId, 'assistant', PLACEHOLDER_REPLY);
        setMessages((prev) => [...prev, messageFromRow(assistantRow)]);
      } catch (err) {
        console.error('Error sending message:', err);
      } finally {
        setSending(false);
      }
    } else {
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: PLACEHOLDER_REPLY,
            sender: 'nani',
            timestamp: new Date(),
          },
        ]);
      }, 1000);
    }
  };

  const handleQuickAction = (action: string) => {
    const actionMessage: Message = {
      id: Date.now().toString(),
      text: action,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, actionMessage]);
    if (sessionId && childId) {
      addMessage(sessionId, childId, 'user', action).catch((err) => console.error(err));
    }
  };

  const quickActions = [
    { label: 'Ver planes', action: 'planes' },
    { label: 'Tips de sueño', action: 'sueño' },
    { label: 'Marketplace', action: 'marketplace' },
    { label: 'Agenda', action: 'agenda' },
    { label: 'Rutinas', action: 'rutinas' },
    { label: 'Comunidad', action: 'comunidad' },
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
            <p className="text-xs text-gray-500">Asistente personal • En línea</p>
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
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 2 && (
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
              disabled={sending}
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
