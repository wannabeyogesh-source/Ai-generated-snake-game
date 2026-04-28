import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Music2, 
  Activity,
  Disc,
  Radio,
  Waves
} from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  url: string;
}

const DUMMY_TRACKS: Track[] = [
  { id: '1', title: 'NEON_DRIFT', artist: 'CYBER_CORE', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop', url: '#' },
  { id: '2', title: 'VOID_WALKER', artist: 'SYNTH_PULSE', cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop', url: '#' },
  { id: '3', title: 'GRID_RUNNER', artist: 'BIT_CRUSHER', cover: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=100&h=100&fit=crop', url: '#' },
  { id: '4', title: 'SYSTEM_ERROR', artist: 'GLITCH_CAT', cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=100&h=100&fit=crop', url: '#' },
];

interface AudioContextType {
  currentTrack: Track;
  currentTrackIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  togglePlay: () => void;
  handleNext: () => void;
  handlePrev: () => void;
  setVolume: (v: number) => void;
  setCurrentTrackIndex: (i: number) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(180);
  const [volume, setVolume] = useState(0.7);

  const currentTrack = DUMMY_TRACKS[currentTrackIndex];

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= duration) {
            handleNext();
            return 0;
          }
          return p + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const handleNext = () => setCurrentTrackIndex((i) => (i + 1) % DUMMY_TRACKS.length);
  const handlePrev = () => setCurrentTrackIndex((i) => (i - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length);

  return (
    <AudioContext.Provider value={{
      currentTrack,
      currentTrackIndex,
      isPlaying,
      progress,
      duration,
      volume,
      togglePlay,
      handleNext,
      handlePrev,
      setVolume,
      setCurrentTrackIndex
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const SidebarPlaylist = () => {
  const { currentTrackIndex, setCurrentTrackIndex, isPlaying } = useAudio();

  return (
    <div className="bg-black/80 border border-cyan-vibrant/20 p-4 flex flex-col h-72">
      <div className="flex items-center justify-between mb-4 border-b border-cyan-vibrant/10 pb-2">
        <div className="flex items-center gap-2">
          <Disc className="h-4 w-4 text-cyan-vibrant animate-spin-slow" />
          <h2 className="text-[10px] uppercase text-cyan-vibrant tracking-[0.3em] font-black">Storage_Volume://Audio</h2>
        </div>
        <Radio className="h-3 w-3 text-cyan-vibrant/40" />
      </div>
      
      <div className="space-y-1 overflow-y-auto pr-1 scrollbar-hide flex-1">
        {DUMMY_TRACKS.map((track, idx) => (
          <button
            key={track.id}
            onClick={() => setCurrentTrackIndex(idx)}
            className={`w-full group px-3 py-2 flex items-center gap-4 transition-all border-l-2 text-left ${
              currentTrackIndex === idx
                ? 'bg-cyan-vibrant/5 border-cyan-vibrant text-cyan-vibrant'
                : 'border-transparent text-cyan-vibrant/30 hover:bg-cyan-vibrant/5 hover:text-cyan-vibrant/60'
            }`}
          >
            <span className="text-[9px] font-black tabular-nums opacity-60">0{idx + 1}.</span>
            <div className="flex-1 min-w-0">
              <p className={`text-[11px] font-black truncate tracking-widest ${currentTrackIndex === idx ? 'text-glitch' : ''}`}>
                {track.title}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[7px] font-bold opacity-40 uppercase">Artist:</span>
                <span className="text-[8px] font-bold opacity-60 truncate">{track.artist}</span>
              </div>
            </div>
            {currentTrackIndex === idx && isPlaying && (
              <div className="flex items-end gap-0.5 h-3">
                <motion.div animate={{ height: [4, 12, 6, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-cyan-vibrant" />
                <motion.div animate={{ height: [8, 4, 12, 4, 8] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-cyan-vibrant" />
                <motion.div animate={{ height: [12, 6, 8, 6, 12] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-0.5 bg-cyan-vibrant" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const FooterPlayer = () => {
  const { currentTrack, isPlaying, progress, duration, togglePlay, handleNext, handlePrev } = useAudio();

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <footer className="h-20 bg-black/95 border-t border-cyan-vibrant/20 px-8 flex items-center gap-12 z-50 relative overflow-hidden">
      {/* Visual background decoration */}
      <div className="absolute inset-0 scrolling-text text-[60px] font-black text-cyan-vibrant/[0.02] pointer-events-none select-none">
        NEON_PULSE_SYSTEM_CORE_AUDIO_FEED_DEDICATED_LINK_ESTABLISHED_SUCCESSFULLY
      </div>

      <div className="flex items-center gap-4 w-72 shrink-0 relative z-10">
        <div className="relative w-12 h-12 border border-cyan-vibrant/20 overflow-hidden bg-black group">
           <img src={currentTrack.cover} className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-opacity" />
           <div className="absolute inset-0 bg-cyan-vibrant/10" />
           {isPlaying && (
             <div className="absolute inset-0 flex items-center justify-center">
               <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-6 h-6 border-2 border-cyan-vibrant/30 rounded-full" />
             </div>
           )}
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-black text-cyan-vibrant truncate tracking-widest text-glitch">{currentTrack.title}</p>
          <div className="flex items-center gap-2 opacity-40">
             <span className="text-[7px] font-black uppercase">Src:</span>
             <p className="text-[9px] font-bold truncate uppercase">{currentTrack.artist}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1.5 max-w-xl mx-auto relative z-10">
        <div className="flex items-center justify-center gap-10 mb-1">
          <button onClick={handlePrev} className="text-cyan-vibrant/40 hover:text-cyan-vibrant transition-colors glitch-hover">
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 border border-cyan-vibrant flex items-center justify-center hover:bg-cyan-vibrant/10 transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)] glitch-hover"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-cyan-vibrant" />
            ) : (
              <Play className="h-5 w-5 fill-cyan-vibrant translate-x-0.5" />
            )}
          </button>
          <button onClick={handleNext} className="text-cyan-vibrant/40 hover:text-cyan-vibrant transition-colors glitch-hover">
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[9px] text-cyan-vibrant/40 font-black tabular-nums min-w-[30px]">{formatTime(progress)}</span>
          <div className="flex-1 h-0.5 bg-cyan-vibrant/10 relative overflow-hidden">
            <motion.div
              className="absolute h-full bg-magenta-vibrant shadow-[0_0_10px_#ff00ff]"
              animate={{ width: `${(progress / duration) * 100}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
            />
          </div>
          <span className="text-[9px] text-cyan-vibrant/40 font-black tabular-nums min-w-[30px]">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="w-72 shrink-0 flex justify-end items-center gap-6 relative z-10">
        <div className="flex items-center gap-3">
          <Waves className="h-3 w-3 text-cyan-vibrant/40" />
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className={`w-1 h-3 border border-cyan-vibrant/10 ${i <= 6 ? 'bg-cyan-vibrant' : 'bg-transparent opacity-20'}`} />
            ))}
          </div>
        </div>
        <div className="w-10 h-10 border border-cyan-vibrant/10 flex items-center justify-center text-cyan-vibrant/30 hover:text-magenta-vibrant hover:border-magenta-vibrant/50 transition-all cursor-pointer">
           <Activity className="h-4 w-4" />
        </div>
      </div>
    </footer>
  );
};
