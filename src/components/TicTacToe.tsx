import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, X, Circle, AlertTriangle, Terminal, Activity } from 'lucide-react';

type Player = 'X' | 'O' | null;

export default function TicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | 'Draw'>(null);
  const [logs, setLogs] = useState<string[]>(['LOG_LINK::INITIALIZED', 'HEURISTIC_ENGINE::ACTIVE']);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  const calculateWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (!squares.includes(null)) return 'Draw' as const;
    return null;
  };

  const handleClick = (i: number) => {
    if (board[i] || winner) return;
    const player = isXNext ? 'X' : 'O';
    addLog(`CMD::PLACEMENT_ID_${i}_SIG_${player}`);
    
    const newBoard = board.slice();
    newBoard[i] = player;
    setBoard(newBoard);
    setIsXNext(!isXNext);
    const winStatus = calculateWinner(newBoard);
    if (winStatus) {
      setWinner(winStatus);
      addLog(winStatus === 'Draw' ? 'STATUS::COLLISION_DRAW' : `STATUS::WINNER_DETECTED_${winStatus}`);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setLogs(['LOG_LINK::RESET_SUCCESS', 'SYSTEM_AWAITING_INPUT']);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-8 h-full bg-black/40 backdrop-blur-sm overflow-hidden border border-cyan-vibrant/20 m-4">
      <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
      
      {/* Background scrolling text decoration */}
      <div className="absolute top-1/2 left-0 w-full opacity-5 pointer-events-none -translate-y-1/2 scale-150 rotate-12 select-none uppercase font-black text-[120px] whitespace-nowrap overflow-hidden leading-none">
        LOGIC_WAR_NULL_CORE_SIG_PROCESS_EXEC_BUFFER
      </div>

      <div className="flex gap-8 items-start relative z-10">
        <div className="flex flex-col gap-4">
           {/* HUD Headers */}
          <div className="text-center w-full max-w-[400px]">
            <div className="flex items-center gap-3 mb-2">
               <Terminal className="h-5 w-5 text-cyan-vibrant" />
               <h2 className="text-2xl font-black text-cyan-vibrant uppercase italic tracking-[0.3em] text-glitch">LOGIC_WAR_XO</h2>
            </div>
            <div className="flex items-center justify-between px-4 py-2 border border-cyan-vibrant/10 bg-black/60 shadow-[inset_0_0_20px_rgba(0,255,255,0.05)]">
               <span className="text-[9px] text-cyan-vibrant/40 font-black tracking-widest uppercase">Dec_Engine: Stable</span>
               <div className="flex items-center gap-2">
                  <motion.div 
                    animate={{ backgroundColor: ['rgba(0,255,255,0.4)', 'rgba(0,255,255,1)', 'rgba(0,255,255,0.4)'] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-2 h-2 rounded-full shadow-[0_0_10px_#00ffff]" 
                  />
                  <span className="text-[10px] text-cyan-vibrant font-black uppercase tracking-widest">Active</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-black/80 p-5 border border-cyan-vibrant/20 shadow-[0_0_50px_rgba(0,255,255,0.05)] relative group">
             {/* Dynamic side markers */}
            <div className="absolute top-1/4 -left-10 flex flex-col gap-2 items-center opacity-40">
               {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-cyan-vibrant" />)}
            </div>

            {board.map((square, i) => (
              <motion.button
                key={i}
                whileHover={{ backgroundColor: 'rgba(0, 255, 255, 0.05)', borderColor: 'rgba(0, 255, 255, 0.4)' }}
                onClick={() => handleClick(i)}
                className="w-24 h-24 bg-black/60 border border-cyan-vibrant/10 flex items-center justify-center group relative overflow-hidden transition-colors"
              >
                <AnimatePresence>
                  {square === 'X' && (
                    <motion.div
                      initial={{ scale: 0, rotate: -90, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      className="text-magenta-vibrant"
                    >
                      <X className="h-10 w-10 drop-shadow-[0_0_15px_#ff00ff]" strokeWidth={3} />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border border-magenta-vibrant/20 rounded-full animate-ping" />
                    </motion.div>
                  )}
                  {square === 'O' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-cyan-vibrant"
                    >
                      <Circle className="h-10 w-10 drop-shadow-[0_0_15px_#00ffff]" strokeWidth={3} />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border border-cyan-vibrant/20 rounded-full animate-ping" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {!square && !winner && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="text-[7px] text-cyan-vibrant font-black uppercase tracking-[0.2em] border border-cyan-vibrant/20 px-2 py-1">
                      TARGET_{i}
                    </div>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Diagnostic Sidebar */}
        <div className="w-56 h-full flex flex-col gap-4">
           <div className="bg-black/60 border border-cyan-vibrant/10 p-4 h-48 flex flex-col">
              <div className="flex items-center gap-2 mb-3 border-b border-cyan-vibrant/10 pb-2">
                 <Activity className="h-3 w-3 text-magenta-vibrant" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-cyan-vibrant/60">Live_Console</span>
              </div>
              <div className="flex-1 overflow-hidden space-y-1">
                 {logs.map((log, i) => (
                   <motion.p 
                    initial={{ x: -10, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }}
                    key={i} 
                    className={`text-[8px] font-mono leading-tight ${i === 0 ? 'text-cyan-vibrant' : 'text-cyan-vibrant/30'}`}
                   >
                     {`> ${log}`}
                   </motion.p>
                 ))}
              </div>
           </div>
           
           <div className="flex-1 border border-cyan-vibrant/10 bg-black/40 p-4 flex flex-col items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-2">
                 <div className="w-8 h-8 rounded-full border border-cyan-vibrant/20 flex items-center justify-center">
                    <div className={`w-4 h-4 rounded-full ${isXNext ? 'bg-magenta-vibrant shadow-[0_0_10px_#ff00ff]' : 'bg-cyan-vibrant shadow-[0_0_10px_#00ffff]'}`} />
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-vibrant">Turn_Queue</span>
              </div>
              <div className="w-full h-[1px] bg-cyan-vibrant/10" />
              <div className="flex flex-col items-center">
                 <p className="text-[14px] font-black uppercase italic tracking-widest text-glitch">
                    PLAYER_{isXNext ? 'X' : 'O'}
                 </p>
                 <p className="text-[7px] font-bold text-cyan-vibrant/30">STATUS_READY</p>
              </div>
           </div>
        </div>
      </div>

      <div className="mt-12 h-20 flex flex-col items-center justify-center w-full max-w-[650px] relative z-10">
        <AnimatePresence mode="wait">
          {winner ? (
            <motion.div 
              key="winner"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-center w-full"
            >
              <div className="mb-4 py-2 border-y border-magenta-vibrant/20 bg-magenta-vibrant/5 relative overflow-hidden group">
                <div className="absolute inset-0 scrolling-text text-[30px] font-black text-magenta-vibrant opacity-5 pointer-events-none">
                  DOMAIN_MASTER_DETECTED_DOMAIN_MASTER_DETECTED_DOMAIN_MASTER_DETECTED
                </div>
                <p className="text-2xl font-black text-magenta-vibrant uppercase italic tracking-[0.4em] text-glitch relative z-10">
                  {winner === 'Draw' ? 'NULL_RESULT_DRAW' : `DOMAIN_MASTER_${winner}`}
                </p>
              </div>
              <button
                onClick={resetGame}
                className="flex items-center justify-center gap-4 w-full border border-cyan-vibrant bg-cyan-vibrant/5 px-12 py-4 font-black text-cyan-vibrant text-xs hover:bg-cyan-vibrant hover:text-black transition-all uppercase tracking-[0.6em] glitch-hover shadow-[0_0_30px_rgba(0,255,255,0.1)]"
              >
                <RefreshCw className="h-5 w-5" /> FULL_SYSTEM_RESET
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-2">
               <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 animate-pulse" />
                  <p className="text-[10px] text-cyan-vibrant/40 uppercase tracking-[0.8em] font-black">Waiting for heuristical decision...</p>
               </div>
               <div className="flex gap-2">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <motion.div 
                      key={i} 
                      animate={{ scaleY: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }} 
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 h-3 bg-cyan-vibrant/30" 
                    />
                  ))}
               </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
