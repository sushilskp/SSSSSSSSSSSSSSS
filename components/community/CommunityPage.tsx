
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, MessageSquare, Heart, Share2, Shield, Loader2, Signal, Copy, Check, Terminal, Database, ExternalLink, RefreshCw } from 'lucide-react';
import { communityService } from '../../services/communityService';
import { CommunityPost } from '../../types';
import { CreatePostModal } from './CreatePostModal';
import { PostComments } from './PostComments';
import { PublicProfileModal } from '../profile/PublicProfileModal';
import { supabase } from '../../services/supabase';

const categories = ['All', 'Startup Idea', 'Feedback', 'Question', 'Showcase'];

export const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  const setupSQL = `-- GROWTH.AI MAINFRAME ULTIMATE SETUP SCRIPT (V4.5)
-- RUN THIS IN SUPABASE SQL EDITOR: https://supabase.com/dashboard/project/_/sql

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  username TEXT UNIQUE,
  email TEXT,
  avatar_url TEXT,
  profession TEXT,
  bio TEXT,
  skills TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. COMMUNITY POSTS
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. LIKES
CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- 4. FOLLOWS
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- 5. AI CHAT HISTORY
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  sources JSONB,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. FEEDBACK
CREATE TABLE IF NOT EXISTS public.platform_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT,
  role TEXT,
  feedback TEXT,
  improvements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. GLOBAL CHAT
CREATE TABLE IF NOT EXISTS public.global_chat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. SECURITY (ENABLE RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_chat ENABLE ROW LEVEL SECURITY;

-- 9. POLICIES (GIVE ACCESS TO EVERYONE)
CREATE POLICY "Public Read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Owner Write" ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Public Read Posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Auth Write Posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Public Read Likes" ON public.community_likes FOR SELECT USING (true);
CREATE POLICY "Auth Like/Unlike" ON public.community_likes FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Owner Read AI Chat" ON public.ai_chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner Write AI Chat" ON public.ai_chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public Write Feedback" ON public.platform_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Feedback" ON public.platform_feedback FOR SELECT USING (true);

CREATE POLICY "Public Read Global Chat" ON public.global_chat FOR SELECT USING (true);
CREATE POLICY "Auth Send Global Chat" ON public.global_chat FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 10. GRANTS
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;`;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setShowSetupGuide(false);
    
    try {
      // Direct table check
      const { error: tableCheck } = await supabase.from('community_posts').select('id').limit(1);
      
      if (tableCheck && (tableCheck.message.includes('not found') || tableCheck.message.includes('does not exist'))) {
         setShowSetupGuide(true);
         setLoading(false);
         return;
      }

      const data = await communityService.getPosts();
      setPosts((data || []) as any);
    } catch (err: any) {
      console.error("Fetch Posts Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(setupSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => filter === 'All' || post.category === filter);
  }, [posts, filter]);

  const handleToggleLike = async (postId: string) => {
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            const isLiking = !p.has_liked;
            return {
                ...p,
                has_liked: isLiking,
                likes_count: (Number(p.likes_count) || 0) + (isLiking ? 1 : -1)
            };
        }
        return p;
    }));
    await communityService.toggleLike(postId);
  };

  if (showSetupGuide) {
    return (
      <div className="min-h-screen bg-[#000000] pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 rounded-[2.5rem] bg-[#10B981]/10 border-2 border-[#10B981]/30 flex items-center justify-center text-[#10B981] shadow-[0_0_50px_rgba(16,185,129,0.15)]">
              <Database className="w-10 h-10" />
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">Database <br /> Setup Required</h1>
              <p className="text-[10px] md:text-xs text-[#10B981] font-black uppercase tracking-[0.4em] leading-relaxed max-w-xl mx-auto">
                MAINFRAME ERROR: TABLES NOT DETECTED. PLEASE INITIALIZE YOUR SUPABASE BACKEND USING THE SCRIPT BELOW.
              </p>
            </div>
          </div>

          <div className="glass-panel p-10 rounded-[4rem] border border-white/10 bg-[#050505]/40 space-y-8">
             <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                   <Terminal className="w-5 h-5 text-[#10B981]" />
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Growth Engine Master SQL v4.5</h3>
                </div>
                <button 
                  onClick={handleCopySQL}
                  className="px-6 py-2.5 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl text-[10px] font-black text-[#10B981] uppercase tracking-widest hover:bg-[#10B981] hover:text-black transition-all flex items-center gap-2"
                >
                   {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                   {copied ? 'Copied' : 'Copy SQL Script'}
                </button>
             </div>
             <div className="bg-black/80 rounded-[2rem] border border-white/5 p-8">
                <pre className="text-[11px] text-[#10B981]/70 font-mono leading-relaxed overflow-x-auto custom-scrollbar max-h-[400px]">
                  {setupSQL}
                </pre>
             </div>
             <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                <a 
                  href="https://supabase.com/dashboard/project/_/sql" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-10 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-[#10B981] hover:text-white transition-all shadow-2xl"
                >
                   Open SQL Editor <ExternalLink className="w-4 h-4" />
                </a>
                <button 
                  onClick={fetchPosts}
                  className="px-10 py-5 bg-[#10B981] text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-2xl"
                >
                   <RefreshCw className="w-4 h-4" /> Re-sync Hub
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] pt-28 pb-20 px-6 relative">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">Community</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] italic">Syncing verified founder nodes.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-5 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-[#10B981]/20"
          >
            <Plus className="w-5 h-5" /> Share Insight
          </button>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide border-b border-white/5">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => { setFilter(cat); setExpandedPostId(null); }}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border whitespace-nowrap ${filter === cat ? 'bg-[#10B981] border-[#10B981] text-black shadow-lg shadow-[#10B981]/10' : 'bg-white/5 border-white/10 text-gray-600 hover:text-white hover:border-white/20'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <Loader2 className="w-12 h-12 animate-spin text-[#10B981]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-800">Synchronizing Transmissions...</span>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredPosts.length === 0 ? (
                <div className="glass-panel p-24 rounded-[4rem] text-center space-y-6 border-dashed border-2 border-white/5 bg-[#050505]/20">
                  <Signal className="w-16 h-16 text-gray-900 mx-auto" />
                  <p className="text-gray-700 font-black uppercase tracking-[0.4em] text-[10px]">No signals in this sector.</p>
                </div>
              ) : (
                filteredPosts.map(post => (
                  <div key={post.id} className="glass-panel p-10 rounded-[3.5rem] border border-white/5 hover:border-[#10B981]/30 transition-all duration-500 space-y-8 bg-[#050505]/40 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5 cursor-pointer group/author" onClick={() => setSelectedUserId(post.author_id)}>
                        <div className="w-14 h-14 rounded-2xl bg-black border-2 border-white/10 overflow-hidden flex items-center justify-center group-hover/author:border-[#10B981]/50 transition-colors">
                          {post.author?.avatar_url ? <img src={post.author.avatar_url} className="w-full h-full object-cover" /> : <Shield className="w-6 h-6 text-gray-700" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight group-hover/author:text-[#10B981] transition-colors">{post.author?.full_name || 'Anonymous'}</p>
                          <div className="flex items-center gap-3">
                             <span className="text-[9px] font-black text-[#10B981] uppercase tracking-[0.2em]">{post.category}</span>
                             <span className="w-1 h-1 rounded-full bg-gray-800" />
                             <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5 cursor-pointer" onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}>
                      <h3 className="text-3xl font-black text-white tracking-tighter uppercase group-hover:text-[#10B981] transition-colors leading-none break-words overflow-hidden">{post.title}</h3>
                      <p className={`text-gray-400 text-sm leading-relaxed font-medium break-words ${expandedPostId === post.id ? '' : 'line-clamp-3'}`}>{post.content}</p>
                    </div>

                    <div className="flex items-center gap-10 pt-8 border-t border-white/5">
                      <button 
                        onClick={() => handleToggleLike(post.id)} 
                        className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-110 active:scale-90 ${post.has_liked ? 'text-[#10B981]' : 'text-gray-600 hover:text-white'}`}
                      >
                        <Heart className={`w-4 h-4 ${post.has_liked ? 'fill-[#10B981]' : ''}`} /> {Number(post.likes_count) || 0}
                      </button>
                      <button 
                        onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)} 
                        className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 hover:text-white transition-all hover:scale-110 active:scale-90"
                      >
                        <MessageSquare className="w-4 h-4" /> {Number(post.comments_count) || 0}
                      </button>
                      <button className="ml-auto p-2.5 bg-white/5 rounded-xl text-gray-700 hover:text-white hover:bg-white/10 transition-all active:scale-90"><Share2 className="w-4 h-4" /></button>
                    </div>

                    {expandedPostId === post.id && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                        <PostComments postId={post.id} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && <CreatePostModal onClose={() => setShowCreateModal(false)} onCreated={fetchPosts} />}
      {selectedUserId && <PublicProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}
    </div>
  );
};
