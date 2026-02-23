import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Cloud, Send } from 'lucide-react';
import { BottomNav } from './BottomNav';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'nani';
  timestamp: Date;
}

interface ChatProps {
  parentName?: string;
  childName?: string;
  onNavigate?: (route: string) => void;
}

export const Chat: React.FC<ChatProps> = ({ parentName, childName, onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hola ${parentName || 'mamá'}, Saludame a ${childName || 'tu hij@'} 💙 ¿En qué te puedo ayudar?`,
      sender: 'nani',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { label: 'Ver planes', action: 'planes' },
    { label: 'Tips de sueño', action: 'sueño' },
    { label: 'Marketplace', action: 'marketplace' },
    { label: 'Agenda', action: 'agenda' },
    { label: 'Rutinas', action: 'rutinas' },
    { label: 'Comunidad', action: 'comunidad' },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Simular respuesta de Nani (aquí se integraría con Gemini API)
    setTimeout(() => {
      const naniResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: '¡Gracias por tu mensaje! Estoy aquí para ayudarte en todo lo que necesites. ¿Hay algo específico en lo que pueda asistirte hoy? 💙',
        sender: 'nani',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, naniResponse]);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    const actionMessage: Message = {
      id: Date.now().toString(),
      text: action,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, actionMessage]);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-lavender-100 to-pink-100 flex flex-col pb-20">
        {/* Header fijo */}
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

        {/* Mensajes */}
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

        {/* Chips de acción rápida */}
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

        {/* Input fijo */}
        <form onSubmit={handleSend} className="bg-white/90 backdrop-blur-sm border-t border-lavender-200 p-4 sticky bottom-0">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe un mensaje a Nani..."
              className="rounded-full border-lavender-200 focus:border-lavender-400 flex-1"
            />
            <Button
              type="submit"
              className="rounded-full bg-lavender-400 hover:bg-lavender-500 text-white p-3 shadow-lg"
            >
              <Send className="w-5 h-5" />
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

