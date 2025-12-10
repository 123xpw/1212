
export interface Journey {
  id: string;
  location: string;
  date: string;
  description: string;
}

export enum ExpenseCategory {
  Transport = 'Transport',
  Accommodation = 'Accommodation',
  Food = 'Food',
  Shopping = 'Shopping',
  Activities = 'Activities',
  Other = 'Other'
}

export interface Expense {
  id: string;
  location: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string; // New: 消费备注
}

export interface WishlistItem {
  id: string;
  location: string;
  plannedDate: string;
  reason: string;
  priority: number; // 0, 25, 50, 75, 100
  budgetNote?: string;
  status: 'Pending' | 'Realized'; // New: 愿望状态
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  bestSeason: string;
  budgetLevel: 'Low' | 'Medium' | 'High' | 'Luxury';
  imageUrl: string;
  tags: string[]; // 'Featured', 'Seasonal', 'Value'
  recommendedReason: string;
}

export type ViewName = 'journeys' | 'expenses' | 'wishlist' | 'explore';
