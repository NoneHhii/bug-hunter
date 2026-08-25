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
  kubernetes_core: {
    id: 'kubernetes_core',
    name: 'Kubernetes Core Cluster',
    rarity: 5,
    icon: '☸️',
    description: 'Điều phối hàng nghìn container, buff phòng thủ cho toàn hệ thống.',
    stats: { def: 200, hp: 1000, spd: 30 },
    synergy: {
      target: 'Tanker',
      multiplier: 1.5,
      description: '+50% hiệu quả phòng thủ cho Role Tanker',
    },
  },
  copilot_enterprise: {
    id: 'copilot_enterprise',
    name: 'GitHub Copilot Enterprise',
    rarity: 5,
    icon: '🤖',
    description: 'Tự động gợi ý hàng chục dòng code không lỗi.',
    stats: { atk: 180, spd: 60 },
    synergy: {
      target: 'DPS',
      multiplier: 2.0,
      description: '+100% chỉ số tấn công cho Role DPS',
    },
  },
  herman_miller_chair: {
    id: 'herman_miller_chair',
    name: 'Embody Ergonomic Chair',
    rarity: 5,
    icon: '🪑',
    description: 'Bảo vệ cột sống tuyệt đối, hồi phục Sanity liên tục.',
    stats: { hp: 1500, def: 120 },
    synergy: {
      target: 'Support',
      multiplier: 1.8,
      description: '+80% chỉ số máu cho Role Support',
    },
  },

  // --- TIER 4 SAO ---
  redis_turbo: {
    id: 'redis_turbo',
    name: 'Redis In-Memory Turbo',
    rarity: 4,
    icon: '⚡',
    description: 'Phản hồi tốc độ ánh sáng qua cache RAM.',
    stats: { spd: 150, atk: 80 },
    synergy: {
      target: 'Burst',
      multiplier: 2.0,
      description: '+100% hiệu quả tốc độ cho Role Burst',
    },
  },
  docker_compose: {
    id: 'docker_compose',
    name: 'Docker Compose Spec',
    rarity: 4,
    icon: '🐳',
    description: 'Đóng gói toàn bộ service, lỗi ở đâu cách ly ở đó.',
    stats: { hp: 800, def: 120 },
    synergy: {
      target: 'Go/Docker',
      multiplier: 1.8,
      description: '+80% hiệu quả cho Tech Stack Go/Docker',
    },
  },
  cloudflare_shield: {
    id: 'cloudflare_shield',
    name: 'Cloudflare WAF Pro',
    rarity: 4,
    icon: '🛡️',
    description: 'Chặn đứng lưu lượng tấn công xấu và mã độc.',
    stats: { def: 150, hp: 600 },
    synergy: {
      target: 'Tanker',
      multiplier: 1.6,
      description: '+60% hiệu quả phòng thủ cho Tanker',
    },
  },

  // --- TIER 3 SAO ---
  mechanical_keyboard: {
    id: 'mechanical_keyboard',
    name: 'Tactile Blue Switch Keyboard',
    rarity: 3,
    icon: '⌨️',
    description: 'Gõ lạch cạch tạo nhịp điệu làm việc dồn dập.',
    stats: { spd: 40, atk: 25 },
    synergy: {
      target: 'DPS',
      multiplier: 1.5,
      description: '+50% hiệu quả cho Role DPS',
    },
  },
  dual_4k_monitors: {
    id: 'dual_4k_monitors',
    name: 'Dual 4K Vertical Monitors',
    rarity: 3,
    icon: '🖥️',
    description: 'Một bên code, một bên đọc stack trace lỗi.',
    stats: { def: 70, atk: 30 },
    synergy: {
      target: 'Support',
      multiplier: 1.5,
      description: '+50% hiệu quả cho Role Support',
    },
  },
  energy_drink: {
    id: 'energy_drink',
    name: 'Monster Energy 500ml',
    rarity: 3,
    icon: '🥫',
    description: 'Tăng lực đột biến để kịp chạy sprint trước deadline.',
    stats: { spd: 80, hp: -100 },
    synergy: {
      target: 'Burst',
      multiplier: 1.5,
      description: '+50% tốc độ cho Role Burst',
    },
  },

  // --- TIER 2 SAO ---
  rubber_duck: {
    id: 'rubber_duck',
    name: 'Debugging Rubber Duck',
    rarity: 2,
    icon: '🦆',
    description: 'Tâm sự với vịt vàng giúp tự nhận ra lỗi ngớ ngẩn.',
    stats: { def: 30, hp: 150 },
    synergy: {
      target: 'Support',
      multiplier: 1.4,
      description: '+40% hiệu quả cho Role Support',
    },
  },
  coffee_thermos: {
    id: 'coffee_thermos',
    name: 'Cold Brew 1 Lít',
    rarity: 2,
    icon: '☕',
    description: 'Duy trì năng lượng làm việc qua đêm.',
    stats: { hp: 250, spd: 15 },
    synergy: {
      target: 'Tanker',
      multiplier: 1.3,
      description: '+30% hiệu quả cho Role Tanker',
    },
  }
};
