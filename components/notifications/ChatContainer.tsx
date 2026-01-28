
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, BrainCircuit, ShieldCheck, Target, Zap } from 'lucide-react';
import { Message, IdeaMetrics } from '../../types';
import { sendMessageToAI } from '../../services/geminiService';
import { TypewriterText } from '../TypewriterText';

interface ChatContainerProps {
  onMetricsUpdate: (metrics: IdeaMetrics) => void;
  currentMetrics?: IdeaMetrics | null;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ onMetricsUpdate, currentMetrics }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Namaste! I'm **Growth**. How can I help you build today?",
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }]
      }));

      // Fix: Destructure text from the response object to solve type errors on lines 53, 65, and 74
      const { text: responseText } = await sendMessageToAI(userMsg.content, history);
      
      const metricsMatch = responseText.match(/\{"metrics":\s*\{.*\}\}/);
      let cleanResponse = responseText;
      
      if (metricsMatch) {
        try {
          const metricsData = JSON.parse(metricsMatch[0]).metrics;
          onMetricsUpdate({
            viabilityScore: metricsData.score,
            marketDemand: metricsData.demand,
            competitionLevel: metricsData.competition,
            isDiscovery: false
          });
          cleanResponse = responseText.replace(metricsMatch[0], '').trim();
        } catch (e) {
          console.error("Failed to parse metrics JSON", e);
        }
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanResponse,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Network error detected. Please check your connection and try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[640px] w-full max-w-[540px] glass-panel rounded-[2rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] relative border border-white/10">
      <div className="bg-[#121417]/95 backdrop-blur-xl p-5 border-b border-white/10 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#10B981] flex items-center justify-center shadow-[0_10px_20px_rgba(16,185,129,0.3)]">
            <BrainCircuit className="text-white w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2 tracking-tight uppercase">
              Growth
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest border border-green-500/20">Live Analysis</span>
            </h3>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              VC-Grade Validation Engine
            </span>
          </div>
        </div>
        
        {currentMetrics && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl animate-in zoom-in duration-500">
            <Target className="w-4 h-4 text-[#10B981]" />
            <span className="text-[11px] font-black text-[#10B981] tracking-tighter uppercase">VIABILITY: {currentMetrics.viabilityScore}%</span>
          </div>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 bg-gradient-to-b from-[#121417]/30 to-[#0B0B0F]/50 custom-scrollbar"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
          >
            <div 
              className={`max-w-[92%] px-6 py-5 rounded-[1.5rem] text-sm leading-[1.6] ${
                msg.role === 'user' 
                  ? 'bg-white text-black rounded-br-none shadow-2xl font-bold border border-white' 
                  : 'bg-[#1A1D21] text-gray-200 rounded-bl-none border border-white/5 shadow-xl'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-invert prose-sm max-w-none">
                   <TypewriterText text={msg.content} />
                </div>
              ) : (
                msg.content
              )}
            </div>
            <div className="flex items-center gap-2 mt-3 px-1">
               {msg.role === 'assistant' && <ShieldCheck className="w-3.5 h-3.5 text-green-500/40" />}
               <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">
                {msg.role === 'assistant' ? 'Intelligence Report' : 'Founder Input'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start animate-in fade-in duration-300">
            <div className="flex items-center gap-3 p-5 bg-[#1A1D21] rounded-2xl rounded-bl-none border border-white/5 shadow-inner">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full animate-bounce [animation-duration:0.6s]" />
                <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]" />
                <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.4s]" />
              </div>
              <span className="text-[10px] text-[#10B981] font-black uppercase tracking-[0.2em] ml-2 animate-pulse">Scanning Bharat Vectors...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-[#121417] border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
        <div className="relative flex items-center group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your Bharat startup idea..."
            className="w-full bg-[#0B0B0F] text-white text-base rounded-[1.25rem] pl-6 pr-16 py-5 border border-white/10 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 transition-all placeholder:text-gray-700 font-bold"
          />
          <button 
            onClick={handleSend}
            disabled={isTyping || !inputValue.trim()}
            className="absolute right-2.5 p-3 bg-[#10B981] hover:bg-[#059669] disabled:bg-gray-900 disabled:text-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all active:scale-95 shadow-xl group-focus-within:shadow-[#10B981]/20"
          >
            {isTyping ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
          </button>
        </div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-[9px] text-gray-700 uppercase tracking-[0.2em] font-black">Powered by Growth Logic Core</p>
          <div className="flex gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
             <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
             <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
};
