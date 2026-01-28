import React, { useEffect, useState, useRef } from 'react';
import {
  User, Mail, Shield, ArrowLeft, Camera,
  Save, Loader2, Zap, LogOut, Phone,
  Fingerprint, ShieldCheck, BarChart3,
  Terminal, Database, Signal
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

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onLogout,
  onBack,
  onProfileUpdate,
  initialTab = 'overview'
}) => {

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] =
    useState<'overview' | 'settings' | 'network'>(initialTab);
  const [followStats, setFollowStats] =
    useState({ followers: 0, following: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

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

        const [stats, posts] = await Promise.all([
          communityService.getFollowStats(user.id),
          communityService.getUserPosts(user.id)
        ]);

        setFollowStats(stats);
        setUserPosts(posts as CommunityPost[]);
      } catch (err) {
        console.error("Profile sync failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: profile.full_name,
        profession: profile.profession,
        skills: profile.skills,
        phone: profile.phone,
        bio: profile.bio,
        avatar_url: profile.avatar_url
      });

      onProfileUpdate?.(profile);

    } catch (err: any) {
      alert("Calibration error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result as string;

      try {
        await supabase
          .from('profiles')
          .update({ avatar_url: base64 })
          .eq('id', profile.user_id);

        const updated = { ...profile, avatar_url: base64 };
        setProfile(updated);
        onProfileUpdate?.(updated);

      } catch (err: any) {
        alert(err.message);
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // ✅ STRICT SAFE PLAN FORMAT (Netlify safe)
  const plan = profile?.plan ?? 'free';
  const planDisplay =
    plan.charAt(0).toUpperCase() + plan.slice(1);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#10B981]" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-12 max-w-[1400px] mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      <h2 className="text-4xl font-black text-white">
        {profile.full_name}
      </h2>

      <p className="text-[#10B981] uppercase text-sm">
        {profile.profession || 'Verified Founder Node'}
      </p>

      <div className="mt-8 space-y-3">
        <InfoCard icon={<Mail size={16} />}
          label="Email"
          value={profile.email || 'N/A'} />

        <InfoCard icon={<Shield size={16} />}
          label="Plan"
          value={planDisplay} />
      </div>
    </div>
  );
};

const InfoCard = ({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="bg-white/5 p-4 rounded-xl flex justify-between">
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-white font-bold">{value}</p>
      </div>
    </div>
  </div>
);
