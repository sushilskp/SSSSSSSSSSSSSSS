
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Loader2, BrainCircuit, ShieldCheck, Target, Zap, 
  Camera, User, Paperclip, X, Globe
} from 'lucide-react';
import { Message, IdeaMetrics, MessageAttachment, UserProfile } from '../types';
import { sendMessageToAI } from '../services/geminiService';
import { TypewriterText } from './TypewriterText';
import { supabase } from '../services/supabase';
import { communityService } from '../services/communityService';

interface MessageWithSources extends Message {
  sources?: { title: string; uri: string }[];
  isStreaming?: boolean;
}

const BRAND_LOGO = "https://i.postimg.cc/nzhnD7TF/DC77304F-CBB0-4F29-8AEA-65E8503C738E.jpg";

export const ChatContainer: React.FC<{ 
  onMetricsUpdate: (m: IdeaMetrics) => void;
  currentMetrics?: IdeaMetrics | null;
  initialIdea?: string;
  onIdeaProcessed?: () => void;
  onProfileUpdate?: (p: UserProfile) => void;
}> = ({ onMetricsUpdate, currentMetrics, initialIdea, onIdeaProcessed, onProfileUpdate }) => {
  const [messages, setMessages] = useState<MessageWithSources[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const initedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const history = await communityService.getAIHistory();
          if (history.length > 0) {
            setMessages(history);
          } else {
            setMessages([{ id: 'welcome', role: 'assistant', content: "Namaste! 🙏 I'm your Growth partner. What are we building today?", timestamp: Date.now() }]);
          }
        }
      } catch (err) {
        setMessages([{ id: 'welcome', role: 'assistant', content: "Namaste! Logic node active. How can I help?", timestamp: Date.now() }]);
      } finally {
        setLoadingHistory(false);
      }
    };
    initChat();
  }, []);

  const processMessage = useCallback(async (content: string, currentHistory: MessageWithSources[]) => {
    if (isTyping || !content.trim()) return;
    setIsTyping(true);
    
    const assistId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistId, role: 'assistant', content: '', timestamp: Date.now(), isStreaming: true }]);

    try {
      const history = currentHistory.map(m => ({ role: m.role === 'user' ? 'user' as const : 'model' as const, parts: [{ text: m.content }] }));
      const streamData = await sendMessageToAI(content, history);
      const fullRes = streamData.text;

      let clean = fullRes;
      const metricsMatch = fullRes.match(/\{"metrics":\s*\{[\s\S]*?\}\}/);
      if (metricsMatch) {
        try {
          const metrics = JSON.parse(metricsMatch[0]).metrics;
          onMetricsUpdate({ viabilityScore: metrics.score, marketDemand: metrics.demand, competitionLevel: metrics.competition, isDiscovery: false });
          clean = fullRes.replace(metricsMatch[0], '').trim();
        } catch (e) {}
      }

      setMessages(prev => prev.map(m => m.id === assistId ? { ...m, content: clean, isStreaming: false, sources: streamData.sources } : m));
      communityService.saveAIMessage({ role: 'user', content });
      communityService.saveAIMessage({ role: 'assistant', content: clean, sources: streamData.sources });
    } catch (err: any) {
      setMessages(prev => prev.map(m => m.id === assistId ? { ...m, content: `Signal Error: ${err.message}`, isStreaming: false } : m));
    } finally { setIsTyping(false); }
  }, [isTyping, onMetricsUpdate]);

  useEffect(() => {
    if (initialIdea && !loadingHistory && !initedRef.current) {
      initedRef.current = true;
      const msgId = Date.now().toString();
      setMessages(prev => [...prev, { id: msgId, role: 'user', content: initialIdea, timestamp: Date.now() }]);
      processMessage(initialIdea, messages);
      if (onIdeaProcessed) onIdeaProcessed();
    }
  }, [initialIdea, loadingHistory, onIdeaProcessed, processMessage, messages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  if (loadingHistory) return <div className="h-full flex items-center justify-center bg-black"><Loader2 className="w-10 h-10 animate-spin text-[#10B981]" /></div>;

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <div className="px-12 py-6 border-b border-white/10 flex items-center justify-between bg-black/90 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#10B981] overflow-hidden"><img src={BRAND_LOGO} className="w-full h-full object-cover" /></div>
          <div><h3 className="text-xl font-black text-white uppercase">AI Partner</h3><p className="text-[10px] text-gray-500 uppercase font-black">Growth Logic v4.2</p></div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`px-10 py-8 rounded-[3.5rem] max-w-[85%] border ${msg.role === 'user' ? 'bg-white text-black font-bold' : 'bg-[#080808] text-gray-200 border-white/10'}`}>
              {msg.role === 'assistant' ? <TypewriterText text={msg.content} speed={msg.isStreaming ? 0 : 5} /> : <p className="text-lg font-black">{msg.content}</p>}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-[10px] font-black text-[#10B981] uppercase animate-pulse">Running Simulation...</div>}
      </div>
      <div className="p-10 border-t border-white/10 bg-black shrink-0">
        <div className="max-w-4xl mx-auto flex gap-4">
          <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && processMessage(inputValue, messages)} placeholder="Transmit logic..." className="flex-1 bg-[#050505] border border-white/10 rounded-[2rem] py-5 px-8 text-white focus:border-[#10B981] outline-none font-bold" />
          <button onClick={() => { processMessage(inputValue, messages); setInputValue(''); }} disabled={isTyping || !inputValue.trim()} className="p-5 bg-[#10B981] text-black rounded-2xl hover:scale-105 transition-all"><Zap className="w-5 h-5 fill-current" /></button>
        </div>
      </div>
    </div>
  );
};
