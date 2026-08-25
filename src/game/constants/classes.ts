export interface DevClass {
  id: string;
  name: string;
  role: string;
  techStack: string;
  avatarUrl: string;
  defaultStar: number;
  baseStats: {
    hp: number; // Sanity
    atk: number; // Lines of Code
    def: number; // Code Review
    spd: number; // Sprint Velocity
  };
  skill: {
    name: string;
    description: string;
  };
}

export const CLASSES: Record<string, DevClass> = {
  architect: {
    id: 'architect',
    name: '10x Architect',
    role: 'Burst',
    techStack: 'Everything',
    avatarUrl: '/avatars/architect.jpg',
    defaultStar: 5,
    baseStats: { hp: 2000, atk: 300, def: 150, spd: 150 },
    skill: {
      name: 'Deploy Hotfix On Prod',
      description: 'Tiêu diệt toàn bộ Minion Bug ngay lập tức, hồi 30% Sanity cho cả team.',
    },
  },
  c_assembler_elder: {
    id: 'c_assembler_elder',
    name: 'C Assembler Elder',
    role: 'Burst',
    techStack: 'C/Assembly',
    avatarUrl: '/avatars/c_elder.jpg',
    defaultStar: 5,
    baseStats: { hp: 800, atk: 450, def: 40, spd: 200 },
    skill: {
      name: 'Pointer Arithmetic',
      description: 'Gây 400% sát thương chuẩn bỏ qua giáp. 10% tự dính Segfault (mất 50% HP hiện tại).',
    },
  },
  rust_borrow_sentinel: {
    id: 'rust_borrow_sentinel',
    name: 'Rust Borrow Sentinel',
    role: 'Tanker',
    techStack: 'Rust',
    avatarUrl: '/avatars/rust.jpg',
    defaultStar: 5,
    baseStats: { hp: 3200, atk: 150, def: 300, spd: 90 },
    skill: {
      name: 'Zero-Cost Lifetime',
      description: 'Tạo vùng bảo hộ tuyệt đối, miễn nhiễm sát thương và hiệu ứng xấu từ Memory Leak/NPE trong 3 lượt.',
    },
  },
  ai_prompt_wizard: {
    id: 'ai_prompt_wizard',
    name: 'AI Prompt Wizard',
    role: 'DPS',
    techStack: 'Python/OpenAI',
    avatarUrl: '/avatars/ai_wizard.jpg',
    defaultStar: 5,
    baseStats: { hp: 1400, atk: 380, def: 60, spd: 160 },
    skill: {
      name: 'Hallucination Blast',
      description: 'Sinh ra đoạn code siêu việt: Gây sát thương cực lớn ngẫu nhiên (từ 150% đến 500% ATK).',
    },
  },

  // --- TIER 4 SAO (Senior / Specialists) ---
  golang_golem: {
    id: 'golang_golem',
    name: 'Golang Golem',
    role: 'Tanker',
    techStack: 'Go/Docker',
    avatarUrl: '/avatars/backend.jpg',
    defaultStar: 4,
    baseStats: { hp: 2500, atk: 180, def: 200, spd: 80 },
    skill: {
      name: 'Goroutine Shield',
      description: 'Chịu sát thương thay cho đồng đội yếu máu nhất trong 3 lượt, tăng 40% DEF.',
    },
  },
  ruby_enchantress: {
    id: 'ruby_enchantress',
    name: 'Ruby Enchantress',
    role: 'Support',
    techStack: 'Ruby on Rails',
    avatarUrl: '/avatars/backend.jpg',
    defaultStar: 4,
    baseStats: { hp: 1200, atk: 90, def: 60, spd: 110 },
    skill: {
      name: 'Developer Happiness',
      description: 'Hồi 20% Sanity và tăng 30% SPD cho toàn đội hình trong 2 lượt.',
    },
  },
  ts_type_enforcer: {
    id: 'ts_type_enforcer',
    name: 'TypeScript Enforcer',
    role: 'DPS',
    techStack: 'TypeScript',
    avatarUrl: '/avatars/ts.jpg',
    defaultStar: 4,
    baseStats: { hp: 1600, atk: 220, def: 110, spd: 120 },
    skill: {
      name: 'Strict Type Guard',
      description: 'Gây 220% sát thương, đồng thời cấm Boss dùng kỹ năng đặc biệt trong 1 lượt.',
    },
  },
  k8s_commander: {
    id: 'k8s_commander',
    name: 'K8s Cluster Commander',
    role: 'Support',
    techStack: 'DevOps',
    avatarUrl: '/avatars/scrum.jpg',
    defaultStar: 4,
    baseStats: { hp: 1800, atk: 100, def: 180, spd: 100 },
    skill: {
      name: 'Auto-Healing Pods',
      description: 'Khi 1 đồng đội bị hạ gục, lập tức hồi sinh người đó với 40% HP (1 lần/trận).',
    },
  },
  pentest_shadow: {
    id: 'pentest_shadow',
    name: 'White-Hat Pentester',
    role: 'Burst',
    techStack: 'Linux/Kali',
    avatarUrl: '/avatars/pentest.jpg',
    defaultStar: 4,
    baseStats: { hp: 1100, atk: 290, def: 70, spd: 170 },
    skill: {
      name: 'Zero-Day Exploit',
      description: 'Đánh thẳng vào lõi Boss, giảm 50% DEF của mục tiêu trong 3 lượt.',
    },
  },

  // --- TIER 3 SAO (Mid / Junior) ---
  junior: {
    id: 'junior',
    name: 'Junior Developer',
    role: 'DPS',
    techStack: 'React/Node',
    avatarUrl: '/avatars/frontend.jpg',
    defaultStar: 3,
    baseStats: { hp: 800, atk: 70, def: 40, spd: 60 },
    skill: {
      name: 'Brute Force Coding',
      description: 'Tấn công dồn dập vào 1 mục tiêu, bỏ qua phòng thủ của Bug cơ bản.',
    },
  },
  qa_debugger: {
    id: 'qa_debugger',
    name: 'QA Automation Tester',
    role: 'Support',
    techStack: 'Selenium/Cypress',
    avatarUrl: '/avatars/qa.jpg',
    defaultStar: 3,
    baseStats: { hp: 1300, atk: 80, def: 90, spd: 90 },
    skill: {
      name: 'Edge Case Detection',
      description: 'Làm lộ điểm yếu của Bug, giúp toàn đội tăng 25% tỷ lệ bạo kích.',
    },
  },
  css_pixel_artist: {
    id: 'css_pixel_artist',
    name: 'CSS Flexbox Ninja',
    role: 'Support',
    techStack: 'HTML/CSS',
    avatarUrl: '/avatars/frontend.jpg',
    defaultStar: 3,
    baseStats: { hp: 1000, atk: 110, def: 80, spd: 130 },
    skill: {
      name: 'Z-Index: 9999',
      description: 'Đưa 1 đồng minh lên lớp trên cùng: Không thể bị chọn làm mục tiêu trong 1 lượt.',
    },
  },

  // --- TIER 1-2 SAO (Intern / Rookie) ---
  intern: {
    id: 'intern',
    name: 'Intern Developer',
    role: 'Support',
    techStack: 'HTML/CSS',
    avatarUrl: '/avatars/frontend.jpg',
    defaultStar: 2,
    baseStats: { hp: 500, atk: 20, def: 10, spd: 30 },
    skill: {
      name: 'StackOverflow Copy',
      description: '50% sửa được bug ngay, 50% sinh thêm 1 lỗi phụ.',
    },
  },
  chatgpt_wrapper: {
    id: 'chatgpt_wrapper',
    name: 'ChatGPT Free Tab',
    role: 'DPS',
    techStack: 'AI/Web',
    avatarUrl: '/avatars/ai_wizard.jpg',
    defaultStar: 2,
    baseStats: { hp: 450, atk: 90, def: 20, spd: 80 },
    skill: {
      name: 'Copy Paste Fix',
      description: 'Tấn công 1 mục tiêu. 30% hết hạn gói Free, làm mất lượt đánh tiếp theo.',
    },
  }
};
