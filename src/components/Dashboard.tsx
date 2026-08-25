import { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Activity, Bug, TerminalSquare, Globe, Users } from 'lucide-react';

export default function Dashboard({ onEnterBattle }: { onEnterBattle: () => void }) {
    const {
        currentProject, availableProjects, acceptProject, advanceProject,
        codingTeam, inventory, assignToTeam, completeProject, companyFunds, techDebt, ignoreBug, generateProjects
    } = useGameStore();

    const [logs, setLogs] = useState<string[]>([
        "[SYSTEM] Nexus Core initialized.",
        "[SYSTEM] Awaiting project deployment."
    ]);

    const [isSelectingTeam, setIsSelectingTeam] = useState<string | null>(null); // Lưu ID của project đang chọn team
    const [selectedDevs, setSelectedDevs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, msg].slice(-8));
    };

    // Tính toán tốc độ của team code (chỉ tính những người còn sống)
    const activeCoders = inventory.filter(dev => codingTeam.includes(dev.uid) && dev.currentHp > 0);
    const totalSpeed = activeCoders.reduce((sum, dev) => sum + dev.baseStats.spd, 0);

    useEffect(() => {
        let timer: number;
        if (currentProject && currentProject.status === 'CODING') {
            timer = window.setInterval(() => {
                if (totalSpeed > 0) {
                    advanceProject(totalSpeed / 10);
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [currentProject?.status, totalSpeed, advanceProject]);

    useEffect(() => {
        if (currentProject?.status === 'BUG_ENCOUNTERED') {
            addLog("[CRITICAL] Exception caught! Deployment HALTED.");
        } else if (currentProject?.status === 'FINISHED') {
            addLog(`[SUCCESS] Project completed successfully.`);
        }
    }, [currentProject?.status]);

    const handleIgnore = () => {
        ignoreBug();
        addLog("[WARN] Bug ignored. Tech Debt increased.");
    };

    const handleAcceptProject = () => {
        if (!isSelectingTeam) return;
        if (selectedDevs.length === 0) {
            alert("Bạn phải chọn ít nhất 1 Dev!");
            return;
        }
        
        assignToTeam('coding', selectedDevs);
        acceptProject(isSelectingTeam);
        
        const proj = availableProjects.find(p => p.id === isSelectingTeam);
        addLog(`[SYSTEM] Accepted Contract: ${proj?.name}`);
        
        setIsSelectingTeam(null);
        setSelectedDevs([]);
    };

    return (
        <div className="w-full h-full flex flex-col gap-4 font-mono text-[var(--color-on-surface)] relative">

            {/* Team Selection Modal */}
            {isSelectingTeam && (
                <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
                    <div className="w-full max-w-4xl border-2 border-[var(--color-neon-cyan)] bg-[#0a0a0a] flex flex-col h-[80%]">
                        <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#111]">
                            <h2 className="text-[var(--color-neon-cyan)] font-bold uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-5 h-5" /> SELECT CODING SQUAD
                            </h2>
                            <span className="text-gray-400 text-xs">SELECTED: {selectedDevs.length}/5</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 content-start">
                            {inventory.map(dev => {
                                const isAvailable = dev.activity === 'IDLE' && dev.currentHp > 0;
                                const isSelected = selectedDevs.includes(dev.uid);
                                
                                return (
                                    <div 
                                        key={dev.uid}
                                        onClick={() => {
                                            if (!isAvailable && !isSelected) return;
                                            if (isSelected) {
                                                setSelectedDevs(prev => prev.filter(id => id !== dev.uid));
                                            } else if (selectedDevs.length < 5) {
                                                setSelectedDevs(prev => [...prev, dev.uid]);
                                            }
                                        }}
                                        className={`border-2 p-2 relative flex flex-col items-center transition-all cursor-pointer h-[180px]
                                            ${isSelected ? 'border-[var(--color-neon-green)] bg-green-950/30' : 
                                              isAvailable ? 'border-[#333] hover:border-[var(--color-neon-cyan)]' : 
                                              'border-red-900/30 opacity-40 grayscale cursor-not-allowed'}
                                        `}
                                    >
                                        {isSelected && <div className="absolute top-1 right-1 text-[var(--color-neon-green)] text-xs font-bold">✓</div>}
                                        {!isAvailable && !isSelected && <div className="absolute top-1 right-1 text-red-500 text-[8px] font-bold">{dev.currentHp <= 0 ? 'DEAD' : 'BUSY'}</div>}
                                        
                                        <div className="absolute top-1 left-1 text-[10px] text-[var(--color-neon-gold)]">{'⭐'.repeat(dev.star)}</div>
                                        <img src={dev.avatarUrl} className="w-12 h-12 mt-4 object-cover border border-[#333]" />
                                        <div className="mt-2 text-[10px] font-bold text-[var(--color-neon-cyan)] uppercase truncate w-full text-center">{dev.name}</div>
                                        <div className="text-[9px] text-gray-500">{dev.role}</div>
                                        <div className="mt-auto w-full bg-[#111] p-1 text-[9px] flex justify-between border-t border-[#333]">
                                            <span>SPD: {dev.baseStats.spd}</span>
                                            <span className="text-[var(--color-neon-green)]">HP: {Math.floor(dev.currentHp)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="p-4 border-t border-[#333] flex justify-end gap-4 bg-[#111]">
                            <button onClick={() => setIsSelectingTeam(null)} className="px-6 py-2 border border-gray-600 text-gray-400 hover:bg-gray-800 text-xs font-bold transition-colors">
                                CANCEL
                            </button>
                            <button onClick={handleAcceptProject} className="px-6 py-2 border border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)] hover:text-black text-xs font-bold transition-colors">
                                DEPLOY SQUAD
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Stats */}
            <div className="flex gap-4 h-24 shrink-0">
                <div className="flex-[1.5] border border-[var(--color-rpg-border)] bg-[var(--color-rpg-panel)] p-4 flex flex-col justify-between relative">
                    <div className="text-[10px] font-bold tracking-widest text-[var(--color-on-surface-variant)] flex justify-between">
                        <span>SYS.UPTIME</span> <Activity className="w-3 h-3 text-[var(--color-neon-green)]" />
                    </div>
                    <div className="text-3xl font-bold text-[var(--color-neon-green)]">
                        99.99<span className="text-lg">%</span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--color-neon-green)] shadow-[0_0_10px_var(--color-neon-green)]"></div>
                </div>

                <div className="flex-[1.5] border border-[var(--color-rpg-border)] bg-[var(--color-rpg-panel)] p-4 flex flex-col justify-between relative">
                    <div className="text-[10px] font-bold tracking-widest text-[var(--color-on-surface-variant)] flex justify-between">
                        <span>TECH_DEBT</span> <Bug className="w-3 h-3 text-[var(--color-neon-purple)]" />
                    </div>
                    <div className="text-3xl font-bold text-[var(--color-neon-purple)]">
                        {techDebt}
                    </div>
                    <div className="text-[9px] text-[var(--color-neon-red)] mt-1">WARN: THRESHOLD EXCEEDED</div>
                </div>

                <div className="flex-[2] border border-[var(--color-rpg-border)] bg-[var(--color-rpg-panel)] p-4 flex flex-col justify-between relative">
                    <div className="text-[10px] font-bold tracking-widest text-[var(--color-on-surface-variant)] flex justify-between">
                        <span>COMPANY_FUNDS</span> <span className="text-[var(--color-neon-cyan)]">$</span>
                    </div>
                    <div className="text-3xl font-bold text-[var(--color-neon-cyan)]">
                        ${companyFunds.toLocaleString()}
                    </div>
                    <div className="flex gap-2 w-full mt-2">
                        {!currentProject ? (
                            <div className="flex-1 text-gray-500 text-xs text-center border border-[#333] py-1">
                                AWAITING CONTRACT
                            </div>
                        ) : currentProject.status === 'FINISHED' ? (
                            <button
                                onClick={() => {
                                    completeProject();
                                    assignToTeam('coding', []); // Free up the team
                                    if (availableProjects.length === 0) generateProjects();
                                }}
                                className="flex-1 py-1 border border-[var(--color-neon-gold)] text-[var(--color-neon-gold)] hover:bg-[var(--color-neon-gold)] hover:text-black transition-colors font-bold text-xs shadow-[0_0_10px_var(--color-neon-gold)]"
                            >
                                RECLAIM REWARDS
                            </button>
                        ) : currentProject.status === 'BUG_ENCOUNTERED' ? (
                            <>
                                <button
                                    onClick={onEnterBattle}
                                    className="flex-1 py-1 border border-[var(--color-neon-red)] bg-[var(--color-neon-red)]/20 text-[var(--color-neon-red)] hover:bg-[var(--color-neon-red)] hover:text-white transition-colors font-bold text-xs animate-pulse shadow-[0_0_15px_var(--color-neon-red)]"
                                >
                                    ⚠️ FIX BUG
                                </button>
                                <button
                                    onClick={handleIgnore}
                                    className="flex-1 py-1 border border-gray-500 text-gray-400 hover:bg-gray-800 transition-colors font-bold text-xs"
                                >
                                    IGNORE
                                </button>
                            </>
                        ) : (
                            <div className="flex-1 text-[var(--color-neon-green)] text-xs text-center border border-[var(--color-neon-green)] py-1 flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-[var(--color-neon-green)] rounded-full animate-pulse"></div> PROJECT IN PROGRESS...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Map / Progress Area */}
            <div className="flex-1 border border-[var(--color-rpg-border)] bg-[var(--color-rpg-panel)] p-4 relative overflow-hidden flex flex-col">
                <div className="text-[10px] text-gray-500 mb-4 flex justify-between z-20 relative">
                    <span>root@nexus:~# map_scan --global</span>
                    <span>STATUS: SCANNING..._</span>
                </div>

                <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[#0a0a0a] flex items-center justify-center p-8 mt-8">
                    <Globe className="absolute text-[#111] w-full h-full opacity-50" />
                </div>

                <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                    {currentProject ? (
                        <div className="w-full max-w-2xl bg-black/80 border-2 border-[var(--color-neon-cyan)] p-6 shadow-[0_0_30px_rgba(0,245,245,0.1)]">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-[var(--color-neon-cyan)] font-bold uppercase">{currentProject.name}</h2>
                                <span className="text-[10px] text-[var(--color-neon-purple)]">COMPLEXITY: {currentProject.complexity}</span>
                            </div>

                            <div className="w-full h-6 bg-[#111] border border-[#333] relative mb-2">
                                <div
                                    className={`h-full transition-all duration-1000 ${currentProject.status === 'BUG_ENCOUNTERED' ? 'bg-[var(--color-neon-red)] animate-pulse' : 'bg-[var(--color-neon-cyan)]'}`}
                                    style={{ width: `${(currentProject.currentProgress / currentProject.maxProgress) * 100}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>PROGRESS: {Math.floor(currentProject.currentProgress)} / {currentProject.maxProgress}</span>
                                <span>STATUS: {currentProject.status}</span>
                            </div>
                            
                            <div className="mt-4 flex gap-2 justify-center">
                                {activeCoders.map(dev => (
                                    <div key={dev.uid} className="w-8 h-8 border border-[var(--color-neon-cyan)] relative group">
                                        <img src={dev.avatarUrl} className="w-full h-full object-cover" />
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-black" title="Coding..."></div>
                                    </div>
                                ))}
                            </div>

                            {currentProject.status === 'BUG_ENCOUNTERED' && (
                                <div className="mt-4 p-2 bg-red-900/30 border border-[var(--color-neon-red)] text-[var(--color-neon-red)] text-xs text-center animate-pulse font-bold">
                                    &gt;&gt; CRITICAL EXCEPTION DETECTED. IMMEDIATE ATTENTION REQUIRED. &lt;&lt;
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full max-w-4xl bg-black/80 border border-[var(--color-rpg-border)] p-4 flex flex-col gap-4">
                            <div className="text-[var(--color-neon-cyan)] font-bold text-sm border-b border-[#333] pb-2">AVAILABLE CONTRACTS (BOUNTY BOARD)</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {availableProjects.map(proj => (
                                    <div key={proj.id} className="border border-[#333] hover:border-[var(--color-neon-cyan)] p-4 bg-[#111] transition-colors flex flex-col gap-2">
                                        <div className="text-xs font-bold text-white uppercase">{proj.name}</div>
                                        <div className="text-[10px] text-gray-400 flex justify-between">
                                            <span>Complexity:</span>
                                            <span className="text-[var(--color-neon-purple)]">{proj.complexity}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-400 flex justify-between">
                                            <span>Reward:</span>
                                            <span className="text-[var(--color-neon-gold)]">${proj.reward}</span>
                                        </div>
                                        <button
                                            onClick={() => setIsSelectingTeam(proj.id)}
                                            className="mt-2 w-full py-1 text-[10px] border border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)] hover:text-black transition-colors"
                                        >
                                            ACCEPT CONTRACT
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Logs Area */}
            <div className="h-40 shrink-0 border border-[var(--color-rpg-border)] bg-[var(--color-rpg-panel)] p-4 flex flex-col">
                <div className="text-[12px] font-bold text-white flex items-center gap-2 mb-2">
                    <TerminalSquare className="w-4 h-4 text-[var(--color-neon-green)]" /> SYSTEM LOGS
                </div>
                <div className="flex-1 overflow-y-auto text-[10px] text-gray-400 flex flex-col gap-1 font-mono custom-scrollbar">
                    {logs.map((log, idx) => (
                        <div key={idx} className={`flex gap-4 ${log.includes('[CRITICAL]') || log.includes('[WARN]') ? 'text-[var(--color-neon-red)]' : log.includes('[SUCCESS]') ? 'text-[var(--color-neon-gold)]' : ''}`}>
                            <span className="opacity-50">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>
                            <span>{log}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
