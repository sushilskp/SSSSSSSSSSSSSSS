
import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, UserPlus, ShieldCheck, Loader2, Eye, EyeOff, Fingerprint, AtSign, AlertCircle, Phone, Cpu, ArrowLeft, RefreshCw, Shield } from 'lucide-react';
import { supabase, validatePassword, isSupabaseConfigured } from '../../services/supabase';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onBack: () => void;
  onLoginClick: () => void;
}

type RegisterStep = 'FORM' | 'OTP';

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onBack, onLoginClick }) => {
  const [step, setStep] = useState<RegisterStep>('FORM');
  const [name, setName] = useState('');
  const [customId, setCustomId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [strength, setStrength] = useState<{ isValid: boolean; score: number; error?: string }>({ 
    isValid: false, 
    score: 0 
  });

  useEffect(() => {
    setStrength(validatePassword(password));
  }, [password]);

  useEffect(() => {
    if (name && !customId) {
      const suggested = name.toLowerCase().replace(/\s+/g, '_').slice(0, 12) + '_' + Math.floor(100 + Math.random() * 899);
      setCustomId(suggested);
    }
  }, [name]);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isSupabaseConfigured()) {
      setError('CRITICAL: Connection configuration missing.');
      return;
    }

    if (!name.trim()) return setError('Full Name is required.');
    if (!customId.trim()) return setError('Profile handle is required.');
    if (!email.trim()) return setError('Email address is required.');
    if (!phone.trim()) return setError('Phone number is required.');
    if (!strength.isValid) return setError(strength.error || 'Password security check failed.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const formattedUsername = customId.replace(/^@/, '');

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            full_name: name,
            username: formattedUsername,
            phone: phone,
            skills: skills
          }
        }
      });
      
      if (authError) throw authError;

      if (data.user) {
        setStep('OTP');
        setResendTimer(60);
      }
    } catch (err: any) {
      setError(err.message || 'Identity initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length < 6) return setError('Please enter the full 6-digit sync code.');

    setLoading(true);
    setError('');
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (verifyError) throw verifyError;
      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Code might be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email
      });
      if (resendError) throw resendError;
      setResendTimer(60);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend protocol.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'OTP') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
        
        <div className="w-full max-w-md glass-panel p-10 md:p-14 rounded-[4rem] shadow-2xl relative z-10 border border-white/10 animate-in fade-in zoom-in duration-500 text-center space-y-10">
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-[2rem] bg-[#10B981]/10 border-2 border-[#10B981]/30 flex items-center justify-center text-[#10B981] mx-auto shadow-[0_0_40px_rgba(16,185,129,0.1)]">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Identity Sync</h2>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">Check your email for the 6-digit code</p>
            </div>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-8">
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { otpRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(idx, e)}
                  className="w-12 h-16 md:w-14 md:h-20 bg-[#050505] border border-white/10 rounded-2xl text-center text-2xl font-black text-[#10B981] focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/10 outline-none transition-all"
                />
              ))}
            </div>

            {error && (
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <div className="space-y-4">
              <button 
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className="w-full py-5 bg-[#10B981] hover:bg-[#059669] text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs transition-all active:scale-[0.98] disabled:opacity-30 shadow-xl shadow-[#10B981]/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Identity'}
              </button>

              <button 
                type="button"
                onClick={handleResendOtp}
                disabled={loading || resendTimer > 0}
                className="text-[9px] font-black text-gray-600 hover:text-white uppercase tracking-[0.4em] transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                {resendTimer > 0 ? (
                  `Resend Protocol in ${resendTimer}s`
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" /> Resend Sync Code
                  </>
                )}
              </button>
            </div>
          </form>

          <button 
            onClick={() => setStep('FORM')}
            className="flex items-center gap-2 text-gray-700 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest mx-auto"
          >
            <ArrowLeft className="w-3 h-3" /> Edit Profile Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#000000] relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#10B981]/5 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="w-full max-w-2xl glass-panel p-8 md:p-14 rounded-[4rem] shadow-2xl relative z-10 border border-white/10 animate-in fade-in zoom-in duration-700">
        <div className="mb-10 space-y-3 text-center">
          <div className="w-16 h-16 bg-[#10B981]/10 border border-[#10B981]/20 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-inner">
             <Fingerprint className="w-8 h-8 text-[#10B981]" />
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white uppercase leading-none">Initialize <span className="text-[#10B981]">Identity</span></h2>
          <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.4em]">Protocol V5.0 // Secured Sync</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                <User className="w-3 h-3" /> Full Name
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#050505] border border-white/5 rounded-2xl py-4 px-6 text-white focus:border-[#10B981] outline-none transition-all font-bold placeholder:text-gray-800"
                placeholder="ALEX FOUNDER"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                <AtSign className="w-3 h-3 text-[#10B981]" /> Profile handle
              </label>
              <input 
                type="text" 
                value={customId.replace(/^@/, '')}
                onChange={(e) => setCustomId(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                required
                className="w-full bg-[#050505] border border-[#10B981]/20 rounded-2xl py-4 px-6 text-[#10B981] focus:border-[#10B981] outline-none transition-all font-bold placeholder:text-gray-800"
                placeholder="UNIQUE_HANDLE"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mail className="w-3 h-3" /> Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#050505] border border-white/5 rounded-2xl py-4 px-6 text-white focus:border-[#10B981] outline-none transition-all font-bold placeholder:text-gray-800"
                placeholder="EMAIL@DOMAIN.AI"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Phone className="w-3 h-3" /> Phone Number
              </label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-[#050505] border border-white/5 rounded-2xl py-4 px-6 text-white focus:border-[#10B981] outline-none transition-all font-bold placeholder:text-gray-800"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Cpu className="w-3 h-3" /> Technical Skill Array
            </label>
            <input 
              type="text" 
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full bg-[#050505] border border-white/5 rounded-2xl py-4 px-6 text-white focus:border-[#10B981] outline-none transition-all font-bold placeholder:text-gray-800"
              placeholder="AI, GTM, FINTECH, DESIGN..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Lock className="w-3 h-3" /> Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#050505] border border-white/5 rounded-2xl py-4 px-6 text-white focus:border-[#10B981] outline-none transition-all font-bold"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-700 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Confirm Password
              </label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-[#050505] border border-white/5 rounded-2xl py-4 px-6 text-white focus:border-[#10B981] outline-none transition-all font-bold"
              />
            </div>
          </div>

          <div className="pt-6">
            {error && (
              <div className="flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/5 p-4 rounded-xl border border-red-500/10 mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-[#10B981] hover:bg-[#059669] text-white rounded-[1.8rem] font-black uppercase tracking-[0.5em] text-xs flex items-center justify-center gap-4 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-[#10B981]/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />} Begin Synchronization
            </button>
          </div>

          <div className="pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              Already a member? 
              <button type="button" onClick={onLoginClick} className="text-[#10B981] font-black uppercase tracking-widest hover:underline ml-2">Authorize Entry</button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
