export interface ArtifactDef {
  id: string;
  name: string;
  rarity: 2 | 3 | 4 | 5;
  icon: string;
  description: string;
  stats: {
    hp?: number;
    atk?: number;
    def?: number;
    spd?: number;
  };
  synergy: {
    target: string; // Có thể là role (Tanker, DPS...) hoặc techStack (Backend, Frontend...)
    multiplier: number; // Hệ số nhân bonus (vd: 2.0 = X2 chỉ số của đồ)
    description: string;
  };
}

export const ARTIFACTS: Record<string, ArtifactDef> = {
  mechanical_keyboard: {
    id: 'mechanical_keyboard',
    name: 'Tactile Switch Keyboard',
    rarity: 3,
    icon: '⌨️',
    description: 'Bàn phím cơ tiếng gõ lạch cạch giúp tăng tốc độ gõ code.',
    stats: { spd: 30, atk: 10 },
    synergy: {
      target: 'DPS',
      multiplier: 2.0,
      description: '+100% hiệu quả cho Role DPS'
    }
  },
  noise_cancelling_hp: {
    id: 'noise_cancelling_hp',
    name: 'Noise-Cancelling Headphones',
    rarity: 4,
    icon: '🎧',
    description: 'Cách ly khỏi thế giới bên ngoài, giảm stress.',
    stats: { hp: 500, def: 50 },
    synergy: {
      target: 'Tanker',
      multiplier: 1.5,
      description: '+50% hiệu quả cho Role Tanker'
    }
  },
  stackoverflow_pro: {
    id: 'stackoverflow_pro',
    name: 'StackOverflow Premium',
    rarity: 5,
    icon: '🌐',
    description: 'Copy paste code siêu cấp vũ trụ không bao giờ dính bug.',
    stats: { atk: 150, spd: 50 },
    synergy: {
      target: '10x Architect',
      multiplier: 1.5,
      description: '+50% hiệu quả cho 10x Architect'
    }
  },
  coffee_thermos: {
    id: 'coffee_thermos',
    name: 'Venti Cold Brew',
    rarity: 2,
    icon: '☕',
    description: 'Cà phê đặc duy trì sự tỉnh táo qua đêm.',
    stats: { hp: 200, spd: 10 },
    synergy: {
      target: 'Support',
      multiplier: 2.0,
      description: '+100% hiệu quả cho Role Support'
    }
  },
  dual_monitor: {
    id: 'dual_monitor',
    name: 'Vertical Dual Monitor',
    rarity: 3,
    icon: '🖥️',
    description: 'Một màn code, một màn đọc log.',
    stats: { def: 60, atk: 20 },
    synergy: {
      target: 'Backend',
      multiplier: 2.0,
      description: '+100% hiệu quả cho nhánh Backend'
    }
  }
};
