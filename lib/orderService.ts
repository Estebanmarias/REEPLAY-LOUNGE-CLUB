import { supabase } from './supabase';

export interface CartItem {
  name: string;
  quantity: number;
  priceRaw: number;
  modifiers?: string[];
  categoryId?: string;
}

export interface PastOrder {
  paymentStatus?: string;
  paymentReference?: string;
  id: string;
  guestId?: string;
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

const PROFILE_STORAGE_KEY = 'reeplay_user_profile';

const generateId = () => {
  return 'usr_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const orderService = {
  getUserProfile: (): UserProfile => {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
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

  saveOrder: async (order: PastOrder) => {
    const profile = orderService.getUserProfile();
    const { error } = await supabase.from('orders').insert({
      visual_id: order.id,
      guest_id: profile.id,
      date: order.date,
      items: order.items,
      total: order.total,
      type: order.type,
      details: order.details,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      status: order.status,
      delivery_pin: order.deliveryPin || null,
      special_requests: order.specialRequests || null,
      payment_status: order.paymentStatus || 'unpaid',
      payment_reference: order.paymentReference || null,
    });

    if (error) {
      console.error('Supabase save error:', error);
      throw new Error('Could not save order.');
    }

    // Decrement inventory on successful paid orders
    if (order.paymentStatus === 'paid') {
      const itemNames = order.items.map(i => i.name);

      const { data: inventoryRows } = await supabase
        .from('inventory')
        .select('*')
        .in('item_name', itemNames)
        .eq('track_inventory', true);

      if (inventoryRows && inventoryRows.length > 0) {
        for (const invRow of inventoryRows) {
          const cartItem = order.items.find(i => i.name === invRow.item_name);
          if (!cartItem) continue;

          const newStock = Math.max(0, invRow.stock_count - cartItem.quantity);

          await supabase
            .from('inventory')
            .update({ stock_count: newStock })
            .eq('id', invRow.id);

          // Auto-mark sold out on menu when stock hits 0
          if (newStock === 0) {
            await supabase
              .from('menu_items')
              .update({ is_sold_out: true })
              .ilike('name', invRow.item_name);
          }
        }
      }
    }

    return { ...order, guestId: profile.id };
  },

  getHistory: async (): Promise<PastOrder[]> => {
    const profile = orderService.getUserProfile();

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('guest_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase fetch error:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.visual_id,
      guestId: row.guest_id,
      date: row.date,
      items: row.items,
      total: row.total,
      type: row.type,
      details: row.details,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      status: row.status,
      deliveryPin: row.delivery_pin,
      specialRequests: row.special_requests,
    }));
  }
};