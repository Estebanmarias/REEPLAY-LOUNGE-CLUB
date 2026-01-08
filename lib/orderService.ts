export interface CartItem {
  name: string;
  quantity: number;
  priceRaw: number;
}

export interface PastOrder {
  id: string;
  guestId?: string; // Link order to a unique user profile
  date: string;
  items: CartItem[];
  total: number;
  type: 'pickup' | 'delivery';
  details: string;
  customerName: string;
  customerPhone: string;
  status: string;
  deliveryPin?: string;
  specialRequests?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

const ORDER_STORAGE_KEY = 'reeplay_orders_v2';
const PROFILE_STORAGE_KEY = 'reeplay_user_profile';

const generateId = () => {
  return 'usr_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const orderService = {
  // --- Profile Management ---
  getUserProfile: (): UserProfile => {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Create new profile if none exists
    const newProfile: UserProfile = {
      id: generateId(),
      name: '',
      phone: '',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
    return newProfile;
  },

  updateProfile: (name: string, phone: string) => {
    const profile = orderService.getUserProfile();
    const updated = { ...profile, name, phone };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // --- Order Management ---
  saveOrder: (order: PastOrder) => {
    const history = orderService.getAllOrdersRaw();
    // Attach current user ID to the order
    const profile = orderService.getUserProfile();
    const orderWithUser = { ...order, guestId: profile.id };
    
    const newHistory = [orderWithUser, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(newHistory));
    return orderWithUser;
  },

  // Internal use: get everything
  getAllOrdersRaw: (): PastOrder[] => {
    const data = localStorage.getItem(ORDER_STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  // Public use: Get history relevant to the current user
  getHistory: (): PastOrder[] => {
    const allOrders = orderService.getAllOrdersRaw();
    const profile = orderService.getUserProfile();
    
    return allOrders.filter(order => {
      // 1. Match by Unique ID (Best)
      if (order.guestId === profile.id) return true;
      
      // 2. Fallback: Match by Phone if ID is missing (Legacy support)
      // Only check if profile has a phone number saved
      if (!order.guestId && profile.phone && order.customerPhone) {
        return order.customerPhone.replace(/\D/g, '') === profile.phone.replace(/\D/g, '');
      }
      
      return false;
    });
  }
};