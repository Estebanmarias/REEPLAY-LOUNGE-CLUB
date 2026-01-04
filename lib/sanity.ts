import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// --- CONFIGURATION ---
// 1. Log into https://www.sanity.io/manage
// 2. Create a project or select existing one
// 3. Copy your Project ID and paste it below
// NOTE: It must be lowercase, numbers, and dashes only.
export const client = createClient({
  projectId: 'replace-with-your-project-id', // <--- PASTE YOUR ID HERE (must be lowercase)
  dataset: 'production',
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2023-05-03', // use current date (YYYY-MM-DD) to target the latest API version
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