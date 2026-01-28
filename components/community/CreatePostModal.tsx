
import React, { useState } from 'react';
import { X, Shield, Send, Loader2, AlertCircle } from 'lucide-react';
import { communityService } from '../../services/communityService';

interface CreatePostModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Startup Idea' | 'Feedback' | 'Question' | 'Showcase'>('Startup Idea');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_TITLE = 100;
  const MAX_CONTENT = 2000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length < 5) return setError("Title must be at least 5 characters.");
    if (content.length < 20) return setError("Content must be at least 20 characters.");

    setLoading(true);
    try {
      await communityService.createPost({ 
        title: title.trim(), 
        content: content.trim(), 
        category 
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#000000]/90 backdrop-blur-xl">
      <div className="w-full max-w-2xl glass-panel p-10 rounded-[3rem] border border-white/10 shadow-2xl relative animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors p-2">
          <X className="w-6 h-6" />
        </button>

        <div className="mb-10 space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Launch Discussion</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Share insights with the community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Sector</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#000000] border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#10B981] outline-none transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="Startup Idea">Startup Idea</option>
                <option value="Feedback">Feedback</option>
                <option value="Question">Question</option>
                <option value="Showcase">Showcase</option>
              </select>
            </div>
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Title</label>
              <input 
                type="text" 
                value={title}
                maxLength={MAX_TITLE}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's the core focus?"
                className="w-full bg-[#000000] border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#10B981] outline-none transition-all font-bold"
              />
              <span className="absolute right-4 bottom-[-18px] text-[8px] text-gray-600 font-bold">{title.length}/{MAX_TITLE}</span>
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Intelligence Body</label>
            <textarea 
              value={content}
              maxLength={MAX_CONTENT}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Provide deep context, data points, or a clear question for the collective..."
              className="w-full bg-[#000000] border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#10B981] outline-none transition-all resize-none font-medium text-sm leading-relaxed"
            />
            <span className="absolute right-4 bottom-[-18px] text-[8px] text-gray-600 font-bold">{content.length}/{MAX_CONTENT}</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest bg-red-500/5 p-4 rounded-xl border border-red-500/10">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="flex items-center justify-end pt-6 border-t border-white/5">
            <button 
              type="submit"
              disabled={loading}
              className="px-10 py-4 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-[#10B981]/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publish Intelligence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
