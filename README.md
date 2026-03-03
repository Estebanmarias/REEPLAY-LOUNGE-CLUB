# Reeplay Lounge & Club — Digital Operations Platform

> **The Pulse of Ogbomosho.**
> A full-stack Progressive Web App (PWA) built to digitise and streamline operations at Reeplay Lounge & Club — covering online ordering, payments, inventory, physical sales tracking, analytics, and content management.

---

## Stack & Infrastructure

| Layer | Technology |
|---|---|
| Framework | React + TypeScript + Vite (PWA) |
| Styling | Tailwind CSS + Framer Motion |
| Backend | Supabase (Postgres + Storage) |
| Payments | Paystack (Card + Bank Transfer) |
| Hosting | Vercel |
| Icons | Lucide React |

**Live URL:** `reeplay-lounge-club.vercel.app`
**Repo:** `github.com/Estebanmarias/REEPLAY-LOUNGE-CLUB`
**Supabase Project:** `yhtswixxfjtwggvjgpaz.supabase.co`

---

## Environment Variables

```env
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

---

## Supabase Tables

| Table | Purpose |
|---|---|
| `menu_items` | Menu with sold out toggle and price management |
| `events` | Events managed from admin panel |
| `gallery` | Image URLs for the gallery page |
| `orders` | Customer orders with payment and status tracking |
| `inventory` | Stock tracking for countable items |
| `physical_sales` | Daily physical/dine-in sales log |

**Storage bucket:** `gallery` — public, with upload/read/delete policies.

---

## Features

### Customer-Facing
- Live menu fetched from Supabase with sold out states
- Cart with persistence via localStorage
- Drink Lab — custom cocktail builder (base spirit + mixers + garnishes)
- Checkout with delivery / pickup / dine-in options
- Paystack payment gateway (card + bank transfer, NGN)
- Thermal receipt modal with order summary
- Order history with reorder functionality
- Real-time order status polling (10s interval)
- Empty cart upsell with popular items
- Gallery page fetched from Supabase
- Dark / Light mode (Nightlife vs Daytime Luxury)

### Admin Panel (`/#admin`)
- Password protected (`reeplay2026`)
- **Orders** — view paid orders, filter by status, update order status, new order sound + badge notification
- **Menu** — update prices, toggle sold out per item, update descriptions
- **Events** — add, toggle active, delete events
- **Gallery** — upload and delete images via Supabase Storage
- **Inventory** — add items, adjust stock, toggle tracking, auto sold out on zero stock
- **Daily Log** — log physical sales, auto-deduct from inventory, inventory-linked autocomplete
- **Analytics** — weekly revenue (online + physical + combined), order counts, avg order value, pickup vs delivery split, top items chart, daily revenue bar chart (online vs physical)
- **Reports** — WhatsApp report, PDF download, CSV download — all supports today / last 7 days / last 30 days / custom date range

---

## Key Files

| File | Purpose |
|---|---|
| `lib/supabase.ts` | Supabase client via env vars |
| `lib/orderService.ts` | Saves orders, decrements inventory, auto sold out |
| `components/Menu.tsx` | Menu fetch, cart, drink lab, receipt modal |
| `components/GalleryPage.tsx` | Gallery fetched from Supabase |
| `components/AdminPanel.tsx` | Full admin panel — all tabs |
| `App.tsx` | Admin route via `window.location.hash === '#admin'` |

---

## Admin Route

The admin panel renders standalone via a hash check in `App.tsx`:

```typescript
if (window.location.hash === '#admin') return <AdminPanel />;
```

This bypasses the main Navbar entirely to avoid z-index conflicts.

---

## Setup & Installation

```bash
# Clone the repository
git clone https://github.com/Estebanmarias/REEPLAY-LOUNGE-CLUB

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## Pending

- Events page wired to Supabase on frontend
- Skeleton loaders
- Active order pulsing in order history
- Item search category label
- PWA offline support + install prompt
- Table ordering (dine-in flow)
- Promo codes / discount system
- Toast on add to cart
- Scroll to top on page change
- WhatsApp auto-message on new order

---

© 2026 Reeplay Lounge & Club. Developed by Babatunde Stephen Olawale.