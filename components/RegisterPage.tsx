
import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onBack: () => void;
  onLoginClick: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onBack, onLoginClick }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // The profile is usually created via a Supabase trigger, 
        // but we'll attempt a manual insert for safety if triggers aren't set.
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: authData.user.id, 
            full_name: name, 
            email, 
            plan: 'free' 
          });
        
        if (profileError) console.warn("Note: Profile creation managed by backend.");

        if (authData.session) {
          onRegisterSuccess();
        } else {
          setNeedsConfirmation(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-[#0B0B0F]">
        <div className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-[#22C55E]/10 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-10 h-10 text-[#22C55E]" />
          </div>
          <h2 className="text-3xl font-black text-white">Check your email</h2>
          <p className="text-gray-400">Verification link sent to <span className="text-white font-bold">{email}</span>.</p>
          <button 
            onClick={onLoginClick}
            className="w-full py-4 bg-[#22C55E] text-white rounded-xl font-black uppercase tracking-widest text-sm"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-[#0B0B0F]">
      <div className="w-full max-w-md glass-panel p-10 rounded-[3rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="mb-10 space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-white">Founder Registration</h2>
          <p className="text-gray-400 text-sm font-medium">Join the collective of verified startups.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input 
                type="text" 
                disabled={loading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Founder"
                className="w-full bg-[#0B0B0F] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#22C55E] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input 
                type="email" 
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@example.com"
                className="w-full bg-[#0B0B0F] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#22C55E] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input 
                type="password" 
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B0B0F] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#22C55E] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Confirm Identity</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input 
                type="password" 
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B0B0F] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#22C55E] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center tracking-widest bg-red-500/5 p-3 rounded-lg">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-[#22C55E]/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} 
            Initialize Account
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Already a member? <button onClick={onLoginClick} disabled={loading} className="text-[#22C55E] font-bold hover:underline">Sign In</button>
        </p>

        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-center">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]/40" />
          <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest leading-tight">
            Growth.ai Secure Access System
          </span>
        </div>
      </div>
    </div>
  );
};
