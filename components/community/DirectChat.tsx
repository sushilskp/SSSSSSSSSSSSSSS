
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, X, Shield, MessageSquare, User as UserIcon, Lock, Check, CheckCheck } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { communityService } from '../../services/communityService';
import { UserProfile, PrivateMessage } from '../../types';

interface DirectChatProps {
  recipient: UserProfile;
  onClose: () => void;
}

export const DirectChat: React.FC<DirectChatProps> = ({ recipient, onClose }) => {
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id || null));
    // Fix: use user_id
    fetchMessages().then(() => {
        communityService.markPrivateMessagesAsRead(recipient.user_id);
    });

    // Fix: use user_id
    const channel = supabase
      .channel(`private_chat_${recipient.user_id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'private_messages' 
      }, (payload) => {
        const msg = payload.new as PrivateMessage;
        // Fix: use user_id
        const isFromMe = msg.sender_id === myId && msg.recipient_id === recipient.user_id;
        const isToMe = msg.sender_id === recipient.user_id && msg.recipient_id === myId;
        
        if (payload.eventType === 'INSERT') {
            if (isFromMe || isToMe) {
              setMessages(prev => [...prev, msg]);
              // Fix: use user_id
              if (isToMe) communityService.markPrivateMessagesAsRead(recipient.user_id);
            }
        } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, ...msg } : m));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // Fix: use user_id
  }, [recipient.user_id, myId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const fetchMessages = async () => {
    try {
      // Fix: use user_id
      const msgs = await communityService.getPrivateMessages(recipient.user_id);
      setMessages(msgs);
    } catch (err) {
      console.error("Direct sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMsg.trim();
    if (!content || sending || !myId) return;

    setSending(true);
    try {
      // Fix: use user_id
      await communityService.sendPrivateMessage(recipient.user_id, content);
      setNewMsg('');
      inputRef.current?.focus();
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-[3rem] border border-white/5 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-500">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#050505]/95 backdrop-blur-xl z-20">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-[1.25rem] bg-white/5 border border-white/10 overflow-hidden shadow-inner">
            {recipient.avatar_url ? (
              <img src={recipient.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-6 h-6 m-3 text-gray-700" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">{recipient.full_name}</h3>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20">
                <Lock className="w-2.5 h-2.5 text-[#10B981]" />
                <span className="text-[7px] font-black text-[#10B981] uppercase tracking-widest">Secure Uplink</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-0.5">{recipient.profession || 'Verified Founder'}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar scroll-smooth bg-gradient-to-b from-[#050505] to-[#000000]">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
            <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Decrypting Channel...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-10">
            <div className="w-20 h-20 rounded-[2.5rem] bg-[#10B981]/5 border border-[#10B981]/10 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-gray-800" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-white uppercase tracking-tight">Transmission Established</h4>
              <p className="max-w-xs mx-auto text-[11px] text-gray-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
                Peer-to-peer encryption active for this session.
              </p>
            </div>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex ${m.sender_id === myId ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[75%] px-6 py-4 rounded-2xl text-sm font-medium leading-relaxed ${
                m.sender_id === myId 
                  ? 'bg-[#10B981] text-white rounded-br-none shadow-lg' 
                  : 'bg-[#111111] text-gray-200 border border-white/5 rounded-bl-none'
              }`}>
                {m.content}
                <div className={`text-[8px] font-black uppercase tracking-widest mt-2 flex items-center gap-2 ${m.sender_id === myId ? 'text-white/40 justify-end' : 'text-gray-600'}`}>
                   {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   {m.sender_id === myId && (
                     <div className="flex items-center">
                       {m.read_at ? (
                         <CheckCheck className="w-3 h-3 text-[#10B981] fill-[#10B981]/10" />
                       ) : (
                         <Check className="w-3 h-3" />
                       )}
                     </div>
                   )}
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
            placeholder={myId ? "Transmit secure message..." : "Uplink required..."}
            disabled={!myId}
            autoComplete="off"
            className="w-full bg-[#000000] border border-white/10 rounded-[1.8rem] py-5 pl-8 pr-16 text-sm text-white focus:border-[#10B981] outline-none transition-all placeholder:text-gray-800 font-medium"
          />
          <button 
            type="submit"
            disabled={sending || !newMsg.trim() || !myId}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl transition-all active:scale-95 disabled:opacity-20 shadow-xl shadow-[#10B981]/20"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};
