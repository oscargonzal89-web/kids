import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Cloud, Send, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'nani';
  timestamp: Date;
}

interface ChatWithNaniProps {
  parentName?: string;
  childName?: string;
  onBack: () => void;
}

export const ChatWithNani: React.FC<ChatWithNaniProps> = ({
  parentName,
  childName,
  onBack,
}) => {
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
      text: `Ver ${action}`,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, actionMessage]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender-100 to-pink-100 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-lavender-200 p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="rounded-full p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="bg-lavender-200">
          <AvatarFallback>
            <Cloud className="w-6 h-6 text-lavender-600" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-gray-800 font-nunito">Nani</p>
          <p className="text-xs text-gray-500">En línea</p>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
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
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.action}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.label)}
                className="rounded-full bg-white/80 border-lavender-300 text-gray-700 hover:bg-lavender-100 font-nunito"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="bg-white/80 backdrop-blur-sm border-t border-lavender-200 p-4">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="rounded-full border-lavender-200 focus:border-lavender-400 flex-1"
          />
          <Button
            type="submit"
            className="rounded-full bg-lavender-400 hover:bg-lavender-500 text-white p-3"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};


