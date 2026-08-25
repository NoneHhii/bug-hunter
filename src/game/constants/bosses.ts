export interface Boss {
  id: string;
  name: string;
  act: number;
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spd: number;
  };
  mechanic: {
    name: string;
    description: string;
  };
}

export const BOSSES: Boss[] = [
  {
    id: 'npe',
    name: 'NullPointerException',
    act: 1,
    baseStats: { hp: 5000, atk: 100, def: 50, spd: 60 },
    mechanic: {
      name: 'Null Reference',
      description: 'Vô hiệu hóa Dev có sát thương cao nhất (không thể chọn làm mục tiêu trong 1 lượt).',
    },
  },
  {
    id: 'infinite_loop',
    name: 'While(true) Infinite Loop',
    act: 1,
    baseStats: { hp: 6500, atk: 120, def: 60, spd: 140 },
    mechanic: {
      name: 'CPU 100% Hang',
      description: 'Mỗi lượt tự tăng 20% tốc độ tấn công (SPD). Đánh liên tục không ngừng.',
    },
  },

  // --- ACT 2: THẢM HỌA BỘ NHỚ & ASYNC ---
  {
    id: 'memory_leak',
    name: 'Memory Leak',
    act: 2,
    baseStats: { hp: 9000, atk: 90, def: 110, spd: 50 },
    mechanic: {
      name: 'OOM Killer',
      description: 'Mỗi lượt kích thước Boss to lên 10% và ATK tăng thêm 15% vĩnh viễn.',
    },
  },
  {
    id: 'callback_hell',
    name: 'Callback Hell Leviathan',
    act: 2,
    baseStats: { hp: 11000, atk: 140, def: 90, spd: 110 },
    mechanic: {
      name: 'Nested Pyramids',
      description: 'Khóa chặt 1 Dev vào tầng callback sâu nhất: Dev này bị câm lặng và nhận gấp đôi sát thương.',
    },
  },

  // --- ACT 3: BẢO MẬT & HẠ TẦNG ---
  {
    id: 'sql_injection',
    name: 'Little Bobby Tables (SQLi)',
    act: 3,
    baseStats: { hp: 15000, atk: 220, def: 80, spd: 130 },
    mechanic: {
      name: 'DROP TABLE Users;',
      description: 'Đòn đánh bỏ qua toàn bộ chỉ số DEF của đội hình, gây sát thương chuẩn diện rộng.',
    },
  },
  {
    id: 'ddos_botnet',
    name: 'Mirai DDoS Botnet',
    act: 3,
    baseStats: { hp: 18000, atk: 160, def: 140, spd: 170 },
    mechanic: {
      name: 'SYN Flood Request',
      description: 'Gọi 3 Minion Zombie Request mỗi 2 lượt. Làm giảm 40% SPD toàn bộ phe Dev.',
    },
  },

  // --- ACT 4: THẢM HỌA DEPLOYMENT & PRODUCTION ---
  {
    id: 'merge_conflict',
    name: 'The 100-File Merge Conflict',
    act: 4,
    baseStats: { hp: 25000, atk: 260, def: 180, spd: 85 },
    mechanic: {
      name: 'Force Push Disaster',
      description: 'Khiến 2 Dev bất kỳ quay sang đánh lẫn nhau trong 1 lượt và hủy toàn bộ nộ Ultimate.',
    },
  },
  {
    id: 'segfault_abyss',
    name: 'Segmentation Fault (Core Dumped)',
    act: 4,
    baseStats: { hp: 32000, atk: 380, def: 200, spd: 100 },
    mechanic: {
      name: 'Access Violation',
      description: 'Mỗi 3 lượt tung đòn tử thủ: Lập tức hạ gục mục tiêu có lượng máu thấp nhất dưới 30% HP.',
    },
  },

  // --- ACT 5: TỔNG TRÙM CUỐI ---
  {
    id: 'legacy_monolith',
    name: 'The 30-Year COBOL Mainframe',
    act: 5,
    baseStats: { hp: 50000, atk: 450, def: 350, spd: 40 },
    mechanic: {
      name: 'No Documentation Curse',
      description: 'Phản lại 35% mọi sát thương nhận vào. Kháng toàn bộ hiệu ứng choáng. Tự hồi 25% HP khi gần chết.',
    },
  }
];
