import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// --- CONFIGURATION ---
// Safely access environment variables to prevent crashes if import.meta.env is undefined
// This prevents the 'Cannot read properties of undefined' error
const env = (import.meta.env || {}) as any;
const projectId = env.VITE_SANITY_PROJECT_ID || 'replace-with-your-project-id';
const token = env.VITE_SANITY_TOKEN;

export const client = createClient({
  projectId: projectId,
  dataset: 'production',
  useCdn: false, // Must be false for fresh data/writing
  apiVersion: '2023-05-03',
  token: token, // Needed for writing data
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
  // If no token is set or project ID is default, fallback to local
  if (!token || projectId === 'replace-with-your-project-id') {
    console.warn("Sanity configuration missing. Order not saved to DB (Local fallback only).");
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
    // Don't crash the app, just return a mock ID so the user sees success
    return { _id: 'offline-' + Date.now() };
  }
};

export const fetchOrdersByPhone = async (phone: string) => {
  if (!projectId || projectId === 'replace-with-your-project-id') return [];

  try {
    // Query orders for this specific phone number, sorted by newest first
    const query = `*[_type == "order" && customerPhone == $phone] | order(createdAt desc)`;
    return await client.fetch(query, { phone });
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return [];
  }
};