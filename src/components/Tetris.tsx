import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play as PlayIcon, Terminal, Activity } from 'lucide-react';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 25;

const SHAPES = {
  I: [[1, 1, 1, 1]],
  L: [[1, 0, 0], [1, 1, 1]],
  J: [[0, 0, 1], [1, 1, 1]],
  O: [[1, 1], [1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  T: [[0, 1, 0], [1, 1, 1]],
};

const COLORS = ['#00ffff', '#ff00ff', '#ffffff', '#22d3ee', '#f43f5e'];

export default function Tetris() {
  const [grid, setGrid] = useState<string[][]>(Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
  const [activePiece, setActivePiece] = useState<{ pos: { x: number, y: number }, shape: number[][], color: string } | null>(null);
  const [nextPiece, setNextPiece] = useState<{ shape: number[][], color: string } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [highScore] = useState(12400);

  const getRandomPiece = useCallback(() => {
    const keys = Object.keys(SHAPES) as (keyof typeof SHAPES)[];
    const shape = SHAPES[keys[Math.floor(Math.random() * keys.length)]];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return { shape, color };
  }, []);

  const spawnPiece = useCallback(() => {
    const piece = nextPiece || getRandomPiece();
    const next = getRandomPiece();
    setNextPiece(next);

    const pos = { x: Math.floor(COLS / 2) - Math.floor(piece.shape[0].length / 2), y: 0 };

    if (checkCollision(pos, piece.shape, grid)) {
      setIsGameOver(true);
      return null;
    }
    return { ...piece, pos };
  }, [grid, nextPiece, getRandomPiece]);

  const checkCollision = (pos: { x: number, y: number }, shape: number[][], currentGrid: string[][]) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && currentGrid[newY][newX])) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const getGhostPosition = useCallback(() => {
    if (!activePiece) return null;
    let ghostY = activePiece.pos.y;
    while (!checkCollision({ ...activePiece.pos, y: ghostY + 1 }, activePiece.shape, grid)) {
      ghostY++;
    }
    return { ...activePiece.pos, y: ghostY };
  }, [activePiece, grid]);

  const rotate = (matrix: number[][]) => {
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
  };

  const moveDown = useCallback(() => {
    if (!activePiece || isPaused || isGameOver) return;

    const newPos = { ...activePiece.pos, y: activePiece.pos.y + 1 };
    if (checkCollision(newPos, activePiece.shape, grid)) {
      const newGrid = grid.map(row => [...row]);
      activePiece.shape.forEach((row, y) => {
        row.forEach((val, x) => {
          if (val) {
            const gridY = activePiece.pos.y + y;
            const gridX = activePiece.pos.x + x;
            if (gridY >= 0) newGrid[gridY][gridX] = activePiece.color;
          }
        });
      });

      let linesCleared = 0;
      const filteredGrid = newGrid.filter(row => {
        const isFull = row.every(cell => cell !== '');
        if (isFull) linesCleared++;
        return !isFull;
      });
      
      while (filteredGrid.length < ROWS) {
        filteredGrid.unshift(Array(COLS).fill(''));
      }
      
      setGrid(filteredGrid);
      setLines(l => l + linesCleared);
      setScore(s => s + (linesCleared * 100));
      setActivePiece(spawnPiece());
    } else {
      setActivePiece({ ...activePiece, pos: newPos });
    }
  }, [activePiece, grid, isPaused, isGameOver, spawnPiece]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!activePiece || isPaused || isGameOver) {
       if (e.key === ' ' || e.key.toLowerCase() === 'p') setIsPaused(prev => !prev);
       return;
    };

    switch (e.key.toLowerCase()) {
      case 'arrowleft':
      case 'a':
        if (!checkCollision({ ...activePiece.pos, x: activePiece.pos.x - 1 }, activePiece.shape, grid)) {
          setActivePiece({ ...activePiece, pos: { ...activePiece.pos, x: activePiece.pos.x - 1 } });
        }
        break;
      case 'arrowright':
      case 'd':
        if (!checkCollision({ ...activePiece.pos, x: activePiece.pos.x + 1 }, activePiece.shape, grid)) {
          setActivePiece({ ...activePiece, pos: { ...activePiece.pos, x: activePiece.pos.x + 1 } });
        }
        break;
      case 'arrowdown':
      case 's':
        moveDown();
        break;
      case 'arrowup':
      case 'w':
        const rotated = rotate(activePiece.shape);
        if (!checkCollision(activePiece.pos, rotated, grid)) {
          setActivePiece({ ...activePiece, shape: rotated });
        }
        break;
      case 'p':
      case ' ':
        setIsPaused(prev => !prev);
        break;
    }
  }, [activePiece, grid, isPaused, isGameOver, moveDown]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const interval = setInterval(moveDown, Math.max(100, 500 - (lines * 5)));
    return () => clearInterval(interval);
  }, [moveDown, lines]);

  useEffect(() => {
    if (!activePiece && !isGameOver) {
      setActivePiece(spawnPiece());
    }
  }, [activePiece, isGameOver, spawnPiece]);

  const resetGame = () => {
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
    setScore(0);
    setLines(0);
    setIsGameOver(false);
    setIsPaused(false);
    setActivePiece(null);
    setNextPiece(null);
  };

  const ghostPos = getGhostPosition();

  return (
    <div className="relative flex items-center justify-center p-6 h-full bg-black/40 backdrop-blur-sm crt-overlay overflow-hidden border border-cyan-vibrant/20 m-4">
      <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
      
      <div className="flex gap-8 items-start relative z-10">
        <div className="flex flex-col gap-4">
           {/* Header HUD */}
          <div className="flex justify-between w-full mb-2 bg-black/60 border border-cyan-vibrant/20 p-4 shadow-[0_0_30px_rgba(0,255,255,0.05)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-vibrant" />
            <div className="flex flex-col">
               <div className="flex items-center gap-2 mb-1 opacity-40">
                 <Terminal className="h-3 w-3" />
                 <span className="text-[8px] font-black uppercase tracking-widest">Buffer_Data</span>
               </div>
               <span className="text-xl font-black text-cyan-vibrant text-glitch tabular-nums leading-none">
                 {score.toString().padStart(6, '0')}
               </span>
            </div>
            <div className="flex flex-col items-end">
               <div className="flex items-center gap-2 mb-1 opacity-40">
                 <Activity className="h-3 w-3" />
                 <span className="text-[8px] font-black uppercase tracking-widest">Peak_Load</span>
               </div>
               <span className="text-xl font-black text-magenta-vibrant tabular-nums leading-none">
                 {highScore.toString().padStart(6, '0')}
               </span>
            </div>
          </div>

          <div 
            className="relative bg-black/80 border border-cyan-vibrant/20 shadow-[0_0_50px_rgba(0,255,255,0.02)]"
            style={{ width: COLS * BLOCK_SIZE, height: ROWS * BLOCK_SIZE }}
          >
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

            {/* Render Grid */}
            {grid.map((row, y) => row.map((color, x) => (
              color && (
                <div 
                  key={`grid-${y}-${x}`}
                  className="absolute border border-black/40"
                  style={{
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                    left: x * BLOCK_SIZE,
                    top: y * BLOCK_SIZE,
                    backgroundColor: color,
                    boxShadow: `inset 0 0 10px rgba(0,0,0,0.5), 0 0 10px ${color}44`
                  }}
                />
              )
            )))}

            {/* Render Ghost Piece */}
            {ghostPos && activePiece && activePiece.shape.map((row, y) => row.map((val, x) => (
              val && (
                <div 
                  key={`ghost-${y}-${x}`}
                  className="absolute border border-cyan-vibrant/20"
                  style={{
                    width: BLOCK_SIZE - 2,
                    height: BLOCK_SIZE - 2,
                    left: (ghostPos.x + x) * BLOCK_SIZE + 1,
                    top: (ghostPos.y + y) * BLOCK_SIZE + 1,
                    backgroundColor: 'rgba(0, 255, 255, 0.05)',
                  }}
                />
              )
            )))}

            {/* Render Active Piece */}
            {activePiece && activePiece.shape.map((row, y) => row.map((val, x) => (
              val && (
                <div 
                  key={`active-${y}-${x}`}
                  className="absolute border border-black/40"
                  style={{
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                    left: (activePiece.pos.x + x) * BLOCK_SIZE,
                    top: (activePiece.pos.y + y) * BLOCK_SIZE,
                    backgroundColor: activePiece.color,
                    boxShadow: `inset 0 0 8px rgba(255,255,255,0.3), 0 0 20px ${activePiece.color}aa`
                  }}
                />
              )
            )))}

            <AnimatePresence>
              {(isPaused || isGameOver) && (
                <motion.div
                  initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                  exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 p-8 text-center"
                >
                   {isGameOver ? (
                     <div className="space-y-6 w-full">
                        <h2 className="text-4xl font-pixel text-magenta-vibrant tracking-widest italic text-glitch uppercase">STACK_OVERFLOW</h2>
                        <button
                          onClick={resetGame}
                          className="w-full relative py-4 border border-magenta-vibrant bg-magenta-vibrant/5 text-magenta-vibrant font-black hover:bg-magenta-vibrant hover:text-black transition-all glitch-hover uppercase tracking-[0.3em] text-[10px]"
                        >
                          CLEAR_BUFFER
                        </button>
                     </div>
                   ) : (
                     <div className="space-y-8 w-full">
                        <h2 className="text-6xl font-pixel text-cyan-vibrant tracking-widest text-glitch uppercase italic opacity-80">HALTED</h2>
                        <button
                          onClick={() => setIsPaused(false)}
                          className="w-full relative py-5 border border-cyan-vibrant bg-cyan-vibrant/5 text-cyan-vibrant font-black hover:bg-cyan-vibrant hover:text-black transition-all glitch-hover uppercase tracking-[0.4em] text-xs"
                        >
                          RESUME_FLOW
                        </button>
                     </div>
                   )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tetris Sidebar */}
        <div className="w-40 flex flex-col gap-4">
           <div className="bg-black/60 border border-cyan-vibrant/10 p-4 border-t-2 border-t-magenta-vibrant">
              <span className="text-[8px] font-black uppercase text-cyan-vibrant/40 tracking-[0.2em] block mb-4">Next_Module</span>
              <div className="h-20 flex items-center justify-center relative">
                 {nextPiece && (
                   <div style={{ transform: 'scale(0.7)' }}>
                      {nextPiece.shape.map((row, y) => (
                        <div key={y} className="flex">
                           {row.map((val, x) => (
                             <div 
                              key={x} 
                              className={`w-[25px] h-[25px] border border-black/20 ${val ? '' : 'invisible'}`}
                              style={{ backgroundColor: nextPiece.color, boxShadow: `0 0 10px ${nextPiece.color}44` }}
                             />
                           ))}
                        </div>
                      ))}
                   </div>
                 )}
              </div>
           </div>

           <div className="bg-black/60 border border-cyan-vibrant/10 p-4 flex flex-col gap-6">
              <div>
                 <span className="text-[8px] font-black uppercase text-cyan-vibrant/40 tracking-[0.2em] block mb-1">Total_Lines</span>
                 <p className="text-xl font-black text-cyan-vibrant tabular-nums leading-none">{lines.toString().padStart(3, '0')}</p>
              </div>
              <div className="w-full h-[1px] bg-cyan-vibrant/10" />
              <div>
                 <span className="text-[8px] font-black uppercase text-cyan-vibrant/40 tracking-[0.2em] block mb-1">Complexity</span>
                 <p className="text-xl font-black text-magenta-vibrant tabular-nums leading-none">0{Math.floor(lines/10) + 1}</p>
              </div>
           </div>

           <div className="mt-auto border border-cyan-vibrant/10 p-3 opacity-30">
              <div className="flex gap-1 justify-center mb-2">
                 {[1,2,3,4].map(i => <div key={i} className="w-1 h-3 bg-cyan-vibrant animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
              </div>
              <p className="text-[7px] text-center font-black uppercase tracking-widest text-cyan-vibrant">Rec_Signal_Stable</p>
           </div>
        </div>
      </div>
    </div>
  );
}
