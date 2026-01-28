
import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id) // Fix: use user_id for matching profile
            .single();
          
          if (error) throw error;
          setProfile(data);
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
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <div className="flex flex-col items-center text-center space-y-6 mb-12">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#22C55E] to-blue-500 p-1">
            <div className="w-full h-full rounded-full bg-[#0B0B0F] flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            {/* Fix: Changed profile?.name to profile?.full_name to match UserProfile type */}
            <h2 className="text-3xl font-black tracking-tight text-white">{profile?.full_name || 'Founder'} Profile</h2>
            <p className="text-[#22C55E] text-[10px] font-black uppercase tracking-[0.3em] mt-1">Growth Tier: {profile?.plan || 'Venture'}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Fix: Changed profile?.name to profile?.full_name to match UserProfile type */}
          <InfoCard icon={<User className="w-4 h-4" />} label="Display Name" value={profile?.full_name || 'N/A'} />
          <InfoCard icon={<Mail className="w-4 h-4" />} label="Email Address" value={profile?.email || 'N/A'} />
          <InfoCard icon={<Shield className="w-4 h-4" />} label="Plan Level" value={(profile?.plan?.charAt(0).toUpperCase() + profile?.plan?.slice(1)) || 'Free'} />
        </div>

        <div className="mt-12 space-y-4">
          <button className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2">
            Manage Subscription <ExternalLink className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <p className="mt-10 text-[8px] text-gray-600 text-center uppercase tracking-widest font-black">
          {/* Fix: Property 'id' does not exist on type 'UserProfile'. Use 'user_id' instead. */}
          Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'} • ID: {profile?.user_id?.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-[#0B0B0F] rounded-lg text-gray-500">
        {icon}
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-white">{value}</span>
      </div>
    </div>
  </div>
);
