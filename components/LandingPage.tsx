import React, { useState, useEffect } from 'react';
import { 
  Rocket, Target, Zap, Users, ArrowRight, ShieldCheck, 
  TrendingUp, Search, Footprints, Sparkles, PlayCircle, 
  Clock, Star, GraduationCap, Plus, Trash2, Loader2, 
  ImageIcon, Settings as SettingsIcon, XCircle,
  KeyRound, ShieldAlert, Lock, ChevronRight, Briefcase,
  MapPin, Languages, IndianRupee, BrainCircuit, Cpu, 
  Network, Fingerprint, Activity, LockIcon, Quote, CheckCircle2, MessageSquare, Send, Check, Terminal, Database
} from 'lucide-react';
import { AppMode, Masterclass } from '../types';
import { supabase } from '../services/supabase';
import { communityService } from '../services/communityService';

interface LandingPageProps {
  onStartValidation: (idea?: string) => void;
  onJoinCommunity: () => void;
  onEnterAdmin: () => void;
}

interface PlatformFeedback {
  id: string;
  name: string;
  role: string;
  feedback: string;
  improvements: string;
  created_at: string;
}

const UPCOMING_CLASSES = [
  { title: "UPI & ONDC Integration", category: "Fintech Core", duration: "15 min" },
  { title: "Vernacular GTM Strategies", category: "Bharat Growth", duration: "12 min" },
  { title: "AgriTech Unit Economics", category: "Sustainability", duration: "18 min" },
  { title: "Navigating RBI Regulations", category: "Compliance", duration: "20 min" },
  { title: "Tier 2/3 Market Analysis", category: "Strategy", duration: "14 min" },
  { title: "DPI Stack for Builders", category: "Engineering", duration: "16 min" }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStartValidation, onJoinCommunity, onEnterAdmin }) => {
  const [ideaInput, setIdeaInput] = useState('');
  const [showGate, setShowGate] = useState(false);
  const [gateKey, setGateKey] = useState('');
  const [gateError, setGateError] = useState(false);
  const [masterclasses, setMasterclasses] = useState<Masterclass[]>([]);
  const [loadingArchive, setLoadingArchive] = useState(true);

  // Feedback State
  const [feedbacks, setFeedbacks] = useState<PlatformFeedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [feedbackForm, setFeedbackForm] = useState({ name: '', role: '', content: '', improvements: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  
  const ADMIN_PROTOCOL_KEY = '040410';

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [feedbackData, archiveData] = await Promise.all([
          communityService.getPlatformFeedback(4),
          supabase.from('masterclasses').select('*').order('created_at', { ascending: false }).limit(6)
        ]);
        setFeedbacks(feedbackData as any);
        setMasterclasses(archiveData.data || []);
      } catch (err) {
        console.error("Failed to fetch community intelligence loop:", err);
      } finally {
        setLoadingFeedbacks(false);
        setLoadingArchive(false);
      }
    };
    fetchLandingData();
  }, []);

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gateKey === ADMIN_PROTOCOL_KEY) {
      setShowGate(false);
      setGateKey('');
      onEnterAdmin();
    } else {
      setGateError(true);
      setTimeout(() => setGateError(false), 2000);
    }
  };

  const handleIdeaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ideaInput.trim()) {
      onStartValidation(ideaInput.trim());
    } else {
      onStartValidation();
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.name || !feedbackForm.content) {
      setFeedbackError("FOUNDER IDENTITY AND INTEL BODY REQUIRED.");
      return;
    }
    setSubmittingFeedback(true);
    setFeedbackError('');
    try {
      await communityService.submitFeedback(feedbackForm);
      setFeedbackSuccess(true);
      
      const newFeedbackObj: PlatformFeedback = {
        id: Date.now().toString(),
        name: feedbackForm.name,
        role: feedbackForm.role,
        feedback: feedbackForm.content,
        improvements: feedbackForm.improvements,
        created_at: new Date().toISOString()
      };
      setFeedbacks(prev => [newFeedbackObj, ...prev].slice(0, 4));
      
      setFeedbackForm({ name: '', role: '', content: '', improvements: '' });
      setTimeout(() => setFeedbackSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      setFeedbackError("MAINFRAME UPLINK FAILED. PLEASE TRY AGAIN.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleQuickTheme = (theme: string) => {
    onStartValidation(`Find a high-impact startup problem in the ${theme} sector in India.`);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white overflow-x-hidden relative">
      {/* Hero Section - Centered and Emerald Theme */}
      <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6 overflow-hidden">
        {/* Background Logic Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'linear-gradient(#10B981 1px, transparent 1px), linear-gradient(90deg, #10B981 1px, transparent 1px)', backgroundSize: '80px 80px' }}>
        </div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-[15%] right-[5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#10B981]/10 rounded-full blur-[120px] md:blur-[180px] animate-pulse" />
          <div className="absolute bottom-[15%] left-[5%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-[#10B981]/5 rounded-full blur-[100px] md:blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-12 md:space-y-16 py-20">
          <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mx-auto">
              <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">System Intelligence v4.2.0</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl md:text-[9rem] font-black tracking-tighter leading-[0.85] uppercase text-white">
              WHAT'S YOUR <br />
              <span className="text-[#10B981] italic">STARTUP IDEA?</span>
            </h1>
          </div>

          <div className="max-w-2xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <form onSubmit={handleIdeaSubmit} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-[2.2rem] md:rounded-[2.8rem] blur opacity-20 group-focus-within:opacity-40 transition-opacity duration-500"></div>
              <div className="relative flex flex-col sm:flex-row gap-3 p-2 md:p-3 bg-[#050505] border border-white/10 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl transition-all group-focus-within:border-[#10B981]/30">
                <input 
                  type="text"
                  value={ideaInput}
                  onChange={(e) => setIdeaInput(e.target.value)}
                  placeholder="Ask your AI partner a question..."
                  className="flex-1 bg-transparent py-3 md:py-5 px-6 md:px-8 text-white text-base md:text-xl focus:outline-none placeholder:text-gray-800 font-bold"
                />
                <button 
                  type="submit"
                  className="px-8 md:px-12 py-4 md:py-5 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl md:rounded-[1.8rem] font-black uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-[#10B981]/20 whitespace-nowrap"
                >
                  Analyze <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </form>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 animate-in fade-in duration-1000 delay-500 px-4">
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em] mr-2">Strategy Hub:</span>
            <ThemeChip label="Unit Economics" onClick={() => handleQuickTheme("Unit Economics for Bharat")} />
            <ThemeChip label="GTM Strategy" onClick={() => handleQuickTheme("Go-To-Market for Tier 2 cities")} />
            <ThemeChip label="Tech Architecture" onClick={() => handleQuickTheme("Scalable AI Backend")} />
            <ThemeChip label="Pitch Deck Intel" onClick={() => handleQuickTheme("Investor-ready metrics")} />
          </div>
        </div>
      </section>

      {/* AI Partner Co-founder Section */}
      <section className="py-20 md:py-32 px-4 md:px-6 bg-[#030303] relative border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/20 text-[9px] font-black text-[#10B981] uppercase tracking-widest rounded-lg">
               <BrainCircuit className="w-3.5 h-3.5" /> Neural Co-founder
             </div>
             <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">The Partner who <br /> <span className="text-[#10B981]">never sleeps.</span></h2>
             <p className="text-gray-500 font-medium text-lg leading-relaxed">
               More than just a chatbot. Your AI Partner understands the operational friction of the Indian market, regulatory hurdles, and digital public infrastructure (DPI) better than anyone.
             </p>
             <div className="grid grid-cols-2 gap-6 pt-6">
                <ValuePoint icon={<Zap />} title="Real-time Pivot" desc="Instant feedback on model changes." />
                <ValuePoint icon={<Users />} title="Network Access" desc="Sync with the founder collective." />
             </div>
          </div>
          <div className="relative group">
             <div className="absolute -inset-4 bg-[#10B981]/5 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
             <div className="glass-panel p-10 rounded-[4rem] border border-white/10 relative overflow-hidden">
                <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Partner Health</h4>
                   <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-[#10B981] animate-pulse" />
                   </div>
                   <div className="flex justify-between text-[11px] font-black text-white uppercase tracking-widest">
                      <span>Reasoning Engine</span>
                      <span>v3.5 Active</span>
                   </div>
                   <div className="flex justify-between text-[11px] font-black text-white uppercase tracking-widest">
                      <span>Market Knowledge</span>
                      <span>Synced (Live)</span>
                   </div>
                   <div className="flex justify-between text-[11px] font-black text-white uppercase tracking-widest">
                      <span>UPI/ONDC Logic</span>
                      <span className="text-[#10B981]">Integrated</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Dynamic Accelerator Section - Always Populated */}
      <section className="py-20 md:py-32 px-4 md:px-6 bg-[#000000] relative border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/20 text-[9px] font-black text-[#10B981] uppercase tracking-widest rounded-lg">
               <GraduationCap className="w-3.5 h-3.5" /> Growth Accelerator
             </div>
             <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">Founder <span className="text-[#10B981] italic">Accelerator</span> Archive</h2>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em]">Proprietary GTM and Scale Logic for Modern Builders.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingArchive ? (
              [1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 rounded-[3rem] animate-pulse" />)
            ) : (
              <>
                {/* Render DB Masterclasses if they exist */}
                {masterclasses.map(mc => (
                  mc.is_coming_soon ? (
                    <LockedMasterclass key={mc.id} title={mc.title} category={mc.level} duration={mc.duration} />
                  ) : (
                    <MasterclassCard key={mc.id} masterclass={mc} />
                  )
                ))}
                
                {/* Always show Upcoming placeholders if database is low on content */}
                {(masterclasses.length < 3) && UPCOMING_CLASSES.map((uc, idx) => (
                  <LockedMasterclass key={`upcoming-${idx}`} title={uc.title} category={uc.category} duration={uc.duration} />
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Refined Feedback Section */}
      <section className="py-20 md:py-32 px-4 md:px-6 bg-[#000000] relative border-b border-white/5 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#10B981]/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto space-y-16 relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#10B981]/10 border border-[#10B981]/20 rounded-full">
              <Terminal className="w-4 h-4 text-[#10B981]" />
              <span className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.4em]">Mainframe Protocol</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
              FEED<span className="text-[#10B981] italic">BACK</span>
            </h2>
            <p className="text-[10px] md:text-xs text-gray-500 font-black uppercase tracking-[0.4em] max-w-2xl mx-auto leading-relaxed">
              CONTRIBUTE TO THE GROWTH LOGIC CORE. SHARE YOUR EXPERIENCE OR REQUEST AN OPTIMIZATION.
            </p>
          </div>

          <div className="glass-panel p-6 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl bg-[#050505]/60 relative overflow-hidden">
             {/* Terminal Header Bar */}
             <div className="flex items-center justify-between mb-10 pb-5 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/40" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                    <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                  </div>
                  <div className="h-3 w-px bg-white/10 mx-2" />
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">LOGIC NODE: ACTIVE</span>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="w-3 h-3 text-[#10B981] animate-pulse" />
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">CONNECTION: STABLE</span>
                </div>
             </div>

             {feedbackSuccess ? (
               <div className="py-20 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-500">
                  <div className="w-20 h-20 rounded-full bg-[#10B981]/10 flex items-center justify-center border-2 border-[#10B981]/30 text-[#10B981]">
                    <Check className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">INTEL COMMITTED</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">TRANSMISSION TO GROWTH CORE V4.2 SUCCESSFUL</p>
                  </div>
                  <button 
                    onClick={() => setFeedbackSuccess(false)}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    New Sequence
                  </button>
               </div>
             ) : (
               <form onSubmit={handleFeedbackSubmit} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] ml-1">FOUNDER IDENTITY</label>
                      <input 
                        type="text" 
                        value={feedbackForm.name}
                        onChange={e => setFeedbackForm({...feedbackForm, name: e.target.value})}
                        placeholder="NAME / ALIAS"
                        className="w-full bg-[#000000] border border-white/5 rounded-xl py-4 px-6 text-xs text-white focus:border-[#10B981] outline-none font-black tracking-widest uppercase transition-all"
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] ml-1">STARTUP / ROLE</label>
                      <input 
                        type="text" 
                        value={feedbackForm.role}
                        onChange={e => setFeedbackForm({...feedbackForm, role: e.target.value})}
                        placeholder="CEO @ VENTURE"
                        className="w-full bg-[#000000] border border-white/5 rounded-xl py-4 px-6 text-xs text-white focus:border-[#10B981] outline-none font-black tracking-widest uppercase transition-all"
                      />
                   </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] ml-1">INTEL BODY (FEEDBACK)</label>
                    <textarea 
                      value={feedbackForm.content}
                      onChange={e => setFeedbackForm({...feedbackForm, content: e.target.value})}
                      placeholder="UPLINK YOUR VALIDATION FEEDBACK..."
                      rows={3}
                      className="w-full bg-[#000000] border border-white/5 rounded-xl py-4 px-6 text-xs text-white focus:border-[#10B981] outline-none font-bold tracking-wider uppercase transition-all resize-none leading-relaxed"
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-[#10B981] uppercase tracking-[0.3em] ml-1">OPTIMIZATION REQUEST</label>
                    <textarea 
                      value={feedbackForm.improvements}
                      onChange={e => setFeedbackForm({...feedbackForm, improvements: e.target.value})}
                      placeholder="CORE LOGIC REFINEMENT PROPOSAL..."
                      rows={2}
                      className="w-full bg-[#000000] border border-white/10 rounded-xl py-4 px-6 text-xs text-white focus:border-[#10B981] outline-none font-bold tracking-wider uppercase transition-all resize-none leading-relaxed"
                    />
                 </div>

                 {feedbackError && (
                   <p className="text-[9px] text-red-500 font-black uppercase tracking-widest text-center">{feedbackError}</p>
                 )}

                 <button 
                   type="submit"
                   disabled={submittingFeedback}
                   className="w-full py-5 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-50 shadow-xl shadow-[#10B981]/20 group"
                 >
                   {submittingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                     <>
                        <Send className="w-4 h-4" /> TRANSMIT INTEL
                     </>
                   )}
                 </button>
               </form>
             )}
          </div>

          {/* Intelligence Loop Sub-Feed */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/5" />
              <h4 className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">LIVE INTELLIGENCE LOOP</h4>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loadingFeedbacks ? (
                 [1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)
              ) : feedbacks.map(f => (
                <div key={f.id} className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 hover:border-[#10B981]/20 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-[9px] font-black text-[#10B981] border border-white/10">{f.name[0]}</div>
                      <p className="text-[9px] font-black text-white uppercase truncate">{f.name}</p>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium italic line-clamp-2 leading-relaxed">"{f.feedback}"</p>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                     <span className="text-[8px] font-black text-[#10B981] uppercase tracking-widest">{f.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Admin Gate Modal */}
      {showGate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-300">
           <div className={`w-full max-w-md bg-[#040410] p-10 rounded-[2rem] border border-white/5 shadow-2xl text-center space-y-10 relative overflow-hidden transition-all duration-300 ${gateError ? 'ring-2 ring-red-500 scale-95' : ''}`}>
              <button onClick={() => setShowGate(false)} className="absolute top-6 right-6 text-gray-600 hover:text-white transition-all"><XCircle className="w-6 h-6" /></button>
              
              <div className="space-y-3">
                <ShieldAlert className={`w-12 h-12 mx-auto ${gateError ? 'text-red-500' : 'text-[#10B981]'}`} />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Security Protocol</h3>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Authorized Access Required</p>
              </div>

              <form onSubmit={handleGateSubmit} className="space-y-4">
                 <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-[#10B981] transition-colors" />
                    <input 
                      type="password" 
                      value={gateKey}
                      onChange={e => setGateKey(e.target.value)}
                      placeholder="Enter Access Sequence..."
                      autoFocus
                      className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:border-[#10B981] outline-none transition-all font-bold tracking-widest"
                    />
                 </div>
                 <button type="submit" className="w-full py-4 bg-white text-black hover:bg-[#10B981] hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">Verify Protocol</button>
              </form>
           </div>
        </div>
      )}

      <footer className="py-16 md:py-24 px-4 md:px-6 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
          <div className="space-y-6">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-10 h-10 bg-[#10B981] rounded-xl overflow-hidden">
                <img src="https://i.postimg.cc/nzhnD7TF/DC77304F-CBB0-4F29-8AEA-65E8503C738E.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white uppercase">Growth</span>
            </div>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">Partner Intel © 2025</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            <FooterLink label="Platform Lab" />
            <FooterLink label="Founder Feed" />
            <FooterLink label="Terms of Access" />
            <button 
              onClick={() => setShowGate(true)}
              className="text-[10px] font-black uppercase tracking-widest text-gray-700 hover:text-[#10B981] transition-colors border-l border-white/10 pl-12 flex items-center gap-2"
            >
              Admin Console <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const MasterclassCard: React.FC<{ masterclass: Masterclass }> = ({ masterclass }) => (
  <div className="glass-panel p-8 rounded-[3rem] border border-white/5 group hover:border-[#10B981]/30 transition-all duration-500 flex flex-col space-y-6 relative overflow-hidden bg-[#050505]/40">
     <div className="absolute top-0 left-0 w-full h-1.5 bg-[#10B981]/20 overflow-hidden">
        <div className="h-full w-1/3 bg-[#10B981] animate-[shimmer_2s_infinite]" />
     </div>
     <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] border border-[#10B981]/20">
        <PlayCircle className="w-7 h-7" />
     </div>
     <div className="space-y-2">
        <h4 className="text-xl font-black text-white uppercase tracking-tight">{masterclass.title}</h4>
        <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">{masterclass.description}</p>
     </div>
     <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
           <Clock className="w-3 h-3 text-gray-700" />
           <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{masterclass.duration}</span>
        </div>
        <span className="text-[9px] font-black text-[#10B981] uppercase tracking-[0.2em]">{masterclass.level}</span>
     </div>
  </div>
);

// Fix: Defining as React.FC to allow key prop when mapping
const LockedMasterclass: React.FC<{ title: string; category: string; duration: string }> = ({ title, category, duration }) => (
  <div className="glass-panel p-8 rounded-[3rem] border border-white/5 group relative overflow-hidden flex flex-col items-center text-center space-y-6 grayscale hover:grayscale-0 transition-all duration-700 hover:border-[#10B981]/20 bg-white/[0.01]">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 pointer-events-none" />
    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-700 group-hover:text-[#10B981] group-hover:bg-[#10B981]/5 transition-all">
       <LockIcon className="w-6 h-6" />
    </div>
    <div className="space-y-2 relative z-10">
      <h4 className="text-sm font-black text-white uppercase tracking-tight">{title}</h4>
      <div className="flex items-center justify-center gap-3">
        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{category}</span>
        <span className="w-1 h-1 rounded-full bg-gray-800" />
        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">COMING SOON</span>
      </div>
    </div>
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
       <span className="text-[7px] font-black text-yellow-500 uppercase tracking-[0.3em]">LOCKED ARCHIVE</span>
    </div>
  </div>
);

const ThemeChip = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-[#10B981]/10 hover:border-[#10B981]/40 transition-all active:scale-95"
  >
    {label}
  </button>
);

const ValuePoint = ({ icon, title, desc, color }: { icon: any, title: string, desc: string, color?: string }) => (
  <div className="flex items-start gap-4">
    <div className={`p-3 bg-white/5 rounded-xl border border-white/10 ${color || 'text-[#10B981]'}`}>
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-black text-white uppercase tracking-tight">{title}</h4>
      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-relaxed">{desc}</p>
    </div>
  </div>
);

const FooterLink = ({ label }: { label: string }) => (
  <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">{label}</button>
);