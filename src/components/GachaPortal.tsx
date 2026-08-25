import { useState } from 'react';
import { useGameStore, type OwnedDev, type OwnedArtifact } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Server, Cpu } from 'lucide-react';

export default function GachaPortal() {
    const { coffeeBeans, rollGacha, rollArtifactGacha } = useGameStore();
    const [activeBanner, setActiveBanner] = useState<'dev' | 'artifact'>('dev');
    const [pulling, setPulling] = useState(false);

    const [revealedDevs, setRevealedDevs] = useState<OwnedDev[] | null>(null);
    const [revealedArtifacts, setRevealedArtifacts] = useState<OwnedArtifact[] | null>(null);

    const handlePull = (times: 1 | 10) => {
        const cost = activeBanner === 'dev' ? times * 160 : times * 100;
        if (coffeeBeans < cost) {
            alert("INSUFFICIENT CPU RESOURCES.");
            return;
        }

        setPulling(true);
        // Fake loading delay
        setTimeout(() => {
            if (activeBanner === 'dev') {
                const devs = rollGacha(times);
                if (devs) setRevealedDevs(devs);
            } else {
                const artifacts = rollArtifactGacha(times);
                if (artifacts) setRevealedArtifacts(artifacts);
            }
            setPulling(false);
        }, 2000);
    };

    const clearRevealed = () => {
        setRevealedDevs(null);
        setRevealedArtifacts(null);
    };

    const getRarityColor = (star: number) => {
        if (star === 5) return 'var(--color-neon-gold)';
        if (star === 4) return 'var(--color-neon-purple)';
        return 'var(--color-neon-cyan)';
    };

    return (
        <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-2 font-mono">
            {/* LEFT AREA: UPLINK */}
            <div className="flex-[3] border-2 border-[var(--color-neon-purple)] bg-[#0a0a0a] flex flex-col relative overflow-hidden">
                <div className="bg-[var(--color-neon-purple)]/20 text-[var(--color-neon-purple)] px-4 py-2 text-sm font-bold flex justify-between items-center border-b border-[var(--color-neon-purple)]">
                    <div className="flex gap-4">
                        <button
                            onClick={() => !pulling && setActiveBanner('dev')}
                            className={`${activeBanner === 'dev' ? 'text-[var(--color-neon-gold)] underline' : 'text-[var(--color-neon-purple)] hover:text-white'} transition-colors flex items-center gap-2`}
                        >
                            <Server className="w-4 h-4" /> RECRUIT_DEV.EXE
                        </button>
                        <button
                            onClick={() => !pulling && setActiveBanner('artifact')}
                            className={`${activeBanner === 'artifact' ? 'text-[var(--color-neon-gold)] underline' : 'text-[var(--color-neon-purple)] hover:text-white'} transition-colors flex items-center gap-2`}
                        >
                            <Cpu className="w-4 h-4" /> HARDWARE_STORE.EXE
                        </button>
                    </div>
                    <span className="text-[var(--color-neon-green)]">[STATUS: ONLINE]</span>
                </div>

                {/* Binary Background */}
                <div className="absolute inset-0 top-10 opacity-10 text-[10px] text-[var(--color-neon-green)] overflow-hidden font-mono leading-none break-all z-0 pointer-events-none">
                    {Array.from({ length: 200 }).map(() => Math.random().toString(2).substring(2)).join('')}
                </div>

                <div className="flex-1 flex items-center justify-center relative z-10 p-4 min-h-0">
                    <AnimatePresence mode="wait">
                        {pulling ? (
                            <motion.div key="pulling" className="flex flex-col items-center">
                                <div className="w-48 h-48 rounded-full border-4 border-[var(--color-neon-green)] border-t-transparent animate-spin mb-4 shadow-[0_0_30px_rgba(0,255,51,0.5)]"></div>
                                <div className="text-[var(--color-neon-green)] font-bold animate-pulse">DOWNLOADING ASSETS...</div>
                            </motion.div>
                        ) : (revealedDevs || revealedArtifacts) ? (
                            <motion.div key="revealed" className="flex flex-col items-center w-full h-full min-h-0">
                                <h2 className="text-[var(--color-neon-gold)] text-xl font-bold mb-4 shrink-0">UPLINK SUCCESSFUL</h2>
                                <div className="flex gap-4 overflow-y-auto w-full justify-center p-4 custom-scrollbar flex-wrap flex-1 content-start min-h-0">
                                    {revealedDevs?.map((dev, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            key={`dev-${i}`}
                                            className="border border-[#333] bg-[#111] w-40 shrink-0 p-2 flex flex-col items-center relative"
                                            style={{ borderColor: getRarityColor(dev.star) }}
                                        >
                                            <div className="text-xs mb-2" style={{ color: getRarityColor(dev.star) }}>{'⭐'.repeat(dev.star)}</div>
                                            <img src={dev.avatarUrl} className="w-20 h-20 object-cover border border-[#333] mb-2" />
                                            <div className="text-sm font-bold text-center uppercase" style={{ color: getRarityColor(dev.star) }}>{dev.name}</div>
                                            <div className="text-[10px] text-gray-500">{dev.techStack}</div>
                                        </motion.div>
                                    ))}
                                    {revealedArtifacts?.map((art, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            key={`art-${i}`}
                                            className="border border-[#333] bg-[#111] w-32 shrink-0 p-3 flex flex-col items-center relative"
                                            style={{ borderColor: getRarityColor(art.rarity) }}
                                        >
                                            <div className="text-xs mb-2" style={{ color: getRarityColor(art.rarity) }}>{'⭐'.repeat(art.rarity)}</div>
                                            <div className="text-4xl mb-2">{art.icon}</div>
                                            <div className="text-xs font-bold text-center uppercase" style={{ color: getRarityColor(art.rarity) }}>{art.name}</div>
                                        </motion.div>
                                    ))}
                                </div>
                                <button
                                    onClick={clearRevealed}
                                    className="mt-4 shrink-0 border border-white text-white px-8 py-2 hover:bg-white/20 transition-colors cursor-pointer"
                                >
                                    ACKNOWLEDGE
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key="idle" className="flex flex-col items-center relative">
                                <div className="w-64 h-64 rounded-full border-2 border-[var(--color-neon-green)] bg-green-900/10 flex flex-col items-center justify-center relative shadow-[inset_0_0_50px_rgba(0,255,51,0.2)]">
                                    <div className="absolute inset-2 rounded-full border border-[var(--color-neon-green)]/30 border-dashed animate-[spin_10s_linear_infinite]"></div>
                                    {activeBanner === 'dev' ? <Server className="w-12 h-12 text-[var(--color-neon-green)] mb-2 animate-pulse" /> : <Cpu className="w-12 h-12 text-[var(--color-neon-green)] mb-2 animate-pulse" />}
                                    <div className="text-[var(--color-neon-green)] font-bold text-lg">UPLINK ESTABLISHED</div>
                                    <div className="text-[10px] text-[var(--color-neon-green)]/70">AWAITING {activeBanner === 'dev' ? 'RECRUITMENT' : 'HARDWARE'} INPUT_</div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Action Buttons */}
                {!pulling && !revealedDevs && !revealedArtifacts && (
                    <div className="p-6 flex flex-col sm:flex-row gap-4 border-t border-[var(--color-neon-purple)] relative z-10 bg-[#0a0a0a]">
                        <button
                            onClick={() => handlePull(1)}
                            className="flex-1 border border-[var(--color-neon-green)] text-[var(--color-neon-green)] p-4 flex flex-col items-center justify-center hover:bg-[var(--color-neon-green)] hover:text-black transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,51,0.2)]"
                        >
                            <div className="font-bold">EXECUTE SINGLE PULL</div>
                            <div className="text-[10px] mt-1 opacity-80">[{activeBanner === 'dev' ? '160' : '100'} CPU]</div>
                        </button>
                        <button
                            onClick={() => handlePull(10)}
                            className="flex-1 border border-[var(--color-neon-purple)] text-[var(--color-neon-purple)] p-4 flex flex-col items-center justify-center hover:bg-[var(--color-neon-purple)] hover:text-black transition-all cursor-pointer shadow-[0_0_15px_rgba(176,0,255,0.2)]"
                        >
                            <div className="font-bold">BATCH PULL X10</div>
                            <div className="text-[10px] mt-1 opacity-80">[{activeBanner === 'dev' ? '1600 CPU] - GUARANTEES 4★ DEV' : '1000 CPU] - RANDOM GEAR'}</div>
                        </button>
                    </div>
                )}
            </div>

            {/* RIGHT AREA: HIGH PRIORITY ASSETS */}
            <div className="flex-[1.5] border-2 border-[var(--color-neon-cyan)] bg-[#0a0a0a] flex flex-col">
                <div className="bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)] px-4 py-2 text-sm font-bold flex gap-2 items-center border-b border-[var(--color-neon-cyan)]">
                    <Database className="w-4 h-4" /> HIGH-PRIORITY ASSETS
                </div>

                <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
                    <div className="border border-[var(--color-neon-gold)] p-3 bg-yellow-900/10">
                        <div className="bg-[var(--color-neon-gold)] text-black text-[10px] font-bold px-2 py-0.5 inline-block mb-2">5★ CLASS: 10X ARCHITECT</div>
                        <div className="flex gap-3">
                            <img src="/avatars/architect.jpg" className="w-16 h-16 border border-[var(--color-neon-gold)]" />
                            <div>
                                <div className="text-[var(--color-neon-gold)] font-bold text-sm">ARCHITECT GUARDIAN</div>
                                <div className="text-[10px] text-gray-400 mt-1">Absorbs fatal syntax errors. Core systems remain intact.</div>
                            </div>
                        </div>
                    </div>

                    <div className="border border-[var(--color-neon-purple)] p-3 bg-purple-900/10">
                        <div className="bg-[var(--color-neon-purple)] text-black text-[10px] font-bold px-2 py-0.5 inline-block mb-2">4★ CLASS: ASSASSIN</div>
                        <div className="flex gap-3">
                            <img src="/avatars/qa.jpg" className="w-16 h-16 border border-[var(--color-neon-purple)]" />
                            <div>
                                <div className="text-[var(--color-neon-purple)] font-bold text-sm">QA NINJA</div>
                                <div className="text-[10px] text-gray-400 mt-1">Asynchronous strikes bypass standard firewalls. High crit chance.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
