
import React, { useEffect, useState, useMemo } from 'react';
import { User, Mail, Shield, LogOut, ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { UserProfile } from '../types';

interface ProfilePageProps {
  onLogout: () => void;
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout, onBack }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Safe plan formatting for TS2532
  const planDisplay = useMemo(() => {
    const rawPlan = profile?.plan || 'free';
    return rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1);
  }, [profile?.plan]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          
          if (data) {
            setProfile({ ...data, user_id: data.id });
          } else {
            setProfile({
              user_id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || 'Founder',
              plan: 'free',
              created_at: user.created_at
            });
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#10B981]" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-800">Recalibrating Node...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 bg-[#050505]/40 border border-white/10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none" />
        
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-xs font-black uppercase tracking-[0.3em] group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        <div className="flex flex-col items-center text-center space-y-6 mb-12">
          <div className="w-24 h-24 rounded-[1.8rem] bg-gradient-to-tr from-[#10B981] to-emerald-500 p-1 shadow-2xl">
            <div className="w-full h-full rounded-[1.6rem] bg-[#0B0B0F] flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight text-white uppercase leading-none">{profile?.full_name || 'Founder'}</h2>
            <p className="text-[#10B981] text-[10px] font-black uppercase tracking-[0.3em]">Growth Logic Tier: {planDisplay}</p>
          </div>
        </div>

        <div className="space-y-4">
          <InfoCard icon={<User className="w-4 h-4" />} label="Identity Record" value={profile?.full_name || 'N/A'} />
          <InfoCard icon={<Mail className="w-4 h-4" />} label="Uplink Channel" value={profile?.email || 'N/A'} />
          <InfoCard icon={<Shield className="w-4 h-4" />} label="Security Level" value={planDisplay} />
        </div>

        <div className="mt-12 space-y-4">
          <button className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3">
            Manage Subscription <ExternalLink className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3"
          >
            <LogOut className="w-4 h-4" /> Terminate Session
          </button>
        </div>

        <p className="mt-10 text-[8px] text-gray-700 text-center uppercase tracking-[0.2em] font-black">
          ACTIVE SINCE {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'} • NODE_ID: {profile?.user_id?.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between shadow-inner">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-[#0B0B0F] rounded-lg text-gray-500 border border-white/5">
        {icon}
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-white tracking-tight">{value}</span>
      </div>
    </div>
  </div>
);
