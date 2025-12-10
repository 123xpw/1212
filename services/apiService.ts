import { Journey, Expense, WishlistItem, Destination } from '../types';

const API_BASE = 'http://localhost:3000/api';

// 简单的 Token 管理
let token: string | null = localStorage.getItem('auth_token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': token ? `Bearer ${token}` : ''
});

// 核心请求函数
const request = async (endpoint: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers }
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${res.status}`);
  }
  return res.json();
};

export const apiService = {
  // --- 认证 (自动登录逻辑) ---
  loginOrRegisterDemoUser: async () => {
    const demoUser = { username: 'DemoUser', email: 'demo@example.com' };
    try {
      // 尝试登录
      const loginRes = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(demoUser)
      });
      token = loginRes.token;
      localStorage.setItem('auth_token', token || '');
      return loginRes.user;
    } catch (e) {
      // 如果登录失败（可能用户不存在），则注册
      console.log('Login failed, trying to register...', e);
      const regRes = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(demoUser)
      });
      token = regRes.token;
      localStorage.setItem('auth_token', token || '');
      return regRes.user;
    }
  },

  // --- 旅程 (Journeys) ---
  getJourneys: async (): Promise<Journey[]> => {
    return request('/journeys');
  },
  createJourney: async (journey: Partial<Journey>): Promise<Journey> => {
    return request('/journeys', {
      method: 'POST',
      body: JSON.stringify(journey)
    });
  },
  deleteJourney: async (id: string): Promise<void> => {
    return request(`/journeys/${id}`, { method: 'DELETE' });
  },

  // --- 消费 (Expenses) ---
  getExpenses: async (): Promise<Expense[]> => {
    return request('/expenses');
  },
  createExpense: async (expense: Partial<Expense>): Promise<Expense> => {
    return request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense)
    });
  },
  updateExpense: async (id: string, expense: Partial<Expense>): Promise<void> => {
    return request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense)
    });
  },
  deleteExpense: async (id: string): Promise<void> => {
    return request(`/expenses/${id}`, { method: 'DELETE' });
  },

  // --- 愿望清单 (Wishlist) ---
  getWishlist: async (): Promise<WishlistItem[]> => {
    return request('/wishlist');
  },
  createWishlistItem: async (item: Partial<WishlistItem>): Promise<WishlistItem> => {
    return request('/wishlist', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },
  updateWishlistItem: async (id: string, item: Partial<WishlistItem>): Promise<void> => {
    return request(`/wishlist/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    });
  },
  deleteWishlistItem: async (id: string): Promise<void> => {
    return request(`/wishlist/${id}`, { method: 'DELETE' });
  },

  // --- 探索 (Destinations - Public) ---
  getDestinations: async (category?: string): Promise<Destination[]> => {
    const query = category ? `?category=${category}` : '';
    return request(`/destinations${query}`);
  }
};