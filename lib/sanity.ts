import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// --- CONFIGURATION ---
// 1. Log into https://www.sanity.io/manage
// 2. Create a project or select existing one
// 3. Copy your Project ID and paste it below
// NOTE: It must be lowercase, numbers, and dashes only.
const projectId = 'replace-with-your-project-id'; // <--- PASTE YOUR ID HERE

// 4. Create an API Token in Sanity Manage -> API -> Tokens -> Add New Token
// Give it "Editor" permissions so users can submit orders.
const token = 'replace-with-your-write-token'; // <--- PASTE WRITE TOKEN HERE

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
  // If no token is set (placeholder), we can't write to Sanity.
  // We'll just return a success mock so the UI doesn't break.
  if (!token || token.includes('replace-with')) {
    console.warn("Sanity Write Token missing. Order not saved to DB.");
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
    throw error;
  }
};

export const fetchOrdersByPhone = async (phone: string) => {
  if (!projectId || projectId.includes('replace-with')) return [];

  try {
    // Query orders for this specific phone number, sorted by newest first
    const query = `*[_type == "order" && customerPhone == $phone] | order(createdAt desc)`;
    return await client.fetch(query, { phone });
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return [];
  }
};