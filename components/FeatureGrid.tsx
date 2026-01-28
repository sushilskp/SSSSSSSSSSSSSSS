import React from 'react';
import { Target, Search, Footprints, ArrowRight, Zap, Cpu, BarChart3, Rocket } from 'lucide-react';

interface FeatureGridProps {
  onCardClick: (type: 'VALIDATION' | 'MARKET' | 'STEPS') => void;
}

const Step = ({ num, title, desc, delay, icon: Icon }: { num: string; title: string; desc: string; delay: string; icon: any }) => (
  <div className={`flex flex-col items-center text-center space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 ${delay} group/step`}>
    <div className="relative">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-[#050505] border border-white/10 flex items-center justify-center text-[#10B981] font-black text-xl shadow-2xl group-hover/step:border-[#10B981]/50 group-hover/step:shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all duration-500 group-hover/step:-translate-y-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/10 to-transparent opacity-0 group-hover/step:opacity-100 transition-opacity" />
        <Icon className="w-6 h-6 md:w-8 md:h-8 group-hover/step:scale-110 transition-transform duration-500" />
      </div>
      <div className="absolute -top-2 -right-2 w-7 h-7 bg-white text-black rounded-lg flex items-center justify-center text-[10px] font-black shadow-xl group-hover/step:bg-[#10B981] group-hover/step:text-white transition-colors">
        {num}
      </div>
    </div>
    
    <div className="space-y-2 px-2">
      <h4 className="text-sm md:text-base font-black text-white uppercase tracking-tighter group-hover/step:text-[#10B981] transition-colors">{title}</h4>
      <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[160px] mx-auto group-hover/step:text-gray-300 transition-colors">
        {desc}
      </p>
    </div>
  </div>
);

export const FeatureGrid: React.FC<FeatureGridProps> = ({ onCardClick }) => {
  return (
    <section id="features" className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5 relative overflow-hidden">
      {/* Decorative background pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#10B981]/5 rounded-full blur-[120px] pointer-events-none animate-pulse-soft" />

      <div className="p-12 md:p-20 glass-panel rounded-[4rem] md:rounded-[5rem] border-white/5 bg-gradient-to-br from-[#050505] to-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10 space-y-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter animate-in fade-in duration-1000">
              The Validation <span className="text-[#10B981] italic">Lifecycle</span>
            </h3>
            <p className="text-[10px] md:text-xs text-gray-600 font-bold uppercase tracking-[0.4em] leading-relaxed">
              Tactical progression from raw intent to series-ready intel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 relative">
            {/* Steps with icons and staggered delays */}
            <Step 
              num="01" 
              title="Identity Input" 
              desc="Describe the problem vector" 
              delay="delay-0"
              icon={Target}
            />
            <Step 
              num="02" 
              title="Market Scan" 
              desc="Deep-layer signal analysis" 
              delay="delay-200"
              icon={Search}
            />
            <Step 
              num="03" 
              title="Logic Scoring" 
              desc="VC-grade viability mapping" 
              delay="delay-500"
              icon={BarChart3}
            />
            <Step 
              num="04" 
              title="Commit Intel" 
              desc="Archive and execute mission" 
              delay="delay-700"
              icon={Rocket}
            />
            
            {/* Dynamic Animated Flow Line */}
            <div className="hidden lg:block absolute top-[40px] left-[15%] right-[15%] h-[2px] bg-white/5 z-0 overflow-hidden rounded-full">
              <div 
                className="h-full w-full bg-gradient-to-r from-transparent via-[#10B981]/60 to-transparent animate-[shimmer_4s_linear_infinite]" 
                style={{ backgroundSize: '200% 100%' }}
              />
            </div>
          </div>
        </div>

        {/* CTA Footer in Lifecycle */}
        <div className="mt-20 pt-12 border-t border-white/5 text-center relative z-10">
          <button 
            onClick={() => onCardClick('VALIDATION')}
            className="inline-flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.5em] text-gray-500 hover:text-[#10B981] transition-all group"
          >
            Initialize full sequence <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
