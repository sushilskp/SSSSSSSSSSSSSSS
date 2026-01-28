
import { supabase } from './supabase';
import { CommunityPost, CommunityComment, ChatMessage, UserProfile, PrivateMessage, Message, UserSettings, SavedAnalysis, Notification } from '../types';

export const communityService = {
  // Helper to ensure profile exists in the 'profiles' table
  async ensureProfileRecord(user: any) {
    if (!user) return false;
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (existing && !fetchError) return true;

      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || 'Neural Founder',
        username: user.user_metadata?.username || `founder_${user.id.slice(0, 5)}`,
        email: user.email || '',
        plan: 'free'
      });
      
      if (insertError) {
        console.warn("Profile auto-sync failed:", insertError.message);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  // --- AI Chat Persistence ---
  async getAIHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
        
      if (error) return [];
      
      return (data || []).map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.created_at).getTime(),
        sources: m.sources,
        attachments: m.attachments
      }));
    } catch (e) {
      return [];
    }
  },

  async saveAIMessage(msg: { role: string; content: string; sources?: any[]; attachments?: any[] }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('ai_chat_messages')
        .insert({
          user_id: user.id,
          role: msg.role,
          content: msg.content,
          sources: msg.sources || null,
          attachments: msg.attachments || null
        });
    } catch (e) {}
  },

  async getPosts() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, username),
          likes_count:community_likes(count),
          comments_count:community_comments(count)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const likedPostIds = new Set();
      if (user) {
        const { data: userLikes } = await supabase.from('community_likes').select('post_id').eq('user_id', user.id);
        (userLikes || []).forEach(l => likedPostIds.add(l.post_id));
      }

      // CRITICAL: Supabase count returns an array of objects e.g. [{count: 5}]. 
      // We must flatten this to a number to avoid React Error #31.
      return (data || []).map(post => ({
        ...post,
        likes_count: (post.likes_count as any)?.[0]?.count || 0,
        comments_count: (post.comments_count as any)?.[0]?.count || 0,
        has_liked: likedPostIds.has(post.id)
      }));
    } catch (e) {
      return [];
    }
  },

  async getUserPosts(userId: string) {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, username),
          likes_count:community_likes(count),
          comments_count:community_comments(count)
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(post => ({
        ...post,
        likes_count: (post.likes_count as any)?.[0]?.count || 0,
        comments_count: (post.comments_count as any)?.[0]?.count || 0
      }));
    } catch (e) {
      return [];
    }
  },

  async createPost(post: { title: string; content: string; category: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required.");
    const { error } = await supabase.from('community_posts').insert({
      author_id: user.id,
      title: post.title,
      content: post.content,
      category: post.category
    });
    if (error) throw error;
  },

  async getComments(postId: string) {
    const { data, error } = await supabase
      .from('community_comments')
      .select('*, author:profiles(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addComment(postId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Auth required.");
    const { error } = await supabase.from('community_comments').insert({
      post_id: postId,
      author_id: user.id,
      content
    });
    if (error) throw error;
  },

  async toggleLike(postId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data: existing } = await supabase.from('community_likes').select('id').eq('post_id', postId).eq('user_id', user.id).maybeSingle();
      if (existing) {
        await supabase.from('community_likes').delete().eq('id', existing.id);
      } else {
        await supabase.from('community_likes').insert({ post_id: postId, user_id: user.id });
      }
      return true;
    } catch (e) { return false; }
  },

  async isFollowing(followingId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', followingId).maybeSingle();
    return !!data;
  },

  async toggleFollow(followingId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Auth required.");
    const currentlyFollowing = await this.isFollowing(followingId);
    if (currentlyFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', followingId);
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: followingId });
    }
  },

  async getFollowStats(userId: string) {
    try {
      const [followers, following] = await Promise.all([
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId)
      ]);
      return { followers: (followers as any).count || 0, following: (following as any).count || 0 };
    } catch (e) {
      return { followers: 0, following: 0 };
    }
  },

  async searchUsers(query: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(10);
    if (error) throw error;
    return (data || []).map(u => ({ ...u, user_id: u.id })) as UserProfile[];
  },

  async getPlatformFeedback(limit = 4, targetUserId?: string) {
    try {
      let q = supabase.from('platform_feedback').select('*').order('created_at', { ascending: false }).limit(limit);
      if (targetUserId) q = q.eq('target_user_id', targetUserId);
      const { data } = await q;
      return data || [];
    } catch (e) { return []; }
  },

  async submitFeedback(fb: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('platform_feedback').insert({ 
        user_id: user?.id || null, 
        name: fb.name, 
        role: fb.role, 
        feedback: fb.feedback, 
        improvements: fb.improvements 
      });
      if (error) throw error;
      return true;
    } catch (e) { return false; }
  },

  async getNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      return data || [];
    } catch (e) { return []; }
  },

  async markNotificationRead(id: string) {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } catch (e) {}
  },

  async markAllNotificationsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    } catch (e) {}
  },

  async getChatMessages() {
    try {
      const { data } = await supabase.from('global_chat').select('*, author:profiles(*)').order('created_at', { ascending: true }).limit(50);
      return data || [];
    } catch (e) { return []; }
  },

  async sendChatMessage(content: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('global_chat').insert({ user_id: user.id, content });
    } catch (e) {}
  },

  async getPrivateMessages(recipientId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from('private_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      return data || [];
    } catch (e) { return []; }
  },

  async sendPrivateMessage(recipientId: string, content: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('private_messages').insert({ sender_id: user.id, recipient_id: recipientId, content });
    } catch (e) {}
  },

  async markPrivateMessagesAsRead(recipientId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('private_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', recipientId)
        .eq('recipient_id', user.id)
        .is('read_at', null);
    } catch (e) {}
  }
};
