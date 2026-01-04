import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flame, Wine, Utensils, Crown, GlassWater, Plus, Minus, ShoppingBag, X, Receipt, Copy, Check, ExternalLink, Trash2, MapPin, Clock, Bike, History, Calendar, FileText, MessageSquare } from 'lucide-react';

// --- Types ---
interface MenuItem {
  name: string;
  desc: string;
  price: string;
}

interface CartItem extends MenuItem {
  priceRaw: number;
  quantity: number;
}

interface MenuProps {
  onBack: () => void;
}

type OrderType = 'pickup' | 'delivery';

interface PastOrder {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  type: OrderType;
  details: string;
}

// --- Constants & Data ---
const IG_DM_LINK = "https://ig.me/m/reeplaylounge_ogbomoso"; 
const VAT_RATE = 0.075; // 7.5%

// Receipt Info
const RECEIPT_INFO = {
  name: "Reeplay Lounge",
  address1: "Triple SK World",
  address2: "Opp. Alari Akata",
  address3: "Under G, Ogbomoso, OYO State",
  tel: "09060621425",
  email: "reeplaylounge@gmail.com"
};

const EXTRAS = {
  container: { name: "Plastic Container", desc: "Packaging", price: "₦500" },
  bag: { name: "Paper Bag", desc: "Packaging", price: "₦1000" }
};

const DELIVERY_ZONES = [
  { id: 'under_g', label: 'Under G Area', price: 500 },
  { id: 'lautech', label: 'Lautech Main Campus', price: 700 },
  { id: 'town', label: 'Ogbomoso Town', price: 1000 },
  { id: 'outskirts', label: 'Outskirts / Far', price: 2000 },
];

const CATEGORIES = [
  { id: 'kitchen', label: 'Main Kitchen', icon: Utensils },
  { id: 'sides', label: 'Proteins & Sides', icon: Flame },
  { id: 'cocktails', label: 'Cocktails & Shakes', icon: Wine },
  { id: 'bottles', label: 'Bottle Service', icon: Crown },
  { id: 'beverages', label: 'Beer & Drinks', icon: GlassWater },
];

const MENU_ITEMS: Record<string, Array<MenuItem>> = {
  kitchen: [
    { name: "Jollof Rice", desc: "Classic smoky West African rice cooked in tomato and pepper base with aromatic spice.", price: "₦4,500" },
    { name: "Native Rice", desc: "Palm oil rice with local spices, herbs, smoked catfish, beef and crayfish.", price: "₦4,500" },
    { name: "Pineapple Rice", desc: "Sweet and savory rice infused with fresh pineapple chunks, shredded chicken, mushroom.", price: "₦5,000" },
    { name: "Chinese Rice", desc: "Light stir-fried Basmati rice with vegetables, oriental seasoning, shredded chicken, scrambled egg.", price: "₦4,500" },
    { name: "Steamed Rice & Chicken Sauce", desc: "Fluffy steamed rice served with tender chicken in rich sauce.", price: "₦5,500" },
    { name: "Steamed Rice & Beef Sauce", desc: "Steamed rice paired with savory beef sauce.", price: "₦5,500" },
    { name: "Ofada Rice with Sauce", desc: "Traditional Nigerian rice served with spicy ofada sauce, assorted meat, egg and fried plantain.", price: "₦7,000" },
    { name: "Smokey Asun Rice", desc: "Rice infused with peppered grilled goat meat (asun).", price: "₦6,000" },
    { name: "Suya Rice", desc: "Delicious rice blended with suya-seasoned beef and spices.", price: "₦6,000" },
    { name: "Creamy Chicken Alfredo", desc: "Rich pasta tossed in smooth, creamy alfredo sauce with shredded chicken, parmesan and fresh herb.", price: "₦6,000" },
    { name: "Meat Ball Pasta", desc: "Rich pasta tossed in tomato sauce and minced beef.", price: "₦5,000" },
    { name: "Native Pasta", desc: "Local-style pasta cooked with peppers, onions, shredded beef, cow skin and smoked fish.", price: "₦4,000" },
    { name: "Stir-Fry Pasta", desc: "Colorful stir-fried pasta with veggies, shredded chicken, mushroom, shrimps.", price: "₦4,000" },
    { name: "Macaroni Sauté", desc: "Simple sautéed macaroni with light seasoning.", price: "₦3,000" },
    { name: "Native Noodles", desc: "Boldly spiced local-style noodles.", price: "₦3,500" },
    { name: "Noodles & Egg", desc: "Classic noodles served with boiled or fried egg.", price: "₦3,000" },
  ],
  sides: [
    { name: "Gizdodo", desc: "A mix of fried plantain and gizzard in spicy sauce.", price: "₦4,000" },
    { name: "Pepper Chicken", desc: "Juicy chicken tossed in peppery seasoning.", price: "₦4,000" },
    { name: "Pepper Turkey", desc: "Spicy turkey wings in rich pepper sauce.", price: "₦5,000" },
    { name: "Catfish Pepper Soup", desc: "Light and spicy broth with fresh catfish.", price: "₦6,000" },
    { name: "Goat Meat Pepper Soup", desc: "Traditional spicy goat meat soup.", price: "₦4,000" },
    { name: "Goat Meat Asun", desc: "Peppered grilled goat meat, smoky and tasty.", price: "₦4,000" },
    { name: "Spicy Snail", desc: "Tender snail cooked in hot pepper sauce.", price: "₦6,000" },
    { name: "Honey Gizzed Wings", desc: "Crispy chicken wings glazed with honey and spices.", price: "₦3,000" },
    { name: "Classic Chicken Shawarma", desc: "Grilled chicken wrapped in soft bread with fresh veggies and creamy sauce.", price: "₦3,700" },
    { name: "Suya Shawarma", desc: "Tender beef suya slices, suya spice, cabbage, carrots, and creamy sauce.", price: "₦5,000" },
    { name: "Small Chops", desc: "Assorted finger foods: samosas, puff-puff, spring rolls.", price: "₦4,000" },
    { name: "Potato Chips", desc: "Crispy fried potato fries.", price: "₦2,000" },
    { name: "Yam Chips", desc: "Crunchy fried yam sticks.", price: "₦1,500" },
    { name: "Fried Plantain", desc: "Sweet golden plantain slices.", price: "₦1,000" },
  ],
  cocktails: [
    { name: "Long Island Iced Tea", desc: "Powerful mix of vodka, tequila, white rum, gin, Cointreau, lemon, syrup, soda.", price: "₦7,500" },
    { name: "Blue Chill", desc: "Tropical blend of pineapple juice, coconut liqueur, vodka, and blue curacao.", price: "₦6,500" },
    { name: "Daiquiri (Classic/Strawberry)", desc: "White rum, triple sec, and fresh lime juice (Strawberry fruit added).", price: "₦6,500" },
    { name: "Killing Me Softly", desc: "Orange, pineapple, passion juices mixed with vodka, white rum, hint of lime.", price: "₦5,500" },
    { name: "Bubbles Delight", desc: "Orange juice, pineapple juice, white rum, vodka, bubble gum syrup.", price: "₦5,500" },
    { name: "Screaming Orgasm", desc: "Indulgent mix of Irish cream, coffee liqueur, amaretto, vodka, and milk.", price: "₦6,500" },
    { name: "Sex on the Beach", desc: "Orange juice, peach schnapps, vodka, and cranberry juice.", price: "₦6,000" },
    { name: "Tequila Sunrise", desc: "Orange juice, tequila, grenadine, fresh lime.", price: "₦6,000" },
    { name: "Margarita", desc: "Classic blend of tequila, triple sec, and freshly squeezed lime juice.", price: "₦5,000" },
    { name: "Oreo Cookies & Cream", desc: "Oreo cookies blended with vanilla ice cream and milk.", price: "₦7,500" },
    { name: "Coffee Baileys Island", desc: "Irish cream, coffee liqueur, vodka, vanilla ice cream.", price: "₦7,500" },
    { name: "Milkshakes", desc: "Choice of Vanilla, Chocolate, or Strawberry.", price: "₦6,500" },
    { name: "Chapman (Mocktail)", desc: "Soda, bitters, citrus, and grenadine.", price: "₦4,000" },
    { name: "Pop Lola", desc: "A vibrant, fruity blend with a fizzy twist.", price: "₦4,000" },
    { name: "Rack of 6 Sierra Shots", desc: "Six crisp Sierra tequila shots served in style.", price: "₦12,000" },
  ],
  bottles: [
    { name: "Ace of Spades", desc: "Champagne.", price: "₦900,000" },
    { name: "Dom Pérignon", desc: "Champagne.", price: "₦700,000" },
    { name: "Don Julio", desc: "Tequila.", price: "₦750,000" },
    { name: "Clase Azul Reposado", desc: "Tequila.", price: "₦600,000" },
    { name: "Casamigos", desc: "Tequila.", price: "₦300,000" },
    { name: "Hennessy XO", desc: "Cognac.", price: "₦600,000" },
    { name: "Hennessy VSOP", desc: "Cognac.", price: "₦170,000" },
    { name: "Hennessy VS", desc: "Cognac.", price: "₦100,000" },
    { name: "Glenfiddich (12 Years)", desc: "Whisky.", price: "₦90,000" },
    { name: "Jameson Black Barrel", desc: "Whisky.", price: "₦75,000" },
    { name: "Jack Daniel's", desc: "Whisky.", price: "₦55,000" },
    { name: "Ciroc", desc: "Vodka.", price: "₦65,000" },
    { name: "Azul (Olmeca)", desc: "Tequila.", price: "₦60,000" },
    { name: "Baileys Original", desc: "Irish Cream.", price: "₦45,000" },
    { name: "Carlo Rossi", desc: "Red/White Wine.", price: "₦30,000" },
    { name: "Four Cousins", desc: "Red/White Wine.", price: "₦20,000" },
  ],
  beverages: [
    { name: "Cranberry (Pack)", desc: "Juice.", price: "₦12,000" },
    { name: "Cranberry (Can)", desc: "Juice.", price: "₦3,000" },
    { name: "Budweiser / Heineken", desc: "Beer.", price: "₦2,000" },
    { name: "Guinness Stout", desc: "Beer.", price: "₦2,000" },
    { name: "Desperado", desc: "Beer.", price: "₦2,000" },
    { name: "Goldberg / 33 Export", desc: "Beer.", price: "₦1,500" },
    { name: "Legend Stout", desc: "Beer.", price: "₦1,500" },
    { name: "Monster / Climax", desc: "Energy Drink.", price: "₦2,000" },
    { name: "Soft Drinks", desc: "Pet Bottle.", price: "₦700" },
    { name: "Table Water", desc: "Bottle.", price: "₦500" },
  ]
};

// Helper: Parse currency string to number
const parsePrice = (priceStr: string) => {
  return parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
};

// Helper: Format number back to currency
const formatPrice = (price: number) => {
  return "₦" + price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

// --- Child Components ---

const MenuItemCard: React.FC<{
  item: MenuItem;
  categoryId: string;
  index: number;
  onAdd: (item: MenuItem, categoryId: string) => void;
}> = ({ item, categoryId, index, onAdd }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [showParticle, setShowParticle] = useState(false);

  const handleAdd = () => {
    onAdd(item, categoryId);
    setIsAdded(true);
    setShowParticle(true);
    
    // Reset added state
    setTimeout(() => setIsAdded(false), 1000);
    // Reset particle state
    setTimeout(() => setShowParticle(false), 800);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: isAdded ? 1.02 : 1,
        borderColor: isAdded ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.1)',
        backgroundColor: isAdded ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)'
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="group relative overflow-hidden p-6 rounded-2xl backdrop-blur-md border hover:border-purple-500/50 hover:bg-black/60 transition-colors flex flex-col justify-between"
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
            {item.name}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {item.desc}
          </p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-lg md:text-xl font-black text-yellow-500 font-mono">
            {item.price}
          </span>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleAdd}
        className={`self-end mt-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 text-white relative
          ${isAdded 
            ? 'bg-green-600 shadow-[0_0_15px_rgba(22,163,74,0.4)]' 
            : 'bg-white/10 hover:bg-purple-600'
          }
        `}
      >
        <AnimatePresence mode="wait">
          {isAdded ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
            >
              <Check className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="plus"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Plus className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="min-w-[5.5rem] text-center">
          {isAdded ? "Added" : "Add to Order"}
        </span>

        {/* Floating Particle */}
        <AnimatePresence>
          {showParticle && (
            <motion.div
              initial={{ opacity: 0, y: 0, x: 0 }}
              animate={{ opacity: 1, y: -40, x: 20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute right-0 bottom-full mb-1 text-green-400 font-bold text-lg pointer-events-none whitespace-nowrap"
            >
              +1
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-purple-500 to-yellow-500 transition-all duration-500 group-hover:w-full" />
    </motion.div>
  );
};

// --- Main Component ---

const Menu: React.FC<MenuProps> = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState('kitchen');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [history, setHistory] = useState<PastOrder[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  // New States for Order Method
  const [orderType, setOrderType] = useState<OrderType>('pickup');
  const [address, setAddress] = useState('');
  const [deliveryZoneId, setDeliveryZoneId] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Confirmation state
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem('reeplay_orders');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Generate a random Order ID when receipt opens
  useEffect(() => {
    if (isReceiptOpen && !orderId) {
      setOrderId('#' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
    }
  }, [isReceiptOpen, orderId]);

  const addToCart = (item: MenuItem, categoryId: string) => {
    setCart(prev => {
      let newCart = [...prev];
      
      // 1. Add Main Item
      const existingItem = newCart.find(i => i.name === item.name);
      if (existingItem) {
        newCart = newCart.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        newCart.push({ ...item, priceRaw: parsePrice(item.price), quantity: 1 });
      }

      // 2. Logic for Automatic Container (Kitchen/Sides)
      if (categoryId === 'kitchen' || categoryId === 'sides') {
        const containerItem = EXTRAS.container;
        const existingContainer = newCart.find(i => i.name === containerItem.name);
        if (existingContainer) {
          newCart = newCart.map(i => i.name === containerItem.name ? { ...i, quantity: i.quantity + 1 } : i);
        } else {
          newCart.push({ ...containerItem, priceRaw: parsePrice(containerItem.price), quantity: 1 });
        }
      }

      // 3. Logic for Automatic Bag (If not exists and cart was previously empty or just starting)
      // Actually, just check if bag exists, if not add it.
      const bagItem = EXTRAS.bag;
      const existingBag = newCart.find(i => i.name === bagItem.name);
      if (!existingBag) {
        newCart.push({ ...bagItem, priceRaw: parsePrice(bagItem.price), quantity: 1 });
      }

      return newCart;
    });
  };

  const confirmRemoveItem = () => {
    if (itemToRemove) {
      setCart(prev => prev.filter(i => i.name !== itemToRemove));
      setItemToRemove(null);
    }
  };

  const updateQuantity = (itemName: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.name === itemName) {
        return { ...i, quantity: Math.max(1, i.quantity + delta) };
      }
      return i;
    }));
  };

  const deliveryFee = useMemo(() => {
    if (orderType === 'pickup') return 0;
    const zone = DELIVERY_ZONES.find(z => z.id === deliveryZoneId);
    return zone ? zone.price : 0;
  }, [orderType, deliveryZoneId]);

  const cartSubTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.priceRaw * item.quantity), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const vatAmount = useMemo(() => {
    return cartSubTotal * VAT_RATE;
  }, [cartSubTotal]);

  const finalTotal = useMemo(() => {
    return cartSubTotal + vatAmount + deliveryFee;
  }, [cartSubTotal, vatAmount, deliveryFee]);

  const handlePreviewClick = () => {
    setErrorMsg('');
    if (orderType === 'pickup' && !pickupTime) {
      setErrorMsg('Please select a pickup time.');
      return;
    }
    if (orderType === 'delivery') {
      if (!deliveryZoneId) {
        setErrorMsg('Please select a delivery zone.');
        return;
      }
      if (!address.trim()) {
        setErrorMsg('Please enter a delivery address.');
        return;
      }
    }
    setIsCartOpen(false);
    setIsPreviewOpen(true);
  };

  const handleConfirmOrder = () => {
    setIsPreviewOpen(false);
    setIsReceiptOpen(true);
  };

  const generateOrderSummary = () => {
    const zoneLabel = DELIVERY_ZONES.find(z => z.id === deliveryZoneId)?.label;
    const lines = [
      `Order ${orderId} - Reeplay Lounge`,
      `Date: ${new Date().toLocaleString()}`,
      `Type: ${orderType.toUpperCase()}`,
      orderType === 'pickup' ? `Pickup Time: ${pickupTime}` : `Delivery: ${zoneLabel} - ${address}`,
      specialRequest ? `Note: ${specialRequest}` : '',
      `----------------`,
      ...cart.map(item => `- ${item.name} x${item.quantity} (${formatPrice(item.priceRaw * item.quantity)})`),
      `----------------`,
      `Subtotal: ${formatPrice(cartSubTotal)}`,
      `VAT (7.5%): ${formatPrice(vatAmount)}`,
      orderType === 'delivery' ? `Delivery Fee: ${formatPrice(deliveryFee)}` : null,
      `TOTAL: ${formatPrice(finalTotal)}`
    ];
    return lines.filter(l => l).join('\n');
  };

  const handleCopyToClipboard = () => {
    const summary = generateOrderSummary();
    const zoneLabel = DELIVERY_ZONES.find(z => z.id === deliveryZoneId)?.label;
    
    // Save to History
    const exists = history.some(o => o.id === orderId);
    if (!exists) {
      const newOrder: PastOrder = {
        id: orderId,
        date: new Date().toISOString(),
        items: [...cart],
        total: finalTotal, // Save the final total with VAT
        type: orderType,
        details: orderType === 'pickup' ? pickupTime : `${zoneLabel} - ${address}`
      };
      const newHistory = [newOrder, ...history];
      setHistory(newHistory);
      localStorage.setItem('reeplay_orders', JSON.stringify(newHistory));
    }

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Slight delay to allow UI feedback before opening new tab
      setTimeout(() => {
        window.open(IG_DM_LINK, '_blank');
      }, 800);
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="relative min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto z-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4 self-start md:self-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <div className="p-2 rounded-full bg-white/10 group-hover:bg-purple-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium hidden md:inline">Back</span>
          </button>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
             <div className="p-2 rounded-full bg-white/10 group-hover:bg-yellow-600 transition-colors">
              <History className="w-5 h-5" />
            </div>
            <span className="font-medium">History</span>
          </button>
        </div>

        <div className="text-left md:text-right">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            OUR MENU
          </h1>
          <p className="text-gray-300 mt-2 text-lg">Taste the vibe of Ogbomosho</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto pb-4 gap-4 mb-8 no-scrollbar sticky top-20 z-30 bg-black/80 backdrop-blur-md py-4 -mx-4 px-4 md:bg-transparent md:backdrop-filter-none md:static md:p-0 md:overflow-visible">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap transition-all duration-300 border
                ${isActive 
                  ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30'}
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span className="font-bold tracking-wide">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-24">
        <AnimatePresence mode="popLayout">
          {MENU_ITEMS[activeCategory]?.map((item, index) => (
            <MenuItemCard 
              key={item.name + activeCategory}
              item={item}
              categoryId={activeCategory}
              index={index}
              onAdd={addToCart}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-purple-600 text-white p-4 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.6)] flex items-center justify-center hover:scale-110 transition-transform"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-3 -right-3 bg-yellow-500 text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-purple-600">
                {cartCount}
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#111] z-50 shadow-2xl border-l border-white/10 flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#111]">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-purple-500" />
                  Your Order
                </h2>
                <div className="flex items-center gap-3">
                    {cart.length > 0 && (
                        <button
                            onClick={() => setIsClearConfirmOpen(true)}
                            className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg transition-colors font-bold uppercase tracking-wider border border-red-500/20"
                        >
                            Clear
                        </button>
                    )}
                    <button 
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                    <X className="w-6 h-6" />
                    </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-transparent">
                <div className="space-y-4 mb-8">
                  {cart.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Your cart is empty.</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.name} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="flex-1">
                          <h4 className="font-bold text-white">{item.name}</h4>
                          <p className="text-yellow-500 text-sm font-mono">{formatPrice(item.priceRaw)}</p>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1">
                          <button 
                            onClick={() => updateQuantity(item.name, -1)}
                            className="p-1 hover:text-purple-400 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.name, 1)}
                            className="p-1 hover:text-purple-400"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button 
                          onClick={() => setItemToRemove(item.name)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-500" /> Order Method
                    </h3>
                    
                    <div className="flex bg-white/5 p-1 rounded-lg mb-6">
                      <button
                        className={`flex-1 py-2.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${orderType === 'pickup' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => {
                          setOrderType('pickup');
                          setErrorMsg('');
                        }}
                      >
                        <Clock className="w-4 h-4" /> Pickup
                      </button>
                      <button
                        className={`flex-1 py-2.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${orderType === 'delivery' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => {
                          setOrderType('delivery');
                          setErrorMsg('');
                        }}
                      >
                        <Bike className="w-4 h-4" /> Delivery
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {orderType === 'pickup' ? (
                        <motion.div
                          key="pickup"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 mb-6"
                        >
                          <label className="text-xs text-gray-400 uppercase font-bold ml-1">Select Pickup Time</label>
                          <div className="relative">
                            <input
                              type="time"
                              value={pickupTime}
                              onChange={(e) => {
                                setPickupTime(e.target.value);
                                setErrorMsg('');
                              }}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors appearance-none"
                            />
                            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                          </div>
                          <p className="text-xs text-yellow-500/80 italic leading-relaxed pt-2">
                            Note: Menu items are pre-ordered so it will be ready after 45 mins depending on the type of order.
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="delivery"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 mb-6"
                        >
                          <div className="space-y-2">
                            <label className="text-xs text-gray-400 uppercase font-bold ml-1">Delivery Zone</label>
                            <select
                                value={deliveryZoneId}
                                onChange={(e) => setDeliveryZoneId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors appearance-none"
                            >
                                <option value="" disabled className="bg-black">Select a zone...</option>
                                {DELIVERY_ZONES.map(zone => (
                                    <option key={zone.id} value={zone.id} className="bg-black">
                                        {zone.label} - {formatPrice(zone.price)}
                                    </option>
                                ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs text-gray-400 uppercase font-bold ml-1">Delivery Address</label>
                            <textarea
                              value={address}
                              onChange={(e) => {
                                setAddress(e.target.value);
                                setErrorMsg('');
                              }}
                              placeholder="Street, Building, Apartment..."
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors min-h-[100px] resize-none"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {errorMsg && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mb-4 text-center font-medium bg-red-400/10 py-2 rounded-lg"
                      >
                        {errorMsg}
                      </motion.p>
                    )}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-[#111]">
                   <div className="space-y-2 mb-6">
                      <div className="flex justify-between items-center text-sm text-gray-400">
                          <span>Subtotal</span>
                          <span>{formatPrice(cartSubTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-400">
                          <span>VAT (7.5%)</span>
                          <span>{formatPrice(vatAmount)}</span>
                      </div>
                      {orderType === 'delivery' && deliveryFee > 0 && (
                        <div className="flex justify-between items-center text-sm text-green-400">
                            <span>Delivery Fee</span>
                            <span>{formatPrice(deliveryFee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-4 border-t border-white/10">
                          <span className="text-gray-200">Total</span>
                          <span className="text-2xl font-black text-white">{formatPrice(finalTotal)}</span>
                      </div>
                  </div>
                  <button
                    onClick={handlePreviewClick}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/20"
                  >
                    Preview Order <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
             <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-[#161616] border border-white/10 rounded-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Order Preview</h2>
                  <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                   <div className="space-y-4 mb-6">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="flex items-start gap-3 mb-2">
                           <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                             {orderType === 'pickup' ? <Clock className="w-5 h-5"/> : <Bike className="w-5 h-5"/>}
                           </div>
                           <div>
                             <h4 className="font-bold text-white capitalize">{orderType} Order</h4>
                             <p className="text-sm text-gray-400">
                                {orderType === 'pickup' 
                                    ? `Pickup at ${pickupTime}` 
                                    : `${DELIVERY_ZONES.find(z => z.id === deliveryZoneId)?.label} - ${address}`
                                }
                             </p>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm uppercase text-gray-500 font-bold tracking-wider">Items</h4>
                        {cart.map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-white/5 last:border-0">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded text-xs">{item.quantity}x</span>
                                <span className="text-gray-300">{item.name}</span>
                              </div>
                              <span className="text-gray-400 font-mono">{formatPrice(item.priceRaw * item.quantity)}</span>
                           </div>
                        ))}
                      </div>
                   </div>

                   <div className="space-y-2 mb-6">
                      <label className="text-sm uppercase text-gray-500 font-bold tracking-wider flex items-center gap-2">
                         <MessageSquare className="w-4 h-4" /> Special Request
                      </label>
                      <textarea 
                        value={specialRequest}
                        onChange={(e) => setSpecialRequest(e.target.value)}
                        placeholder="Allergies, extra spicy, no cutlery..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-purple-500 outline-none transition-colors min-h-[80px] resize-none"
                      />
                   </div>
                </div>

                <div className="p-6 bg-[#111] border-t border-white/10">
                   <div className="flex justify-between items-center mb-2 text-gray-400">
                     <span>Subtotal</span>
                     <span>{formatPrice(cartSubTotal)}</span>
                   </div>
                   <div className="flex justify-between items-center mb-2 text-gray-400">
                     <span>VAT (7.5%)</span>
                     <span>{formatPrice(vatAmount)}</span>
                   </div>
                   {orderType === 'delivery' && deliveryFee > 0 && (
                        <div className="flex justify-between items-center mb-4 text-green-400">
                            <span>Delivery Fee</span>
                            <span>{formatPrice(deliveryFee)}</span>
                        </div>
                    )}
                   <div className="flex justify-between items-center mb-6 pt-4 border-t border-white/10">
                     <span className="text-xl font-bold text-white">Total</span>
                     <span className="text-2xl font-black text-yellow-500">{formatPrice(finalTotal)}</span>
                   </div>
                   <button 
                     onClick={handleConfirmOrder}
                     className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
                   >
                     Confirm & Generate Receipt <FileText className="w-5 h-5" />
                   </button>
                </div>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {itemToRemove && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={() => setItemToRemove(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111] border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center"
            >
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                 <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Remove Item?</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to remove <span className="text-white font-bold">{itemToRemove}</span> from your cart?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setItemToRemove(null)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRemoveItem}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Cart Confirmation Dialog */}
      <AnimatePresence>
        {isClearConfirmOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={() => setIsClearConfirmOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111] border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center"
            >
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                 <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Clear Cart?</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to remove all items from your order?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsClearConfirmOpen(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                      setCart([]);
                      setIsClearConfirmOpen(false);
                      setIsCartOpen(false);
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsHistoryOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
              >
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <History className="w-6 h-6 text-yellow-500" /> Past Orders
                  </h2>
                  <button 
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700">
                  {history.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>No past orders found.</p>
                      <p className="text-sm mt-1">Your successful orders will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {history.map((order) => (
                        <div key={order.id} className="bg-white/5 border border-white/5 rounded-xl p-5 hover:bg-white/10 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-white text-lg">{order.id}</h3>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${order.type === 'pickup' ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-blue-500 text-blue-400 bg-blue-500/10'}`}>
                                  {order.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Calendar className="w-3 h-3" />
                                {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            <span className="text-xl font-bold text-yellow-500 font-mono">
                              {formatPrice(order.total)}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            {order.items.map((item, idx) => (
                              <div key={`${order.id}-${idx}`} className="flex justify-between text-sm text-gray-300 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                <span>{item.quantity}x {item.name}</span>
                                <span className="text-gray-500">{formatPrice(item.priceRaw * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="pt-3 border-t border-white/10 text-xs text-gray-400 flex items-center gap-2">
                             {order.type === 'pickup' ? <Clock className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                             <span className="truncate max-w-full">{order.details}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Receipt Modal - The Main Receipt Design */}
      <AnimatePresence>
        {isReceiptOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[80] flex items-center justify-center p-4"
              onClick={() => setIsReceiptOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-[#EEE] text-black shadow-2xl overflow-hidden relative font-mono text-sm leading-tight"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                {/* Receipt Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-1 tracking-tighter uppercase">{RECEIPT_INFO.name}</h2>
                        <p className="text-xs">{RECEIPT_INFO.address1}</p>
                        <p className="text-xs">{RECEIPT_INFO.address2}</p>
                        <p className="text-xs">{RECEIPT_INFO.address3}</p>
                        <p className="text-xs mt-1">Tel: {RECEIPT_INFO.tel}</p>
                        <p className="text-xs">{RECEIPT_INFO.email}</p>
                    </div>

                    {/* Meta Data */}
                    <div className="border-b border-black/20 pb-2 mb-2">
                        <div className="flex justify-between text-xs mb-1">
                            <span>Copy - Order Details</span>
                            <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>(Inc Tax)</span>
                            <span>{orderId.replace('#', '')} - est</span>
                        </div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Tab</span>
                            <span className="uppercase">{orderType === 'pickup' ? 'ONLINE' : 'DELIVERY'}</span>
                        </div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Staff</span>
                            <span>Till 1</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span>Device</span>
                            <span>Web</span>
                        </div>
                    </div>

                    {/* Table Headers */}
                    <div className="flex justify-between border-t border-b border-black py-1 mb-2 text-xs font-bold uppercase">
                        <span className="w-1/2">Product</span>
                        <span className="w-1/6 text-right">Price</span>
                        <span className="w-1/6 text-right">Qty</span>
                        <span className="w-1/6 text-right">Total</span>
                    </div>

                    {/* Items */}
                    <div className="mb-4 space-y-1">
                        {cart.map((item, idx) => (
                             <div key={idx} className="flex justify-between text-xs">
                                <span className="w-1/2 uppercase truncate pr-1">{item.name}</span>
                                <span className="w-1/6 text-right">{item.priceRaw}</span>
                                <span className="w-1/6 text-right">{item.quantity}</span>
                                <span className="w-1/6 text-right">{item.priceRaw * item.quantity}</span>
                            </div>
                        ))}
                        <div className="flex justify-between text-xs font-bold pt-1">
                            <span className="w-1/2">Total Qty</span>
                            <span className="w-1/2 text-right">{cartCount}</span>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-black pt-2 space-y-1 mb-6">
                        <div className="flex justify-between">
                            <span>Sub Total</span>
                            <span>{formatPrice(cartSubTotal).replace('₦', '₦')}</span>
                        </div>
                         <div className="flex justify-between">
                            <span>VAT (7.5%)</span>
                            <span>{formatPrice(vatAmount).replace('₦', '₦')}</span>
                        </div>
                        {orderType === 'delivery' && deliveryFee > 0 && (
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>{formatPrice(deliveryFee).replace('₦', '₦')}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg mt-2">
                            <span>Amount Due</span>
                            <span>{formatPrice(finalTotal).replace('₦', '₦')}</span>
                        </div>
                         {specialRequest && (
                           <div className="mt-2 pt-2 border-t border-dashed border-gray-400 text-xs italic">
                              Note: {specialRequest}
                           </div>
                         )}
                    </div>

                    {/* Footer */}
                    <div className="text-center">
                        <p className="font-bold mb-4">The Coolest Place to be!</p>
                        {/* Fake Barcode */}
                        <div className="h-12 w-full bg-[linear-gradient(90deg,black_1px,transparent_0,transparent_2px,black_3px,black_4px,transparent_0,transparent_6px,black_7px,transparent_0,transparent_9px,black_10px)] opacity-80 mb-1"></div>
                        <p className="text-[10px] tracking-widest">{`REC${orderId.replace('#', '')}ASJLAYQQ3KG3K`}</p>
                    </div>
                </div>

                {/* Actions (Outside receipt styling) */}
                <div className="bg-gray-900 text-white p-4">
                  <button
                    onClick={handleCopyToClipboard}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded flex items-center justify-center gap-2 transition-all"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? "Copied! Opening Instagram..." : "Send Order to Instagram"}
                    {!copied && <ExternalLink className="w-4 h-4 ml-1" />}
                  </button>
                  <button
                    onClick={() => setIsReceiptOpen(false)}
                    className="w-full py-2 bg-transparent hover:bg-white/10 text-gray-400 hover:text-white text-sm font-medium rounded transition-colors mt-2"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default Menu;