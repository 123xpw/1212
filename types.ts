export interface Journey {
  id: string;
  location: string;
  date: string;
  description: string;
  imageUrl?: string;
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
}

export interface WishlistItem {
  id: string;
  location: string;
  plannedDate: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  bestSeason: string;
  budgetLevel: 'Low' | 'Medium' | 'High' | 'Luxury';
  imageUrl: string;
}

export type ViewName = 'journeys' | 'expenses' | 'wishlist' | 'explore';
