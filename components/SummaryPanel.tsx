import React, { useEffect, useState } from 'react';
import { TrendingUp, Shield, User, Zap, BarChart3, Globe, Info, Activity, Target, Layers, ArrowUpRight, Cpu, Network, Database } from 'lucide-react';
import { IdeaMetrics } from '../types';

interface SummaryPanelProps {
  metrics: IdeaMetrics | null;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ metrics }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (metrics) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [metrics]);

  if (!metrics) {
    return (
      <div className="flex flex-col gap-6 h-full animate-in fade-in slide-in-from-right-12 duration-1000">
        <div className="glass-morphism p-12 rounded-[3.5rem] w-full flex-1 flex flex-col items-center justify-center text-center space-y-12 border-dashed border-2 border-white/5 relative overflow-hidden group bg-[#020202]/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.02)_0%,transparent_80%)]" />
          
          <div className="relative">
            <div className="w-36 h-36 rounded-[3.5rem] bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-700 relative z-10">
              <Cpu className="w-16 h-16 text-gray-800 group-hover:text-[#10B981] transition-colors" />
            </div>
            <div className="absolute inset-0 bg-[#10B981]/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="space-y-6 relative z-10 px-4">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Logic Module Offline</h3>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.4em] leading-relaxed max-w-[280px] mx-auto">
              Initialize validation sequence in the primary forge console to populate tactical data nodes.
            </p>
          </div>

          <div className="flex gap-3 relative z-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                 <div className="w-1/3 h-full bg-[#10B981]/30 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score > 80) return 'text-[#10B981]';
    if (score > 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score > 80) return 'bg-[#10B981]';
    if (score > 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col gap-6 h-full animate-in slide-in-from-right-12 duration-1000">
      {/* Primary Gauge */}
      <div className={`glass-morphism p-10 rounded-[3.5rem] border border-white/10 relative overflow-hidden transition-all duration-700 bg-[#020202]/40 ${animate ? 'ring-8 ring-[#10B981]/10 scale-[1.01]' : ''}`}>
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12">
          <Network className="w-56 h-56" />
        </div>
        
        <div className="flex items-center justify-between mb-12 relative z-10">
           <div className="space-y-3">
             <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${getScoreBg(metrics.viabilityScore)} animate-pulse`} />
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">Viability Index</h4>
             </div>
             <div className="flex items-baseline gap-2">
               <span className={`text-8xl font-black tracking-tighter tabular-nums ${getScoreColor(metrics.viabilityScore)}`}>{metrics.viabilityScore}</span>
               <span className="text-3xl font-black text-gray-700 uppercase">%</span>
             </div>
           </div>
           <div className="p-6 bg-white/5 border border-white/10 rounded-[2.25rem] shadow-2xl">
             <Target className={`w-12 h-12 ${getScoreColor(metrics.viabilityScore)}`} />
           </div>
        </div>

        {/* Viability Bar System */}
        <div className="space-y-6 relative z-10">
          <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5 relative">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out relative shadow-2xl ${getScoreBg(metrics.viabilityScore)}`}
              style={{ width: `${metrics.viabilityScore}%` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-5 bg-white/[0.03] border border-white/5 rounded-2xl md:rounded-3xl">
             <Info className={`w-5 h-5 flex-shrink-0 mt-1 ${getScoreColor(metrics.viabilityScore)}`} /> 
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
               {metrics.viabilityScore > 80 ? 'CRITICAL: High-conviction sector pattern identified. Expansion potential optimal.' : 
                metrics.viabilityScore > 60 ? 'CAUTION: Viability verified with significant friction points. Iteration required.' : 
                'WARNING: High risk density detected. Core assumptions failing validation stress tests.'}
             </p>
          </div>
        </div>
      </div>

      {/* Grid Dashboard */}
      <div className="grid grid-cols-2 gap-6 flex-1">
        <MetricCard 
          icon={<Globe className="w-7 h-7" />} 
          label="Market Depth" 
          value={metrics.marketDemand} 
          color={metrics.marketDemand === 'High' ? 'text-[#10B981]' : 'text-gray-500'}
          trend="Positive"
          accent="green"
        />
        <MetricCard 
          icon={<Shield className="w-7 h-7" />} 
          label="Resistance" 
          value={metrics.competitionLevel} 
          color={metrics.competitionLevel === 'High' ? 'text-red-500' : 'text-[#10B981]'}
          trend="Static"
          accent="green"
        />
        
        {/* Deep Logic Breakdown */}
        <div className="col-span-2 glass-morphism p-10 rounded-[3rem] border border-white/5 space-y-10 group bg-[#020202]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Activity className="w-6 h-6 text-[#10B981]" />
              <h5 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Signal Vectors</h5>
            </div>
            <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">v2.5 Intelligence</span>
          </div>
          
          <div className="space-y-6">
             <VectorLine label="Logic Integrity" percent={metrics.viabilityScore} color="emerald" />
             <SimulationLine label="Market Velocity" percent={metrics.viabilityScore + 8 > 100 ? 98 : metrics.viabilityScore + 8} color="green" />
             <SimulationLine label="Scaling Friction" percent={metrics.viabilityScore < 50 ? 85 : 42} color="red" />
          </div>
        </div>

        {/* Global Export */}
        <button className="col-span-2 group py-8 bg-white hover:bg-[#10B981] text-black hover:text-white rounded-[2.5rem] text-[13px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl border border-white/10">
          <Database className="w-6 h-6" /> 
          Commit Intel Dossier
          <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, color, trend, accent }: { icon: any, label: string, value: string, color: string, trend: string, accent?: 'emerald' | 'green' }) => (
  <div className={`glass-morphism p-8 rounded-[2.5rem] border border-white/5 space-y-6 group hover:border-[#10B981]/20 transition-all relative overflow-hidden bg-[#020202]/30`}>
    <div className={`p-5 bg-white/[0.03] rounded-2xl w-fit ${color} group-hover:scale-110 transition-transform duration-500`}>
      {icon}
    </div>
    <div>
      <h5 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-2">{label}</h5>
      <p className={`text-3xl font-black uppercase tracking-tighter ${color}`}>{value}</p>
      <div className="flex items-center gap-2 mt-3">
         <div className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse`} />
         <span className={`text-[9px] font-black uppercase tracking-widest ${color} opacity-60`}>
           {trend}
         </span>
      </div>
    </div>
  </div>
);

const VectorLine = ({ label, percent, color }: { label: string, percent: number, color: 'emerald' | 'green' }) => (
  <div className="space-y-3">
    <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
      <span>{label}</span>
      <span className="text-white">{percent}%</span>
    </div>
    <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden p-0.5">
      <div 
        className={`h-full bg-gradient-to-r from-[#10B981] to-[#2DD4BF] rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)]`} 
        style={{ width: `${percent}%` }} 
      />
    </div>
  </div>
);

const SimulationLine = ({ label, percent, color }: { label: string, percent: number, color: string }) => (
  <div className="space-y-3">
    <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
      <span>{label}</span>
      <span className="text-gray-400">{percent}%</span>
    </div>
    <div className="h-2.5 bg-white/[0.02] rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ease-out ${color === 'green' ? 'bg-[#10B981]/40' : color === 'red' ? 'bg-red-500/40' : 'bg-[#10B981]/20'}`} 
        style={{ width: `${percent}%` }} 
      />
    </div>
  </div>
);