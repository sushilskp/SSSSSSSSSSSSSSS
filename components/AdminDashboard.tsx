
import React, { useState, useEffect } from 'react';
import { 
  Database, Shield, BarChart3, Settings, Plus, Trash2, 
  ArrowLeft, Loader2, PlayCircle, Clock, CheckCircle2, 
  AlertTriangle, Eye, Globe, ExternalLink, X, Save,
  Users, MessageSquare, ShieldCheck, Activity, ChevronRight,
  FileText, Search, Lock, User, Mail, Calendar, CreditCard,
  Phone, Zap, Tag
} from 'lucide-react';
import { Masterclass, UserProfile } from '../types';
import { supabase } from '../services/supabase';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'library' | 'users' | 'community' | 'system'>('library');
  const [masterclasses, setMasterclasses] = useState<Masterclass[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newMasterclass, setNewMasterclass] = useState<Partial<Masterclass>>({
    title: '',
    level: 'Founder Basic',
    duration: '10 min',
    thumbnail_url: '',
    description: '',
    is_pro: false,
    is_new: true,
    is_coming_soon: false
  });

  const systemLogs = [
    { time: '10:42 AM', event: 'Global logic core updated to v2.5.1', status: 'Success' },
    { time: '09:15 AM', event: 'New masterclass "VC Logic" added to archive', status: 'Info' },
    { time: '08:00 AM', event: 'Nightly backup of founder database completed', status: 'Success' },
    { time: '04:30 AM', event: 'Minor latency detected in Asian nodes', status: 'Warning' },
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [mcRes, profRes] = await Promise.all([
        supabase.from('masterclasses').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false })
      ]);
      
      if (mcRes.error) throw mcRes.error;
      if (profRes.error) throw profRes.error;

      setMasterclasses(mcRes.data || []);
      // Map DB 'id' to 'user_id' for display
      setProfiles((profRes.data || []).map(p => ({ ...p, user_id: p.id, plan: p.plan || 'free' })));
    } catch (err) {
      console.error("Admin Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Confirm permanent removal from archive?")) return;
    try {
      await supabase.from('masterclasses').delete().eq('id', id);
      setMasterclasses(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterclass.title || !newMasterclass.description) {
      alert("Missing core data vectors.");
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('masterclasses')
        .insert([newMasterclass])
        .select();

      if (error) throw error;
      
      setMasterclasses(prev => [data[0], ...prev]);
      setShowAddModal(false);
      setNewMasterclass({
        title: '',
        level: 'Founder Basic',
        duration: '10 min',
        thumbnail_url: '',
        description: '',
        is_pro: false,
        is_new: true,
        is_coming_soon: false
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040410] pt-20 flex flex-col md:flex-row">
      <aside className="w-full md:w-72 border-r border-white/5 bg-[#020205] p-8 flex flex-col gap-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-white">
            <ShieldCheck className="w-6 h-6 text-[#10B981]" />
            <h1 className="text-xl font-black uppercase tracking-tight">Console</h1>
          </div>
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Growth Admin</p>
        </div>

        <nav className="space-y-1.5">
          <AdminNavBtn active={activeTab === 'library'} icon={<Database />} label="Library" onClick={() => setActiveTab('library')} />
          <AdminNavBtn active={activeTab === 'users'} icon={<Users />} label="Founders" onClick={() => setActiveTab('users')} />
          <AdminNavBtn active={activeTab === 'community'} icon={<MessageSquare />} label="Moderation" onClick={() => setActiveTab('community')} />
          <AdminNavBtn active={activeTab === 'system'} icon={<Settings />} label="Registry" onClick={() => setActiveTab('system')} />
        </nav>

        <div className="mt-auto pt-10 border-t border-white/5">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group">
            <ArrowLeft className="w-4 h-4" /> Return to Website
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar bg-[#040410]">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
                {activeTab === 'library' ? 'Archive' : 
                 activeTab === 'users' ? 'Founders' : 
                 activeTab === 'community' ? 'Moderation' : 'Registry'}
              </h2>
              <div className="flex items-center gap-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> global_prod_v4</span>
                <span className="flex items-center gap-1.5 text-[#10B981]"><Activity className="w-3.5 h-3.5" /> status: optimal</span>
              </div>
            </div>

            {activeTab === 'library' && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3.5 bg-white text-black hover:bg-[#10B981] hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all shadow-xl"
              >
                <Plus className="w-4 h-4" /> New Entry
              </button>
            )}
          </div>

          <div className="animate-in fade-in duration-300">
            {activeTab === 'library' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <QuickStat label="Total Classes" value={masterclasses.length.toString()} />
                  <QuickStat label="Pro Content" value={masterclasses.filter(m => m.is_pro).length.toString()} />
                  <QuickStat label="Coming Soon" value={masterclasses.filter(m => m.is_coming_soon).length.toString()} />
                </div>

                <div className="bg-[#020205] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Masterclass</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Intel Stats</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-20 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-[#10B981] mx-auto mb-3" />
                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Retrieving Archive...</span>
                          </td>
                        </tr>
                      ) : masterclasses.map(mc => (
                        <tr key={mc.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-black border border-white/10 overflow-hidden flex-shrink-0">
                                <img src={mc.thumbnail_url} className="w-full h-full object-cover opacity-50" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white uppercase">{mc.title}</p>
                                <p className="text-[10px] text-gray-600 font-medium truncate max-w-[200px]">{mc.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{mc.duration}</p>
                              <div className="flex gap-2">
                                {mc.is_pro && <span className="text-[8px] font-black text-blue-500 uppercase">PRO</span>}
                                {mc.is_coming_soon && <span className="text-[8px] font-black text-yellow-500 uppercase">LOCKED</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                             <button onClick={() => handleDeleteClass(mc.id)} className="p-2.5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <QuickStat label="Total Founders" value={profiles.length.toString()} />
                  <QuickStat label="New Today" value={profiles.filter(p => new Date(p.created_at || '').toDateString() === new Date().toDateString()).length.toString()} />
                </div>

                <div className="bg-[#020205] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="border-b border-white/5 bg-white/[0.02]">
                         <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Founder Identity</th>
                         <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Contact / Tier</th>
                         <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Technical Skills</th>
                         <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Dossier</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {loading ? (
                          <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#10B981]" /></td></tr>
                        ) : profiles.map(prof => (
                          <tr key={prof.user_id} className="hover:bg-white/[0.01] transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
                                  {prof.avatar_url ? <img src={prof.avatar_url} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-800" />}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white uppercase truncate max-w-[150px]">{prof.full_name}</p>
                                  <p className="text-[10px] text-gray-600 font-medium lowercase truncate max-w-[180px]">{prof.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-3 h-3 text-gray-600" />
                                    <span className="text-[10px] font-bold text-gray-400">{prof.phone || 'NO PHONE'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CreditCard className={`w-3 h-3 ${prof.plan === 'pro' ? 'text-blue-500' : 'text-gray-700'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${prof.plan === 'pro' ? 'text-blue-500' : 'text-gray-500'}`}>{prof.plan}</span>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                  {prof.skills ? prof.skills.split(',').map((skill, sIdx) => (
                                    <span key={sIdx} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[8px] font-black text-gray-500 uppercase tracking-tight">{skill.trim()}</span>
                                  )) : <span className="text-[8px] font-bold text-gray-800 uppercase italic">No Skills</span>}
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex flex-col items-end gap-1">
                                  <span className="text-[8px] font-black text-gray-800 uppercase">{new Date(prof.created_at || '').toLocaleDateString()}</span>
                                  <button className="p-2 bg-white/5 rounded-lg border border-white/5 text-gray-700 group-hover:text-[#10B981] group-hover:border-[#10B981]/20 transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                  <div className="bg-[#020205] border border-white/5 rounded-[2.5rem] p-10 space-y-10 shadow-2xl">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                      <Settings className="w-5 h-5 text-[#10B981]" /> Core Parameters
                    </h3>
                    <div className="space-y-6">
                       <SystemToggle label="Public Analysis Engine" description="Enable workbench logic for anonymous visitors." active={true} />
                       <SystemToggle label="Founder Registration" description="Accept new membership requests." active={true} />
                       <SystemToggle label="Search Grounding" description="Use real-time web results in validations." active={true} />
                       <SystemToggle label="Maintenance Protocol" description="Lock entire site for scheduled updates." active={false} />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                   <div className="bg-[#020205] border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" /> Recent Events
                      </h4>
                      <div className="space-y-4">
                        {systemLogs.map((log, i) => (
                          <div key={i} className="flex gap-4 group">
                             <span className="text-[9px] font-bold text-gray-700 uppercase pt-1">{log.time}</span>
                             <div className="space-y-1 flex-1">
                                <p className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{log.event}</p>
                                <span className={`text-[8px] font-black uppercase tracking-tighter ${log.status === 'Success' ? 'text-[#10B981]' : 'text-yellow-500'}`}>{log.status}</span>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
           <div className="w-full max-w-2xl bg-[#040410] p-10 rounded-[3rem] border border-white/10 shadow-2xl relative animate-in zoom-in duration-300">
              <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">Archive Entry</h3>
              
              <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdminField label="Official Title" placeholder="e.g. Market Logic Mastery" value={newMasterclass.title || ''} onChange={v => setNewMasterclass({...newMasterclass, title: v})} />
                <AdminField label="Difficulty Level" placeholder="e.g. Intermediate" value={newMasterclass.level || ''} onChange={v => setNewMasterclass({...newMasterclass, level: v})} />
                <AdminField label="Video Duration" placeholder="e.g. 12:45" value={newMasterclass.duration || ''} onChange={v => setNewMasterclass({...newMasterclass, duration: v})} />
                <AdminField label="Image Path" placeholder="https://..." value={newMasterclass.thumbnail_url || ''} onChange={v => setNewMasterclass({...newMasterclass, thumbnail_url: v})} />
                
                <div className="md:col-span-2 space-y-2">
                   <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Archive Summary</label>
                   <textarea 
                    value={newMasterclass.description || ''}
                    onChange={e => setNewMasterclass({...newMasterclass, description: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-[#10B981] outline-none font-bold resize-none" 
                    rows={4} 
                  />
                </div>

                <div className="md:col-span-2 pt-6">
                   <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full py-5 bg-white text-black hover:bg-[#10B981] hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all disabled:opacity-50"
                  >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Commit Registration"}
                   </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const AdminNavBtn = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all border ${active ? 'bg-white text-black border-white shadow-xl' : 'bg-transparent border-transparent text-gray-500 hover:text-white hover:bg-white/5'}`}>
    {React.cloneElement(icon, { className: `w-4 h-4 ${active ? 'text-black' : 'text-gray-600'}` })}
    <span className="text-[11px] font-black uppercase tracking-tight">{label}</span>
  </button>
);

const QuickStat = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-[#020205] border border-white/5 p-6 rounded-2xl flex flex-col gap-1 shadow-lg">
    <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">{label}</span>
    <span className="text-2xl font-black text-white tracking-tighter">{value}</span>
  </div>
);

const SystemToggle = ({ label, description, active }: { label: string, description: string, active: boolean }) => (
  <div className="flex items-center justify-between p-6 bg-black/20 rounded-2xl border border-white/5">
     <div>
        <h4 className="text-sm font-bold text-white uppercase">{label}</h4>
        <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest">{description}</p>
     </div>
     <button className={`w-12 h-6 rounded-full relative transition-all duration-300 ${active ? 'bg-[#10B981]' : 'bg-gray-800'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${active ? 'left-7' : 'left-1'}`} />
     </button>
  </div>
);

const AdminField = ({ label, placeholder, value, onChange }: { label: string, placeholder: string, value: string, onChange: (v: string) => void }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type="text" 
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder} 
      className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-[#10B981] font-bold placeholder:text-gray-900" 
    />
  </div>
);
