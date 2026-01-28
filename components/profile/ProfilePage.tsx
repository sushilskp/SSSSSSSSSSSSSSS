
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  User, Mail, Shield, ArrowLeft, Camera, 
  Save, Loader2, Zap, LogOut, Phone, Fingerprint, 
  ShieldCheck, BarChart3, Terminal, Database, Signal
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { communityService } from '../../services/communityService';
import { UserProfile, CommunityPost } from '../../types';

interface ProfilePageProps {
  onLogout: () => void;
  onBack: () => void;
  onProfileUpdate?: (profile: UserProfile) => void;
  initialTab?: 'overview' | 'settings' | 'network';
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout, onBack, onProfileUpdate, initialTab = 'overview' }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'network'>(initialTab as any);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoized plan display to prevent re-calculation and satisfy TS
  const planDisplay = useMemo(() => {
    const rawPlan = profile?.plan || 'free';
    return rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1);
  }, [profile?.plan]);

  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isMounted) return;

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (isMounted) {
          if (profileData) {
            setProfile({ ...profileData, user_id: profileData.id });
          } else {
            setProfile({ 
              user_id: user.id, 
              email: user.email || '', 
              plan: 'free', 
              full_name: user.user_metadata?.full_name || 'Neural Founder' 
            });
          }
        }

        const [stats, posts] = await Promise.allSettled([
          communityService.getFollowStats(user.id),
          communityService.getUserPosts(user.id)
        ]);

        if (isMounted) {
          if (stats.status === 'fulfilled') setFollowStats(stats.value);
          if (posts.status === 'fulfilled') setUserPosts(posts.value as any);
        }
      } catch (err) {
        console.error("Profile sync failed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfileData();
    return () => { isMounted = false; };
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: profile.full_name,
          profession: profile.profession,
          skills: profile.skills,
          phone: profile.phone,
          bio: profile.bio,
          avatar_url: profile.avatar_url
        });
        if (error) throw error;
        if (onProfileUpdate) onProfileUpdate(profile);
      }
    } catch (err: any) {
      console.error("Calibration error:", err);
    } finally { setSaving(false); }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const { error } = await supabase.from('profiles').update({ avatar_url: base64 }).eq('id', profile.user_id);
        if (error) throw error;
        const updated = { ...profile, avatar_url: base64 };
        setProfile(updated);
        if (onProfileUpdate) onProfileUpdate(updated);
      } catch (err: any) { console.error(err); } finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="relative">
        <Loader2 className="w-10 h-10 animate-spin text-[#10B981] mb-4" />
        <div className="absolute inset-0 blur-xl bg-[#10B981]/20 animate-pulse" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-800">Syncing Identity Matrix...</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-12 max-w-[1400px] mx-auto overflow-x-hidden">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-3 text-gray-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.3em] group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Hub
          </button>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
            <LogOut className="w-3.5 h-3.5" /> Terminate Uplink
          </button>
        </div>

        <div className="glass-panel p-10 md:p-16 rounded-[4rem] border border-white/10 relative overflow-hidden bg-[#050505]/40 shadow-2xl">
           <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12">
              <Fingerprint className="w-64 h-64" />
           </div>
           <div className="flex flex-col items-center text-center space-y-8 relative z-10">
              <div 
                onClick={handleAvatarClick}
                className="group/avatar w-40 h-40 md:w-56 md:h-56 rounded-[4rem] bg-black border-4 border-white/10 overflow-hidden flex items-center justify-center relative shadow-2xl cursor-pointer"
              >
                {uploading && <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#10B981]" /></div>}
                {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User className="w-20 h-20 text-gray-800" />}
                <div className="absolute -bottom-4 right-0 p-4 bg-[#10B981] text-black rounded-[2rem] border-4 border-black shadow-lg"><ShieldCheck className="w-6 h-6" /></div>
              </div>
              <div className="space-y-2">
                <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">{profile?.full_name}</h2>
                <p className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.4em]">{profile?.profession || 'Verified Founder Node'}</p>
              </div>
              <div className="flex gap-12 pt-6">
                <div className="text-center group cursor-default">
                  <p className="text-4xl font-black text-white group-hover:text-[#10B981] transition-colors tabular-nums">{followStats.followers}</p>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Connections</p>
                </div>
                <div className="text-center group cursor-default">
                  <p className="text-4xl font-black text-white group-hover:text-[#10B981] transition-colors tabular-nums">{followStats.following}</p>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Networked</p>
                </div>
                <div className="text-center group cursor-default">
                  <p className="text-4xl font-black text-white group-hover:text-[#10B981] transition-colors tabular-nums">{userPosts.length}</p>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Signals</p>
                </div>
              </div>
           </div>
        </div>

        <div className="flex items-center justify-center gap-4 p-2 bg-white/5 border border-white/5 rounded-[2.5rem] max-w-2xl mx-auto w-full">
          <TabPill active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Intelligence" icon={<BarChart3 className="w-4 h-4" />} />
          <TabPill active={activeTab === 'network'} onClick={() => setActiveTab('network')} label="Registry" icon={<Terminal className="w-4 h-4" />} />
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'overview' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4 space-y-4">
                 <InfoCard icon={<User className="w-4 h-4" />} label="Display Name" value={profile?.full_name || 'N/A'} />
                 <InfoCard icon={<Mail className="w-4 h-4" />} label="Email Address" value={profile?.email || 'N/A'} />
                 <InfoCard icon={<Shield className="w-4 h-4" />} label="Plan Level" value={planDisplay} />
                 <section className="glass-panel p-8 rounded-[3rem] border border-white/10 bg-[#050505]/60 space-y-6">
                   <h3 className="text-xs font-black text-[#10B981] uppercase tracking-[0.4em] flex items-center gap-3"><Zap className="w-4 h-4" /> Skill Matrix</h3>
                   <div className="flex flex-wrap gap-2">
                     {profile?.skills ? profile.skills.split(',').map((s: string, i: number) => (
                       <span key={i} className="px-3 py-1.5 bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg text-[9px] font-black text-[#10B981] uppercase tracking-widest">{s.trim()}</span>
                     )) : <p className="text-[9px] text-gray-800 uppercase font-black tracking-widest">Scanning logic sectors...</p>}
                   </div>
                 </section>
              </div>
              <div className="lg:col-span-8 space-y-6">
                 <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Broadcasting <span className="text-[#10B981]">Signals</span></h3>
                 {userPosts.length === 0 ? (
                   <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20"><Signal className="w-12 h-12 mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest">Channel Silent</p></div>
                 ) : userPosts.map(post => (
                   <div key={post.id} className="glass-panel p-8 rounded-[2.5rem] bg-[#080808] border border-white/5 space-y-4 hover:border-[#10B981]/20 transition-all group">
                     <div className="flex justify-between items-center"><span className="text-[9px] font-black text-[#10B981] uppercase tracking-widest px-2 py-1 bg-[#10B981]/5 rounded-lg border border-[#10B981]/10">{post.category}</span><span className="text-[9px] font-black text-gray-800 uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString()}</span></div>
                     <h4 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-[#10B981] transition-colors">{post.title}</h4>
                     <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{post.content}</p>
                   </div>
                 ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleUpdateProfile} className="glass-panel p-12 rounded-[4rem] border border-white/10 space-y-10 bg-[#050505]/40 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none"><Database className="w-64 h-64" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <CommandInput label="Founder Name" value={profile?.full_name || ''} onChange={(v: string) => setProfile(p => p ? {...p, full_name: v} : null)} placeholder="ALEX FOUNDER" />
                  <CommandInput label="Core Specialty" value={profile?.profession || ''} onChange={(v: string) => setProfile(p => p ? {...p, profession: v} : null)} placeholder="CEO @ STARTUP" />
                  <CommandInput label="Uplink Code" value={profile?.phone || ''} onChange={(v: string) => setProfile(p => p ? {...p, phone: v} : null)} placeholder="+91 XXXXX XXXXX" />
                  <CommandInput label="Skill Array (CSV)" value={profile?.skills || ''} onChange={(v: string) => setProfile(p => p ? {...p, skills: v} : null)} placeholder="AI, GTM, FINTECH..." />
                  <div className="md:col-span-2 space-y-4">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] ml-1">Mission Protocol (Bio)</label>
                    <textarea value={profile?.bio || ''} onChange={e => setProfile(p => p ? {...p, bio: e.target.value} : null)} className="w-full bg-black border border-white/10 rounded-[2rem] p-8 text-white focus:border-[#10B981] outline-none font-bold resize-none min-h-[160px] shadow-inner" placeholder="INITIALIZING MISSION LOG..." />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="w-full py-8 bg-[#10B981] hover:bg-[#059669] text-black rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-sm flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 shadow-2xl relative z-10 group">
                  {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />} Commit Logic Changes
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabPill = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex-1 px-8 py-5 rounded-[2.2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border ${active ? 'bg-[#10B981] border-[#10B981] text-black shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-transparent border-transparent text-gray-500 hover:text-white hover:bg-white/5'}`}>
    {icon} {label}
  </button>
);

const CommandInput = ({ label, value, onChange, placeholder }: any) => (
  <div className="space-y-4">
    <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] ml-1">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-black border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-[#10B981] font-bold shadow-inner placeholder:text-gray-900" />
  </div>
);

const InfoCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between shadow-inner">
    <div className="flex items-center gap-3 text-left">
      <div className="p-2 bg-[#0B0B0F] rounded-lg text-gray-500 border border-white/5">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-white">{value}</span>
      </div>
    </div>
  </div>
);
