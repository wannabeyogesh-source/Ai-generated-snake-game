import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, Play as PlayIcon } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface SnakeGameProps {
  onScoreUpdate: (score: number) => void;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };

export default function SnakeGame({ onScoreUpdate }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const moveSnake = useCallback(() => {
    if (isPaused || isGameOver) return;

    setSnake((prevSnake) => {
      const newHead = {
        x: prevSnake[0].x + direction.x,
        y: prevSnake[0].y + direction.y,
      };

      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setIsGameOver(true);
        return prevSnake;
      }

      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 10);
        generateFood(newSnake);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPaused]);

  const generateFood = (currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y)) {
        break;
      }
    }
    setFood(newFood);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        setDirection((prev) => (prev.y === 1 ? prev : { x: 0, y: -1 }));
        break;
      case 'arrowdown':
      case 's':
        setDirection((prev) => (prev.y === -1 ? prev : { x: 0, y: 1 }));
        break;
      case 'arrowleft':
      case 'a':
        setDirection((prev) => (prev.x === 1 ? prev : { x: -1, y: 0 }));
        break;
      case 'arrowright':
      case 'd':
        setDirection((prev) => (prev.x === -1 ? prev : { x: 1, y: 0 }));
        break;
      case ' ':
      case 'p':
        setIsPaused((prev) => !prev);
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const intervalId = setInterval(moveSnake, 130);
    return () => clearInterval(intervalId);
  }, [moveSnake]);

  useEffect(() => {
    onScoreUpdate(score);
    if (score > highScore) setHighScore(score);
  }, [score, onScoreUpdate, highScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width / GRID_SIZE;

    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        ctx.beginPath();
        ctx.arc(x * size + size / 2, y * size + size / 2, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Food
    ctx.fillStyle = '#ff00ff'; // Pure Magenta
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ff00ff';
    const foodSize = size * 0.5;
    ctx.fillRect(
      food.x * size + (size - foodSize) / 2 + (Math.random() > 0.95 ? (Math.random() - 0.5) * 4 : 0),
      food.y * size + (size - foodSize) / 2 + (Math.random() > 0.95 ? (Math.random() - 0.5) * 4 : 0),
      foodSize,
      foodSize
    );

    // Snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#00ffff' : 'rgba(0, 255, 255, 0.6)';
      ctx.shadowBlur = index === 0 ? 30 : 0;
      ctx.shadowColor = '#00ffff';
      
      const padding = 1;
      const glitchOffset = isPaused ? 0 : (Math.random() > 0.98 ? (Math.random() - 0.5) * 5 : 0);
      
      ctx.fillRect(
        segment.x * size + padding + glitchOffset,
        segment.y * size + padding,
        size - padding * 2,
        size - padding * 2
      );

      if (index === 0) {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(segment.x * size + size / 4, segment.y * size + size / 4, 2, 2);
        ctx.fillRect(segment.x * size + (size * 3) / 4 - 2, segment.y * size + size / 4, 2, 2);
      }
    });

    ctx.shadowBlur = 0;
  }, [snake, food, isPaused]);

  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    generateFood(INITIAL_SNAKE);
  };

  return (
    <div className="relative flex flex-col flex-1 items-center justify-center p-6 crt-overlay">
      <div className="relative w-full max-w-[600px] aspect-square bg-black/80 border border-cyan-vibrant/20 overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.05)]">
        
        {/* Game HUD Overlay */}
        <div className="absolute top-4 inset-x-4 flex justify-between items-start z-10">
          <div className="bg-black/60 backdrop-blur-sm border border-cyan-vibrant/20 p-3 flex gap-8">
            <div className="flex flex-col">
              <p className="text-[8px] text-cyan-vibrant/30 leading-none mb-1 font-black tracking-widest uppercase">Buffer_Score</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-cyan-vibrant tabular-nums text-glitch tracking-widest">
                  {score.toString().padStart(6, '0')}
                </span>
                <span className="text-[7px] text-cyan-vibrant/40 font-bold">PTS</span>
              </div>
            </div>
            <div className="w-[1px] bg-cyan-vibrant/10" />
            <div className="flex flex-col">
              <p className="text-[8px] text-magenta-vibrant/40 leading-none mb-1 font-black tracking-widest uppercase">Peak_Protocol</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-magenta-vibrant tabular-nums tracking-widest">
                  {highScore.toString().padStart(6, '0')}
                </span>
                <span className="text-[7px] text-magenta-vibrant/40 font-bold">VAL</span>
              </div>
            </div>
          </div>
          
          <motion.div 
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-end"
          >
            <div className="flex items-center gap-2 mb-1">
               <div className="w-1.5 h-1.5 rounded-full bg-magenta-vibrant animate-pulse" />
               <p className="text-[9px] text-magenta-vibrant font-black tracking-widest uppercase">Rec_Feed_Active</p>
            </div>
            <p className="text-[7px] text-cyan-vibrant/30 font-bold font-mono">LINK_0x429A_STABLE</p>
          </motion.div>
        </div>

        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="w-full h-full opacity-80"
        />

        <AnimatePresence>
          {(isPaused || isGameOver) && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20"
            >
              <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
              {isGameOver ? (
                <div className="text-center p-12 bg-black border border-magenta-vibrant/40 relative group">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-magenta-vibrant animate-pulse" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-magenta-vibrant animate-pulse" />
                  
                  <Trophy className="mx-auto mb-6 h-20 w-20 text-magenta-vibrant text-glitch opacity-80" />
                  <h2 className="mb-2 text-4xl font-pixel text-magenta-vibrant uppercase italic tracking-widest text-glitch">CRITICAL_FAIL</h2>
                  <p className="text-magenta-vibrant/40 text-[9px] mb-10 uppercase tracking-[0.4em] font-black border-y border-magenta-vibrant/10 py-2">
                    SEGMENTATION_FAULT: BUFFER_OVERFLOW_0xFE
                  </p>
                  
                  <button
                    onClick={restartGame}
                    className="w-full relative flex items-center justify-center gap-3 border border-magenta-vibrant bg-magenta-vibrant/5 px-12 py-5 font-black text-magenta-vibrant transition-all hover:bg-magenta-vibrant hover:text-black uppercase tracking-[0.3em] text-xs glitch-hover shadow-[0_0_30px_rgba(255,0,255,0.1)]"
                  >
                    <RefreshCw className="h-4 w-4" />
                    REBOOT_CORE_V2
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-10 relative inline-block">
                    <h2 className="text-6xl font-pixel text-cyan-vibrant uppercase italic tracking-widest text-glitch opacity-80">HALTED</h2>
                    <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                       <div className="w-1 h-8 bg-cyan-vibrant/20 animate-pulse" />
                       <div className="w-1 h-3 bg-magenta-vibrant/40" />
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPaused(false)}
                    className="flex items-center gap-5 border border-cyan-vibrant bg-cyan-vibrant/5 px-20 py-6 font-black text-cyan-vibrant transition-all hover:bg-cyan-vibrant hover:text-black uppercase tracking-[0.4em] text-lg shadow-[0_0_50px_rgba(0,255,255,0.1)] glitch-hover"
                  >
                    <PlayIcon className="h-6 w-6 fill-current" />
                    RESUME_LINK
                  </button>
                  
                  <div className="mt-12 flex flex-col gap-1 items-center">
                    <p className="text-[10px] text-cyan-vibrant/40 uppercase tracking-[0.8em] font-black">AWAITING_INPUT_SIGNAL</p>
                    <div className="mt-2 flex gap-4 text-[8px] text-cyan-vibrant/20 font-bold">
                       <span>[W,A,S,D]</span>
                       <span>[P]</span>
                       <span>[SPACE]</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-4 left-4 text-[8px] text-cyan-vibrant/20 uppercase tracking-[0.4em] font-black flex gap-6">
          <span>NAV:[W,A,S,D]</span>
          <span>PAUSE:[P]</span>
          <span>TERM:[ESC]</span>
        </div>
      </div>
    </div>
  );
}
