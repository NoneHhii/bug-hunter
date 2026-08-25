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
      description: '50% sửa được bug ngay, 50% tạo thêm 1 sub-bug. "Em tưởng cái này chạy được trên máy em..."',
    },
  },
  junior: {
    id: 'junior',
    name: 'Junior Developer',
    role: 'DPS',
    techStack: 'React/Node',
    avatarUrl: '/avatars/backend.jpg',
    defaultStar: 3,
    baseStats: { hp: 800, atk: 70, def: 40, spd: 60 },
    skill: {
      name: 'Brute Force Coding',
      description: 'Tấn công dồn dập vào 1 mục tiêu, bỏ qua phòng thủ của Bug cơ bản.',
    },
  },
  senior: {
    id: 'senior',
    name: 'Senior Developer',
    role: 'Tanker',
    techStack: 'Go/Rust',
    avatarUrl: '/avatars/qa.jpg',
    defaultStar: 4,
    baseStats: { hp: 1500, atk: 120, def: 100, spd: 90 },
    skill: {
      name: 'Refactor Architecture',
      description: 'Giảm 40% giáp của Boss Bug, tăng 20% tốc độ code toàn team. Luôn yêu cầu viết Unit Test trước khi commit.',
    },
  },
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
      description: 'Tiêu diệt toàn bộ Minion Bug ngay lập tức, hồi 30% Sanity cho cả team. Uống cà phê thay nước lọc.',
    },
  },
};
