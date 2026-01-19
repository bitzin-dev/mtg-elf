
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { generateMTGAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AIAssistantProps {
  externalIsOpen?: boolean;
  onToggleExternal?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ externalIsOpen, onToggleExternal }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use external control if provided, otherwise internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggleOpen = onToggleExternal || (() => setInternalIsOpen(!internalIsOpen));

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Olá! Sou o Oráculo da ColeçãoMTG. Posso ajudar com dicas de deck, regras ou sugestões de cartas.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await generateMTGAdvice(userMsg.text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      // Clean error handling without console spam
      const errorMsg: ChatMessage = {
         id: (Date.now() + 1).toString(),
         role: 'model',
         text: "Houve um erro de conexão com os planos. Tente novamente mais tarde."
      }
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className={`fixed z-[150] flex flex-col items-start pointer-events-none transition-all duration-300 ${externalIsOpen ? 'bottom-[85px] left-2 right-2 sm:left-6 sm:right-auto sm:bottom-6' : 'bottom-24 sm:bottom-6 left-4 sm:left-6'}`}>
      
      {/* Chat Window */}
      <div 
        className={`bg-white rounded-lg shadow-2xl border border-gray-200 w-full sm:w-96 mb-0 overflow-hidden transition-all duration-300 origin-bottom-left pointer-events-auto ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 h-0'}`}
      >
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <Sparkles size={18} className="text-yellow-300" />
            <span className="font-bold">Oráculo IA</span>
          </div>
          <button onClick={toggleOpen} className="text-white hover:bg-white/20 rounded p-1">
            <X size={18} />
          </button>
        </div>
        
        <div className="h-80 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white self-end rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none shadow-sm'}`}
            >
              {msg.text}
            </div>
          ))}
          {isLoading && (
             <div className="self-start bg-white border border-gray-200 p-3 rounded-lg rounded-bl-none shadow-sm flex items-center gap-2 text-gray-500 text-xs">
                <Loader2 size={14} className="animate-spin" /> Consultando os tomos...
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pergunte sobre uma carta..."
            className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Toggle Button (Only show if not controlled externally/mobile nav) */}
      {!onToggleExternal && (
          <button 
            onClick={toggleOpen}
            className="pointer-events-auto bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white rounded-full p-4 shadow-lg flex items-center gap-2 transition-transform hover:scale-105 mt-4"
          >
            {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            {!isOpen && <span className="font-medium hidden sm:inline">Ajuda IA</span>}
          </button>
      )}
    </div>
  );
};
