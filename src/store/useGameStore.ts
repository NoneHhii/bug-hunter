import { create } from 'zustand';
import { CLASSES, type DevClass } from '../game/constants/classes';
import { ARTIFACTS, type ArtifactDef } from '../game/constants/artifacts';

export interface OwnedDev extends DevClass {
  uid: string;
  level: number;
  exp: number; // Tích lũy điểm EXP
  star: number;
  equippedArtifacts: string[];
  currentHp: number;
  activity: 'IDLE' | 'CODING' | 'CAMPAIGN' | 'BOSS';
}

export interface ProjectState {
  id: string;
  name: string;
  location: string;
  x: number;
  y: number;
  complexity: number;
  maxProgress: number;
  currentProgress: number;
  deadlineTurns: number;
  reward: number;
  isActive: boolean;
  status: 'IDLE' | 'CODING' | 'BUG_ENCOUNTERED' | 'FINISHED' | 'FAILED';
}

export interface OwnedArtifact extends ArtifactDef {
  uid: string;
}

interface GameState {
  sanity: number;
  maxSanity: number;
  coffeeBeans: number; // Used for Gacha (CPU)
  companyFunds: number; // Money from Projects
  techDebt: number; // Tech debt points
  vouchers: number;
  pullRequests: number;
  inventory: OwnedDev[];
  artifactInventory: OwnedArtifact[];
  codingTeam: string[]; // UID của devs
  campaignTeam: string[];
  bossTeam: string[];
  availableProjects: ProjectState[];
  currentProject: ProjectState | null;
  
  // Actions
  rollGacha: (times: 1 | 10) => OwnedDev[] | null;
  rollArtifactGacha: (times: 1 | 10) => OwnedArtifact[] | null;
  equipArtifact: (devUid: string, artifactUid: string) => void;
  unequipArtifact: (devUid: string, artifactUid: string) => void;
  
  // Team Management
  assignToTeam: (teamType: 'coding' | 'campaign' | 'boss', devUids: string[]) => void;
  setDevActivity: (devUid: string, activity: 'IDLE' | 'CODING' | 'CAMPAIGN' | 'BOSS') => void;
  damageDev: (devUid: string, amount: number) => void;
  healDev: (devUid: string, amount: number) => void;
  mergeDevs: (targetUid: string, sacrificeUid: string) => void;
  
  // Project Actions
  generateProjects: () => void;
  acceptProject: (id: string) => void;
  advanceProject: (progressAmount: number) => void;
  encounterBug: () => void;
  resolveBug: (success: boolean) => void;
  ignoreBug: () => void;
  completeProject: () => void;
  failProject: () => void;
  dismissProject: () => void;
  addVouchers: (amount: number) => void;
  consumeCoffee: (amount: number) => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
  sanity: 120,
  maxSanity: 120,
  coffeeBeans: 10000, 
  companyFunds: 5000,
  techDebt: 0,
  vouchers: 10,
  pullRequests: 0,
  inventory: [],
  artifactInventory: [],
  codingTeam: [],
  campaignTeam: [],
  bossTeam: [],
  availableProjects: [
      { id: '1', name: 'Landing Page v2', location: 'US_EAST_1', x: 22, y: 35, complexity: 2, maxProgress: 500, currentProgress: 0, deadlineTurns: 50, reward: 1000, isActive: false, status: 'IDLE' },
      { id: '2', name: 'Auth Microservice', location: 'EU_CENT', x: 48, y: 32, complexity: 5, maxProgress: 1500, currentProgress: 0, deadlineTurns: 100, reward: 4000, isActive: false, status: 'IDLE' },
      { id: '3', name: 'Data Pipeline', location: 'ASIA_PAC', x: 80, y: 45, complexity: 8, maxProgress: 3000, currentProgress: 0, deadlineTurns: 150, reward: 10000, isActive: false, status: 'IDLE' }
  ],
  currentProject: null,

  rollGacha: (times) => {
    const state = get();
    const cost = times * 160;
    if (state.coffeeBeans < cost) return null;
    
    const newDevs: OwnedDev[] = [];
    for (let i = 0; i < times; i++) {
      let targetStar = 2;
      const roll = Math.random();
      
      if (times === 10 && i === 9) {
          targetStar = roll < 0.2 ? 5 : 4;
      } else {
          if (roll < 0.05) targetStar = 5;
          else if (roll < 0.2) targetStar = 4;
          else if (roll < 0.6) targetStar = 3;
          else targetStar = 2;
      }
      
      const availableClasses = Object.values(CLASSES).filter(c => c.defaultStar === targetStar);
      const baseClass = availableClasses.length > 0 
          ? availableClasses[Math.floor(Math.random() * availableClasses.length)]
          : Object.values(CLASSES)[0];
      
      newDevs.push({
        ...baseClass,
        uid: crypto.randomUUID(),
        level: 0,
        exp: 0,
        star: baseClass.defaultStar,
        equippedArtifacts: [],
        currentHp: baseClass.baseStats.hp,
        activity: 'IDLE'
      });
    }

    set({
      coffeeBeans: state.coffeeBeans - cost,
      inventory: [...state.inventory, ...newDevs]
    });
    
    return newDevs;
  },

  rollArtifactGacha: (times) => {
    const state = get();
    const cost = times * 100;
    if (state.coffeeBeans < cost) return null;
    
    const newArtifacts: OwnedArtifact[] = [];
    
    for (let i = 0; i < times; i++) {
        let targetStar = 2;
        const roll = Math.random();
        
        if (roll < 0.05) targetStar = 5;
        else if (roll < 0.2) targetStar = 4;
        else if (roll < 0.5) targetStar = 3;
        else targetStar = 2;
        
        const availableArts = Object.values(ARTIFACTS).filter(a => a.rarity === targetStar);
        const baseArt = availableArts.length > 0
            ? availableArts[Math.floor(Math.random() * availableArts.length)]
            : Object.values(ARTIFACTS)[0];
            
        newArtifacts.push({
            ...baseArt,
            uid: crypto.randomUUID(),
        });
    }

    set({
      coffeeBeans: state.coffeeBeans - cost,
      artifactInventory: [...(state.artifactInventory || []), ...newArtifacts]
    });
    
    return newArtifacts;
  },

  equipArtifact: (devUid, artifactUid) => set((state) => {
      const devIndex = state.inventory.findIndex(d => d.uid === devUid);
      if (devIndex === -1) return state;
      
      const dev = state.inventory[devIndex];
      if (dev.equippedArtifacts && dev.equippedArtifacts.length >= 2) return state; // Max 2
      
      // Khởi tạo mảng nếu chưa có
      const currentEquipped = dev.equippedArtifacts || [];
      if (currentEquipped.includes(artifactUid)) return state; // Đã gắn rồi
      
      const newDev = { ...dev, equippedArtifacts: [...currentEquipped, artifactUid] };
      const newInventory = [...state.inventory];
      newInventory[devIndex] = newDev;
      
      return { inventory: newInventory };
  }),

  unequipArtifact: (devUid, artifactUid) => set((state) => {
      const devIndex = state.inventory.findIndex(d => d.uid === devUid);
      if (devIndex === -1) return state;
      
      const dev = state.inventory[devIndex];
      const newDev = { ...dev, equippedArtifacts: (dev.equippedArtifacts || []).filter(id => id !== artifactUid) };
      const newInventory = [...state.inventory];
      newInventory[devIndex] = newDev;
      
      return { inventory: newInventory };
  }),

  mergeDevs: (targetUid, sacrificeUid) => set((state) => {
    const targetIdx = state.inventory.findIndex(d => d.uid === targetUid);
    const sacrificeIdx = state.inventory.findIndex(d => d.uid === sacrificeUid);
    
    if (targetIdx === -1 || sacrificeIdx === -1 || targetUid === sacrificeUid) return state;
    
    const target = state.inventory[targetIdx];
    const sacrifice = state.inventory[sacrificeIdx];
    
    // Only allow merging identical classes
    if (target.id !== sacrifice.id) return state;
    if (sacrifice.activity !== 'IDLE') return state; // Cannot sacrifice busy devs
    
    let maxLevel = 255;
    if (target.star <= 2) maxLevel = 127; // int8
    else if (target.star >= 5) maxLevel = 65535; // uint16
    
    // Required EXP is Math.pow(2, level + 6), max capped at 2^30
    const getRequiredExp = (lvl: number) => Math.pow(2, Math.min(lvl + 6, 30));
    
    let currentLvl = target.level;
    let currentExp = target.exp;
    
    // Identical dev merge gives exactly enough EXP for 1 full level up at current level
    currentExp += getRequiredExp(currentLvl);
    
    let justHitLevel1 = false;
    
    while (currentLvl < maxLevel && currentExp >= getRequiredExp(currentLvl)) {
      currentExp -= getRequiredExp(currentLvl);
      currentLvl++;
      if (currentLvl === 1 && target.level === 0) justHitLevel1 = true;
    }
    
    // 5% stat boost per level
    const levelDiff = currentLvl - target.level;
    const statMultiplier = 1 + (0.05 * levelDiff);
    
    const newTarget = {
      ...target,
      level: currentLvl,
      exp: currentExp,
      baseStats: {
        hp: Math.floor(target.baseStats.hp * statMultiplier),
        atk: Math.floor(target.baseStats.atk * statMultiplier),
        def: Math.floor(target.baseStats.def * statMultiplier),
        spd: Math.floor(target.baseStats.spd * statMultiplier)
      },
      currentHp: Math.floor(target.baseStats.hp * statMultiplier) // Heal to full
    };
    
    if (justHitLevel1) {
        // Trigger easter egg event via window dispatch or toast
        // Handled by UI component when noticing level change
        window.dispatchEvent(new CustomEvent('EASTER_EGG_LVL1', { detail: { name: newTarget.name } }));
    }
    
    const newInventory = [...state.inventory];
    newInventory[targetIdx] = newTarget;
    newInventory.splice(sacrificeIdx, 1);
    
    return { inventory: newInventory };
  }),

  assignToTeam: (teamType, devUids) => set((state) => {
      // Đầu tiên, set activity của các dev cũ trong team này về IDLE
      const oldUids = state[`${teamType}Team` as keyof GameState] as string[];
      let newInventory = [...state.inventory];
      
      oldUids.forEach(uid => {
          const idx = newInventory.findIndex(d => d.uid === uid);
          if (idx !== -1) {
              newInventory[idx] = { ...newInventory[idx], activity: 'IDLE' };
          }
      });

      // Sau đó set activity của các dev mới
      const activityMap: Record<string, OwnedDev['activity']> = {
          'coding': 'CODING',
          'campaign': 'CAMPAIGN',
          'boss': 'BOSS'
      };
      
      devUids.forEach(uid => {
          const idx = newInventory.findIndex(d => d.uid === uid);
          if (idx !== -1) {
              newInventory[idx] = { ...newInventory[idx], activity: activityMap[teamType] };
          }
      });

      return {
          inventory: newInventory,
          [`${teamType}Team`]: devUids
      };
  }),

  setDevActivity: (devUid, activity) => set((state) => {
      const idx = state.inventory.findIndex(d => d.uid === devUid);
      if (idx === -1) return state;
      const newInventory = [...state.inventory];
      newInventory[idx] = { ...newInventory[idx], activity };
      return { inventory: newInventory };
  }),

  damageDev: (devUid, amount) => set((state) => {
      const idx = state.inventory.findIndex(d => d.uid === devUid);
      if (idx === -1) return state;
      const dev = state.inventory[idx];
      const newHp = Math.max(0, dev.currentHp - amount);
      const newInventory = [...state.inventory];
      newInventory[idx] = { ...dev, currentHp: newHp };
      return { inventory: newInventory };
  }),

  healDev: (devUid, amount) => set((state) => {
      const idx = state.inventory.findIndex(d => d.uid === devUid);
      if (idx !== -1) {
          const newInv = [...state.inventory];
          newInv[idx] = { ...newInv[idx], currentHp: Math.min(newInv[idx].baseStats.hp, newInv[idx].currentHp + amount) };
          return { inventory: newInv };
      }
      return state;
  }),

  generateProjects: () => set((state) => {
      const locations = [
          { location: 'US_WEST_2', x: 15, y: 38 },
          { location: 'US_EAST_1', x: 25, y: 35 },
          { location: 'SA_EAST_1', x: 30, y: 70 },
          { location: 'EU_CENT_1', x: 50, y: 30 },
          { location: 'AF_SOUTH_1', x: 52, y: 65 },
          { location: 'AP_SOUTHEAST_1', x: 75, y: 60 },
          { location: 'AP_NORTHEAST_1', x: 85, y: 35 },
      ];
      // shuffle locations
      const shuffled = [...locations].sort(() => 0.5 - Math.random());
      
      return {
          availableProjects: [
              { id: crypto.randomUUID(), name: 'UI Hotfix', ...shuffled[0], complexity: 1 + state.techDebt, maxProgress: 300, currentProgress: 0, deadlineTurns: 30, reward: 800, isActive: false, status: 'IDLE' },
              { id: crypto.randomUUID(), name: 'Payment Gateway', ...shuffled[1], complexity: 6 + state.techDebt, maxProgress: 2000, currentProgress: 0, deadlineTurns: 120, reward: 5000, isActive: false, status: 'IDLE' },
              { id: crypto.randomUUID(), name: 'AI Recommendation', ...shuffled[2], complexity: 10 + state.techDebt, maxProgress: 5000, currentProgress: 0, deadlineTurns: 200, reward: 15000, isActive: false, status: 'IDLE' }
          ]
      };
  }),

  acceptProject: (id) => set((state) => {
      const p = state.availableProjects.find(p => p.id === id);
      if (!p) return state;
      return { 
          currentProject: { ...p, isActive: true, status: 'CODING' },
          availableProjects: state.availableProjects.filter(proj => proj.id !== id)
      };
  }),

  advanceProject: (progress) => set((state) => {
      if (!state.currentProject || state.currentProject.status !== 'CODING') return state;
      const newProgress = Math.min(state.currentProject.maxProgress, state.currentProject.currentProgress + progress);
      
      // Random bug encounter
      const bugChance = 0.05 + (state.techDebt * 0.02);
      let status: 'IDLE' | 'CODING' | 'BUG_ENCOUNTERED' | 'FINISHED' = state.currentProject.status;
      if (Math.random() < bugChance) {
          status = 'BUG_ENCOUNTERED';
      } else if (newProgress >= state.currentProject.maxProgress) {
          status = 'FINISHED';
      }

      return { 
          currentProject: { 
              ...state.currentProject, 
              currentProgress: newProgress,
              status
          } 
      };
  }),

  encounterBug: () => set((state) => {
      if (!state.currentProject) return state;
      return { currentProject: { ...state.currentProject, status: 'BUG_ENCOUNTERED' } };
  }),

  resolveBug: (success) => set((state) => {
      if (!state.currentProject) return state;
      if (state.currentProject.status === 'FAILED') return state;
      if (success) {
          // Thắng: tiếp tục code + hồi 30% máu cho các dev trong team
          const newInv = state.inventory.map(dev => {
              if (state.bossTeam.includes(dev.uid) && dev.currentHp > 0) {
                  return { ...dev, currentHp: Math.min(dev.baseStats.hp, dev.currentHp + (dev.baseStats.hp * 0.3)) };
              }
              return dev;
          });
          return { 
              currentProject: { ...state.currentProject, status: 'CODING' },
              inventory: newInv
          };
      } else {
          // Thua: Trừ 15% tiến độ
          const penalty = state.currentProject.maxProgress * 0.15;
          return { 
              currentProject: { 
                  ...state.currentProject, 
                  currentProgress: Math.max(0, state.currentProject.currentProgress - penalty),
                  status: 'CODING' 
              } 
          };
      }
  }),
  
  ignoreBug: () => set((state) => {
      if (!state.currentProject) return state;
      const penalty = state.currentProject.maxProgress * 0.15;
      return {
          techDebt: state.techDebt + 1,
          currentProject: {
              ...state.currentProject,
              currentProgress: Math.max(0, state.currentProject.currentProgress - penalty),
              status: 'CODING'
          }
      };
  }),

  completeProject: () => set((state) => {
      if (!state.currentProject) return state;
      return {
          companyFunds: state.companyFunds + state.currentProject.reward,
          currentProject: null
      };
  }),

  failProject: () => set((state) => {
      const proj = state.currentProject;
      if (!proj) return state;
      
      // Penalty: increase tech debt, reduce funds
      return {
          currentProject: { ...proj, status: 'FAILED' },
          techDebt: state.techDebt + Math.ceil(proj.complexity / 2),
          companyFunds: Math.max(0, state.companyFunds - Math.floor(proj.reward / 2)),
          codingTeam: [],
          inventory: state.inventory.map(d => state.codingTeam.includes(d.uid) ? { ...d, activity: 'IDLE' } : d)
      };
  }),

  dismissProject: () => set({ currentProject: null }),

  addVouchers: (amount) => set((state) => ({
      vouchers: state.vouchers + amount
  })),

  consumeCoffee: (amount) => {
      const state = get();
      if (state.coffeeBeans >= amount) {
          set({ coffeeBeans: state.coffeeBeans - amount });
          return true;
      }
      return false;
  }
}));
