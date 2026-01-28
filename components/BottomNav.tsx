
import React from 'react';
import { Home, Zap, Users } from 'lucide-react';
import { AppMode } from '../types';

interface BottomNavProps {
  onSetMode: (mode: AppMode) => void;
  currentMode: AppMode;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onSetMode, currentMode }) => {
  const navItems = [
    { mode: AppMode.LANDING, icon: Home, label: 'Home' },
    { mode: AppMode.LAB, icon: Zap, label: 'AI Partner' },
    { mode: AppMode.COMMUNITY, icon: Users, label: 'Network' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[70] bg-[#000000]/80 backdrop-blur-2xl border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around h-20 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentMode === item.mode;
          
          return (
            <button
              key={item.mode}
              onClick={() => onSetMode(item.mode)}
              className="flex flex-col items-center gap-1.5 transition-all relative py-2 min-w-[64px]"
            >
              <div className={`transition-all duration-300 ${isActive ? 'text-[#10B981] scale-110' : 'text-gray-500'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-[#10B981]' : 'text-gray-600'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-1 w-8 h-1 bg-[#10B981] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
