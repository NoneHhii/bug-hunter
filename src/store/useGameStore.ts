import { create } from 'zustand';
import { CLASSES, type DevClass } from '../game/constants/classes';
import { ARTIFACTS, type ArtifactDef } from '../game/constants/artifacts';

export interface OwnedDev extends DevClass {
  uid: string;
  level: number;
  star: number;
  equippedArtifacts: string[];
  currentHp: number;
  activity: 'IDLE' | 'CODING' | 'CAMPAIGN' | 'BOSS';
}

export interface ProjectState {
  id: string;
  name: string;
  complexity: number;
  maxProgress: number;
  currentProgress: number;
  deadlineTurns: number;
  reward: number;
  isActive: boolean;
  status: 'IDLE' | 'CODING' | 'BUG_ENCOUNTERED' | 'FINISHED';
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
  
  // Project Actions
  generateProjects: () => void;
  acceptProject: (id: string) => void;
  advanceProject: (progressAmount: number) => void;
  encounterBug: () => void;
  resolveBug: (success: boolean) => void;
  ignoreBug: () => void;
  completeProject: () => void;
  addVouchers: (amount: number) => void;
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
      { id: '1', name: 'Landing Page v2', complexity: 2, maxProgress: 500, currentProgress: 0, deadlineTurns: 50, reward: 1000, isActive: false, status: 'IDLE' },
      { id: '2', name: 'Auth Microservice', complexity: 5, maxProgress: 1500, currentProgress: 0, deadlineTurns: 100, reward: 4000, isActive: false, status: 'IDLE' },
      { id: '3', name: 'Data Pipeline', complexity: 8, maxProgress: 3000, currentProgress: 0, deadlineTurns: 150, reward: 10000, isActive: false, status: 'IDLE' }
  ],
  currentProject: null,

  rollGacha: (times) => {
    const state = get();
    const cost = times * 160;
    if (state.coffeeBeans < cost) return null;
    
    const newDevs: OwnedDev[] = [];
    for (let i = 0; i < times; i++) {
      // Logic gacha đơn giản
      let selectedClassKey = 'intern';
      const roll = Math.random();
      
      if (times === 10 && i === 9) {
          // Guarantee 4* in 10 pull
          selectedClassKey = roll < 0.2 ? 'architect' : 'senior';
      } else {
          if (roll < 0.05) selectedClassKey = 'architect'; // 5% 5 star
          else if (roll < 0.2) selectedClassKey = 'senior'; // 15% 4 star
          else if (roll < 0.6) selectedClassKey = 'junior'; // 40% 3 star
          else selectedClassKey = 'intern'; // 40% 2 star
      }
      
      const baseClass = CLASSES[selectedClassKey];
      
      newDevs.push({
        ...baseClass,
        uid: crypto.randomUUID(),
        level: 1,
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
    const cost = times * 100; // Rẻ hơn Dev Gacha
    if (state.coffeeBeans < cost) return null;
    
    const newArtifacts: OwnedArtifact[] = [];
    
    for (let i = 0; i < times; i++) {
        const roll = Math.random();
        let selectedKey = 'coffee_thermos';
        
        if (roll < 0.05) selectedKey = 'stackoverflow_pro'; // 5% 5 star
        else if (roll < 0.2) selectedKey = 'noise_cancelling_hp'; // 15% 4 star
        else if (roll < 0.5) selectedKey = 'dual_monitor'; // 30% 3 star
        else if (roll < 0.8) selectedKey = 'mechanical_keyboard'; // 30% 3 star
        else selectedKey = 'coffee_thermos'; // 20% 2 star
        
        const baseArt = ARTIFACTS[selectedKey];
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
      
      // Update team array if dev is in team
      const newTeam = state.team.map(d => d?.uid === devUid ? newDev : d);

      return { inventory: newInventory, team: newTeam };
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

  generateProjects: () => set((state) => {
      return {
          availableProjects: [
              { id: crypto.randomUUID(), name: 'UI Hotfix', complexity: 1 + state.techDebt, maxProgress: 300, currentProgress: 0, deadlineTurns: 30, reward: 800, isActive: false, status: 'IDLE' },
              { id: crypto.randomUUID(), name: 'Payment Gateway', complexity: 6 + state.techDebt, maxProgress: 2000, currentProgress: 0, deadlineTurns: 120, reward: 5000, isActive: false, status: 'IDLE' },
              { id: crypto.randomUUID(), name: 'AI Recommendation', complexity: 10 + state.techDebt, maxProgress: 5000, currentProgress: 0, deadlineTurns: 200, reward: 15000, isActive: false, status: 'IDLE' }
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
      if (success) {
          // Thắng: tiếp tục code
          return { currentProject: { ...state.currentProject, status: 'CODING' } };
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

  addVouchers: (amount) => set((state) => ({
      vouchers: state.vouchers + amount
  })),
}));
