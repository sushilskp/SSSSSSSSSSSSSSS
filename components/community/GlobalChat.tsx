
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Users, Shield, Globe, User, MessageSquare } from 'lucide-react';
import { communityService } from '../../services/communityService';
import { ChatMessage } from '../../types';
import { supabase } from '../../services/supabase';
import { PublicProfileModal } from '../profile/PublicProfileModal';

export const GlobalChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchInitialMessages();
    
    const channel = supabase
      .channel('global_chat_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'global_chat' },
        async (payload) => {
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, plan')
            .eq('id', payload.new.user_id)
            .single();
          
          const newMessage: ChatMessage = {
            ...payload.new as any,
            author: data || undefined
          };
          
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchInitialMessages = async () => {
    try {
      const data = await communityService.getChatMessages();
      setMessages(data);
    } catch (err) {
      console.error("Chat sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMsg.trim();
    if (!content || sending) return;

    setSending(true);
    try {
      await communityService.sendChatMessage(content);
      setNewMsg('');
      // Keep focus on input for the next message
      inputRef.current?.focus();
    } catch (err) {
      console.error("Broadcast failed:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <Loader2 className="w-10 h-10 animate-spin text-[#10B981]" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">Syncing with HQ...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full glass-panel rounded-[3rem] border border-white/5 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] animate-in fade-in duration-700">
      <div className="p-8 border-b border-white/5 bg-[#050505]/95 backdrop-blur-xl flex items-center justify-between z-10">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-[1.25rem] bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/20">
            <Globe className="w-6 h-6 text-[#10B981]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              Founder Hub 
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            </h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-0.5">Real-time Global Sync</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
           <Users className="w-4 h-4 text-gray-600" />
           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Link</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-black/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
             <MessageSquare className="w-12 h-12 mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest">No transmissions found.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-4 group animate-in slide-in-from-bottom-2 duration-300">
              <div 
                className="flex-shrink-0 mt-1 cursor-pointer transition-transform hover:scale-110"
                onClick={() => setSelectedUserId(msg.user_id)}
              >
                  <div className="w-10 h-10 rounded-xl border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
                    {msg.author?.avatar_url ? (
                      <img src={msg.author.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
              </div>
              <div className="flex flex-col max-w-[80%]">
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-[10px] font-black text-[#10B981] uppercase tracking-widest">
                    {msg.author?.full_name || 'Founder'}
                  </span>
                  {msg.author?.plan === 'pro' && (
                    <Shield className="w-3 h-3 text-[#10B981] opacity-50" />
                  )}
                  <span className="text-[8px] font-bold text-gray-700 uppercase">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="bg-[#111111] text-gray-200 border border-white/5 rounded-2xl rounded-tl-none px-5 py-4 text-[13px] font-medium leading-relaxed shadow-xl group-hover:border-[#10B981]/20 transition-colors">
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-8 bg-[#050505] border-t border-white/5">
        <form onSubmit={handleSend} className="relative group max-w-4xl mx-auto">
          <input 
            ref={inputRef}
            type="text" 
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Broadcast intel to the collective..."
            autoComplete="off"
            className="w-full bg-[#000000] border border-white/10 rounded-[1.5rem] py-5 pl-8 pr-16 text-sm text-white focus:border-[#10B981] outline-none transition-all placeholder:text-gray-800 font-medium"
          />
          <button 
            type="submit"
            disabled={sending || !newMsg.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl transition-all active:scale-95 disabled:opacity-20 shadow-xl shadow-[#10B981]/20"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
      
      {selectedUserId && <PublicProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}
    </div>
  );
};
