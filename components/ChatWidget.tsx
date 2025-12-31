import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '您好，我是艺美整形中心的智能顾问。请问有什么可以帮您？无论是关于手术项目、术后恢复还是预约流程，我都可以为您解答。' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(userText);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "抱歉，由于网络问题，我暂时无法回答。请稍后再试。", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center ${
          isOpen ? 'bg-stone-800 rotate-90' : 'bg-gold-500 animate-bounce-slow'
        }`}
      >
        {isOpen ? <X className="text-white w-6 h-6" /> : <MessageCircle className="text-white w-8 h-8" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-[380px] h-[500px] bg-white rounded-lg shadow-2xl flex flex-col border border-stone-100 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-navy-900 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
               <Bot className="text-navy-900 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-serif tracking-wide">艺美智能顾问</h3>
              <p className="text-gold-400 text-xs">24/7 在线为您解答</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-stone-50 space-y-4 scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gold-500 text-white rounded-tr-none' 
                      : 'bg-white text-stone-700 shadow-sm border border-stone-100 rounded-tl-none'
                  } ${msg.isError ? 'border-red-300 text-red-600 bg-red-50' : ''}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-stone-100 flex space-x-1">
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-200"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-stone-100">
            <div className="flex items-center gap-2 bg-stone-50 rounded-full px-4 py-2 border border-stone-200 focus-within:border-gold-500 transition-colors">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="询问关于双眼皮、隆鼻等问题..."
                className="flex-1 bg-transparent outline-none text-sm text-stone-700 placeholder-stone-400"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className={`p-1.5 rounded-full transition-colors ${
                  inputValue.trim() ? 'bg-gold-500 text-white hover:bg-gold-600' : 'bg-stone-200 text-stone-400'
                }`}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;