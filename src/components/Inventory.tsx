import { useGameStore } from '../store/useGameStore';
import { Database, Cpu } from 'lucide-react';

export default function Inventory() {
  const { artifactInventory } = useGameStore();

  const getRarityColor = (star: number) => {
      if (star === 5) return 'var(--color-neon-gold)';
      if (star === 4) return 'var(--color-neon-purple)';
      return 'var(--color-neon-cyan)';
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 font-mono">
      <div className="bg-[#0a0a0a] border border-[#333] p-4 flex gap-4 items-center shrink-0">
          <Database className="text-[var(--color-neon-cyan)] w-6 h-6" />
          <h2 className="text-[var(--color-neon-cyan)] text-xl font-bold">HARDWARE INVENTORY</h2>
          <span className="text-gray-500 text-sm ml-auto">[{artifactInventory.length} ITEMS]</span>
      </div>

      <div className="flex-1 bg-[#0a0a0a] border border-[#333] p-6 overflow-y-auto custom-scrollbar">
          {artifactInventory.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                  <Cpu className="w-16 h-16 mb-4" />
                  <p className="text-xl font-bold tracking-widest">NO HARDWARE DETECTED</p>
                  <p className="text-sm">Visit the RECRUIT portal to requisition gear.</p>
              </div>
          ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {artifactInventory.map((art, idx) => (
                      <div 
                          key={`${art.uid}-${idx}`}
                          className="border border-[#333] bg-[#111] flex flex-col items-center p-4 relative group hover:border-white transition-colors"
                          style={{ borderBottomWidth: '4px', borderBottomColor: getRarityColor(art.rarity) }}
                      >
                          <div className="text-[10px] absolute top-2 left-2" style={{ color: getRarityColor(art.rarity) }}>{'⭐'.repeat(art.rarity)}</div>
                          <div className="text-4xl my-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{art.icon}</div>
                          <div className="text-xs font-bold text-center text-gray-200 uppercase mb-2 h-8 flex items-center justify-center">{art.name}</div>
                          
                          {/* Hover Details */}
                          <div className="absolute inset-0 bg-black/90 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center z-10 text-[10px]">
                              <div className="font-bold text-[var(--color-neon-cyan)] mb-1">SYNERGY: {art.synergy.target}</div>
                              <div className="text-gray-400 text-center mb-2">{art.synergy.description}</div>
                              <div className="w-full border-t border-[#333] pt-1">
                                  {art.stats.hp && <div>HP: +{art.stats.hp}</div>}
                                  {art.stats.atk && <div>ATK: +{art.stats.atk}</div>}
                                  {art.stats.def && <div>DEF: +{art.stats.def}</div>}
                                  {art.stats.spd && <div>SPD: +{art.stats.spd}</div>}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
}
