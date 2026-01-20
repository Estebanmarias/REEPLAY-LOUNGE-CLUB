import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";

export interface CartItem {
  name: string;
  quantity: number;
  priceRaw: number;
  modifiers?: string[];
  categoryId?: string;
}

export interface PastOrder {
  id: string; // Visual ID (e.g. #1234)
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

const PROFILE_STORAGE_KEY = 'reeplay_user_profile';
const OFFLINE_ORDERS_KEY = 'reeplay_offline_orders';

const generateId = () => {
  return 'usr_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const orderService = {
  // --- Profile Management (Keep local for device identification) ---
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
  
  saveOrder: async (order: PastOrder) => {
    const profile = orderService.getUserProfile();
    const orderWithUser = { 
      ...order, 
      guestId: profile.id,
      createdAt: new Date().toISOString()
    };

    // 1. Attempt Firestore Save
    try {
      // Use standard Date object for Firestore compatibility if connection works
      await addDoc(collection(db, "orders"), {
        ...orderWithUser,
        createdAt: new Date() 
      });
      console.log("Order saved to Firestore");
    } catch (e) {
      console.warn("Firestore save failed (network/permission), falling back to local storage.", e);
      
      // 2. Fallback to LocalStorage so user is not blocked
      try {
        const existingStr = localStorage.getItem(OFFLINE_ORDERS_KEY);
        const existing = existingStr ? JSON.parse(existingStr) : [];
        existing.push(orderWithUser);
        localStorage.setItem(OFFLINE_ORDERS_KEY, JSON.stringify(existing));
      } catch (localErr) {
        console.error("Local storage save failed", localErr);
        throw new Error("Could not save order to device or cloud.");
      }
    }
    
    return orderWithUser;
  },

  getHistory: async (): Promise<PastOrder[]> => {
    const profile = orderService.getUserProfile();
    let allOrders: PastOrder[] = [];

    // 1. Fetch Local/Offline Orders first
    try {
        const localStr = localStorage.getItem(OFFLINE_ORDERS_KEY);
        if (localStr) {
            const localOrders = JSON.parse(localStr);
            const userLocalOrders = localOrders.filter((o: any) => o.guestId === profile.id);
            allOrders = [...allOrders, ...userLocalOrders];
        }
    } catch (e) { console.error("Error reading local history", e); }

    // 2. Fetch Firestore Orders
    try {
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef, 
        where("guestId", "==", profile.id),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data() as any;
        // Avoid duplicates if ID exists in local storage list (unlikely but safe)
        if (!allOrders.find(o => o.id === data.id)) {
             allOrders.push({
                ...data,
                // Ensure date strings remain strings
                date: data.date || new Date().toISOString()
            } as PastOrder);
        }
      });
    } catch (e) {
      console.warn("Could not fetch from Firestore, showing local history only.", e);
    }
    
    // Sort combined list descending by date
    return allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
};
