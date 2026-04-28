import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play as PlayIcon, Zap, Activity } from 'lucide-react';

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
  const [explosions, setExplosions] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const nextEnemyRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());

  const resetGame = () => {
    setBullets([]);
    setEnemies([]);
    setExplosions([]);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setPlayer({ x: CANVAS_WIDTH / 2 - 20, y: CANVAS_HEIGHT - 60, width: 40, height: 20 });
    lastTimeRef.current = performance.now();
    nextEnemyRef.current = performance.now() + 1000;
  };

  const spawnEnemy = useCallback(() => {
    const width = 30 + Math.random() * 30;
    const enemy: Entity = {
      id: Math.random(),
      x: Math.random() * (CANVAS_WIDTH - width),
      y: -50,
      width: width,
      height: 20,
      color: Math.random() > 0.5 ? '#ff00ff' : '#00ffff'
    };
    setEnemies(prev => [...prev, enemy]);
  }, []);

  const shoot = useCallback(() => {
    setBullets(prev => {
      if (prev.length > 20) return prev; // Increased limit
      const bullet: Entity = {
        id: Math.random(),
        x: player.x + player.width / 2 - 2,
        y: player.y - 5,
        width: 4,
        height: 15,
        color: '#ffffff'
      };
      return [...prev, bullet];
    });
  }, [player.x, player.width, player.y]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.add(key);
      
      if (key === 'p') {
        if (!isGameOver) setIsPaused(p => !p);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameOver]);

  const lastShootTimeRef = useRef(0);

  const update = useCallback((time: number) => {
    if (isPaused || isGameOver) {
      lastTimeRef.current = time; // Reset time to avoid jump on resume
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    const deltaTime = time - (lastTimeRef.current || time);
    lastTimeRef.current = time;

    // Smooth movement
    const moveSpeed = 8;
    setPlayer(p => {
      let newX = p.x;
      if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) newX -= moveSpeed;
      if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) newX += moveSpeed;
      return { ...p, x: Math.max(0, Math.min(CANVAS_WIDTH - p.width, newX)) };
    });

    // Auto-fire
    if (keysPressed.current.has(' ') || keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
      if (time - lastShootTimeRef.current > 150) {
        shoot();
        lastShootTimeRef.current = time;
      }
    }

    // Spawn enemies
    if (time > nextEnemyRef.current) {
      spawnEnemy();
      nextEnemyRef.current = time + Math.max(600, 1500 - (score * 0.05));
    }

    // Move bullets
    setBullets(prev => prev.map(b => ({ ...b, y: b.y - 10 })).filter(b => b.y > -20));

    // Move enemies
    setEnemies(prev => {
      const next = prev.map(e => ({ ...e, y: e.y + (1.5 + score * 0.0005) }));
      if (next.some(e => e.y > CANVAS_HEIGHT - 30)) {
        setIsGameOver(true);
      }
      return next;
    });

    // Collision Detection
    setBullets(bPrev => {
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
            setScore(s => s + 100);
            setExplosions(ex => [...ex, { 
              x: enemy.x + enemy.width/2, 
              y: enemy.y + enemy.height/2, 
              life: 1, 
              color: enemy.color,
              id: Math.random() 
            }]);
          } else {
            remainingEnemies.push(enemy);
          }
        });
        return remainingEnemies;
      });
      return remainingBullets;
    });

    // Update explosions
    setExplosions(prev => prev.map(ex => ({ ...ex, life: ex.life - 0.05 })).filter(ex => ex.life > 0));

    requestRef.current = requestAnimationFrame(update);
  }, [isPaused, isGameOver, score, spawnEnemy]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [update]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // BKG Stars with parallax
    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
    for(let i=0; i<40; i++) {
       const speed = (i % 3) + 1;
       const starY = (time * 0.05 * speed + i * 20) % CANVAS_HEIGHT;
       ctx.fillRect((i * 37) % CANVAS_WIDTH, starY, speed, speed);
    }

    // Player (Ship)
    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillRect(player.x + player.width/2 - 5, player.y - 8, 10, 8);
    
    // Engine glow
    if (Math.random() > 0.3) {
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(player.x + 5, player.y + player.height, 10, 5);
      ctx.fillRect(player.x + player.width - 15, player.y + player.height, 10, 5);
    }

    // Bullets
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    // Enemies
    enemies.forEach(e => {
       ctx.fillStyle = e.color;
       ctx.shadowBlur = 20;
       ctx.shadowColor = e.color;
       ctx.fillRect(e.x, e.y, e.width, e.height);
       
       // Cockpit
       ctx.fillStyle = '#000';
       ctx.fillRect(e.x + e.width/2 - 5, e.y + 5, 10, 5);
    });

    // Explosions
    explosions.forEach(ex => {
       ctx.save();
       ctx.globalAlpha = ex.life;
       ctx.fillStyle = ex.color;
       ctx.shadowBlur = 30 * ex.life;
       ctx.shadowColor = ex.color;
       // Glitch fragment explosion
       for (let i=0; i<8; i++) {
         const angle = (i * Math.PI * 2) / 8;
         const d = (1 - ex.life) * 60;
         ctx.fillRect(ex.x + Math.cos(angle) * d - 4, ex.y + Math.sin(angle) * d - 4, 8, 8);
       }
       ctx.restore();
    });

  }, [player, bullets, enemies, explosions, score]);
  
  const time = performance.now();

  return (
    <div className="relative flex flex-col items-center justify-center p-4 h-full font-pixel crt-overlay overflow-hidden">
      <div className="flex justify-between w-full max-w-[500px] mb-4 bg-black/60 border border-cyan-vibrant/20 p-4 shadow-[0_0_30px_rgba(0,255,255,0.05)] relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-vibrant" />
         <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1 opacity-40">
               <Zap className="h-3 w-3" />
               <span className="text-[8px] font-black uppercase tracking-widest">Threat_Eliminated</span>
            </div>
            <span className="text-2xl font-black text-cyan-vibrant text-glitch tabular-nums leading-none">
              {score.toString().padStart(6, '0')}
            </span>
         </div>
         <div className="flex items-center gap-5">
            <div className="text-right">
               <span className="text-[8px] text-magenta-vibrant/40 block mb-1 font-black uppercase tracking-widest">Sector_Stability</span>
               <span className="text-xs text-magenta-vibrant font-black uppercase tracking-tighter">SIG_ALPHA_V3</span>
            </div>
            <div className="w-10 h-10 border border-magenta-vibrant/20 flex items-center justify-center">
              <Activity className="h-5 w-5 text-magenta-vibrant animate-pulse" />
            </div>
         </div>
      </div>

      <div className="relative border border-cyan-vibrant/20 bg-black shadow-[0_0_60px_rgba(0,255,255,0.05)]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="max-w-full opacity-90 transition-opacity duration-300"
        />

        <AnimatePresence>
          {(isPaused || isGameOver) && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 p-8"
            >
               {isGameOver ? (
                 <div className="text-center space-y-8 w-full max-w-[300px]">
                    <h2 className="text-5xl font-pixel text-magenta-vibrant uppercase italic tracking-widest text-glitch">WAR_LOST</h2>
                    <div className="py-3 border-y border-magenta-vibrant/20 bg-magenta-vibrant/5">
                      <p className="text-[9px] text-magenta-vibrant uppercase tracking-[0.4em] font-black">DEFENSE_GRID_BREACHED // CORE_EXPOSED</p>
                    </div>
                    <button
                      onClick={resetGame}
                      className="w-full relative py-5 border border-magenta-vibrant bg-magenta-vibrant/5 text-magenta-vibrant font-black hover:bg-magenta-vibrant hover:text-black transition-all glitch-hover uppercase tracking-[0.3em] text-[10px] shadow-[0_0_30px_rgba(255,0,255,0.1)]"
                    >
                      REBOOT_DEFENSE_SYS
                    </button>
                 </div>
               ) : (
                 <div className="text-center space-y-10 w-full max-w-[320px]">
                    <div className="relative inline-block">
                       <h2 className="text-7xl font-pixel text-cyan-vibrant italic tracking-widest text-glitch uppercase opacity-80 leading-none">STASIS</h2>
                       <div className="absolute -right-10 top-0 h-full w-1.5 bg-cyan-vibrant/20 animate-pulse" />
                    </div>
                    <button
                      onClick={() => setIsPaused(false)}
                      className="w-full relative py-6 border border-cyan-vibrant bg-cyan-vibrant/5 text-cyan-vibrant font-black hover:bg-cyan-vibrant hover:text-black transition-all glitch-hover uppercase tracking-[0.4em] text-xs shadow-[0_0_50px_rgba(0,255,255,0.1)]"
                    >
                      <PlayIcon className="inline mr-4 h-6 w-6 fill-current" /> ACTIVATE_FEED
                    </button>
                    <div className="flex flex-col items-center gap-2 opacity-40">
                       <p className="text-[10px] text-cyan-vibrant uppercase font-black tracking-[0.6em] mb-2 leading-none">External_Signal_Hold</p>
                       <div className="flex gap-6 text-[8px] font-bold">
                          <span>[P]_PAUSE</span>
                          <span>[SPACE]_FIRE</span>
                          <span>[A/D]_MOVE</span>
                       </div>
                    </div>
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Corner Brackets */}
        <div className="absolute -top-[1px] -left-[1px] w-8 h-8 border-t border-l border-cyan-vibrant/40" />
        <div className="absolute -bottom-[1px] -right-[1px] w-8 h-8 border-b border-r border-cyan-vibrant/40" />
      </div>

      <div className="mt-8 flex gap-10 items-center border-t border-cyan-vibrant/10 pt-5 w-full max-w-[400px]">
        <div className="flex flex-col items-center flex-1">
           <span className="text-[8px] text-cyan-vibrant/30 font-black uppercase tracking-widest mb-1 leading-none">Drift_Control</span>
           <span className="text-[10px] text-cyan-vibrant/60 font-black">[A/D]</span>
        </div>
        <div className="w-[1px] h-8 bg-cyan-vibrant/10" />
        <div className="flex flex-col items-center flex-1">
           <span className="text-[8px] text-cyan-vibrant/30 font-black uppercase tracking-widest mb-1 leading-none">Void_Pulse</span>
           <span className="text-[10px] text-cyan-vibrant/60 font-black">[SPACE]</span>
        </div>
        <div className="w-[1px] h-8 bg-cyan-vibrant/10" />
        <div className="flex flex-col items-center flex-1">
           <span className="text-[8px] text-cyan-vibrant/30 font-black uppercase tracking-widest mb-1 leading-none">Hold_State</span>
           <span className="text-[10px] text-cyan-vibrant/60 font-black">[P]</span>
        </div>
      </div>
    </div>
  );
}
