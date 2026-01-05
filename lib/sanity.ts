import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// --- CONFIGURATION ---
// Safely access environment variables to prevent crashes if import.meta.env is undefined
const env = (import.meta.env || {}) as any;

// Updated with your actual Project ID from the screenshot
const projectId = env.VITE_SANITY_PROJECT_ID || 'wyb22rvu'; 
const token = env.VITE_SANITY_TOKEN;

export const client = createClient({
  projectId: projectId,
  dataset: 'production',
  useCdn: false, // Must be false for fresh data/writing
  apiVersion: '2023-05-03',
  token: token, // Needed for writing data (Orders)
  ignoreBrowserTokenWarning: true 
});

// Initialize image builder safely
let builder: any;
try {
  builder = imageUrlBuilder(client);
} catch (e) {
  console.warn("Sanity builder init failed:", e);
}

export const urlFor = (source: any) => {
  if (!source || !builder) return undefined;
  try {
    return builder.image(source);
  } catch (error) {
    return undefined;
  }
};

// --- ORDER FUNCTIONS ---

export const submitOrderToSanity = async (orderData: any) => {
  // If no token is set, fallback to local only
  if (!token) {
    console.warn("Sanity Token missing. Order not saved to DB (Local fallback only).");
    return { _id: 'local-' + Date.now() };
  }

  try {
    const doc = {
      _type: 'order',
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    return await client.create(doc);
  } catch (error) {
    console.error("Failed to submit order to Sanity:", error);
    return { _id: 'offline-' + Date.now() };
  }
};

export const fetchOrdersByPhone = async (phone: string) => {
  if (!projectId) return [];

  try {
    // Query orders for this specific phone number, sorted by newest first
    const query = `*[_type == "order" && customerPhone == $phone] | order(createdAt desc)`;
    return await client.fetch(query, { phone });
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return [];
  }
};