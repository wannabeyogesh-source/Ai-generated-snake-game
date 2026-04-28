import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play as PlayIcon, Zap } from 'lucide-react';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;

interface Entity {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export default function WarshipShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState({ x: CANVAS_WIDTH / 2 - 20, y: CANVAS_HEIGHT - 60, width: 40, height: 20 });
  const [bullets, setBullets] = useState<Entity[]>([]);
  const [enemies, setEnemies] = useState<Entity[]>([]);
  const [explosions, setExplosions] = useState<Entity[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const nextEnemyRef = useRef<number>(0);

  const resetGame = () => {
    setBullets([]);
    setEnemies([]);
    setExplosions([]);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setPlayer({ x: CANVAS_WIDTH / 2 - 20, y: CANVAS_HEIGHT - 60, width: 40, height: 20 });
  };

  const spawnEnemy = useCallback(() => {
    const width = 40 + Math.random() * 20;
    const enemy: Entity = {
      id: Date.now() + Math.random(),
      x: Math.random() * (CANVAS_WIDTH - width),
      y: -50,
      width: width,
      height: 30,
      color: Math.random() > 0.5 ? '#ff00ff' : '#00ffff'
    };
    setEnemies(prev => [...prev, enemy]);
  }, []);

  const shoot = useCallback(() => {
    const bullet: Entity = {
      id: Date.now() + Math.random(),
      x: player.x + player.width / 2 - 2,
      y: player.y - 10,
      width: 4,
      height: 10,
      color: '#00ffff'
    };
    setBullets(prev => [...prev, bullet]);
  }, [player]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isGameOver) return;
    if (e.key === ' ' || e.key.toLowerCase() === 'p') {
      setIsPaused(p => !p);
      return;
    }
    if (isPaused) return;

    const step = 20;
    switch (e.key.toLowerCase()) {
      case 'arrowleft':
      case 'a':
        setPlayer(p => ({ ...p, x: Math.max(0, p.x - step) }));
        break;
      case 'arrowright':
      case 'd':
        setPlayer(p => ({ ...p, x: Math.min(CANVAS_WIDTH - p.width, p.x + step) }));
        break;
      case 'w':
      case 'arrowup':
        shoot();
        break;
    }
  }, [isGameOver, isPaused, player.width, shoot]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const update = useCallback((time: number) => {
    if (isPaused || isGameOver) return;

    if (time - lastTimeRef.current > 16.67) {
      lastTimeRef.current = time;

      // Spawn enemies
      if (time > nextEnemyRef.current) {
        spawnEnemy();
        nextEnemyRef.current = time + Math.max(500, 1500 - (score * 0.1));
      }

      // Move bullets
      setBullets(prev => prev.map(b => ({ ...b, y: b.y - 10 })).filter(b => b.y > -20));

      // Move enemies
      setEnemies(prev => {
        const next = prev.map(e => ({ ...e, y: e.y + (2 + score * 0.001) }));
        // Check game over (enemy reaches bottom)
        if (next.some(e => e.y > CANVAS_HEIGHT)) {
           setIsGameOver(true);
        }
        return next;
      });

      // Simple collision detection
      setBullets(bPrev => {
        let newScore = 0;
        const remainingBullets = [...bPrev];
        setEnemies(ePrev => {
          const remainingEnemies: Entity[] = [];
          ePrev.forEach(enemy => {
            const hitIndex = remainingBullets.findIndex(bullet => 
              bullet.x < enemy.x + enemy.width &&
              bullet.x + bullet.width > enemy.x &&
              bullet.y < enemy.y + enemy.height &&
              bullet.y + bullet.height > enemy.y
            );

            if (hitIndex !== -1) {
              remainingBullets.splice(hitIndex, 1);
              newScore += 100;
              setExplosions(ex => [...ex, { ...enemy, id: Date.now() + Math.random() }]);
              // Explosion timeout
              setTimeout(() => {
                setExplosions(ex => ex.filter(exp => exp.id !== Date.now()));
              }, 200);
            } else {
              remainingEnemies.push(enemy);
            }
          });
          return remainingEnemies;
        });
        if (newScore > 0) setScore(s => s + newScore);
        return remainingBullets;
      });
    }

    requestRef.current = requestAnimationFrame(update);
  }, [isPaused, isGameOver, score, spawnEnemy]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars/BKG
    ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
    for(let i=0; i<30; i++) {
       ctx.fillRect((score * 0.1 + i*50) % CANVAS_WIDTH, (score * 0.5 + i*80) % CANVAS_HEIGHT, 2, 2);
    }

    // Draw Player
    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillRect(player.x + 15, player.y - 10, 10, 10);

    // Draw Bullets
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    // Draw Enemies
    enemies.forEach(e => {
       ctx.fillStyle = e.color;
       ctx.shadowBlur = 15;
       ctx.shadowColor = e.color;
       ctx.fillRect(e.x, e.y, e.width, e.height);
       // Glitch bit
       if (Math.random() > 0.95) {
          ctx.fillRect(e.x - 5, e.y, 5, 5);
          ctx.fillRect(e.x + e.width, e.y, 5, 5);
       }
    });

    // Draw Explosions
    explosions.forEach(ex => {
       ctx.fillStyle = '#ffffff';
       ctx.shadowBlur = 30;
       ctx.shadowColor = '#ff33ff';
       ctx.fillRect(ex.x - 10, ex.y - 10, ex.width + 20, ex.height + 20);
    });

  }, [player, bullets, enemies, explosions, score]);

  return (
    <div className="relative flex flex-col items-center justify-center p-4 h-full font-pixel crt-overlay overflow-hidden">
      <div className="flex justify-between w-full max-w-[500px] mb-4 bg-black border-2 border-cyan-500/20 p-3">
         <div className="flex flex-col">
            <span className="text-[10px] text-cyan-900 border-b border-cyan-900/40 mb-1">RADAR_LOCK</span>
            <span className="text-2xl font-black text-cyan-400 text-glitch">{score.toString().padStart(6, '0')}</span>
         </div>
         <div className="flex items-center gap-4">
            <div className="text-right">
               <span className="text-[10px] text-magenta-900 block border-b border-magenta-900/40 mb-1 font-black">THREAT_LEVEL</span>
               <span className="text-xs text-magenta-500 font-bold uppercase">SIG_ALPHA_V3</span>
            </div>
            <Zap className="h-6 w-6 text-magenta-500 animate-pulse" />
         </div>
      </div>

      <div className="relative border-4 border-cyan-900/50 bg-black">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="max-w-full opacity-90"
        />

        <AnimatePresence>
          {(isPaused || isGameOver) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-20 p-8"
            >
               {isGameOver ? (
                 <div className="text-center space-y-6">
                    <h2 className="text-6xl font-black text-magenta-600 uppercase italic tracking-tighter text-glitch">WAR_LOST</h2>
                    <p className="text-magenta-900 text-xs uppercase tracking-[0.5em] border border-magenta-900/30 p-4">DEFENSE_GRID_BREACHED: CORE_EXPOSED</p>
                    <button
                      onClick={resetGame}
                      className="w-full border-4 border-magenta-600 bg-transparent text-magenta-600 py-4 uppercase font-black hover:bg-magenta-600 hover:text-black transition-all glitch-hover"
                    >
                      REBOOT_DEFENSE
                    </button>
                 </div>
               ) : (
                 <div className="text-center space-y-8">
                    <h2 className="text-6xl font-black text-cyan-400 italic tracking-tighter text-glitch opacity-80">STASIS_MODE</h2>
                    <button
                      onClick={() => setIsPaused(false)}
                      className="w-full border-4 border-cyan-500 bg-transparent text-cyan-500 py-6 px-16 uppercase font-black hover:bg-cyan-500 hover:text-black transition-all glitch-hover text-xl shadow-[0_0_30px_rgba(0,255,255,0.2)]"
                    >
                      <PlayIcon className="inline mr-4 h-6 w-6 fill-current" /> REACTIVATE
                    </button>
                    <p className="text-[10px] text-cyan-950 uppercase tracking-[0.8em]">Awaiting_Signal: Space_To_Resume</p>
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 text-[10px] text-cyan-900 uppercase tracking-[0.4em] font-bold">
        [A/D]_LR_DRIFT // [W]_VOID_PULSE // [SPACE]_STASIS
      </div>
    </div>
  );
}
