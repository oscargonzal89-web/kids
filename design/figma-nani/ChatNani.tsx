import { motion } from "motion/react";
import { useState } from "react";
import { NaniAvatar } from "../NaniAvatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Send, Calendar, ShoppingBag, Moon, TrendingUp } from "lucide-react@0.487.0";

interface ChatNaniProps {
  parentName: string;
  childName: string;
  onNavigate: (screen: string) => void;
}

interface Message {
  id: string;
  text: string;
  sender: "nani" | "user";
  timestamp: Date;
}

export function ChatNani({ parentName, childName, onNavigate }: ChatNaniProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `${parentName}, ya conozco a ${childName} 💙 ¿Quieres ver las recomendaciones de hoy?`,
      sender: "nani",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  const quickActions = [
    { label: "Ver planes", icon: Calendar, action: () => onNavigate("explorar") },
    { label: "Tips de sueño", icon: Moon, action: () => handleQuickMessage("Dame tips de sueño para bebés") },
    { label: "Marketplace", icon: ShoppingBag, action: () => onNavigate("explorar") },
    { label: "Agenda", icon: TrendingUp, action: () => handleQuickMessage("Muéstrame la agenda de hoy") }
  ];

  const handleQuickMessage = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    
    // Simular respuesta de Nani
    setTimeout(() => {
      const naniResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `Claro, ${parentName}. Para ayudar a ${childName} con el sueño, te recomiendo: 1) Mantener una rutina constante 🌙 2) Baño tibio antes de dormir 🛁 3) Ambiente tranquilo y oscuro ✨`,
        sender: "nani",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, naniResponse]);
    }, 1000);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInputValue("");
    
    // Simular respuesta de Nani
    setTimeout(() => {
      const naniResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `Entiendo tu pregunta sobre ${childName}. Estoy aquí para ayudarte en todo lo que necesites 💙`,
        sender: "nani",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, naniResponse]);
    }, 1000);
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#FFF8F2] flex flex-col pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-[#D6C7F9] to-[#A8D8F9] rounded-b-[32px] p-6 shadow-lg">
        <div className="mb-4">
          <h2 className="text-white mb-1">Nani</h2>
          <p className="text-white/80 text-sm">Tu asistente virtual de crianza</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto px-6 -mt-6">
        <div className="bg-white rounded-[24px] p-6 shadow-xl border-0 min-h-[calc(100vh-300px)]">
          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "nani" && (
                  <div className="flex-shrink-0">
                    <NaniAvatar size="sm" animate={false} />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-[16px] p-4 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-[#F9A8A8] to-[#D6C7F9] text-white rounded-tr-sm"
                      : "bg-[#D6C7F9]/20 text-gray-700 rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </motion.div>
            ))}

            {/* Quick Actions */}
            {messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-3 mt-6"
              >
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={action.action}
                      className="bg-[#FFF8F2] border border-gray-200 rounded-[16px] p-4 hover:border-[#D6C7F9] transition-all flex flex-col items-center gap-2"
                    >
                      <Icon className="text-[#D6C7F9]" size={24} />
                      <span className="text-sm text-gray-700">{action.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Input - Fixed at bottom */}
      <div className="px-6 py-4 bg-[#FFF8F2]">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-[16px] px-4 py-3 shadow-md">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pregunta sobre sueño, alimentación o desarrollo..."
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
          />
          <button
            onClick={handleSend}
            className="w-8 h-8 bg-gradient-to-r from-[#D6C7F9] to-[#F9A8A8] rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
