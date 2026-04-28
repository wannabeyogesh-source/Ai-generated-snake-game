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
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore] = useState(12400);

  const spawnPiece = useCallback(() => {
    const keys = Object.keys(SHAPES) as (keyof typeof SHAPES)[];
    const shape = SHAPES[keys[Math.floor(Math.random() * keys.length)]];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const pos = { x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 };

    if (checkCollision(pos, shape, grid)) {
      setIsGameOver(true);
      return null;
    }
    return { pos, shape, color };
  }, [grid]);

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

  const rotate = (matrix: number[][]) => {
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
  };

  const moveDown = useCallback(() => {
    if (!activePiece || isPaused || isGameOver) return;

    const newPos = { ...activePiece.pos, y: activePiece.pos.y + 1 };
    if (checkCollision(newPos, activePiece.shape, grid)) {
      // Lock piece
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

      // Clear lines
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
    const interval = setInterval(moveDown, 400);
    return () => clearInterval(interval);
  }, [moveDown]);

  useEffect(() => {
    if (!activePiece && !isGameOver) {
      setActivePiece(spawnPiece());
    }
  }, [activePiece, isGameOver, spawnPiece]);

  const resetGame = () => {
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setActivePiece(null);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 h-full bg-black/40 backdrop-blur-sm crt-overlay overflow-hidden border border-cyan-vibrant/20 m-4">
      
      {/* Header HUD */}
      <div className="flex justify-between w-full max-w-[300px] mb-6 font-mono tracking-widest bg-black/60 border border-cyan-vibrant/20 p-4 shadow-[0_0_30px_rgba(0,255,255,0.05)] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-vibrant group-hover:bg-magenta-vibrant transition-colors" />
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
             {highScore.toLocaleString().padStart(7, '0')}
           </span>
        </div>
      </div>

      <div 
        className="relative bg-black/80 border border-cyan-vibrant/20 shadow-[0_0_50px_rgba(0,255,255,0.02)]"
        style={{ width: COLS * BLOCK_SIZE, height: ROWS * BLOCK_SIZE }}
      >
        {/* Render Grid Dots for background */}
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
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-white opacity-20" />
            </div>
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
                    <div className="py-2 border-y border-magenta-vibrant/20 bg-magenta-vibrant/5">
                      <p className="text-[9px] text-magenta-vibrant uppercase tracking-[0.4em] font-black">SEGMENTATION_FAULT: HEAP_CRITICAL</p>
                    </div>
                    <button
                      onClick={resetGame}
                      className="w-full relative py-4 border border-magenta-vibrant bg-magenta-vibrant/5 text-magenta-vibrant font-black hover:bg-magenta-vibrant hover:text-black transition-all glitch-hover uppercase tracking-[0.3em] text-[10px] shadow-[0_0_30px_rgba(255,0,255,0.1)]"
                    >
                      CLEAR_BUFFER
                    </button>
                 </div>
               ) : (
                 <div className="space-y-8 w-full">
                    <div className="relative inline-block">
                       <h2 className="text-6xl font-pixel text-cyan-vibrant tracking-widest text-glitch uppercase italic opacity-80">HALTED</h2>
                       <div className="absolute -right-8 top-0 h-full w-1 bg-cyan-vibrant/20 animate-pulse" />
                    </div>
                    <button
                      onClick={() => setIsPaused(false)}
                      className="w-full relative py-5 border border-cyan-vibrant bg-cyan-vibrant/5 text-cyan-vibrant font-black hover:bg-cyan-vibrant hover:text-black transition-all glitch-hover uppercase tracking-[0.4em] text-xs shadow-[0_0_40px_rgba(0,255,255,0.1)]"
                    >
                      <PlayIcon className="inline mr-3 h-5 w-5 fill-current" /> RESUME_FLOW
                    </button>
                    <div className="flex flex-col items-center gap-1 opacity-40">
                       <p className="text-[10px] text-cyan-vibrant uppercase font-black tracking-[0.6em]">Manual Interupt Required</p>
                       <div className="flex gap-4 text-[8px] font-bold">
                          <span>[P]</span>
                          <span>[SPACE]</span>
                       </div>
                    </div>
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative corner brackets */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-cyan-vibrant/30" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-cyan-vibrant/30" />
      </div>

      {/* Control Info */}
      <div className="mt-8 flex gap-8 items-center border-t border-cyan-vibrant/10 pt-4 w-full max-w-[300px]">
        <div className="flex flex-col items-center flex-1">
           <span className="text-[8px] text-cyan-vibrant/30 font-black uppercase tracking-widest mb-1">Movement</span>
           <span className="text-[9px] text-cyan-vibrant/60 font-bold">[WASD]</span>
        </div>
        <div className="w-[1px] h-6 bg-cyan-vibrant/10" />
        <div className="flex flex-col items-center flex-1">
           <span className="text-[8px] text-cyan-vibrant/30 font-black uppercase tracking-widest mb-1">Interupt</span>
           <span className="text-[9px] text-cyan-vibrant/60 font-bold">[P / SPACE]</span>
        </div>
      </div>
    </div>
  );
}
