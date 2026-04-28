import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, X, Circle, AlertTriangle, Terminal } from 'lucide-react';

type Player = 'X' | 'O' | null;

export default function TicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | 'Draw'>(null);

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
    const newBoard = board.slice();
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    const winStatus = calculateWinner(newBoard);
    if (winStatus) setWinner(winStatus);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-8 h-full bg-black/40 backdrop-blur-sm overflow-hidden border border-cyan-vibrant/20 m-4">
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
      
      {/* HUD Headers */}
      <div className="mb-10 text-center relative z-10 w-full max-w-[400px]">
        <div className="flex items-center justify-center gap-2 mb-2">
           <Terminal className="h-4 w-4 text-cyan-vibrant/40" />
           <h2 className="text-xl font-black text-cyan-vibrant uppercase italic tracking-[0.2em] text-glitch">LOGIC_WAR_XO</h2>
        </div>
        <div className="flex items-center justify-between px-4 py-1.5 border border-cyan-vibrant/10 bg-black/40">
           <span className="text-[8px] text-cyan-vibrant/40 font-black tracking-widest uppercase">Subroutine: Decision_Link</span>
           <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-vibrant animate-pulse" />
              <span className="text-[8px] text-cyan-vibrant/80 font-black uppercase">Active</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-black/60 p-4 border border-cyan-vibrant/30 relative z-10 shadow-[0_0_50px_rgba(0,255,255,0.05)]">
         {/* Static corner decoration */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-magenta-vibrant/50"></div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-magenta-vibrant/50"></div>

        {board.map((square, i) => (
          <motion.button
            key={i}
            whileHover={{ backgroundColor: 'rgba(0, 255, 255, 0.03)', borderColor: 'rgba(0, 255, 255, 0.6)' }}
            onClick={() => handleClick(i)}
            className="w-24 h-24 bg-black/40 border border-cyan-vibrant/10 flex items-center justify-center group relative overflow-hidden transition-colors"
          >
            <AnimatePresence>
              {square === 'X' && (
                <motion.div
                  initial={{ scale: 0, rotate: -90, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  className="text-magenta-vibrant"
                >
                  <X className="h-10 w-10 drop-shadow-[0_0_15px_#ff00ff]" strokeWidth={3} />
                </motion.div>
              )}
              {square === 'O' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-cyan-vibrant"
                >
                  <Circle className="h-10 w-10 drop-shadow-[0_0_15px_#00ffff]" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
            {!square && !winner && (
              <div className="absolute inset-x-0 bottom-1 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[7px] text-cyan-vibrant font-black uppercase tracking-widest transition-opacity">
                Sector_{i}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-12 h-20 flex flex-col items-center justify-center w-full max-w-[400px] relative z-10">
        {winner ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center w-full"
          >
            <div className="mb-4 py-2 border-y border-magenta-vibrant/20 bg-magenta-vibrant/5">
              <p className="text-lg font-black text-magenta-vibrant uppercase italic tracking-[0.3em] text-glitch">
                {winner === 'Draw' ? 'NULL_RESULT_DRAW' : `DOMAIN_MASTER_${winner}`}
              </p>
            </div>
            <button
              onClick={resetGame}
              className="flex items-center justify-center gap-3 w-full border border-cyan-vibrant bg-cyan-vibrant/5 px-8 py-3 font-black text-cyan-vibrant text-[10px] hover:bg-cyan-vibrant hover:text-black transition-all uppercase tracking-[0.4em] glitch-hover shadow-[0_0_20px_rgba(0,255,255,0.1)]"
            >
              <RefreshCw className="h-4 w-4" /> REBOOT_SEQUENCE
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
             <div className="flex items-center justify-around w-full border-t border-cyan-vibrant/10 pt-4">
                <div className={`flex flex-col items-center gap-1 transition-opacity ${!isXNext ? 'opacity-30' : 'opacity-100'}`}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-magenta-vibrant">Player_X</span>
                  {isXNext && <motion.div layoutId="turn" className="h-0.5 w-12 bg-magenta-vibrant shadow-[0_0_10px_#ff00ff]" />}
                </div>
                <div className="w-1 h-1 rounded-full bg-cyan-vibrant/10" />
                <div className={`flex flex-col items-center gap-1 transition-opacity ${isXNext ? 'opacity-30' : 'opacity-100'}`}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-vibrant">Player_O</span>
                  {!isXNext && <motion.div layoutId="turn" className="h-0.5 w-12 bg-cyan-vibrant shadow-[0_0_10px_#00ffff]" />}
                </div>
             </div>
             <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-yellow-500 animate-pulse" />
                <p className="text-[8px] text-cyan-vibrant/30 uppercase tracking-[0.6em] font-bold">Waiting for sector selection...</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
