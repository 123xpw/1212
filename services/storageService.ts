import { Journey, Expense, WishlistItem } from '../types';

const KEYS = {
  JOURNEYS: 'voyage_journeys',
  EXPENSES: 'voyage_expenses',
  WISHLIST: 'voyage_wishlist'
};

const get = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
};

const set = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
};

export const storageService = {
  getJourneys: () => get<Journey[]>(KEYS.JOURNEYS, []),
  saveJourneys: (journeys: Journey[]) => set(KEYS.JOURNEYS, journeys),

  getExpenses: () => get<Expense[]>(KEYS.EXPENSES, []),
  saveExpenses: (expenses: Expense[]) => set(KEYS.EXPENSES, expenses),

  getWishlist: () => get<WishlistItem[]>(KEYS.WISHLIST, []),
  saveWishlist: (list: WishlistItem[]) => set(KEYS.WISHLIST, list),
};
