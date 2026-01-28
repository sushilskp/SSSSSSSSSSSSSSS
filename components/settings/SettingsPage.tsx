
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Bell, Trash2, Key, Loader2, Save, Moon, Sun, CheckCircle2, Globe } from 'lucide-react';
import { supabase, validatePassword } from '../../services/supabase';
import { UserSettings } from '../../types';

interface SettingsPageProps {
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single();
      if (error) throw error;
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPwError('');
    setSuccessMsg('');
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setPwError(validation.error || 'Invalid password');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccessMsg("Password updated successfully.");
      setNewPassword('');
    } catch (err: any) {
      setPwError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await supabase.from('user_settings').update({ [key]: value }).eq('user_id', settings.user_id);
  };

  const handleDeleteAccount = async () => {
    if (confirm("DANGER: This will permanently delete your account and all validated idea reports. Are you absolutely sure?")) {
      alert("Request received. For security, please contact support@growth.ai to finalize deletion.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000]">
      <Loader2 className="w-10 h-10 animate-spin text-[#10B981]" />
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] p-6 bg-[#000000] flex items-center justify-center">
      <div className="w-full max-w-3xl glass-panel p-10 rounded-[3rem] shadow-2xl relative animate-in fade-in slide-in-from-bottom-8 duration-500">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 text-xs font-black uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </button>

        <h2 className="text-4xl font-black text-white mb-12 tracking-tighter">System Preferences</h2>

        <div className="space-y-16">
          {/* Section: UI & Theme */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-[10px] font-black text-[#10B981] uppercase tracking-[0.3em]">
              <Globe className="w-4 h-4" /> Experience Settings
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Visual Mode</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{settings?.theme === 'dark' ? 'Onyx Dark' : 'Clean Light'}</p>
                </div>
                <button 
                  onClick={() => updateSetting('theme', settings?.theme === 'dark' ? 'light' : 'dark')}
                  className="p-3 bg-[#000000] border border-white/10 rounded-2xl text-[#10B981] hover:scale-110 transition-all"
                >
                  {settings?.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>

              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Email Alerts</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Activity reports</p>
                </div>
                <button 
                  onClick={() => updateSetting('email_notifications', !settings?.email_notifications)}
                  className={`w-14 h-8 rounded-full relative transition-all duration-300 ${settings?.email_notifications ? 'bg-[#10B981]' : 'bg-gray-800'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${settings?.email_notifications ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Section: Access Security */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-[10px] font-black text-[#10B981] uppercase tracking-[0.3em]">
              <Shield className="w-4 h-4" /> Data Security
            </div>
            
            <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Change Account Password</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 bg-[#000000] border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#10B981] outline-none transition-all"
                    placeholder="Enter new strong password"
                  />
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={saving || !newPassword}
                    className="px-8 py-4 bg-white/5 hover:bg-[#10B981] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-30"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
                  </button>
                </div>
                {pwError && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest ml-1">{pwError}</p>}
                {successMsg && <p className="text-[#10B981] text-[9px] font-black uppercase tracking-widest ml-1">{successMsg}</p>}
              </div>

              <div className="pt-6 border-t border-white/5">
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut({ scope: 'others' });
                    alert("Signed out of all other sessions.");
                  }}
                  className="w-full py-4 border border-white/5 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Terminate other sessions
                </button>
              </div>
            </div>
          </section>

          {/* Section: Danger Zone */}
          <section className="pt-8 border-t border-red-500/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-red-500/5 rounded-[2.5rem] border border-red-500/10">
              <div>
                <p className="text-sm font-bold text-red-500">Deactivate Growth.ai Account</p>
                <p className="text-[10px] text-red-500/50 font-black uppercase tracking-widest mt-1">This action cannot be undone.</p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="px-8 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-red-500/20"
              >
                Delete Account
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
