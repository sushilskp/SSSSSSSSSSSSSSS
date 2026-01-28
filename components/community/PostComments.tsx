
import React, { useState, useEffect } from 'react';
import { Send, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { communityService } from '../../services/communityService';
import { CommunityComment } from '../../types';
import { supabase } from '../../services/supabase';

interface PostCommentsProps {
  postId: string;
}

export const PostComments: React.FC<PostCommentsProps> = ({ postId }) => {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, [postId]);

  const fetchComments = async () => {
    try {
      const data = await communityService.getComments(postId);
      setComments(data as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await communityService.addComment(postId, newComment);
      setNewComment('');
      fetchComments();
    } catch (err: any) {
      console.warn("Engagement error:", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await supabase.from('community_comments').delete().eq('id', id);
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-white/5 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-[#10B981]/60" />
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Community Discussion</h4>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-4 h-4 animate-spin text-gray-700" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest text-center py-4">Join the feedback loop.</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {comment.author?.avatar_url ? (
                  <img src={comment.author.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-black text-gray-600">{(comment.author?.full_name || 'F')[0]}</span>
                )}
              </div>
              <div className="flex-1 bg-white/[0.02] border border-white/5 p-3 rounded-2xl rounded-tl-none relative group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black text-white/80 uppercase tracking-wider">{comment.author?.full_name || 'Founder'}</span>
                  {userId === comment.author_id && (
                    <button onClick={() => handleDelete(comment.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500/40 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddComment} className="relative mt-4">
        <input 
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your technical perspective..."
          className="w-full bg-[#000000] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white focus:border-[#10B981] outline-none transition-all placeholder:text-gray-800"
        />
        <button 
          disabled={submitting || !newComment.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#10B981] hover:scale-110 active:scale-95 transition-all disabled:opacity-30"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
