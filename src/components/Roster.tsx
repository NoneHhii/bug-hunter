import { useGameStore, type OwnedDev, type OwnedArtifact } from '../store/useGameStore';
// import { ARTIFACTS } from '../game/constants/artifacts';
import { AnimatePresence } from 'framer-motion';
// import toast from 'react-hot-toast';
import { DndContext, useDraggable, useDroppable, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';

// --- Subcomponents for DND ---
function DevCard({ dev }: { dev: OwnedDev }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `dev-droppable-${dev.uid}`,
    data: { type: 'dev-slot', devUid: dev.uid }
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative border-2 w-full h-[220px] p-2 flex flex-col items-center transition-all overflow-hidden group shrink-0
        ${isOver ? 'border-[var(--color-neon-cyan)] shadow-[inset_0_0_20px_rgba(0,245,245,0.2)] bg-cyan-950/30' : 'border-[var(--color-rpg-border)] bg-[var(--color-rpg-panel)] hover:border-[var(--color-neon-purple)]'}
      `}
    >
      <div className="absolute top-1 left-1 text-[10px] font-bold text-[var(--color-neon-gold)] z-10 bg-black/50 px-1">{'⭐'.repeat(dev.star)}</div>

      {/* Activity Status */}
      <div className={`absolute top-1 right-1 text-[8px] font-bold px-1 z-10 ${dev.currentHp <= 0 ? 'text-red-500 border border-red-500' :
        dev.activity !== 'IDLE' ? 'text-yellow-500 border border-yellow-500' : 'text-green-500 border border-green-500'
        }`}>
        {dev.currentHp <= 0 ? 'DEAD' : dev.activity}
      </div>

      <img src={dev.avatarUrl} alt={dev.role} className={`w-14 h-14 object-cover border border-[#333] pointer-events-none mt-4 ${dev.currentHp <= 0 ? 'grayscale' : ''}`} />
      <div className="font-bold text-center text-[10px] text-[var(--color-neon-cyan)] mt-2 uppercase w-full truncate">{dev.name}</div>
      <div className="text-[9px] text-gray-400 font-mono uppercase text-center">{dev.techStack} | {dev.role}</div>

      {/* HP Bar */}
      <div className="w-full bg-[#0a0a0a] border-t border-[#333] text-[9px] p-1 mt-1 font-mono text-gray-400">
        <div className="flex justify-between"><span>HP:</span><span className={`${dev.currentHp <= 0 ? 'text-red-500' : 'text-[var(--color-neon-green)]'}`}>{Math.floor(dev.currentHp)}/{dev.baseStats.hp}</span></div>
      </div>

      <div className="flex gap-2 mt-2 z-10 w-full justify-center">
        <ArtifactSlot devUid={dev.uid} slotIndex={0} artifactUid={dev.equippedArtifacts?.[0]} />
        <ArtifactSlot devUid={dev.uid} slotIndex={1} artifactUid={dev.equippedArtifacts?.[1]} />
      </div>

      {/* Skill Description Hover */}
      <div className="absolute inset-0 bg-black/90 p-2 text-[9px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col justify-center z-20">
        <span className="text-[var(--color-neon-gold)] font-bold mb-1">{dev.skill.name}</span>
        <p>{dev.skill.description}</p>
      </div>
    </div>
  );
}

function DraggableArtifact({ artifact, isEquipped, isOverlay = false }: { artifact: OwnedArtifact, isEquipped?: boolean, isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `art-${artifact.uid}`,
    data: { type: 'artifact', artifact },
    disabled: isEquipped
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isOverlay ? 1 : 0.4,
  } : undefined;

  const color = artifact.rarity >= 4 ? 'var(--color-neon-purple)' : 'var(--color-neon-cyan)';

  if (isOverlay) {
    return (
      <div className="flex items-center justify-center w-12 h-12 bg-[#111] border-2 shadow-[0_0_15px_rgba(0,255,255,0.5)] z-[9999] text-2xl" style={{ borderColor: color, boxShadow: `0 0 15px ${color}` }}>
        {artifact.icon}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`border border-[#333] p-2 flex gap-2 items-center relative group shrink-0
        ${isEquipped ? 'opacity-30 grayscale cursor-not-allowed bg-black' : 'bg-[#190913] cursor-grab active:cursor-grabbing hover:border-[var(--color-neon-purple)]'}
      `}
    >
      <div className={`w-8 h-8 border flex items-center justify-center text-xl shrink-0`} style={{ borderColor: color }}>
        {artifact.icon}
      </div>
      <div className="text-[10px] flex-1 truncate">
        <div className="font-bold truncate" style={{ color }}>{artifact.name}</div>
        <div className="text-gray-400 truncate">{artifact.synergy.target}</div>
      </div>
    </div>
  );
}

function ArtifactSlot({ devUid, artifactUid }: { devUid: string, artifactUid?: string, slotIndex: number }) {
  const { artifactInventory, unequipArtifact } = useGameStore();
  const art = artifactUid ? artifactInventory.find(a => a.uid === artifactUid) : null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (art) unequipArtifact(devUid, artifactUid!);
      }}
      className={`w-8 h-8 border-2 flex items-center justify-center text-xs cursor-pointer relative group pointer-events-auto
                ${art ? 'border-[#333] bg-black hover:border-red-500 hover:bg-red-900/50' : 'border-[#333] bg-black/50 border-dashed'}
            `}
      title={art ? `Click to unequip ${art.name}` : "Drag artifact to character to equip"}
    >
      {art ? (
        <>
          {art.icon}
          <div className="absolute inset-0 bg-red-500/80 items-center justify-center hidden group-hover:flex text-white font-bold text-[8px]">UNEQUIP</div>
        </>
      ) : '+'}
    </div>
  );
}

export default function Roster() {
  const { inventory, artifactInventory, equipArtifact } = useGameStore();
  const [activeDragArt, setActiveDragArt] = useState<OwnedArtifact | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const type = event.active.data.current?.type;
    if (type === 'artifact') {
      setActiveDragArt(event.active.data.current?.artifact as OwnedArtifact);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragArt(null);

    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'artifact' && overType === 'dev-slot') {
      const artifact = active.data.current?.artifact as OwnedArtifact;
      const targetDevUid = over.data.current?.devUid as string;

      if (artifact && targetDevUid) {
        equipArtifact(targetDevUid, artifact.uid);
      }
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="w-full h-full flex gap-4 p-2 font-mono flex-col lg:flex-row">

        {/* ROSTER DB */}
        <div className="flex-[2] border border-[var(--color-rpg-border)] bg-[var(--color-rpg-panel)] p-4 flex flex-col relative h-full min-h-[300px]">
          <div className="absolute top-0 left-0 bg-[var(--color-neon-purple)]/10 text-[var(--color-neon-purple)] px-2 py-1 text-xs font-bold border-b border-[var(--color-neon-purple)]">
            ROSTER_DB [STAFF: {inventory.length}]
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8 overflow-y-auto custom-scrollbar p-1 pb-4 relative z-0 h-full content-start">
            {inventory.length === 0 && <div className="text-gray-500 text-sm absolute top-4 left-4">NO DATA FOUND.</div>}
            <AnimatePresence>
              {inventory.map(dev => (
                <DevCard key={dev.uid} dev={dev} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* SYNERGIES & ARTIFACTS */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex-[1] min-h-[100px] border border-[var(--color-rpg-border)] bg-[var(--color-rpg-panel)] p-4 relative flex flex-col overflow-hidden">
            <div className="absolute top-0 left-0 text-[var(--color-neon-purple)] px-2 py-1 text-xs font-bold flex items-center gap-1 border-b border-[var(--color-rpg-border)] w-full bg-[var(--color-rpg-panel)] z-10">
              <span className="text-[var(--color-neon-purple)] animate-pulse">❖</span> ACTIVE_SYNERGIES
            </div>
            <div className="mt-6 pt-2 flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1">
              <div className="border-l-2 border-[var(--color-neon-purple)] bg-[#281620] p-2 text-[10px]">
                <div className="text-[var(--color-neon-purple)] font-bold mb-1">FULLSTACK_RESONANCE</div>
                <div className="text-gray-400">Frontend + Backend detected. <br /><span className="text-[var(--color-neon-green)]">+15% Compilation Speed.</span></div>
              </div>
            </div>
          </div>

          <div className="flex-[2] min-h-[150px] border border-[var(--color-rpg-border)] bg-[var(--color-rpg-panel)] p-4 relative flex flex-col overflow-hidden">
            <div className="absolute top-0 left-0 text-[var(--color-neon-cyan)] px-2 py-1 text-xs font-bold flex items-center gap-1 border-b border-[var(--color-rpg-border)] w-full bg-[var(--color-rpg-panel)] z-10">
              ⬡ AVAILABLE_ARTIFACTS
            </div>
            <div className="mt-6 pt-2 flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1">
              {artifactInventory.length === 0 && <div className="text-gray-500 text-[10px] mt-2">NO ARTIFACTS IN INVENTORY.</div>}
              <AnimatePresence>
                {artifactInventory.map(art => {
                  const isEquipped = inventory.some(dev => dev.equippedArtifacts?.includes(art.uid));
                  return <DraggableArtifact key={art.uid} artifact={art} isEquipped={isEquipped} />;
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {activeDragArt ? <DraggableArtifact artifact={activeDragArt} isOverlay={true} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
