import { useState } from 'react';
import { ShieldAlert, Crosshair, Trophy, Users } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

interface BattleHubProps {
    onSelectMode: (mode: 'campaign' | 'arena' | 'boss') => void;
}

export default function BattleHub({ onSelectMode }: BattleHubProps) {
    const { currentProject, inventory, assignToTeam } = useGameStore();
    const hasActiveBug = currentProject?.status === 'BUG_ENCOUNTERED';

    const [isSelectingFor, setIsSelectingFor] = useState<'campaign' | 'boss' | null>(null);
    const [selectedDevs, setSelectedDevs] = useState<string[]>([]);

    const handleDeploy = () => {
        if (!isSelectingFor) return;
        if (selectedDevs.length === 0) {
            alert("Bạn phải chọn ít nhất 1 Dev để tham chiến!");
            return;
        }

        assignToTeam(isSelectingFor, selectedDevs);
        onSelectMode(isSelectingFor);
        setIsSelectingFor(null);
        setSelectedDevs([]);
    };

    return (
        <div className="w-full h-full flex flex-col p-4 md:p-8 font-mono bg-[#050505] relative">
            
            {/* Team Selection Modal */}
            {isSelectingFor && (
                <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
                    <div className="w-full max-w-4xl border-2 border-[var(--color-neon-purple)] bg-[#0a0a0a] flex flex-col h-[80%] shadow-[0_0_30px_var(--color-neon-purple)]">
                        <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#111]">
                            <h2 className="text-[var(--color-neon-purple)] font-bold uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-5 h-5" /> DEPLOY SQUAD FOR {isSelectingFor.toUpperCase()}
                            </h2>
                            <span className="text-gray-400 text-xs">SELECTED: {selectedDevs.length}/5</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 content-start custom-scrollbar">
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
                                            ${isSelected ? 'border-[var(--color-neon-purple)] bg-purple-950/30' : 
                                              isAvailable ? 'border-[#333] hover:border-[var(--color-neon-cyan)]' : 
                                              'border-red-900/30 opacity-40 grayscale cursor-not-allowed'}
                                        `}
                                    >
                                        {isSelected && <div className="absolute top-1 right-1 text-[var(--color-neon-purple)] text-xs font-bold">✓</div>}
                                        {!isAvailable && !isSelected && <div className="absolute top-1 right-1 text-red-500 text-[8px] font-bold">{dev.currentHp <= 0 ? 'DEAD' : 'BUSY'}</div>}
                                        
                                        <div className="absolute top-1 left-1 text-[10px] text-[var(--color-neon-gold)]">{'⭐'.repeat(dev.star)}</div>
                                        <img src={dev.avatarUrl} className="w-12 h-12 mt-4 object-cover border border-[#333]" />
                                        <div className="mt-2 text-[10px] font-bold text-[var(--color-neon-cyan)] uppercase truncate w-full text-center">{dev.name}</div>
                                        <div className="text-[9px] text-gray-500">{dev.role}</div>
                                        <div className="mt-auto w-full bg-[#111] p-1 text-[9px] flex justify-between border-t border-[#333]">
                                            <span>ATK: {dev.baseStats.atk}</span>
                                            <span className="text-[var(--color-neon-green)]">HP: {Math.floor(dev.currentHp)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="p-4 border-t border-[#333] flex justify-end gap-4 bg-[#111]">
                            <button onClick={() => { setIsSelectingFor(null); setSelectedDevs([]); }} className="px-6 py-2 border border-gray-600 text-gray-400 hover:bg-gray-800 text-xs font-bold transition-colors">
                                CANCEL
                            </button>
                            <button onClick={handleDeploy} className="px-6 py-2 border border-[var(--color-neon-purple)] bg-[var(--color-neon-purple)]/20 text-[var(--color-neon-purple)] hover:bg-[var(--color-neon-purple)] hover:text-white text-xs font-bold transition-colors">
                                INITIATE ENGAGEMENT
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <div className="mb-8 border-b-2 border-[#333] pb-4">
                <h1 className="text-[var(--color-neon-purple)] font-bold text-3xl tracking-widest text-glow-purple uppercase">
                   BATTLE_HUB.EXE
                </h1>
                <p className="text-gray-400 text-sm tracking-widest mt-2">
                   Select engagement protocol.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 max-h-[500px]">
                {/* Campaign Mode */}
                <button 
                    onClick={() => setIsSelectingFor('campaign')}
                    className="border-2 border-[var(--color-neon-cyan)] bg-[#0a0a0a] hover:bg-cyan-950/30 transition-all flex flex-col items-center justify-center p-6 group relative overflow-hidden cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-neon-cyan)]/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <Crosshair className="w-16 h-16 text-[var(--color-neon-cyan)] mb-4 group-hover:scale-110 transition-transform" />
                    <h2 className="text-xl font-bold text-[var(--color-neon-cyan)] mb-2">CAMPAIGN</h2>
                    <p className="text-xs text-gray-400 text-center relative z-10">Tower Defense mode. Clear waves of minor bugs to secure network sectors and farm CPU.</p>
                </button>

                {/* Boss Mode */}
                <div className={`border-2 ${hasActiveBug ? 'border-[var(--color-neon-red)] bg-red-950/20 cursor-pointer hover:bg-red-900/40' : 'border-[#333] bg-[#0a0a0a] opacity-50 cursor-not-allowed'} transition-all flex flex-col items-center justify-center p-6 group relative overflow-hidden`}
                    onClick={() => hasActiveBug && setIsSelectingFor('boss')}
                >
                    {hasActiveBug && <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-neon-red)]/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
                    <ShieldAlert className={`w-16 h-16 ${hasActiveBug ? 'text-[var(--color-neon-red)] animate-pulse' : 'text-gray-600'} mb-4`} />
                    <h2 className={`text-xl font-bold mb-2 ${hasActiveBug ? 'text-[var(--color-neon-red)]' : 'text-gray-600'}`}>PROJECT DEBUGGING</h2>
                    <p className="text-xs text-gray-400 text-center relative z-10">Resolve fatal exceptions in active deployment. Requires a bugged project.</p>
                    {!hasActiveBug && <div className="mt-4 px-2 py-1 bg-black text-xs text-gray-500 border border-[#333]">NO ACTIVE BUG DETECTED</div>}
                    {hasActiveBug && <div className="mt-4 px-2 py-1 bg-red-900/50 text-[10px] text-red-200 border border-red-500 animate-pulse relative z-10">URGENT ACTION REQUIRED</div>}
                </div>

                {/* Arena Mode */}
                <button 
                    disabled
                    className="border-2 border-[#333] bg-[#0a0a0a] opacity-60 flex flex-col items-center justify-center p-6 relative cursor-not-allowed"
                >
                    <Trophy className="w-16 h-16 text-gray-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-500 mb-2">ARENA (PVP)</h2>
                    <p className="text-xs text-gray-500 text-center">Hack other companies' servers. Clash with rival Developer teams.</p>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] border-2 border-[var(--color-neon-gold)] text-[var(--color-neon-gold)] font-bold px-4 py-1 text-xl bg-black/80 whitespace-nowrap">
                        COMING SOON
                    </div>
                </button>
            </div>
        </div>
    );
}
