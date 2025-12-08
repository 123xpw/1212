
import { Destination, ExpenseCategory } from './types';

export const THEME_COLOR = '#4682B4';

export const EXPLORE_DESTINATIONS: Destination[] = [
  {
    id: '1',
    name: '京都',
    country: '日本',
    description: '古老的寺庙、传统的茶馆和升华心灵的庭院。漫步在祗园的石板路上，感受千年的历史沉淀。',
    bestSeason: '春季（樱花）或秋季（红叶）',
    budgetLevel: 'Medium',
    imageUrl: 'https://picsum.photos/id/1015/800/600',
    tags: ['Featured', 'Seasonal'],
    recommendedReason: '体验极致的东方美学，摄影爱好者的天堂。'
  },
  {
    id: '2',
    name: '圣托里尼',
    country: '希腊',
    description: '标志性的蓝顶白墙建筑，俯瞰爱琴海的绝美景色。世界上最美的日落观赏地之一。',
    bestSeason: '夏季（6月-9月）',
    budgetLevel: 'High',
    imageUrl: 'https://picsum.photos/id/1036/800/600',
    tags: ['Featured'],
    recommendedReason: '蜜月首选，无可替代的浪漫氛围。'
  },
  {
    id: '3',
    name: '清迈',
    country: '泰国',
    description: '泰北玫瑰，拥有众多精美的寺庙和热闹的夜市。生活节奏缓慢，物价极低。',
    bestSeason: '冬季（11月-2月）',
    budgetLevel: 'Low',
    imageUrl: 'https://picsum.photos/id/1047/800/600',
    tags: ['Value', 'Seasonal'],
    recommendedReason: '极具性价比的数字游民基地，美食丰富且便宜。'
  },
  {
    id: '4',
    name: '雷克雅未克',
    country: '冰岛',
    description: '通往极光、间歇泉和火山的门户。感受地球原始力量的最佳去处。',
    bestSeason: '冬季（极光）或夏季（午夜阳光）',
    budgetLevel: 'High',
    imageUrl: 'https://picsum.photos/id/1018/800/600',
    tags: ['Featured', 'Seasonal'],
    recommendedReason: '人生必看清单：极光与蓝冰洞。'
  },
  {
    id: '5',
    name: '巴厘岛',
    country: '印度尼西亚',
    description: '拥有茂密丛林和美丽海滩的热带天堂。乌布的稻田与瑜伽，库塔的冲浪与夜生活。',
    bestSeason: '旱季（4月-10月）',
    budgetLevel: 'Low',
    imageUrl: 'https://picsum.photos/id/1039/800/600',
    tags: ['Value'],
    recommendedReason: '豪华别墅的价格仅为欧洲的三分之一，度假感拉满。'
  },
  {
    id: '6',
    name: '里斯本',
    country: '葡萄牙',
    description: '充满阳光的南欧城市，色彩斑斓的瓷砖墙和古老的黄色电车。',
    bestSeason: '春秋两季',
    budgetLevel: 'Medium',
    imageUrl: 'https://picsum.photos/id/1040/800/600',
    tags: ['Value', 'Featured'],
    recommendedReason: '西欧物价最低的首都之一，海鲜极其鲜美。'
  },
  {
    id: '7',
    name: '皇后镇',
    country: '新西兰',
    description: '被雄伟山脉环绕的世界冒险之都。蹦极、跳伞、喷射快艇，应有尽有。',
    bestSeason: '夏季（12月-2月）',
    budgetLevel: 'Medium',
    imageUrl: 'https://picsum.photos/id/1043/800/600',
    tags: ['Featured', 'Seasonal'],
    recommendedReason: '自然风光与极限运动的完美结合。'
  },
  {
    id: '8',
    name: '伊斯坦布尔',
    country: '土耳其',
    description: '横跨欧亚大陆的传奇城市，融合了拜占庭与奥斯曼帝国的历史瑰宝。',
    bestSeason: '春季或秋季',
    budgetLevel: 'Medium',
    imageUrl: 'https://picsum.photos/id/1029/800/600',
    tags: ['Value'],
    recommendedReason: '物价亲民，历史底蕴深厚，美食令人难忘。'
  },
  {
    id: '9',
    name: '班夫国家公园',
    country: '加拿大',
    description: '落基山脉的明珠，拥有碧绿的湖泊和巍峨的雪山。',
    bestSeason: '夏季（徒步）或冬季（滑雪）',
    budgetLevel: 'High',
    imageUrl: 'https://picsum.photos/id/1038/800/600',
    tags: ['Seasonal'],
    recommendedReason: '世界级的自然风光摄影地。'
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