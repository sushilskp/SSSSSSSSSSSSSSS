
import React, { useEffect, useState } from 'react';
import { X, Shield, Zap, TrendingUp, Award, User, MessageSquare, Briefcase, Globe, Loader2, UserPlus, UserMinus, Send, ExternalLink, Terminal, Activity, Check } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { communityService } from '../../services/communityService';
import { UserProfile } from '../../types';

interface PublicProfileModalProps {
  userId: string;
  onClose: () => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({ userId, onClose }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentFounder, setCurrentFounder] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const { data: { user: me } } = await supabase.auth.getUser();
        if (me) {
          const { data: myProf } = await supabase.from('profiles').select('*').eq('id', me.id).maybeSingle();
          setCurrentFounder(myProf);
        }

        const [profileRes, followStatus, followStats, feedbackRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
          communityService.isFollowing(userId),
          communityService.getFollowStats(userId),
          communityService.getPlatformFeedback(10, userId)
        ]);
        
        if (profileRes.data) setProfile({ ...profileRes.data, user_id: profileRes.data.id });
        setIsFollowing(followStatus);
        setStats(followStats);
        setReviews(feedbackRes);
      } catch (err) {
        console.error('Modal Error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [userId]);

  const handleToggleFollow = async () => {
    setFollowLoading(true);
    try {
      await communityService.toggleFollow(userId);
      setIsFollowing(!isFollowing);
      setStats(prev => ({ ...prev, followers: prev.followers + (isFollowing ? -1 : 1) }));
    } catch (err) {} finally { setFollowLoading(false); }
  };

  if (loading) return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
    </div>
  );

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-4xl h-[90vh] glass-panel rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 text-gray-400 hover:text-white z-20"><X className="w-6 h-6" /></button>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-32 h-32 rounded-[2.5rem] bg-[#050505] border-2 border-[#10B981]/30 overflow-hidden flex items-center justify-center shadow-2xl">
              {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-gray-800" />}
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{profile.full_name}</h2>
              <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{profile.profession || 'Verified Founder'}</p>
            </div>
            <div className="flex gap-8">
              <div className="text-center"><p className="text-2xl font-black text-white">{stats.followers}</p><p className="text-[9px] font-black text-gray-600 uppercase">Connections</p></div>
              <div className="text-center"><p className="text-2xl font-black text-white">{stats.following}</p><p className="text-[9px] font-black text-gray-600 uppercase">Following</p></div>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 space-y-4 text-center">
            <h4 className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.4em]">Founder Bio</h4>
            <p className="text-sm text-gray-400 leading-relaxed italic">"{profile.bio || "Stealth mode startup building."}"</p>
          </div>
          <div className="pt-10 flex gap-4">
             <button 
               onClick={handleToggleFollow} 
               disabled={followLoading} 
               className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all ${isFollowing ? 'bg-white/10 text-white border border-white/10' : 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20'}`}
             >
               {followLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isFollowing ? <><UserMinus className="w-4 h-4" /> Disconnect</> : <><UserPlus className="w-4 h-4" /> Connect</>}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
