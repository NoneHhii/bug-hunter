import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, ArrowLeft } from 'lucide-react';

type EnemyType = 'syntax' | 'logic' | 'memory';

interface Enemy {
    id: string;
    type: EnemyType;
    hp: number;
    maxHp: number;
    x: number; // 0 to 100 (%)
    y: number; // 0 to 100 (%)
    speed: number;
}

interface FloatingText {
    id: string;
    text: string;
    x: number;
    y: number;
}

export default function CampaignEngine({ onExit }: { onExit: (success?: boolean) => void }) {
    const { campaignTeam, inventory, addVouchers, assignToTeam } = useGameStore();
    
    // Map UIDs to actual Dev objects, filtering out any missing ones
    const activeTeam = inventory.filter(dev => campaignTeam.includes(dev.uid) && dev.currentHp > 0);
    
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [baseHp, setBaseHp] = useState(1000);
    const [wave, setWave] = useState(1);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isVictory, setIsVictory] = useState(false);
    
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const [logs, setLogs] = useState<string[]>(['> INITIATING CAMPAIGN PROTOCOL...']);
    
    const maxWaves = 3;

    const addLog = (msg: string) => setLogs(p => [...p, msg].slice(-8));

    // Wave Spawner
    useEffect(() => {
        if (isGameOver || isVictory) return;
        
        let spawnCount = 0;
        const totalToSpawn = wave * 5; // wave 1 = 5, wave 2 = 10...
        
        addLog(`> WAVE ${wave} INCOMING...`);

        const spawnTimer = setInterval(() => {
            if (spawnCount >= totalToSpawn) {
                clearInterval(spawnTimer);
                return;
            }
            
            const types: EnemyType[] = ['syntax', 'logic', 'memory'];
            const type = types[Math.floor(Math.random() * types.length)];
            const hpMultiplier = wave * 1.5;
            
            const newEnemy: Enemy = {
                id: crypto.randomUUID(),
                type,
                hp: type === 'memory' ? 300 * hpMultiplier : 100 * hpMultiplier,
                maxHp: type === 'memory' ? 300 * hpMultiplier : 100 * hpMultiplier,
                x: 5 + Math.random() * 90, // Random X pos between 5% and 95%
                y: -10, // Start above screen
                speed: type === 'syntax' ? 2 : type === 'logic' ? 1.5 : 1
            };
            
            setEnemies(prev => [...prev, newEnemy]);
            spawnCount++;
        }, 1500 - (wave * 200)); // Spawn faster each wave

        return () => clearInterval(spawnTimer);
    }, [wave, isGameOver, isVictory]);

    // Game Loop (Movement & Base Collision)
    useEffect(() => {
        if (isGameOver || isVictory) return;
        
        const moveLoop = setInterval(() => {
            setEnemies(prev => {
                if (prev.length === 0) return prev;
                let newEnemies = prev.map(e => ({ ...e, y: e.y + (e.speed * 0.1) }));
                
                const reachedBase = newEnemies.filter(e => e.y >= 100);
                if (reachedBase.length > 0) {
                    setBaseHp(hp => {
                        const newHp = hp - (reachedBase.length * 100);
                        if (newHp <= 0 && !isGameOver) {
                            setIsGameOver(true);
                            addLog('> BASE COMPROMISED. CAMPAIGN FAILED.');
                        } else if (newHp > 0) {
                            setScreenShake(true);
                            setTimeout(() => setScreenShake(false), 300);
                            addLog(`> BASE TOOK DAMAGE! HP: ${newHp}`);
                        }
                        return newHp;
                    });
                }
                
                return newEnemies.filter(e => e.y < 100 && e.hp > 0);
            });
        }, 50); // Tick 50ms for smooth movement
        
        return () => clearInterval(moveLoop);
    }, [isGameOver, isVictory]);

    const activeTeamRef = useRef(activeTeam);
    useEffect(() => {
        activeTeamRef.current = activeTeam;
    }, [activeTeam]);

    // Attack Loop
    useEffect(() => {
        if (isGameOver || isVictory) return;
        
        const attackLoop = setInterval(() => {
            const currentTeam = activeTeamRef.current;
            if (currentTeam.length === 0) return;

            setEnemies(prev => {
                if (prev.length === 0) return prev;
                let newEnemies = [...prev];
                
                currentTeam.forEach(dev => {
                    const target = newEnemies.reduce((p, c) => (c.y > p.y) ? c : p, newEnemies[0]);
                    
                    if (target) {
                        const dmg = (dev!.baseStats.atk || 50) + Math.random() * 20;
                        const tIndex = newEnemies.findIndex(e => e.id === target.id);
                        if (tIndex !== -1) {
                            newEnemies[tIndex].hp -= dmg;
                            
                            const ftId = crypto.randomUUID();
                            setFloatingTexts(ft => [...ft, { id: ftId, text: `-${Math.floor(dmg)}`, x: target.x, y: target.y }]);
                            setTimeout(() => setFloatingTexts(ft => ft.filter(f => f.id !== ftId)), 800);
                            
                            setAttackingDev(dev!.uid);
                            setTimeout(() => setAttackingDev(null), 100);
                        }
                    }
                });
                
                return newEnemies.filter(e => e.hp > 0);
            });
        }, 1000);
        
        return () => clearInterval(attackLoop);
    }, [isGameOver, isVictory]);

    // Check Wave clear
    useEffect(() => {
        if (enemies.length === 0 && wave <= maxWaves && !isGameOver && !isVictory) {
            // Need to make sure we've actually spawned things this wave, but this is a simplified version
            // A better way: if time passed since wave start > expected spawn time + clear time
        }
    }, [enemies.length]);

    // For simplicity, we'll auto-progress waves via a master timer if all enemies are dead.
    // Let's refine the wave progression logic.
    useEffect(() => {
        const checkClear = setInterval(() => {
             setEnemies(currEnemies => {
                 if (currEnemies.length === 0 && !isGameOver && !isVictory) {
                     // Wait a bit before next wave
                     if (wave < maxWaves) {
                         setWave(w => w + 1);
                     } else if (wave === maxWaves) {
                         setIsVictory(true);
                         addLog('> ALL SECTORS CLEARED. VICTORY!');
                         // Reward
                         setTimeout(() => addVouchers(5), 1000);
                     }
                 }
                 return currEnemies;
             });
        }, 5000); // Check every 5s if clear
        return () => clearInterval(checkClear);
    }, [wave, maxWaves, isGameOver, isVictory]);

    const [screenShake, setScreenShake] = useState(false);
    const [attackingDev, setAttackingDev] = useState<string | null>(null);

    return (
        <div className={`w-full h-full flex flex-col font-mono bg-[#050505] p-2 md:p-6 transition-transform ${screenShake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
            
            {/* Top Bar */}
            <div className="flex justify-between items-center border-b-2 border-[var(--color-neon-cyan)] pb-2 mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => {
                        if (!isGameOver && !isVictory) {
                            if (window.confirm("Abandoning the mission will fail the campaign. Retreat?")) {
                                assignToTeam('campaign', []);
                                onExit(false);
                            }
                        } else {
                            assignToTeam('campaign', []);
                            onExit();
                        }
                    }} className="text-[var(--color-neon-cyan)] hover:text-white border border-[var(--color-neon-cyan)] p-1 cursor-pointer">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-[var(--color-neon-cyan)] font-bold text-xl uppercase tracking-widest">CAMPAIGN // SECTOR_{wave}</h1>
                </div>
                <div className="flex gap-8">
                    <div className="text-gray-400 font-bold">WAVE: <span className="text-white">{wave}/{maxWaves}</span></div>
                    <div className="text-[var(--color-neon-green)] font-bold">BASE HP: <span className="text-white">{baseHp}</span></div>
                </div>
            </div>

            {/* Battlefield Area */}
            <div className="flex-1 border-2 border-[#333] bg-[#0a0a0a] relative overflow-hidden flex flex-col">
                
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                
                {/* Enemy Playfield */}
                <div className="flex-1 relative">
                    <AnimatePresence>
                        {enemies.map(enemy => (
                            <motion.div 
                                key={enemy.id}
                                className="absolute -translate-x-1/2 flex flex-col items-center"
                                style={{ left: `${enemy.x}%`, top: `${enemy.y}%` }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                            >
                                <div className="text-[8px] text-[var(--color-neon-red)] font-bold mb-1">{Math.floor(enemy.hp)}</div>
                                <div className={`w-8 h-8 flex items-center justify-center border-2 border-[var(--color-neon-red)] bg-red-900/30 ${enemy.type === 'logic' ? 'rounded-full' : ''}`}>
                                    <Bug className="w-5 h-5 text-[var(--color-neon-red)]" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Floating Texts */}
                    {floatingTexts.map(ft => (
                        <motion.div
                            key={ft.id}
                            initial={{ opacity: 1, y: 0 }}
                            animate={{ opacity: 0, y: -30 }}
                            className="absolute text-[var(--color-neon-red)] font-bold text-sm z-50 drop-shadow-md pointer-events-none -translate-x-1/2"
                            style={{ left: `${ft.x}%`, top: `${ft.y}%` }}
                        >
                            {ft.text}
                        </motion.div>
                    ))}
                </div>

                {/* Laser/Attack effects could go here, drawn via SVG between dev and enemy */}

                {/* Defending Team (Bottom) */}
                <div className="h-24 border-t-2 border-[var(--color-neon-cyan)] bg-[#111] relative flex justify-around items-end pb-2 px-8">
                    {activeTeam.map((dev) => (
                        <div key={dev!.uid} className="flex flex-col items-center relative group">
                            <motion.div
                                animate={{ y: attackingDev === dev!.uid ? -10 : 0 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                            >
                                <img src={dev!.avatarUrl} className="w-12 h-12 border-2 border-[#333] group-hover:border-[var(--color-neon-cyan)] transition-colors object-cover" />
                            </motion.div>
                            <div className="text-[9px] text-[var(--color-neon-cyan)] font-bold mt-1 bg-black/50 px-1 truncate max-w-[60px] text-center">
                                {dev!.name}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Overlays */}
                {isGameOver && (
                    <div className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
                        <h2 className="text-4xl font-bold text-[var(--color-neon-red)] mb-4 tracking-widest animate-pulse">SYSTEM BREACHED</h2>
                        <button onClick={() => { assignToTeam('campaign', []); onExit(false); }} className="border-2 border-[var(--color-neon-red)] text-white px-8 py-2 hover:bg-[var(--color-neon-red)] hover:text-black font-bold transition-colors">
                            RETREAT TO HUB
                        </button>
                    </div>
                )}

                {isVictory && (
                    <div className="absolute inset-0 bg-green-950/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
                        <h2 className="text-4xl font-bold text-[var(--color-neon-green)] mb-4 tracking-widest text-glow-green">SECTOR SECURED</h2>
                        <p className="text-white mb-6 font-mono tracking-widest">+5 VOUCHERS ACQUIRED</p>
                        <button onClick={() => { assignToTeam('campaign', []); onExit(true); }} className="border-2 border-[var(--color-neon-green)] text-white px-8 py-2 hover:bg-[var(--color-neon-green)] hover:text-black font-bold transition-colors">
                            RETURN TO HUB
                        </button>
                    </div>
                )}
            </div>

            {/* Battle Log */}
            <div className="h-32 border-2 border-[#333] bg-[#0a0a0a] mt-4 flex flex-col text-xs font-mono">
                 <div className="bg-[#111] text-gray-500 px-2 py-1 border-b border-[#333] font-bold">TERMINAL_LOG</div>
                 <div className="flex-1 p-2 overflow-y-auto custom-scrollbar flex flex-col justify-end">
                     {logs.map((log, idx) => (
                         <div key={idx} className={`${log.includes('DAMAGE') || log.includes('BREACHED') || log.includes('FAILED') ? 'text-red-500' : 'text-gray-400'}`}>
                             {log}
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
}
