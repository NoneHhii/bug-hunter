import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  Terminal, Users, Settings,
  LayoutDashboard, Server, UserPlus, Database, Activity
} from 'lucide-react';
import { useGameStore } from './store/useGameStore';
import GachaPortal from './components/GachaPortal';
import Roster from './components/Roster';
import BattleEngine from './components/BattleEngine';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import BattleHub from './components/BattleHub';
import CampaignEngine from './components/CampaignEngine';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'recruit' | 'team' | 'inventory' | 'battle'>('dashboard');
  const [battleMode, setBattleMode] = useState<'hub' | 'campaign' | 'arena' | 'boss'>('hub');

  const { resolveBug } = useGameStore();

  const handleBattleEnd = (success: boolean) => {
    resolveBug(success);
    setBattleMode('hub');
    setCurrentScreen('dashboard');
  };

  const enterBattleTab = () => {
    setCurrentScreen('battle');
    if (battleMode !== 'hub' && battleMode !== 'campaign' && battleMode !== 'boss') {
      setBattleMode('hub');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'recruit', label: 'RECRUIT', icon: UserPlus },
    { id: 'team', label: 'ROSTER', icon: Users },
    { id: 'inventory', label: 'INVENTORY', icon: Database },
    { id: 'battle', label: 'BATTLE', icon: Activity },
  ];

  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: { background: '#111', color: '#00ff33', border: '1px solid #00ff33', fontFamily: 'VT323, monospace', fontSize: '18px' },
      }} />

      <div className="flex h-screen bg-[#050505] text-gray-300 font-mono overflow-hidden selection:bg-[var(--color-neon-cyan)] selection:text-black">
        {/* Dot Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        {/* Sidebar */}
        <aside className="w-16 md:w-64 border-r-2 border-rpg-border flex flex-col z-20 bg-[#0a0a0a] shadow-[5px_0_15px_rgba(0,0,0,0.5)] transition-all shrink-0">
          <div className="p-4 md:p-6 border-b-2 border-rpg-border flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-[var(--color-neon-cyan)] bg-cyan-900/30 flex items-center justify-center shrink-0">
                <Terminal className="text-[var(--color-neon-cyan)] w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="hidden md:block">
                <h2 className="text-[var(--color-neon-cyan)] font-bold tracking-widest text-lg">ROOT_USER</h2>
                <p className="text-[10px] text-gray-500 tracking-widest">LVL 99 SYSTEM ADMIN</p>
              </div>
            </div>
            <button className="hidden md:block w-full py-2 border border-[var(--color-neon-purple)] text-[var(--color-neon-purple)] hover:bg-purple-900/30 transition-colors text-xs tracking-widest cursor-pointer">
              EXECUTE PURGE
            </button>
          </div>

          <nav className="flex-1 p-2 md:p-4 flex flex-col gap-2 overflow-x-auto md:overflow-x-visible custom-scrollbar">
            {navItems.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  if (currentScreen === 'battle' && battleMode === 'campaign') {
                    if (!window.confirm("BATTLE IN PROGRESS! Retreating will result in failure. Are you sure?")) {
                      return;
                    }
                  }
                  if (tab.id === 'battle') enterBattleTab();
                  else setCurrentScreen(tab.id as any);
                }}
                className={`w-full text-left px-3 py-2 md:px-4 md:py-3 rounded transition-all duration-300 flex items-center gap-2 md:gap-3 shrink-0 uppercase tracking-widest text-xs md:text-sm font-bold whitespace-nowrap
                   ${currentScreen === tab.id
                    ? 'bg-[var(--color-neon-cyan)] text-black shadow-[0_0_15px_var(--color-neon-cyan)]'
                    : 'hover:bg-[#1a1a1a] hover:text-[var(--color-neon-cyan)] text-gray-500'}
                 `}
              >
                <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-[#333] hidden md:block">
            <div className="text-[10px] text-gray-600 mb-2 font-bold uppercase tracking-widest">System Status</div>
            <div className="flex items-center gap-2 text-[var(--color-neon-green)]">
              <div className="w-2 h-2 bg-[var(--color-neon-green)] rounded-full animate-pulse shadow-[0_0_10px_var(--color-neon-green)]"></div>
              <span className="text-xs">ONLINE</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
          {/* Top Header */}
          <header className="h-12 md:h-14 border-b-2 border-rpg-border flex justify-between items-center px-4 md:px-6 bg-[#0a0a0a]/90 backdrop-blur-sm z-20 shrink-0">
            <h1 className="text-[var(--color-neon-green)] font-bold text-sm md:text-xl tracking-widest text-title truncate">BUG HUNTER: DEV vs CODE</h1>
            <div className="hidden md:flex gap-6 text-sm text-gray-400 shrink-0">
              <span className="flex items-center gap-1"><span className="text-gray-500">CPU:</span> 1024</span>
              <span className="flex items-center gap-1"><span className="text-gray-500">RAM:</span> 85%</span>
              <span className="flex items-center gap-1"><span className="text-gray-500">LOC:</span> 5.2k</span>
              <div className="flex items-center gap-3 text-[var(--color-neon-green)] ml-4 border-l border-rpg-border pl-6">
                <Settings className="w-5 h-5 cursor-pointer hover:animate-spin" />
                <Server className="w-5 h-5 cursor-pointer" />
              </div>
            </div>
          </header>

          {/* Screen Content Wrapper */}
          <div className="flex-1 overflow-hidden relative p-2 md:p-6 flex flex-col custom-scrollbar">
            {/* Use display:none to persist the components when switching tabs */}
            <div className={`w-full h-full ${currentScreen === 'dashboard' ? 'block' : 'hidden'}`}>
              <Dashboard onEnterBattle={() => { setCurrentScreen('battle'); setBattleMode('boss'); }} />
            </div>
            <div className={`w-full h-full ${currentScreen === 'recruit' ? 'block' : 'hidden'}`}>
              <GachaPortal />
            </div>
            <div className={`w-full h-full ${currentScreen === 'team' ? 'block' : 'hidden'}`}>
              <Roster />
            </div>
            <div className={`w-full h-full ${currentScreen === 'inventory' ? 'block' : 'hidden'}`}>
              <Inventory />
            </div>

            {/* Battle routes */}
            <div className={`w-full h-full ${(currentScreen === 'battle' && battleMode === 'hub') ? 'block' : 'hidden'}`}>
              <BattleHub onSelectMode={(mode) => setBattleMode(mode)} />
            </div>
            <div className={`w-full h-full ${(currentScreen === 'battle' && battleMode === 'boss') ? 'block' : 'hidden'}`}>
              <BattleEngine onBattleEnd={handleBattleEnd} />
            </div>
            <div className={`w-full h-full ${(currentScreen === 'battle' && battleMode === 'campaign') ? 'block' : 'hidden'}`}>
              <CampaignEngine onExit={() => setBattleMode('hub')} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
