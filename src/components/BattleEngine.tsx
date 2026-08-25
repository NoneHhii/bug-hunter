import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

export default function BattleEngine({ onBattleEnd }: { onBattleEnd: (success: boolean) => void }) {
    const { bossTeam, inventory, currentProject, assignToTeam } = useGameStore();

    // Base HP on project complexity if exists
    const maxHp = currentProject ? currentProject.complexity * 5000 : 10000;
    const [bossHp, setBossHp] = useState(maxHp);
    const bossMaxHp = maxHp;

    // Local state for MP
    const [mps, setMps] = useState<Record<string, number>>({});

    // Animation States
    const [attackingUid, setAttackingUid] = useState<string | null>(null);
    const [bossHit, setBossHit] = useState(false);
    const [screenShake, setScreenShake] = useState(false);
    const [floatingTexts, setFloatingTexts] = useState<{ id: number, text: string, type: 'damage' | 'heal', isBoss: boolean }[]>([]);

    const [logs, setLogs] = useState<string[]>([
        "> Initializing combat sequence...",
        "> Enemy NullPointerException encountered.",
    ]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, msg].slice(-10)); // Keep last 10 logs
    };

    const logsEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const addFloatingText = (text: string, type: 'damage' | 'heal', isBoss: boolean) => {
        const id = Date.now() + Math.random();
        setFloatingTexts(prev => [...prev, { id, text, type, isBoss }]);
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(t => t.id !== id));
        }, 1000);
    };

    const handleExit = (success: boolean) => {
        assignToTeam('boss', []);
        onBattleEnd(success);
    }

    // Fake Auto-Battle loop
    useEffect(() => {
        const timer = setInterval(() => {
            setBossHp(prevHp => {
                const storeState = useGameStore.getState();
                const currentActiveTeam = storeState.inventory.filter(dev => storeState.bossTeam.includes(dev.uid));

                if (prevHp <= 0) {
                    clearInterval(timer);
                    setTimeout(() => handleExit(true), 2000);
                    return prevHp;
                }

                if (currentActiveTeam.length > 0 && currentActiveTeam.every(d => d.currentHp <= 0)) {
                    clearInterval(timer);
                    addLog(`> TEAM DEFEATED! Aborting...`);
                    setTimeout(() => handleExit(false), 2000);
                    return prevHp;
                }

                // Random Dev attacks
                const aliveDevs = currentActiveTeam.filter(d => d.currentHp > 0);
                let nextBossHp = prevHp;

                if (aliveDevs.length > 0) {
                    const attacker = aliveDevs[Math.floor(Math.random() * aliveDevs.length)];
                    const dmg = attacker.baseStats.atk * 5;

                    // Trigger Attack Animation
                    setAttackingUid(attacker.uid);
                    setTimeout(() => setAttackingUid(null), 300);

                    setTimeout(() => {
                        setBossHit(true);
                        setTimeout(() => setBossHit(false), 200);
                        addFloatingText(`-${dmg}`, 'damage', true);
                        addLog(`> ${attacker.name} dealt ${dmg} damage to Boss.`);
                    }, 150);

                    nextBossHp = Math.max(0, prevHp - dmg);
                    if (nextBossHp === 0) {
                        addLog(`> FATAL EXCEPTION RESOLVED! Returning to deployment...`);
                    }

                    // Gain MP
                    setMps(prev => ({
                        ...prev,
                        [attacker.uid]: Math.min(100, (prev[attacker.uid] || 0) + 20)
                    }));
                }

                // Boss attacks occasionally
                if (Math.random() < 0.4 && aliveDevs.length > 0) {
                    setTimeout(() => {
                        const target = aliveDevs[Math.floor(Math.random() * aliveDevs.length)];
                        const bossDmg = 150;

                        // Screen shake
                        setScreenShake(true);
                        setTimeout(() => setScreenShake(false), 400);

                        storeState.damageDev(target.uid, bossDmg);
                        addLog(`> Boss dealt ${bossDmg} damage to ${target.name}.`);
                        addFloatingText(`-${bossDmg}`, 'damage', false);

                    }, 800); // Boss attacks a bit later in the turn
                }

                return nextBossHp;
            });
        }, 2000);

        return () => clearInterval(timer);
    }, []);

    const activeTeam = inventory.filter(dev => bossTeam.includes(dev.uid));

    return (
        <div className={`w-full h-full flex flex-col font-mono p-2 lg:p-6 bg-[#050505] transition-transform ${screenShake ? 'animate-[shake_0.4s_ease-in-out]' : ''} relative`}>

            {/* Abandon Button */}
            <button onClick={() => {
                if (window.confirm("Abandoning the fight will fail the deployment. Retreat?")) {
                    handleExit(false);
                }
            }} className="absolute top-2 left-2 md:top-6 md:left-6 border border-gray-600 text-gray-400 px-4 py-1 text-xs hover:bg-gray-800 transition-colors z-50">
                &lt; ABANDON DEPLOYMENT
            </button>

            {/* TOP AREA: Arena */}
            <div className="flex-1 flex flex-col md:flex-row gap-8 relative overflow-hidden mt-8 md:mt-0">

                {/* LEFT: Team */}
                <div className="flex-[1] flex flex-col justify-center gap-4 z-10 p-4 relative">

                    {/* Floating Text for Devs */}
                    <AnimatePresence>
                        {floatingTexts.filter(t => !t.isBoss).map(t => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                animate={{ opacity: 1, y: -50, scale: 1.5 }}
                                exit={{ opacity: 0 }}
                                className={`absolute left-1/2 font-bold text-2xl z-50 pointer-events-none drop-shadow-[0_0_10px_rgba(0,0,0,1)] ${t.type === 'damage' ? 'text-red-500' : 'text-green-500'}`}
                            >
                                {t.text}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <div className="text-[10px] text-[var(--color-neon-purple)] font-bold mb-[-10px]">FRONTLINE</div>
                    <div className="flex flex-col gap-2 border-l-2 border-[var(--color-neon-purple)] pl-2">
                        {activeTeam.slice(0, 3).map((dev) => {
                            const mp = mps[dev.uid] || 0;
                            const isDead = dev.currentHp <= 0;

                            return (
                                <motion.div
                                    key={dev.uid}
                                    animate={{ x: attackingUid === dev.uid ? 50 : 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                                    className={`border border-[var(--color-rpg-border)] p-2 flex gap-4 items-center relative overflow-hidden group transition-colors
                                ${isDead ? 'bg-red-950/30 grayscale opacity-60' : 'bg-[#111] hover:border-[var(--color-neon-green)]'}
                            `}
                                >
                                    {!isDead && <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-neon-green)]/10 to-transparent w-0 group-hover:w-full transition-all duration-500"></div>}
                                    <img src={dev.avatarUrl} alt={dev.name} className="w-12 h-12 border border-[#333] z-10" />
                                    <div className="flex-1 z-10">
                                        <div className={`flex justify-between text-xs font-bold mb-1 ${isDead ? 'text-red-500' : 'text-[var(--color-neon-green)]'}`}>
                                            <span>{dev.name} {isDead && '(DEAD)'}</span>
                                            <span className="text-[10px] text-gray-500">LVL {dev.level}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* HP Bar */}
                                            <div className="flex-1">
                                                <div className="w-full h-2 bg-[#222] border border-[#333] relative">
                                                    <div
                                                        className={`h-full transition-all duration-300 ${dev.currentHp / dev.baseStats.hp < 0.3 ? 'bg-[var(--color-neon-red)] animate-pulse' : 'bg-[var(--color-neon-green)]'}`}
                                                        style={{ width: `${(dev.currentHp / dev.baseStats.hp) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-[8px] text-gray-400 mt-1 flex justify-between">
                                                    <span>HP: {Math.floor(dev.currentHp)}/{dev.baseStats.hp}</span>
                                                    {dev.currentHp > 0 && dev.currentHp / dev.baseStats.hp < 0.3 && <span className="text-[var(--color-neon-red)] animate-pulse">CRITICAL</span>}
                                                </div>
                                            </div>
                                            {/* MP Bar */}
                                            <div className="flex-1">
                                                <div className="w-full h-2 bg-[#222] border border-[#333] relative">
                                                    <div className="h-full bg-[var(--color-neon-cyan)] transition-all duration-300" style={{ width: `${(mp / 100) * 100}%` }}></div>
                                                </div>
                                                <div className="text-[8px] text-gray-400 mt-1">MP: {Math.floor(mp)}/100</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    <div className="text-[10px] text-[var(--color-neon-cyan)] font-bold mb-[-10px] mt-2">BACKLINE</div>
                    <div className="flex flex-col gap-2 border-l-2 border-[var(--color-neon-cyan)] pl-2">
                        {activeTeam.slice(3, 5).map((dev) => {
                            // const mp = mps[dev.uid] || 0;
                            const isDead = dev.currentHp <= 0;

                            return (
                                <motion.div
                                    key={dev.uid}
                                    animate={{ x: attackingUid === dev.uid ? 50 : 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                                    className={`border border-[var(--color-rpg-border)] p-2 flex gap-4 items-center relative overflow-hidden group transition-colors
                                ${isDead ? 'bg-red-950/30 grayscale opacity-60' : 'bg-[#111] hover:border-[var(--color-neon-cyan)]'}
                            `}
                                >
                                    {!isDead && <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-neon-cyan)]/10 to-transparent w-0 group-hover:w-full transition-all duration-500"></div>}
                                    <img src={dev.avatarUrl} alt={dev.name} className={`w-10 h-10 border border-[#333] z-10 ${!isDead ? 'grayscale-[50%]' : ''}`} />
                                    <div className="flex-1 z-10">
                                        <div className={`flex justify-between text-xs font-bold mb-1 ${isDead ? 'text-red-500' : 'text-[var(--color-neon-cyan)]'}`}>
                                            <span>{dev.name} {isDead && '(DEAD)'}</span>
                                            <span className="text-[10px] text-gray-500">LVL {dev.level}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <div className="w-full h-2 bg-[#222] border border-[#333] relative">
                                                    <div
                                                        className={`h-full transition-all duration-300 ${dev.currentHp / dev.baseStats.hp < 0.3 ? 'bg-[var(--color-neon-red)] animate-pulse' : 'bg-[var(--color-neon-green)]'}`}
                                                        style={{ width: `${(dev.currentHp / dev.baseStats.hp) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                    {activeTeam.length === 0 && <div className="text-gray-500 italic">No Devs deployed!</div>}
                </div>

                {/* RIGHT: Boss */}
                <div className="flex-[2] flex flex-col items-center justify-center relative z-10 p-4">

                    {/* Floating Text for Boss */}
                    <AnimatePresence>
                        {floatingTexts.filter(t => t.isBoss).map(t => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                animate={{ opacity: 1, y: -100, scale: 2 }}
                                exit={{ opacity: 0 }}
                                className={`absolute top-1/3 left-1/2 -translate-x-1/2 font-bold text-4xl z-50 pointer-events-none drop-shadow-[0_0_10px_rgba(0,0,0,1)] ${t.type === 'damage' ? 'text-red-500' : 'text-green-500'}`}
                            >
                                {t.text}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <div className="text-center mb-6">
                        <h2 className="text-[var(--color-neon-purple)] font-bold text-2xl mb-1 tracking-widest text-glow-purple">NullPointerException</h2>
                        <p className="text-[var(--color-neon-red)] text-sm tracking-widest">STATUS: CRITICAL THREAT</p>
                    </div>

                    {/* Boss Image / Visual */}
                    <div className={`w-64 h-64 md:w-80 md:h-80 border-2 border-[var(--color-neon-purple)] relative flex items-center justify-center bg-purple-900/10 shadow-[0_0_30px_rgba(176,0,255,0.3)] mb-8 overflow-hidden group cursor-crosshair transition-all ${bossHit ? 'brightness-200 sepia hue-rotate-180 scale-105' : ''}`}>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-50 z-10 pointer-events-none"></div>
                        <img src="/avatars/boss.jpg" alt="Boss" className="absolute inset-0 w-full h-full object-cover filter brightness-75 contrast-125 group-hover:brightness-100 transition-all group-active:scale-95" />
                        <div className="absolute top-4 left-4 text-[10px] text-[var(--color-neon-purple)] opacity-70 font-mono z-20 font-bold drop-shadow-md">
                            0x00F870A0<br />ERR_MEM_FAULT
                        </div>
                    </div>

                    {/* Boss HP Bar */}
                    <div className="w-full max-w-md h-4 bg-[#111] border-2 border-[var(--color-neon-purple)] relative p-[2px]">
                        <div className="h-full bg-[var(--color-neon-purple)] transition-all duration-300" style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}></div>
                    </div>
                    <div className="text-[10px] text-[var(--color-neon-purple)] font-bold mt-2 text-right w-full max-w-md">BOSS HP: {Math.floor(bossHp)}/{bossMaxHp}</div>
                </div>

            </div>

            {/* BOTTOM AREA: Battle Log */}
            <div className="h-48 border-2 border-[#333] border-t-[var(--color-neon-cyan)] bg-[#0a0a0a] flex flex-col shrink-0 mt-4 z-10 shadow-[0_-5px_15px_rgba(0,255,255,0.1)]">
                <div className="bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] px-4 py-1 text-xs font-bold border-b border-[#333]">
                    BATTLE_LOG.TXT
                </div>
                <div className="flex-1 p-4 overflow-y-auto text-xs text-gray-400 font-mono flex flex-col gap-1 custom-scrollbar">
                    {logs.map((log, i) => (
                        <div key={i} className={log.includes('CRITICAL') || log.includes('defeated') || log.includes('DEFEATED') ? 'text-[var(--color-neon-red)]' : log.includes('damage to Boss') || log.includes('RESOLVED') ? 'text-[var(--color-neon-green)]' : 'text-gray-400'}>
                            {log}
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>

        </div>
    );
}
