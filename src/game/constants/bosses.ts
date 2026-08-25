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
      description: 'Vô hiệu hóa Dev có sát thương cao nhất (không thể chọn làm mục tiêu).',
    },
  },
  {
    id: 'memory_leak',
    name: 'Memory Leak',
    act: 2,
    baseStats: { hp: 8000, atk: 80, def: 100, spd: 50 },
    mechanic: {
      name: 'OOM Killer',
      description: 'Mỗi lượt kích thước Boss to lên 10% và ATK tăng thêm 15% vĩnh viễn.',
    },
  },
];
