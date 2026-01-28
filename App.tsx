
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatContainer } from './components/ChatContainer';
import { SummaryPanel } from './components/SummaryPanel';
import { CommunityPage } from './components/community/CommunityPage';
import { LandingPage } from './components/LandingPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { AdminDashboard } from './components/AdminDashboard';
import { BottomNav } from './components/BottomNav';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { AppMode, IdeaMetrics, UserProfile } from './types';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.LANDING);
  const [metrics, setMetrics] = useState<IdeaMetrics | null>(null);
  const [pendingIdea, setPendingIdea] = useState<string | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const ensureProfileExists = useCallback(async (user: any) => {
    if (!user) return null;
    
    const sessionProfile: UserProfile = {
      user_id: user.id,
      full_name: user.user_metadata?.full_name || 'Neural Founder',
      username: user.user_metadata?.username || '',
      email: user.email || '',
      plan: 'free',
      created_at: user.created_at || new Date().toISOString()
    };

    try {
      // Try to fetch from DB
      const { data: dbUser, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (dbUser && !error) {
        return { ...dbUser, user_id: dbUser.id, plan: dbUser.plan || 'free' } as UserProfile;
      }
      
      // If table doesn't exist or user not found, use session data temporarily
      return sessionProfile;
    } catch (err) {
      console.warn("Database check failed, using session profile.");
      return sessionProfile;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      // Emergency timeout to prevent infinite load
      const timeout = setTimeout(() => {
        setIsInitializing(false);
      }, 5000);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await ensureProfileExists(session.user);
          setUserProfile(profile);
        }
      } catch (err) {
        console.error("Auth init failed:", err);
      } finally {
        clearTimeout(timeout);
        setIsInitializing(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await ensureProfileExists(session.user);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
        setMode(AppMode.LANDING);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [ensureProfileExists]);

  const handleMetricsUpdate = (newMetrics: IdeaMetrics) => setMetrics(newMetrics);

  const handleStartValidation = (idea?: string) => {
    if (idea) setPendingIdea(idea);
    setMode(AppMode.LAB);
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setMode(AppMode.LANDING);
  };

  if (isInitializing) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#000000] gap-6">
        <div className="w-10 h-10 border-2 border-[#10B981]/10 border-t-[#10B981] rounded-full animate-spin" />
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-800 animate-pulse">Syncing Logic Nodes...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (!userProfile) {
      return authView === 'login' ? (
        <LoginPage 
          onLoginSuccess={() => {}} 
          onBack={() => setAuthView('login')} 
          onRegisterClick={() => setAuthView('register')} 
        />
      ) : (
        <RegisterPage 
          onRegisterSuccess={() => setAuthView('login')} 
          onBack={() => setAuthView('login')} 
          onLoginClick={() => setAuthView('login')} 
        />
      );
    }

    switch (mode) {
      case AppMode.ADMIN:
        return <AdminDashboard onBack={() => setMode(AppMode.LANDING)} />;
      case AppMode.PROFILE:
        return <ProfilePage onLogout={handleLogout} onBack={() => setMode(AppMode.LAB)} onProfileUpdate={handleProfileUpdate} />;
      case AppMode.SETTINGS:
        return <ProfilePage onLogout={handleLogout} onBack={() => setMode(AppMode.LAB)} initialTab="settings" onProfileUpdate={handleProfileUpdate} />;
      case AppMode.COMMUNITY:
        return <CommunityPage />;
      case AppMode.LAB:
        return (
          <div className="h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] relative overflow-hidden flex items-stretch justify-center p-0 bg-transparent">
            <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
               <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#10B981]/5 rounded-full blur-[200px] animate-pulse-soft" />
               <div className="absolute inset-0 opacity-[0.2] bg-[linear-gradient(to_right,rgba(16,185,129,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.08)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            <div className="w-full max-w-[1700px] mx-auto flex lg:flex-row flex-col items-center lg:items-stretch justify-center gap-0 lg:gap-8 relative z-10 animate-in fade-in zoom-in-95 duration-1000 px-0 md:px-8 lg:px-12 py-0 lg:py-10 h-full">
              <div className="w-full lg:flex-1 h-full overflow-hidden flex flex-col justify-center">
                <ChatContainer 
                  onMetricsUpdate={handleMetricsUpdate} 
                  currentMetrics={metrics} 
                  initialIdea={pendingIdea}
                  onIdeaProcessed={() => setPendingIdea(undefined)}
                  onProfileUpdate={handleProfileUpdate}
                />
              </div>
              <div className="hidden lg:flex w-[460px] shrink-0 h-full overflow-y-auto custom-scrollbar pr-2 flex-col justify-center">
                <SummaryPanel metrics={metrics} />
              </div>
            </div>
          </div>
        );
      case AppMode.LANDING:
      default:
        return (
          <LandingPage 
            onStartValidation={handleStartValidation} 
            onJoinCommunity={() => setMode(AppMode.COMMUNITY)} 
            onEnterAdmin={() => setMode(AppMode.ADMIN)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#10B981]/40 flex flex-col font-sans antialiased overflow-hidden">
      {userProfile && <Header onSetMode={setMode} currentMode={mode} userProfile={userProfile} />}
      <main className={`flex-1 ${!userProfile || mode === AppMode.LANDING || mode === AppMode.ADMIN ? '' : 'pt-20 pb-20 lg:pb-0 h-full'}`}>
        {renderContent()}
      </main>
      {userProfile && mode !== AppMode.ADMIN && <BottomNav onSetMode={setMode} currentMode={mode} />}
    </div>
  );
};

export default App;
