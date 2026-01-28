
import React from 'react';
import { Home, Zap, Users, User as UserIcon } from 'lucide-react';
import { AppMode, UserProfile } from '../types';

interface HeaderProps {
  onSetMode: (mode: AppMode) => void;
  currentMode?: AppMode;
  userProfile?: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({ onSetMode, currentMode, userProfile }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[60] bg-[#000000]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onSetMode(AppMode.LANDING)}>
          <div className="w-10 h-10 bg-[#10B981] rounded-xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)] overflow-hidden relative">
            <div className="absolute inset-0 bg-[#10B981]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <img 
              src="https://i.postimg.cc/nzhnD7TF/DC77304F-CBB0-4F29-8AEA-65E8503C738E.jpg" 
              alt="Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">
            Growth
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-8 mr-auto ml-12">
          <button 
            onClick={() => onSetMode(AppMode.LANDING)}
            className={`text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${currentMode === AppMode.LANDING ? 'text-[#10B981]' : 'text-gray-400 hover:text-white'}`}
          >
            <Home className="w-4 h-4" /> Home
          </button>
          <button 
            onClick={() => onSetMode(AppMode.LAB)}
            className={`text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${currentMode === AppMode.LAB ? 'text-[#10B981]' : 'text-gray-400 hover:text-white'}`}
          >
            <Zap className="w-4 h-4" /> AI Partner
          </button>
          <button 
            onClick={() => onSetMode(AppMode.COMMUNITY)}
            className={`text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${currentMode === AppMode.COMMUNITY ? 'text-[#10B981]' : 'text-gray-400 hover:text-white'}`}
          >
            <Users className="w-4 h-4" /> Network
          </button>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => onSetMode(AppMode.PROFILE)}
            className={`p-1 rounded-xl border transition-all flex items-center gap-3 sm:pr-4 ${currentMode === AppMode.PROFILE ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-[#10B981]/30'}`}
          >
            <div className="w-9 h-9 rounded-lg bg-black overflow-hidden flex items-center justify-center border border-white/10 transition-transform hover:scale-105">
              {userProfile?.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover opacity-100 block" 
                  key={userProfile.avatar_url} // Force remount on URL change
                />
              ) : (
                <UserIcon className="w-4 h-4 text-gray-500" />
              )}
            </div>
            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Identity</span>
          </button>
        </div>
      </div>
    </header>
  );
};
