import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SnakeGame from './components/SnakeGame';
import TicTacToe from './components/TicTacToe';
import Tetris from './components/Tetris';
import WarshipShooter from './components/WarshipShooter';
import { AudioProvider, SidebarPlaylist, FooterPlayer } from './components/MusicPlayer';
import { 
  Activity, 
  ChevronRight, 
  Zap, 
  Target, 
  Grid3X3, 
  Square, 
  Cpu, 
  ShieldCheck, 
  Terminal as TerminalIcon,
  Wifi,
  Lock
} from 'lucide-react';

type GameModule = 'SNAKE' | 'XO' | 'TETRIS' | 'WARSHIP';

const MODULES = [
  { id: 'SNAKE', label: 'VOID_SNAKE.exe', icon: Activity, description: 'NEURAL LINK STABLE' },
  { id: 'XO', label: 'LOGIC_XO.vbs', icon: Grid3X3, description: 'CONFLIT RESOLUTION' },
  { id: 'TETRIS', label: 'STACK_CORE.dll', icon: Square, description: 'BUFFER OPTIMIZATION' },
  { id: 'WARSHIP', label: 'SHIP_DEFENSE.sys', icon: Target, description: 'ORBITAL LOCK' },
] as const;

export default function App() {
  const [activeModule, setActiveModule] = useState<GameModule>('SNAKE');
  const [score, setScore] = useState(0);
  const [systemTime, setSystemTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const renderModule = () => {
    switch (activeModule) {
      case 'SNAKE': return <SnakeGame onScoreUpdate={setScore} />;
      case 'XO': return <TicTacToe />;
      case 'TETRIS': return <Tetris />;
      case 'WARSHIP': return <WarshipShooter />;
      default: return <SnakeGame onScoreUpdate={setScore} />;
    }
  };

  return (
    <AudioProvider>
      <div className="flex h-screen w-full flex-col bg-ui-bg text-cyan-vibrant font-mono overflow-hidden crt-overlay select-none">
        
        {/* Top Navigation Bar: Mission Control Style */}
        <header className="flex items-center justify-between px-8 py-3 border-b border-cyan-vibrant/20 bg-black/40 backdrop-blur-sm z-50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 border border-cyan-vibrant flex items-center justify-center bg-cyan-vibrant/5 group-hover:bg-cyan-vibrant/10 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.1)]">
                <Cpu className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-widest uppercase text-cyan-vibrant leading-none">SYS_OS v4.28</h1>
                <p className="text-[10px] text-cyan-vibrant/40 font-bold tracking-tighter mt-1">OPERATIONAL // ENCRYPTED_LINK</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-8 pl-8 border-l border-cyan-vibrant/10">
              <div className="flex flex-col">
                <span className="text-[9px] text-cyan-vibrant/30 font-bold uppercase">Signal</span>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-1 h-3 border border-cyan-vibrant/20 ${i <= 3 ? 'bg-cyan-vibrant/60' : 'bg-transparent'}`} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-cyan-vibrant/30 font-bold uppercase">Latency</span>
                <span className="text-xs font-bold text-cyan-vibrant/80">14MS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-cyan-vibrant/30 font-bold uppercase">System_Time</span>
                <span className="text-xs font-bold text-cyan-vibrant/80 tabular-nums">
                  {systemTime.toLocaleTimeString([], { hour12: false })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-1.5 border border-cyan-vibrant/20 bg-cyan-vibrant/5 rounded-full">
              <ShieldCheck className="h-4 w-4 text-lime-500" />
              <span className="text-[10px] font-bold text-cyan-vibrant/80 uppercase">Root_Auth: OK</span>
            </div>
            <div className="flex gap-4">
              <div className="p-2 border border-cyan-vibrant/10 hover:border-cyan-vibrant/40 transition-colors cursor-pointer group">
                <Wifi className="h-4 w-4 text-cyan-vibrant/40 group-hover:text-cyan-vibrant transition-colors" />
              </div>
              <div className="p-2 border border-cyan-vibrant/10 hover:border-cyan-vibrant/40 transition-colors cursor-pointer group">
                <Lock className="h-4 w-4 text-cyan-vibrant/40 group-hover:text-cyan-vibrant transition-colors" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex gap-4 p-4 overflow-hidden relative">
          {/* Background Grid Decoration */}
          <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

          {/* Left Column: Modules & Playlists */}
          <aside className="w-80 flex flex-col gap-4 h-full relative z-10">
            <SidebarPlaylist />

            <div className="bg-black/60 border border-cyan-vibrant/20 p-5 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4 border-b border-cyan-vibrant/10 pb-2">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="h-4 w-4 text-magenta-vibrant" />
                  <span className="text-xs font-black uppercase tracking-widest">Runtime_Env</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
                  <span className="text-[8px] text-cyan-vibrant/40 font-bold uppercase">Live</span>
                </div>
              </div>
              
              <div className="space-y-1.5 flex-1 overflow-y-auto scrollbar-hide">
                {MODULES.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id as GameModule)}
                    className={`w-full group relative flex flex-col p-3 border transition-all text-left ${
                      activeModule === mod.id 
                        ? 'bg-cyan-vibrant/10 border-cyan-vibrant text-cyan-vibrant shadow-[inset_0_0_20px_rgba(0,255,255,0.1)]' 
                        : 'bg-black/40 border-cyan-vibrant/10 text-cyan-vibrant/40 hover:border-cyan-vibrant/30 hover:text-cyan-vibrant/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <mod.icon className={`h-3.5 w-3.5 ${activeModule === mod.id ? 'text-magenta-vibrant' : 'text-cyan-vibrant/40'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{mod.label}</span>
                      </div>
                      {activeModule === mod.id && <ChevronRight className="h-3 w-3 animate-pulse" />}
                    </div>
                    <p className="text-[8px] opacity-60 font-bold tracking-tighter pl-5 truncate">{mod.description}</p>
                    
                    {/* Progress Bar Decoration for Active */}
                    {activeModule === mod.id && (
                      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-magenta-vibrant/40">
                        <motion.div 
                          className="h-full bg-magenta-vibrant"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-cyan-vibrant/10 space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] text-cyan-vibrant/40 font-black tracking-widest">Mem_Core_Temp</span>
                  <span className={score > 1000 ? 'text-magenta-vibrant' : 'text-cyan-vibrant'}>32°C</span>
                </div>
                <div className="h-1 bg-cyan-vibrant/5 border border-cyan-vibrant/10 relative overflow-hidden">
                   <motion.div 
                      className="h-full bg-cyan-vibrant"
                      animate={{ 
                        width: [Math.floor(Math.random() * 20) + 30 + '%', Math.floor(Math.random() * 10) + 40 + '%'],
                        opacity: [0.6, 0.8, 0.6]
                      }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }}
                   />
                </div>
              </div>
            </div>
          </aside>

          {/* Center Column: Execution Environment */}
          <section className="flex-1 flex flex-col bg-black/40 border border-cyan-vibrant/20 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-cyan-vibrant/5 to-transparent pointer-events-none" />
            
            {/* HUD Elements */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-magenta-vibrant shadow-[0_0_8px_#ff00ff]" />
                <span className="text-[9px] font-black text-magenta-vibrant tracking-[0.2em]">EXE_BUFFER_FEED</span>
              </div>
              <div className="text-[8px] text-cyan-vibrant/30 font-bold">MODE: {activeModule}</div>
            </div>

            <div className="absolute top-4 right-4 z-20 text-right pointer-events-none">
              <p className="text-[9px] text-cyan-vibrant/40 font-black tracking-widest">MODULE_HASH</p>
              <p className="text-[10px] font-mono text-cyan-vibrant/60">0x{Math.random().toString(16).slice(2, 10).toUpperCase()}</p>
            </div>

            {/* Content Area with Transition */}
            <div className="flex-1 flex flex-col overflow-hidden">
               <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 flex flex-col"
                >
                  {renderModule()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Corner Accents */}
            <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-cyan-vibrant/20 pointer-events-none" />
            <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-cyan-vibrant/20 pointer-events-none" />
          </section>

          {/* Right Column: Mini Signals */}
          <aside className="w-20 flex flex-col items-center py-6 bg-black/60 border border-cyan-vibrant/20 gap-8 h-full relative z-10">
            <div className="writing-vertical-rl text-[11px] text-cyan-vibrant/20 uppercase tracking-[0.6em] rotate-180 font-black hover:text-cyan-vibrant/50 transition-colors cursor-default">CORE_METRICS_S01</div>
            
            <div className="flex flex-col gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 border border-cyan-vibrant/20 flex items-center justify-center text-cyan-vibrant/30 hover:text-cyan-vibrant hover:border-cyan-vibrant transition-all cursor-pointer font-black text-xs group relative">
                  <span className="group-hover:text-glitch">0{i}</span>
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-cyan-vibrant/40 opacity-0 group-hover:opacity-100" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-cyan-vibrant/40 opacity-0 group-hover:opacity-100" />
                </div>
              ))}
              <div className="w-10 h-10 border border-magenta-vibrant/40 flex items-center justify-center text-magenta-vibrant bg-magenta-vibrant/5 animate-pulse cursor-pointer group">
                <Zap className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </div>
            </div>

            <div className="mt-auto mb-4 flex flex-col gap-6 items-center">
               <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                  <Activity className="h-5 w-5 text-cyan-vibrant/20" />
               </motion.div>
               <div className="w-0.5 h-16 bg-gradient-to-b from-cyan-vibrant/20 to-transparent" />
            </div>
          </aside>
        </main>

        <FooterPlayer />
      </div>
    </AudioProvider>
  );
}
