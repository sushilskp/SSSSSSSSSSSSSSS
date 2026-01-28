
import React, { useState, useEffect } from 'react';
import { Search, Users, MessageSquare, Shield, Globe, Loader2, X, User as UserIcon, Send } from 'lucide-react';
import { GlobalChat } from './GlobalChat';
import { DirectChat } from './DirectChat';
import { communityService } from '../../services/communityService';
import { UserProfile } from '../../types';
import { supabase } from '../../services/supabase';

export const ChatHub: React.FC = () => {
  const [activeChat, setActiveChat] = useState<'global' | UserProfile>('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentChats, setRecentChats] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
    fetchRecentChats();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const fetchRecentChats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get unique user IDs we've messaged
    const { data: messages } = await supabase
      .from('private_messages')
      .select('sender_id, recipient_id')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (messages) {
      const uniqueIds = new Set<string>();
      messages.forEach(m => {
        if (m.sender_id !== user.id) uniqueIds.add(m.sender_id);
        if (m.recipient_id !== user.id) uniqueIds.add(m.recipient_id);
      });

      if (uniqueIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          // Fix: use user_id
          .in('user_id', Array.from(uniqueIds))
          .limit(10);
        
        if (profiles) setRecentChats(profiles);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await communityService.searchUsers(searchQuery);
      // Fix: Property 'id' does not exist on type 'UserProfile'. Use 'user_id' instead.
      setSearchResults(results.filter(u => u.user_id !== currentUser?.id) as any);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const startPrivateChat = (user: UserProfile) => {
    setActiveChat(user);
    setSearchQuery('');
    setSearchResults([]);
    // Add to recent if not there
    // Fix: Property 'id' does not exist on type 'UserProfile'. Use 'user_id' instead.
    if (!recentChats.find(c => c.user_id === user.user_id)) {
      setRecentChats(prev => [user, ...prev].slice(0, 10));
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-700">
      {/* Sidebar: Navigation & Discovery */}
      <div className="w-[380px] hidden lg:flex flex-col gap-6">
        <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 flex flex-col h-full space-y-8 overflow-hidden">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-[#10B981] uppercase tracking-[0.4em] ml-1">Discovery Engine</h3>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#10B981] transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find Founders..."
                className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs text-white focus:border-[#10B981] outline-none transition-all font-bold placeholder:text-gray-800"
              />
              {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-[#10B981]" />}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <h4 className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-1">Network Matches</h4>
                <div className="space-y-2">
                  {searchResults.map(user => (
                    <button 
                      key={user.user_id} // Fix: use user_id
                      onClick={() => startPrivateChat(user)}
                      className="w-full p-4 bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl flex items-center gap-4 hover:bg-[#10B981]/10 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-black border border-white/10 overflow-hidden flex-shrink-0">
                        {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 m-2.5 text-gray-700" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-white group-hover:text-[#10B981] transition-colors truncate">{user.full_name}</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest truncate">{user.profession || 'Founder'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Core Channels */}
            <div className="space-y-4">
              <h4 className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-1">Main Uplink</h4>
              <button 
                onClick={() => setActiveChat('global')}
                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border ${activeChat === 'global' ? 'bg-[#10B981] border-[#10B981] text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeChat === 'global' ? 'bg-white/20' : 'bg-black border border-white/10'}`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black uppercase tracking-tight">Founder Hub</p>
                  <p className={`text-[8px] font-bold uppercase tracking-widest ${activeChat === 'global' ? 'text-white/60' : 'text-gray-600'}`}>Public Broadcast</p>
                </div>
              </button>
            </div>

            {/* Recent Conversations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Active Transmissions</h4>
                <MessageSquare className="w-3 h-3 text-gray-800" />
              </div>
              <div className="space-y-2">
                {recentChats.length === 0 ? (
                  <p className="text-[10px] text-gray-800 font-bold uppercase tracking-widest px-1 py-4 text-center border border-dashed border-white/5 rounded-2xl">No recent DMs</p>
                ) : (
                  recentChats.map(user => (
                    <button 
                      key={user.user_id} // Fix: use user_id
                      onClick={() => setActiveChat(user)}
                      // Fix: Property 'id' does not exist on type 'UserProfile'. Use 'user_id' instead.
                      className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border ${typeof activeChat !== 'string' && activeChat.user_id === user.user_id ? 'bg-white/10 border-[#10B981]/50 text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-black border border-white/10 overflow-hidden flex-shrink-0">
                        {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 m-2.5 text-gray-600" />}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-black truncate">{user.full_name}</p>
                        <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest truncate">{user.profession || 'Founder'}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Interface - Fixed flex class */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {activeChat === 'global' ? (
          <GlobalChat />
        ) : (
          <DirectChat recipient={activeChat} onClose={() => setActiveChat('global')} />
        )}
      </div>
    </div>
  );
};
