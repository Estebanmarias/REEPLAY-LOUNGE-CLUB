export interface CartItem {
  name: string;
  quantity: number;
  priceRaw: number;
}

export interface PastOrder {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  type: 'pickup' | 'delivery';
  details: string;
  customerName: string;
  customerPhone: string;
  status: string;
  deliveryPin?: string;
}

const STORAGE_KEY = 'reeplay_orders_v2';

export const orderService = {
  saveOrder: (order: PastOrder) => {
    const history = orderService.getHistory();
    const newHistory = [order, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    return order;
  },

  getHistory: (): PastOrder[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  getHistoryByPhone: (phone: string): PastOrder[] => {
    const history = orderService.getHistory();
    return history.filter(o => o.customerPhone === phone.replace(/\D/g, ''));
  }
};