import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Cloud, Compass, Heart, User, Send, ChevronUp, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'nani';
  timestamp: Date;
}

interface HomeProps {
  parentName?: string;
  childName?: string;
  onChatWithNani: () => void;
  onNavigate: (route: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  parentName,
  childName,
  onChatWithNani,
  onNavigate,
}) => {
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hola ${parentName || 'mamá'} 💙 ¿En qué te puedo ayudar hoy?`,
      sender: 'nani',
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'user',
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');

    // Simular respuesta de Nani
    setTimeout(() => {
      const naniResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: '¡Perfecto! Estoy aquí para ayudarte. ¿Hay algo específico sobre tu hij@ en lo que pueda asistirte? 💙',
        sender: 'nani',
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, naniResponse]);
    }, 1000);
  };

  const quickActions = [
    { label: 'Tips de sueño', action: 'sueño' },
    { label: 'Ver planes', action: 'planes' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-pink-50 p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Saludo personalizado */}
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-bold text-gray-800 font-poppins-rounded">
            {getGreeting()}, {parentName || 'Mamá'} ☀️
          </h1>
        </div>

        {/* Card principal */}
        <Card className="bg-gradient-to-br from-lavender-200 to-pink-200 border-0 rounded-3xl p-6 shadow-lg">
          <div className="text-center space-y-3">
            <p className="text-xl text-gray-800 font-nunito">
              Hoy <span className="font-bold">{childName || 'tu hij@'}</span> es un niñ@ hermos@ en crecimiento
            </p>
            <div className="text-6xl">🌱</div>
          </div>
        </Card>

        {/* Chat integrado expandido con Nani */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 rounded-3xl shadow-xl overflow-hidden">
          {/* Header del chat */}
          <div className="bg-gradient-to-r from-lavender-300 to-pink-300 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="bg-white">
                <AvatarFallback>
                  <Cloud className="w-6 h-6 text-lavender-600" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-800 font-nunito">Nani</p>
                <p className="text-xs text-gray-600">Asistente personal 💬</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatExpanded(!isChatExpanded)}
                className="rounded-full p-2 text-white hover:bg-white/20"
              >
                <ChevronUp className={`w-4 h-4 transition-transform ${isChatExpanded ? 'rotate-180' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onChatWithNani}
                className="rounded-full p-2 text-white hover:bg-white/20"
                title="Abrir chat completo"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Área de mensajes - expandida por defecto */}
          {isChatExpanded && (
            <>
              <div className="max-h-64 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-white to-lavender-50/30">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        message.sender === 'user'
                          ? 'bg-lavender-400 text-white'
                          : 'bg-white text-gray-800 shadow-sm border border-lavender-100'
                      }`}
                    >
                      <p className="font-nunito text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chips de acción rápida */}
              {chatMessages.length <= 2 && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <Button
                        key={action.action}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const actionMsg: Message = {
                            id: Date.now().toString(),
                            text: action.label,
                            sender: 'user',
                            timestamp: new Date(),
                          };
                          setChatMessages((prev) => [...prev, actionMsg]);
                        }}
                        className="rounded-full bg-white/80 border-lavender-300 text-gray-700 hover:bg-lavender-100 font-nunito text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input del chat */}
              <form onSubmit={handleChatSend} className="p-4 border-t border-lavender-100 bg-white">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escribe a Nani..."
                    className="rounded-full border-lavender-200 focus:border-lavender-400 flex-1 text-sm"
                  />
                  <Button
                    type="submit"
                    className="rounded-full bg-lavender-400 hover:bg-lavender-500 text-white p-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* Estado colapsado */}
          {!isChatExpanded && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600 font-nunito">
                Haz clic en <ChevronUp className="w-4 h-4 inline rotate-180" /> para expandir el chat
              </p>
            </div>
          )}
        </Card>

        {/* Atajos rápidos — mismos destinos que la barra inferior */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Card
            onClick={() => onNavigate('chat')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-0"
          >
            <div className="flex flex-col items-center space-y-3">
              <MessageCircle className="w-8 h-8 text-lavender-500" />
              <p className="font-nunito font-semibold text-gray-700">Chat</p>
            </div>
          </Card>

          <Card
            onClick={() => onNavigate('explore')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-0"
          >
            <div className="flex flex-col items-center space-y-3">
              <Compass className="w-8 h-8 text-lavender-500" />
              <p className="font-nunito font-semibold text-gray-700">Explorar</p>
            </div>
          </Card>

          <Card
            onClick={() => onNavigate('moments')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-0"
          >
            <div className="flex flex-col items-center space-y-3">
              <Heart className="w-8 h-8 text-lavender-500" />
              <p className="font-nunito font-semibold text-gray-700">Momentos</p>
            </div>
          </Card>

          <Card
            onClick={() => onNavigate('profile')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-0"
          >
            <div className="flex flex-col items-center space-y-3">
              <User className="w-8 h-8 text-lavender-500" />
              <p className="font-nunito font-semibold text-gray-700">Perfil</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

