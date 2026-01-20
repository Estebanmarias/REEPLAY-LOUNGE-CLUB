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

  // --- Order Management (Now Async with Firebase) ---
  
  saveOrder: async (order: PastOrder) => {
    try {
      const profile = orderService.getUserProfile();
      const orderWithUser = { 
        ...order, 
        guestId: profile.id,
        createdAt: new Date() // Firestore timestamp for sorting
      };
      
      // Save to 'orders' collection in Firestore
      const docRef = await addDoc(collection(db, "orders"), orderWithUser);
      console.log("Document written with ID: ", docRef.id);
      
      return orderWithUser;
    } catch (e) {
      console.error("Error adding document: ", e);
      // Fallback or re-throw depending on desired behavior
      throw e;
    }
  },

  getHistory: async (): Promise<PastOrder[]> => {
    try {
      const profile = orderService.getUserProfile();
      const ordersRef = collection(db, "orders");
      
      // Query orders where guestId matches current user
      const q = query(
        ordersRef, 
        where("guestId", "==", profile.id),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const orders: PastOrder[] = [];
      
      querySnapshot.forEach((doc) => {
        // We cast the data to PastOrder (ignoring the Firestore specific fields like createdAt for the UI)
        const data = doc.data() as any;
        orders.push({
            ...data,
            // Ensure date strings remain strings if Firestore converted them to Timestamp objects
            date: data.date || new Date().toISOString()
        } as PastOrder);
      });

      return orders;
    } catch (e) {
      console.error("Error fetching history: ", e);
      return [];
    }
  }
};