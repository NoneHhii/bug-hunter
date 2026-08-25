import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { BOSSES, type Boss } from '../game/constants/bosses';

type FloatingText = { id: number, text: string, type: 'damage' | 'heal' | 'status', isBoss: boolean };
type LogEntry = { id: number, text: string, type: 'normal' | 'crit' | 'error' | 'success' };

export default function BattleEngine({ onBattleEnd }: { onBattleEnd: (success: boolean) => void }) {
    const { bossTeam, inventory, currentProject, assignToTeam } = useGameStore();
    const activeTeam = useMemo(() => inventory.filter(dev => bossTeam.includes(dev.uid)), [inventory, bossTeam]);

    // Synergy Check
    const synergies = useMemo(() => {
        let micro = 0, strict = 0, ai = 0, low = 0;
        const roles = new Set<string>();

        activeTeam.forEach(d => {
            roles.add(d.role);
            const stack = d.techStack;
            if (stack.includes('Go') || stack.includes('Docker') || d.role === 'DevOps') micro++;
            if (stack.includes('Rust') || stack.includes('TypeScript')) strict++;
            if (stack.includes('Python') || stack.includes('OpenAI')) ai++;
            if (stack.includes('C/') || stack.includes('Assembly') || stack.includes('Rust')) low++;
        });

        return {
            mesh: micro >= 3,
            strict: strict >= 2,
            agile: roles.has('Frontend') && roles.has('Backend') && roles.has('Support') && roles.has('Tanker'),
            ai: ai >= 2,
            lowLevel: low >= 2
        };
    }, [activeTeam]);

    // Boss Selection
    const [boss] = useState<Boss>(() => {
        return BOSSES[Math.floor(Math.random() * BOSSES.length)];
    });

    const maxBossHp = currentProject ? currentProject.complexity * boss.baseStats.hp : boss.baseStats.hp;
    const [bossHp, setBossHp] = useState(maxBossHp);

    // Combat State Refs (To avoid react dependency hell in tick loop)
    const bossHpRef = useRef(maxBossHp);
    const bossGaugeRef = useRef(0);
    const devGaugesRef = useRef<Record<string, number>>({});
    const devCommitsRef = useRef<Record<string, number>>({});
    const [, setRenderTrigger] = useState(0); // For UI updates


    const [attackingUid, setAttackingUid] = useState<string | null>(null);
    const [bossHit, setBossHit] = useState(false);
    const [screenShake, setScreenShake] = useState(false);

    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const isNight = new Date().getHours() >= 0 && new Date().getHours() < 5;
    const isFridayAfternoon = new Date().getDay() === 5 && new Date().getHours() >= 15 && new Date().getHours() <= 18;

    const addLog = (text: string, type: 'normal' | 'crit' | 'error' | 'success' = 'normal') => {
        setLogs(prev => [...prev, { id: Date.now() + Math.random(), text, type }].slice(-20));
    };

    const addFloatingText = (text: string, type: 'damage' | 'heal' | 'status', isBoss: boolean) => {
        const id = Date.now() + Math.random();
        setFloatingTexts(prev => [...prev, { id, text, type, isBoss }]);
        setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== id)), 1000);
    };

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    useEffect(() => {
        addLog(`> INITIATING DEPLOYMENT...`, 'success');
        addLog(`> TARGET: ${boss.name} (ACT ${boss.act})`);
        if (synergies.mesh) addLog(`[SYNERGY] Microservices Mesh: Dmg Taken -25%`, 'success');
        if (synergies.agile) addLog(`[SYNERGY] Full-Stack Agile: SPD +20%`, 'success');
        if (synergies.ai) addLog(`[SYNERGY] AI Augmented: Crit Rate +35%, Crit Dmg +50%`, 'success');
        if (synergies.lowLevel) addLog(`[SYNERGY] Low-Level Native: Pierce 40% Boss DEF`, 'success');
        if (synergies.strict) addLog(`[SYNERGY] Strict Type Safety: Immune to NPE/Callback Hell`, 'success');
        if (isNight) addLog(`[ENVIRONMENT] Night Shift: Backend/DevOps ATK +20%`, 'crit');
        if (isFridayAfternoon) addLog(`[ENVIRONMENT] Friday Afternoon: Boss Enraged!`, 'error');
    }, []);

    // Main Tick Loop
    useEffect(() => {
        const tickRate = 100; // ms

        const loop = setInterval(() => {
            const state = useGameStore.getState();
            const currentActiveTeam = state.inventory.filter(dev => state.bossTeam.includes(dev.uid));
            const aliveDevs = currentActiveTeam.filter(d => d.currentHp > 0);

            if (bossHpRef.current <= 0) {
                clearInterval(loop);
                addLog(`[200 OK] DEPLOYMENT SUCCESSFUL!`, 'success');
                setTimeout(() => {
                    assignToTeam('boss', []);
                    onBattleEnd(true);
                }, 2000);
                return;
            }

            if (aliveDevs.length === 0) {
                clearInterval(loop);
                addLog(`[500 ERROR] ALL DEVELOPERS DOWN. ROLLBACK INITIATED.`, 'error');
                setTimeout(() => {
                    assignToTeam('boss', []);
                    onBattleEnd(false);
                }, 2000);
                return;
            }

            // Boss Tick
            let bSpd = boss.baseStats.spd;
            if (isFridayAfternoon) bSpd *= 1.5;
            bossGaugeRef.current += (bSpd / 10);

            if (bossGaugeRef.current >= 100) {
                bossGaugeRef.current = 0;
                // Boss Attacks
                let target = aliveDevs[Math.floor(Math.random() * aliveDevs.length)];

                // NPE Mechanic
                if (boss.id === 'npe' && !synergies.strict) {
                    target = [...aliveDevs].sort((a, b) => b.baseStats.atk - a.baseStats.atk)[0]; // target highest atk
                }
                // Memory Leak mechanic
                if (boss.id === 'memory_leak') {
                    boss.baseStats.atk *= 1.1; // boss grows
                }

                let dmg = boss.baseStats.atk;
                if (synergies.mesh) dmg *= 0.75;
                if (isFridayAfternoon) dmg *= 1.2;

                dmg = Math.max(1, dmg - (target.baseStats.def * 0.5));

                // Integer Overflow Easter Egg
                if (target.techStack.includes('C/') && target.baseStats.def > 2000000000) {
                    dmg = 2147483648;
                    addLog(`[FATAL] Integer Overflow on ${target.name}!`, 'error');
                }

                state.damageDev(target.uid, dmg);
                addLog(`> ${boss.name} dealt ${Math.floor(dmg)} dmg to ${target.name}.`, 'error');
                addFloatingText(`-${Math.floor(dmg)}`, 'damage', false);
                setScreenShake(true);
                setTimeout(() => setScreenShake(false), 200);
            }

            // Devs Tick
            aliveDevs.forEach(dev => {
                let spd = dev.baseStats.spd;
                if (synergies.agile) spd *= 1.2;

                devGaugesRef.current[dev.uid] = (devGaugesRef.current[dev.uid] || 0) + (spd / 10);

                if (devGaugesRef.current[dev.uid] >= 100) {
                    devGaugesRef.current[dev.uid] = 0;

                    // Low HP Timeout (408)
                    if (dev.currentHp / dev.baseStats.hp < 0.1 && Math.random() < 0.2) {
                        addLog(`[408 Request Timeout] ${dev.name} is too exhausted to act!`, 'error');
                        addFloatingText('408 TIMEOUT', 'status', false);
                        return;
                    }

                    // Boss Dodge (404)
                    if (Math.random() < 0.05) {
                        addLog(`[404 Not Found] ${boss.name} evaded ${dev.name}'s attack!`, 'error');
                        addFloatingText('404 DODGE', 'status', true);
                        return;
                    }

                    // Attack
                    let atk = dev.baseStats.atk;
                    if (isNight && (dev.role === 'Backend' || dev.role === 'DevOps')) atk *= 1.2;

                    let bossDef = boss.baseStats.def;
                    if (synergies.lowLevel) bossDef *= 0.6; // Pierce 40%

                    let dmg = Math.max(1, atk - bossDef * 0.5);

                    // Crit (301)
                    let isCrit = false;
                    if (synergies.ai && Math.random() < 0.35) {
                        isCrit = true;
                        dmg *= 2.0; // 1.5 base + 0.5 from synergy
                    } else if (Math.random() < 0.1) {
                        isCrit = true;
                        dmg *= 1.5;
                    }

                    // Commits (Ultimate)
                    let commits = (devCommitsRef.current[dev.uid] || 0) + 1;
                    if (commits >= 10) {
                        commits = 0;
                        dmg *= 5;
                        addLog(`[500 Internal Server Error] ${dev.name} executes 'git push --force'!`, 'crit');
                        addFloatingText('ULTIMATE: 500 ERROR', 'status', true);
                    } else {
                        addLog(`[${isCrit ? '301 Moved Permanently' : '200 OK'}] ${dev.name} hit ${boss.name} for ${Math.floor(dmg)}.`, isCrit ? 'crit' : 'normal');
                    }
                    devCommitsRef.current[dev.uid] = commits;

                    bossHpRef.current -= dmg;
                    setBossHp(bossHpRef.current);

                    setAttackingUid(dev.uid);
                    setTimeout(() => setAttackingUid(null), 300);

                    setBossHit(true);
                    setTimeout(() => setBossHit(false), 200);
                    addFloatingText(`-${Math.floor(dmg)}`, 'damage', true);

                    // Small chance to stun (403)
                    if (Math.random() < 0.05) {
                        bossGaugeRef.current = -50; // Stun reduces gauge
                        addLog(`[403 Forbidden] ${dev.name} temporarily blocked ${boss.name}!`, 'success');
                        addFloatingText('403 FORBIDDEN', 'status', true);
                    }
                }
            });

            // Force a re-render to update UI gauges
            setRenderTrigger(prev => prev + 1);

        }, tickRate);

        return () => clearInterval(loop);
    }, [boss, synergies, isNight, isFridayAfternoon, assignToTeam, onBattleEnd]);

    return (
        <div className={`w-full h-full flex flex-col font-mono p-2 lg:p-6 bg-[#050505] transition-transform ${screenShake ? 'animate-[shake_0.4s_ease-in-out]' : ''} relative`}>

            <button onClick={() => {
                if (window.confirm("Abandoning the fight will fail the deployment. Retreat?")) {
                    assignToTeam('boss', []);
                    onBattleEnd(false);
                }
            }} className="absolute top-2 left-2 md:top-6 md:left-6 border border-gray-600 text-gray-400 px-4 py-1 text-xs hover:bg-gray-800 transition-colors z-50">
                &lt; ABANDON DEPLOYMENT
            </button>

            <div className="flex-1 flex flex-col md:flex-row gap-8 relative overflow-hidden mt-8 md:mt-0">

                {/* LEFT: Team */}
                <div className="flex-[1] flex flex-col justify-center gap-4 z-10 p-4 relative">
                    <AnimatePresence>
                        {floatingTexts.filter(t => !t.isBoss).map(t => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                animate={{ opacity: 1, y: -50, scale: 1.5 }}
                                exit={{ opacity: 0 }}
                                className={`absolute left-1/2 font-bold text-2xl z-50 pointer-events-none drop-shadow-[0_0_10px_rgba(0,0,0,1)] ${t.type === 'damage' ? 'text-red-500' : t.type === 'heal' ? 'text-green-500' : 'text-yellow-500'}`}
                            >
                                {t.text}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <div className="text-[10px] text-[var(--color-neon-purple)] font-bold mb-[-10px]">FRONTLINE</div>
                    <div className="flex flex-col gap-2 border-l-2 border-[var(--color-neon-purple)] pl-2">
                        {activeTeam.slice(0, 3).map((dev) => {
                            const isDead = dev.currentHp <= 0;
                            const gauge = devGaugesRef.current[dev.uid] || 0;
                            const commits = devCommitsRef.current[dev.uid] || 0;

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
                                            <div className="flex-[2]">
                                                <div className="w-full h-1.5 bg-[#222] border border-[#333] relative">
                                                    <div className={`h-full transition-all duration-300 ${dev.currentHp / dev.baseStats.hp < 0.3 ? 'bg-[var(--color-neon-red)] animate-pulse' : 'bg-[var(--color-neon-green)]'}`} style={{ width: `${(dev.currentHp / dev.baseStats.hp) * 100}%` }}></div>
                                                </div>
                                                <div className="text-[8px] text-gray-400 mt-0.5">HP: {Math.floor(dev.currentHp)}/{dev.baseStats.hp}</div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="w-full h-1.5 bg-[#222] border border-[#333] relative">
                                                    <div className="h-full bg-[var(--color-neon-cyan)] transition-all" style={{ width: `${Math.min(100, gauge)}%` }}></div>
                                                </div>
                                                <div className="text-[8px] text-gray-400 mt-0.5">PING: {dev.baseStats.spd}</div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="w-full h-1.5 bg-[#222] border border-[#333] flex">
                                                    {Array.from({ length: 10 }).map((_, i) => (
                                                        <div key={i} className={`flex-1 border-r border-[#111] ${i < commits ? 'bg-[var(--color-neon-gold)]' : 'bg-transparent'}`}></div>
                                                    ))}
                                                </div>
                                                <div className="text-[8px] text-gray-400 mt-0.5">COMMITS: {commits}/10</div>
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
                            const isDead = dev.currentHp <= 0;
                            const gauge = devGaugesRef.current[dev.uid] || 0;
                            const commits = devCommitsRef.current[dev.uid] || 0;

                            return (
                                <motion.div
                                    key={dev.uid}
                                    animate={{ x: attackingUid === dev.uid ? 50 : 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                                    className={`border border-[var(--color-rpg-border)] p-2 flex gap-4 items-center relative overflow-hidden group transition-colors
                                ${isDead ? 'bg-red-950/30 grayscale opacity-60' : 'bg-[#111] hover:border-[var(--color-neon-cyan)]'}
                            `}
                                >
                                    <img src={dev.avatarUrl} alt={dev.name} className={`w-10 h-10 border border-[#333] z-10 ${!isDead ? 'grayscale-[50%]' : ''}`} />
                                    <div className="flex-1 z-10">
                                        <div className={`flex justify-between text-xs font-bold mb-1 ${isDead ? 'text-red-500' : 'text-[var(--color-neon-cyan)]'}`}>
                                            <span>{dev.name} {isDead && '(DEAD)'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-[2]"><div className="w-full h-1.5 bg-[#222] border border-[#333]"><div className="h-full bg-[var(--color-neon-green)] transition-all" style={{ width: `${(dev.currentHp / dev.baseStats.hp) * 100}%` }}></div></div></div>
                                            <div className="flex-1"><div className="w-full h-1.5 bg-[#222] border border-[#333]"><div className="h-full bg-[var(--color-neon-cyan)] transition-all" style={{ width: `${Math.min(100, gauge)}%` }}></div></div></div>
                                            <div className="flex-1"><div className="w-full h-1.5 bg-[#222] border border-[#333] flex">{Array.from({ length: 10 }).map((_, i) => (<div key={i} className={`flex-1 border-r border-[#111] ${i < commits ? 'bg-[var(--color-neon-gold)]' : 'bg-transparent'}`}></div>))}</div></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* RIGHT: Boss */}
                <div className="flex-[2] flex flex-col items-center justify-center relative z-10 p-4">
                    <AnimatePresence>
                        {floatingTexts.filter(t => t.isBoss).map(t => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                animate={{ opacity: 1, y: -100, scale: 2 }}
                                exit={{ opacity: 0 }}
                                className={`absolute top-1/3 left-1/2 -translate-x-1/2 font-bold text-4xl z-50 pointer-events-none drop-shadow-[0_0_10px_rgba(0,0,0,1)] ${t.type === 'damage' ? 'text-red-500' : t.type === 'status' ? 'text-yellow-500' : 'text-green-500'}`}
                            >
                                {t.text}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <div className="text-center mb-6">
                        <h2 className="text-[var(--color-neon-purple)] font-bold text-2xl mb-1 tracking-widest text-glow-purple">{boss.name}</h2>
                        <p className="text-[var(--color-neon-red)] text-sm tracking-widest">STATUS: 502 BAD GATEWAY</p>
                        <p className="text-gray-500 text-xs mt-2 italic max-w-sm">{boss.mechanic.description}</p>
                    </div>

                    <div className={`w-64 h-64 md:w-80 md:h-80 border-2 border-[var(--color-neon-purple)] relative flex items-center justify-center bg-purple-900/10 shadow-[0_0_30px_rgba(176,0,255,0.3)] mb-8 overflow-hidden group transition-all ${bossHit ? 'brightness-200 sepia hue-rotate-180 scale-105' : ''}`}>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-50 z-10 pointer-events-none"></div>
                        <img
                            src={`/bosses/${boss.id}.jpg`}
                            onError={(e) => { e.currentTarget.src = '/avatars/boss.jpg' }}
                            alt="Boss"
                            className="absolute inset-0 w-full h-full object-cover filter brightness-75 contrast-125 group-hover:brightness-100 transition-all"
                        />
                        <div className="absolute top-4 left-4 text-[10px] text-[var(--color-neon-purple)] opacity-70 font-mono z-20 font-bold drop-shadow-md">
                            ACT {boss.act}<br />ERR_CRITICAL
                        </div>
                    </div>

                    {/* Boss HP Bar */}
                    <div className="w-full max-w-md h-4 bg-[#111] border-2 border-[var(--color-neon-purple)] relative p-[2px]">
                        <div className="h-full bg-[var(--color-neon-purple)] transition-all duration-300" style={{ width: `${Math.max(0, (bossHp / maxBossHp) * 100)}%` }}></div>
                    </div>
                    <div className="text-[10px] text-[var(--color-neon-purple)] font-bold mt-2 text-right w-full max-w-md">BOSS HP: {Math.floor(Math.max(0, bossHp))}/{maxBossHp}</div>

                    {/* Boss Action Gauge */}
                    <div className="w-full max-w-md h-1 bg-[#111] border border-[#333] relative mt-1">
                        <div className="h-full bg-yellow-500 transition-all" style={{ width: `${Math.max(0, Math.min(100, bossGaugeRef.current))}%` }}></div>
                    </div>
                </div>

            </div>

            {/* BOTTOM AREA: Battle Log */}
            <div className="h-48 border-2 border-[#333] border-t-[var(--color-neon-cyan)] bg-[#0a0a0a] flex flex-col shrink-0 mt-4 z-10 shadow-[0_-5px_15px_rgba(0,255,255,0.1)]">
                <div className="bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] px-4 py-1 text-xs font-bold border-b border-[#333]">
                    HTTP_RESPONSE_LOG.TXT
                </div>
                <div className="flex-1 p-4 overflow-y-auto text-xs text-gray-400 font-mono flex flex-col gap-1 custom-scrollbar">
                    {logs.map((log) => (
                        <div key={log.id} className={
                            log.type === 'error' ? 'text-[var(--color-neon-red)]' :
                                log.type === 'crit' ? 'text-[var(--color-neon-gold)] font-bold' :
                                    log.type === 'success' ? 'text-[var(--color-neon-green)]' : 'text-gray-400'
                        }>
                            {log.text}
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>

        </div>
    );
}
