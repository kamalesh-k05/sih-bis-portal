import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Minimize2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { translations } from '../data/translations';
import { INDIAN_STANDARDS } from '../data/standards';
import { searchStandards } from '../utils/searchEngine';
import { validateResponse } from '../utils/antiHallucination';
import { generateConversationalResponse } from '../utils/responseGenerator';
import type { ChatMessage } from '../types';

export default function AssistantChat() {
  const { showAssistant, toggleAssistant, language } = useAppStore();
  const t = translations[language] || translations['en'];
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm the **BIS Assistant**. Ask me anything about Indian Standards and BIS certification.`,
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const processQuery = async (query: string) => {
    const lower = query.toLowerCase();
    const isProductQuery = /(manufacture|make|sell|produce|factory|business)/i.test(lower) ||
      /\b(fan|light|bulb|cement|steel|water|toy|cooker|helmet|pipe|charger|bottle)\b/i.test(lower);
    
    if (isProductQuery) {
      const results = searchStandards(query, INDIAN_STANDARDS, 3);
      if (results.length > 0) {
        let response = `Found ${results.length} standard${results.length > 1 ? 's' : ''}:\n\n`;
        for (const r of results.slice(0, 3)) {
          const cert = r.standard.certificationRequired === 'mandatory' ? 'Mandatory' : 
                      r.standard.certificationRequired === 'voluntary' ? 'Voluntary' : 'Check QCO';
          response += `**${r.standard.id}** - ${r.standard.title}\n${cert}\n\n`;
        }
        const check = validateResponse(response);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          metadata: { standards: results.map(r => r.standard.id), isWhitelistValid: check.isValid },
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Could you describe your product more specifically? Try mentioning the product type, material, or use.',
          timestamp: new Date(),
        }]);
      }
    } else {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: generateConversationalResponse(query),
        timestamp: new Date(),
      }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() }]);
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 500));
    await processQuery(msg);
    setIsTyping(false);
  };

  return (
    <AnimatePresence>
      {showAssistant && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-4 right-4 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-[#0d1424] rounded-2xl border border-white/10 flex flex-col z-50 overflow-hidden shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_20px_50px_-12px_rgba(0,0,0,0.7)]"
        >
          {/* Header */}
          <div className="bg-[#0a0f1c] border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-saffron-500/15 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-saffron-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-50">BIS Assistant</h3>
                <p className="text-[10px] text-slate-400">Ask about Indian Standards</p>
              </div>
            </div>
            <button onClick={toggleAssistant} className="p-1 text-slate-400 hover:text-slate-50">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-saffron-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-saffron-400" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-saffron-500 text-black'
                    : 'bg-white/10 text-slate-200'
                }`}>
                  <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                  {msg.metadata?.standards && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {msg.metadata.standards.map(s => (
                        <span key={s} className="text-[9px] font-mono bg-black/20 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 bg-saffron-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-black" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-7 h-7 bg-saffron-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-saffron-400" />
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-3 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..."
              className="flex-1 text-sm outline-none px-2 text-slate-100 placeholder:text-slate-500 bg-transparent"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-2 bg-saffron-500 text-black rounded-lg hover:bg-saffron-400 disabled:opacity-50 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
