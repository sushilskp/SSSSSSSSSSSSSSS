
import React, { useState } from 'react';
import { Mail, Lock, LogIn, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
  onRegisterClick: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBack, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('email not confirmed')) {
          setError('Email not confirmed. Please check your inbox.');
        } else if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid credentials. If you haven\'t signed up, please register.');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.user) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Connection error. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="mb-10 space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-white">Welcome Back</h2>
          <p className="text-gray-400 text-sm font-medium">Log in to manage your startup reports.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
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

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-500 text-[10px] font-bold uppercase text-center tracking-widest">{error}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-[#22C55E]/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />} 
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <button onClick={onRegisterClick} disabled={loading} className="text-[#22C55E] font-bold hover:underline disabled:opacity-50">
            Register
          </button>
        </p>

        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]/40" />
          <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Growth.ai Secure Access</span>
        </div>
      </div>
    </div>
  );
};
