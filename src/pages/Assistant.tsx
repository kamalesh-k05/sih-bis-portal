import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Bot, User, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { translations } from '../data/translations';
import { INDIAN_STANDARDS } from '../data/standards';
import { searchStandards } from '../utils/searchEngine';
import { validateResponse, getConfidenceLevel, buildSafetyDisclaimer } from '../utils/antiHallucination';
import { generateConversationalResponse } from '../utils/responseGenerator';
import type { ChatMessage } from '../types';

export default function Assistant() {
  const { language, chatMessages, addChatMessage, setUserType } = useAppStore();
  const t = translations[language] || translations['en'];
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserType(null);
    if (chatMessages.length === 0) {
      addChatMessage({
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm the **BIS Assistant**. I can help you with:\n\n• Finding the right Indian Standard for your product\n• Understanding BIS certification requirements\n• Checking if a product is genuine\n• Learning about ISI, HUID, and other BIS marks\n\nJust describe your product or ask a question!`,
        timestamp: new Date(),
        metadata: { confidence: 'high' },
      });
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const processQuery = async (query: string) => {
    const lower = query.toLowerCase();
    
    // Intent detection
    const isProductQuery = /(manufacture|make|sell|produce|create|build|factory|industry|business)/i.test(lower) ||
      /\b(fan|light|bulb|cement|steel|water|toy|cooker|helmet|pipe|glass|oil|shoe|bag|soap|cream|charger)\b/i.test(lower);
    
    const isVerificationQuery = /(verify|check|genuine|fake|authentic|licence|license|isi mark|huid)/i.test(lower);
    
    const isExplanationQuery = /(what is|what does|explain|mean|meaning|understand|tell me about)/i.test(lower);
    
    const isComplaintQuery = /(complaint|report|problem|issue|wrong|defect|quality issue)/i.test(lower);
    
    if (isProductQuery) {
      // Product standards search
      const results = searchStandards(query, INDIAN_STANDARDS, 5);
      
      if (results.length > 0) {
        const conf = getConfidenceLevel(results.map(r => r.standard), results.length);
        let response = `**I understand.** Let me find standards for your product.\n\n`;
        response += `### Found ${results.length} relevant standard${results.length > 1 ? 's' : ''}:\n\n`;
        
        for (const r of results.slice(0, 3)) {
          response += `**${r.standard.id}** - ${r.standard.title}\n`;
          response += `${r.standard.certificationRequired === 'mandatory' ? 'Mandatory' : r.standard.certificationRequired === 'voluntary' ? 'Voluntary' : 'Check QCO'}\n`;
          response += `> ${r.matchReason}\n\n`;
        }
        
        response += `\n**Would you like to:**\n`;
        response += `1. See detailed standard information\n`;
        response += `2. View the certification roadmap\n`;
        response += `3. Check required documents\n\n`;
        response += `_${buildSafetyDisclaimer()}_`;
        
        // Check IS codes
        const check = validateResponse(response);
        
        addChatMessage({
          id: Date.now().toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          metadata: {
            standards: results.map(r => r.standard.id),
            confidence: conf.level,
            sources: results.map(r => r.standard.source),
            isWhitelistValid: check.isValid,
          },
        });
        
        setUserType('business');
      } else {
        addChatMessage({
          id: Date.now().toString(),
          role: 'assistant',
          content: `I couldn't find specific standards matching your description. Could you provide more details?\n\nTry mentioning:\n• The product type (fan, cement, toy, etc.)\n• The material (steel, plastic, aluminium)\n• The intended use (domestic, industrial, commercial)`,
          timestamp: new Date(),
          metadata: { confidence: 'low' },
        });
      }
    } else if (isVerificationQuery) {
      setUserType('consumer');
      addChatMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `I can help you verify a product! Here's what you can do:\n\n**To verify a product:**\n1. Go to **Verify Product** page\n2. Enter the licence number (found near the BIS/ISI mark)\n3. Or upload a photo of the product label\n\n**Quick verification tips:**\n• Look for the ISI mark or BIS Standard Mark on the product\n• Note the licence number (format: CM/L-XXXXXXXX)\n• Check if the mark looks properly printed/embossed\n\n**For gold jewellery:**\n• Look for the HUID code (6-character code)\n• Verify through the BIS Care app\n\nWould you like me to take you to the verification page?`,
        timestamp: new Date(),
        metadata: { confidence: 'high' },
      });
    } else if (isExplanationQuery) {
      const response = generateConversationalResponse(query);
      addChatMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: { confidence: 'high', isWhitelistValid: true },
      });
    } else if (isComplaintQuery) {
      addChatMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `I understand you have a concern. Here's how you can report a problem:\n\n**To file a quality complaint:**\n1. Go to the **Help** page\n2. Use the complaint form\n3. Provide product details and evidence\n\n**For fake BIS marks:**\n• Report to BIS through their official complaint portal\n• Provide photos of the product and mark\n• Include purchase details if possible\n\n**Official BIS complaint channels:**\n• BIS website: bis.gov.in\n• BIS Care App\n• Regional BIS offices\n\nWould you like me to help you with anything else?`,
        timestamp: new Date(),
        metadata: { confidence: 'high' },
      });
    } else {
      addChatMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: generateConversationalResponse(query),
        timestamp: new Date(),
        metadata: { confidence: 'medium', isWhitelistValid: true },
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    
    addChatMessage(userMsg);
    setInput('');
    setIsTyping(true);
    
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
    await processQuery(userMsg.content);
    
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          <Link to="/" className="hover:text-saffron-300">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-saffron-400 font-medium">BIS Assistant</span>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-saffron-500/100/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-saffron-400" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-saffron-500/100 text-black'
                  : 'bg-[#0d1424] border border-white/10'
              }`}>
                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'text-black' : 'text-slate-200'}`}
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                />
                {msg.metadata?.standards && msg.metadata.standards.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap gap-1">
                    {msg.metadata.standards.map((s) => (
                      <span key={s} className="text-[10px] font-mono bg-saffron-500/100/10 text-saffron-400 px-2 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                )}
                {msg.metadata?.confidence && (
                  <div className="mt-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      msg.metadata.confidence === 'high' ? 'bg-emerald-400/10 text-emerald-300' :
                      msg.metadata.confidence === 'medium' ? 'bg-amber-400/10 text-amber-300' :
                      'bg-white/10 text-slate-300'
                    }`}>
                      {msg.metadata.confidence === 'high' ? '✓ Verified' :
                       msg.metadata.confidence === 'medium' ? '◐ Partial' : '? Needs info'}
                    </span>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-saffron-500/100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-black" />
                </div>
              )}
            </motion.div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-saffron-500/100/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-saffron-400" />
              </div>
              <div className="bg-[#0d1424] border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-white/10 bg-[#0d1424] rounded-2xl p-3 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.assistantPlaceholder}
            className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent text-slate-200 placeholder:text-slate-400"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2.5 bg-saffron-500/100 text-black rounded-xl hover:bg-saffron-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/^### (.*$)/gm, '<h3 class="font-bold text-base mt-3 mb-1">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="font-bold text-lg mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="font-bold text-xl mt-4 mb-2">$1</h1>')
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-2 border-saffron-400/50 pl-3 text-slate-300 italic my-1">$1</blockquote>')
    .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 list-decimal text-sm">$2</li>')
    .replace(/\n/g, '<br/>');
}
