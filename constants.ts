import { Destination, ExpenseCategory } from './types';

export const THEME_COLOR = '#4682B4';

export const EXPLORE_DESTINATIONS: Destination[] = [
  {
    id: '1',
    name: '日本京都',
    description: '古老的寺庙、传统的茶馆和升华心灵的庭院。',
    bestSeason: '春季（樱花季）或秋季',
    budgetLevel: 'Medium',
    imageUrl: 'https://picsum.photos/id/1015/800/600'
  },
  {
    id: '2',
    name: '希腊圣托里尼',
    description: '标志性的蓝顶白墙建筑，俯瞰爱琴海的绝美景色。',
    bestSeason: '夏季',
    budgetLevel: 'High',
    imageUrl: 'https://picsum.photos/id/1036/800/600'
  },
  {
    id: '3',
    name: '冰岛雷克雅未克',
    description: '通往极光、间歇泉和火山的门户。',
    bestSeason: '冬季（极光）或夏季',
    budgetLevel: 'High',
    imageUrl: 'https://picsum.photos/id/1018/800/600'
  },
  {
    id: '4',
    name: '印尼巴厘岛',
    description: '拥有茂密丛林和美丽海滩的热带天堂。',
    bestSeason: '旱季（4月-10月）',
    budgetLevel: 'Low',
    imageUrl: 'https://picsum.photos/id/1039/800/600'
  },
  {
    id: '5',
    name: '法国巴黎',
    description: '光之城，艺术、时尚与美食的中心。',
    bestSeason: '春季或秋季',
    budgetLevel: 'Medium',
    imageUrl: 'https://picsum.photos/id/106/800/600'
  },
  {
    id: '6',
    name: '新西兰皇后镇',
    description: '被雄伟山脉环绕的世界冒险之都。',
    bestSeason: '夏季（12月-2月）',
    budgetLevel: 'Medium',
    imageUrl: 'https://picsum.photos/id/1043/800/600'
  }
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Accommodation]: '#4682B4', // SteelBlue (Primary)
  [ExpenseCategory.Food]: '#FB5607', // Orange
  [ExpenseCategory.Transport]: '#FF006E', // Pink
  [ExpenseCategory.Shopping]: '#8338EC', // Purple
  [ExpenseCategory.Activities]: '#3A0CA3', // Dark Blue
  [ExpenseCategory.Other]: '#A0AEC0', // Gray
};