import React, { useState } from 'react';
import { Mail, Lock, LogIn, ShieldCheck, Loader2, Eye, EyeOff, XCircle, KeyRound, AlertCircle, UserPlus } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
  onRegisterClick: () => void;
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" className="mr-3">
    <path fill="#4285F4" d="M17.64 9.200000000000001c0-.63-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.89 2.69-6.62z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.95v2.33C2.43 15.93 5.49 18 9 18z"/>
    <path fill="#FBBC05" d="M3.96 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.95a9 9 0 0 0 0 8.08l3.01-2.33z"/>
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0 5.49 0 2.43 2.07.95 5.07L3.96 7.4c.71-2.13 2.7-3.71 5.04-3.71z"/>
  </svg>
);

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBack, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes('invalid login credentials')) {
          setError('Invalid email or password.');
        } else {
          setError(authError.message);
        }
        return;
      }
      
      if (data.user) onLoginSuccess();
    } catch (err: any) {
      console.error("Auth Exception:", err);
      setError('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: window.location.origin,
        }
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email address to reset password.");
      return;
    }
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      if (resetError) throw resetError;
      setForgotSent(true);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#000000]">
      <div className="w-full max-w-md glass-panel p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500 border border-white/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="mb-10 space-y-2 text-center">
          <h2 className="text-4xl font-black tracking-tight text-white uppercase leading-none">Welcome <br /> Back</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Authorized Entry Only</p>
        </div>

        {forgotSent ? (
          <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-3xl p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <KeyRound className="w-12 h-12 text-[#10B981] mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]" />
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white uppercase">Check your inbox</h3>
              <p className="text-xs text-gray-400 font-medium">Reset link sent to <br /><span className="text-[#10B981] font-black">{email}</span></p>
            </div>
            <button onClick={() => setForgotSent(false)} className="text-[#10B981] text-[10px] font-black uppercase tracking-widest hover:underline transition-all">Return to Login</button>
          </div>
        ) : (
          <div className="space-y-8">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-5 bg-white hover:bg-gray-100 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <GoogleIcon /> Continue with Google
            </button>

            <div className="relative flex items-center justify-center py-2">
              <div className="border-t border-white/5 w-full" />
              <span className="absolute px-4 bg-[#000000] text-[9px] font-black text-gray-700 uppercase tracking-[0.3em]">Or use direct uplink</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Work Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-[#10B981] transition-colors" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-[#000000] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-[#10B981] outline-none transition-all placeholder:text-gray-800 font-bold"
                    placeholder="FOUNDER@GROWTH.AI"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center pr-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Access Key</label>
                  <button type="button" onClick={handleForgotPassword} className="text-[10px] font-black text-[#10B981] hover:underline transition-colors uppercase tracking-widest">Forgot Access?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-[#10B981] transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-[#000000] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white focus:border-[#10B981] outline-none transition-all font-bold"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/5 p-4 rounded-xl border border-red-500/10 animate-in shake duration-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> 
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#10B981]/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />} Sign In
              </button>
            </form>

            <div className="pt-8 text-center space-y-4">
              <div className="relative flex items-center justify-center py-2">
                <div className="border-t border-white/5 w-full" />
                <span className="absolute px-4 bg-[#000000] text-[8px] font-black text-gray-800 uppercase tracking-widest">New to the collective?</span>
              </div>
              <button 
                onClick={onRegisterClick}
                disabled={loading}
                className="w-full py-4 border border-[#10B981]/20 hover:border-[#10B981]/50 text-[#10B981] rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all hover:bg-[#10B981]/5"
              >
                <UserPlus className="w-4 h-4" /> Initialize Sign Up
              </button>
            </div>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#10B981]/30" />
          <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest">Growth Secure Access v4.2</span>
        </div>
      </div>
    </div>
  );
};