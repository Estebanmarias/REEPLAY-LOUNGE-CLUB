# 🥂 Reeplay Lounge & Club - Premium Nightlife PWA

> **The Pulse of Ogbomosho.**  
> A high-impact, single-page Progressive Web App (PWA) built for a premium lounge experience. This project combines visceral animations, a "Daytime Luxury" light mode, and a sophisticated client-side ordering system.

---

## 📚 Table of Contents
1. [Product Evolution (The Journey)](#-product-evolution-the-journey)
2. [Technical Architecture](#-technical-architecture)
3. [Key Features Deep Dive](#-key-features-deep-dive)
    - [The Order Service (No-Backend Logic)](#1-the-order-service-no-backend-logic)
    - [The Drink Lab (Builder Pattern)](#2-the-drink-lab-builder-pattern)
    - [The Receipt Engine](#3-the-receipt-engine)
    - [Dual-Theme System](#4-dual-theme-system)
4. [Setup & Installation](#-setup--installation)

---

## 🚀 Product Evolution (The Journey)

This project was built in distinct phases to ensure both visual impact and functional depth.

### Phase 1: The "Vibe" (Landing)
*   **Goal:** Capture the atmosphere of a night club digitally.
*   **Implementation:** Created `Hero.tsx` with bold typography and `BackgroundSlider.tsx` for ambient visuals. Used Framer Motion for entrance animations.

### Phase 2: The Digital Menu
*   **Goal:** Replace physical paper menus with a searchable, interactive digital version.
*   **Implementation:** Built `Menu.tsx` with category filtering (Rice, Pasta, Cocktails). Added a cart system with increment/decrement logic.

### Phase 3: The Drink Lab 🧪
*   **Goal:** Gamify the ordering experience for cocktails.
*   **Feature:** A 3-step wizard allowing users to select a **Base Spirit** -> **Mixers** -> **Garnishes**. The app dynamically calculates the price based on selections and adds a "Custom Drink" item to the cart.

### Phase 4: Order Logic & Persistence
*   **Goal:** Allow users to track orders and see history without a login/signup wall.
*   **Solution:** Implemented `orderService.ts`. It generates a unique `usr_` hash in LocalStorage. Orders are tagged with this ID, allowing the browser to "remember" the user.

### Phase 5: UI/UX Polish & Operations
*   **Dark/Light Mode:** "Nightlife" aesthetic (Black/Purple/Neon) vs "Daytime Luxury" (Alabaster/Gold).
*   **Receipts:** A hyper-realistic thermal receipt modal using CSS clip-paths.
*   **Immersive Details:** Added a custom glowing cursor trail and animated gradient borders for high-value cards.
*   **Navigation:** Implemented URL hash routing for direct section linking and deep-linking support.
*   **Operational Logic:** Smart banners to communicate kitchen/delivery start times (3:00 PM).

---

## 🛠 Technical Architecture

*   **Framework:** React (Vite)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + Custom CSS Variables
*   **Animations:** Framer Motion (`AnimatePresence` for modal transitions)
*   **Icons:** Lucide React
*   **Routing:** Hash-based Custom Routing (Lightweight, requires no server-side config).

### Directory Structure
```
src/
├── components/       # UI Components (Menu, Hero, Modals)
├── lib/             
│   └── orderService.ts  # Core business logic (LocalStorage wrapper)
├── staticData.tsx    # Config for Events, Gallery images
├── App.tsx           # Main Layout & View Router
└── main.tsx          # Entry point
```

---

## 🔍 Key Features Deep Dive

### 1. The Order Service (No-Backend Logic)
*File: `lib/orderService.ts`*

We needed a way to save order history without setting up a database (Supabase/Firebase) for this version.
*   **Guest ID:** On first load, we generate a random ID (`usr_xyz...`) and save it to `localStorage`.
*   **Data Structure:**
    ```typescript
    interface PastOrder {
      id: string;      // Visual ID (e.g., #4921)
      guestId: string; // Hidden User ID
      items: CartItem[];
      status: 'Pending' | 'Completed';
      // ...
    }
    ```
*   **Filtering:** The `getHistory()` function fetches *all* orders from storage but filters to return only those matching the current browser's `guestId`.

### 2. The Drink Lab (Builder Pattern)
*File: `components/Menu.tsx` (Builder Section)*

Instead of static items, we use a combinatorial approach:
1.  **Select Base:** (Vodka, Gin, Tequila) -> Sets base price.
2.  **Select Mixers:** (Coke, Juice, Energy) -> Adds to price array.
3.  **Select Garnish:** (Lime, Mint) -> Adds small increments.
4.  **Output:** A single cart item named "Custom [Spirit]" with the modifiers listed in the description.

### 3. The Receipt Engine
*File: `components/Menu.tsx` (Receipt Modal)*

*   **Visuals:** Uses a CSS trick to create the jagged paper edge:
    ```css
    .receipt-jagged-edge {
      background-image: linear-gradient(45deg, transparent 50%, #fff 50%),
                        linear-gradient(-45deg, transparent 50%, #fff 50%);
      background-size: 16px 16px;
    }
    ```
*   **WhatsApp Integration:** Converts the complex cart object into a formatted string (using `%0A` for newlines) to open a pre-filled WhatsApp message to the lounge's business number.

### 4. Dual-Theme System
*File: `App.tsx` & `index.css`*

*   **Dark Mode:** Uses `bg-black`, `text-white`, `border-white/10`.
*   **Light Mode:** Uses `bg-[#FDFBF7]` (Alabaster), `text-[#2D2438]` (Charcoal), and Gold accents.
*   **Glassmorphism:** Components use `backdrop-blur-md` with varying alpha channels (`bg-white/60` vs `bg-black/40`) depending on the active theme.

---

## 💻 Setup & Installation

1.  **Clone the repository**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
4.  **Build for Production:**
    ```bash
    npm run build
    ```

---

© 2026 Reeplay Lounge & Club. Built with ❤️ and ⚡.