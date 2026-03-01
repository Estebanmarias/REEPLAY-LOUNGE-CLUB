import { usePaystackPayment } from 'react-paystack';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flame, Wine, Utensils, Crown, GlassWater, Plus, Minus, ShoppingBag, X, Search, ChevronRight, Loader2, Trash2, MapPin, Clock, CheckCircle, History, ChefHat, Bike, CheckCheck, ArrowRight, ChevronDown, Wand2, Instagram, MessageCircle, PackageOpen, ToggleLeft, ToggleRight, User, Copy, Share, ExternalLink, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { orderService, PastOrder, CartItem } from '../lib/orderService';
import MenuBackground from './MenuBackground';
import PromoCarousel from './PromoCarousel';
import NoticeBanner from './NoticeBanner';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

// --- Types ---
interface MenuItem {
  name: string;
  desc: string;
  price: string;
  isSoldOut?: boolean;
}

interface MenuItemExtended extends MenuItem {
  categoryId: string;
}

interface CartItemExtended extends MenuItem {
  priceRaw: number;
  quantity: number;
  modifiers?: string[];
  categoryId: string; 
}

interface MenuProps {
  onBack: () => void;
  theme: 'dark' | 'light';
}

type OrderType = 'pickup' | 'delivery';
type CartView = 'items' | 'checkout';

interface ConfirmAction {
  type: 'clear' | 'remove';
  itemIndex?: number;
}

// --- Constants & Data ---
const IG_DM_LINK = "https://ig.me/m/reeplaylounge_ogbomoso"; 
const WHATSAPP_PHONE = "2349060621425";
const VAT_RATE = 0.075; 
const PAPER_BAG_PRICE = 1000;
const CONTAINER_PRICE = 500;

// Items that generally don't need a plastic container (wrapped in foil/paper instead)
const NO_CONTAINER_KEYWORDS = ['shawarma', 'spring roll', 'samosa', 'puff', 'chops', 'mosaic'];

const KITCHEN_ADDONS = [
  { id: 'plantain', name: 'Fried Plantain', price: 1000 },
  { id: 'coleslaw', name: 'Coleslaw', price: 500 },
  { id: 'egg', name: 'Boiled Egg', price: 1500 },
  { id: 'beef', name: 'Extra Beef', price: 2000 },
  { id: 'chicken', name: 'Extra Chicken', price: 3000 },
  { id: 'turkey', name: 'Fried Turkey', price: 5000 },
];

const EXTRAS = {
  container: { name: "Plastic Container", desc: "Packaging", price: "₦500" },
  bag: { name: "Paper Bag", desc: "Packaging", price: "₦1000" }
};

const DELIVERY_ZONES = [
  { id: 'select', label: 'Select Area...', price: 0 },
  { id: 'under_g', label: 'Under G Area', price: 500 },
  { id: 'lautech', label: 'Lautech Main Campus', price: 700 },
  { id: 'town', label: 'Ogbomoso Town', price: 1000 },
  { id: 'outskirts', label: 'Outskirts / Far', price: 2000 },
];

// DRINK BUILDER DATA
const BUILDER_DATA = {
  spirits: [
    { id: 'vodka', name: 'Vodka', price: 3000, color: 'bg-blue-600' },
    { id: 'gin', name: 'Dry Gin', price: 3000, color: 'bg-green-600' },
    { id: 'white_rum', name: 'White Rum', price: 3000, color: 'bg-yellow-600' },
    { id: 'dark_rum', name: 'Dark Rum', price: 3500, color: 'bg-amber-800' },
    { id: 'tequila', name: 'Tequila', price: 4000, color: 'bg-orange-600' },
    { id: 'whiskey', name: 'Whiskey', price: 4000, color: 'bg-amber-900' },
    { id: 'brandy', name: 'Brandy', price: 3500, color: 'bg-red-800' },
  ],
  mixers: [
    { id: 'coke', name: 'Coca Cola', price: 500 },
    { id: 'sprite', name: 'Sprite', price: 500 },
    { id: 'soda', name: 'Soda Water', price: 500 },
    { id: 'tonic', name: 'Tonic Water', price: 500 },
    { id: 'cranberry', name: 'Cranberry Juice', price: 1000 },
    { id: 'orange', name: 'Orange Juice', price: 1000 },
    { id: 'pineapple', name: 'Pineapple Juice', price: 1000 },
    { id: 'energy', name: 'Energy Drink', price: 1500 },
  ],
  garnishes: [
    { id: 'lime', name: 'Fresh Lime', price: 200 },
    { id: 'lemon', name: 'Lemon Slice', price: 200 },
    { id: 'mint', name: 'Mint Leaves', price: 200 },
    { id: 'ice', name: 'Extra Ice', price: 0 },
    { id: 'syrup', name: 'Grenadine Syrup', price: 500 },
    { id: 'salt', name: 'Salt Rim', price: 0 },
    { id: 'sugar', name: 'Sugar Rim', price: 0 },
  ]
};

const CATEGORIES = [
  { id: 'rice', label: 'Rice Specialties', icon: Utensils },
  { id: 'pasta', label: 'Pasta & Noodles', icon: Utensils },
  { id: 'sides', label: 'Sides & Bites', icon: Flame },
  { id: 'cocktails', label: 'Cocktails & Shakes', icon: Wine },
  { id: 'bottles', label: 'Bottle Service', icon: Crown },
  { id: 'beverages', label: 'Beer & Drinks', icon: GlassWater },
];

const CUSTOMIZABLE_CATEGORIES = ['rice', 'pasta'];

const MENU_ITEMS: Record<string, Array<MenuItem>> = {
  rice: [
    { name: "Jollof Rice", desc: "Classic smoky West African rice cooked in tomato and pepper base.", price: "₦4,500" },
    { name: "Native Rice", desc: "Palm oil rice with local spices, herbs, smoked catfish, beef and crayfish.", price: "₦4,500" },
    { name: "Pineapple Rice", desc: "Sweet and savory rice infused with fresh pineapple chunks & shredded chicken.", price: "₦5,000" },
    { name: "Chinese Rice", desc: "Light stir-fried Basmati with vegetables and oriental seasoning.", price: "₦4,500" },
    { name: "Steamed Rice & Chicken Sauce", desc: "Fluffy steamed rice served with tender chicken in rich sauce.", price: "₦5,500" },
    { name: "Steamed Rice & Beef Sauce", desc: "Steamed rice paired with savory beef sauce.", price: "₦5,500" },
    { name: "Ofada Rice with Sauce", desc: "Traditional rice with spicy ofada sauce, assorted meat, egg & plantain.", price: "₦7,000" },
    { name: "Smokey Asun Rice", desc: "Rice infused with peppered grilled goat meat (asun).", price: "₦6,000" },
    { name: "Suya Rice", desc: "Delicious rice blended with suya-seasoned beef and spices.", price: "₦6,000" },
  ],
  pasta: [
    { name: "Creamy Chicken Alfredo", desc: "Rich pasta in smooth, creamy alfredo sauce with chicken.", price: "₦6,000" },
    { name: "Meat Ball Pasta", desc: "Pasta tossed in tomato sauce and minced beef.", price: "₦5,000" },
    { name: "Native Pasta", desc: "Local style pasta with peppers, onions, shredded beef & smoked fish.", price: "₦4,000" },
    { name: "Stir-Fry Pasta", desc: "Colorful pasta with veggies, chicken, mushroom & shrimps.", price: "₦4,000" },
    { name: "Macaroni Sauté", desc: "Simple sautéed macaroni with light seasoning.", price: "₦3,000" },
    { name: "Native Noodles", desc: "Boldly spiced local-style noodles.", price: "₦3,500" },
    { name: "Seasoned Noodles", desc: "Well-flavored noodles, simple yet satisfying.", price: "₦4,000" },
    { name: "Noodles & Egg", desc: "Classic noodles served with boiled or fried egg.", price: "₦3,000" },
  ],
  sides: [
    { name: "Chicken Shawarma", desc: "Spiced grilled chicken wrapped with creamy sauce.", price: "₦3,700" },
    { name: "Suya Shawarma", desc: "Tender beef suya slices rolled with veggies.", price: "₦5,000" },
    { name: "Gizdodo", desc: "Fried plantain and gizzard in spicy sauce.", price: "₦4,000" },
    { name: "Pepper Chicken", desc: "Juicy chicken tossed in peppery seasoning.", price: "₦4,000" },
    { name: "Pepper Turkey", desc: "Spicy turkey wings in rich pepper sauce.", price: "₦5,000" },
    { name: "Catfish Pepper Soup", desc: "Light and spicy broth with fresh catfish.", price: "₦6,000" },
    { name: "Goat Meat Pepper Soup", desc: "Traditional spicy goat meat soup.", price: "₦4,000" },
    { name: "Goat Meat Asun", desc: "Peppered grilled goat meat, smoky and tasty.", price: "₦4,000" },
    { name: "Spicy Snail", desc: "Tender snail cooked in hot pepper sauce.", price: "₦6,000" },
    { name: "Honey Gizzed Wings", desc: "Crispy chicken wings glazed with honey and spices.", price: "₦3,000" },
    { name: "Small Chops", desc: "Assorted finger foods: samosas, puff-puff, spring rolls.", price: "₦4,000" },
    { name: "Fried Plantain", desc: "Sweet golden plantain slices.", price: "₦1,000" },
    { name: "Potato Chips", desc: "Crispy fried potato fries.", price: "₦2,000" },
    { name: "Yam Chips", desc: "Crunchy fried yam sticks.", price: "₦1,500" },
    { name: "Fresh Salad", desc: "Healthy mix of fresh garden vegetables.", price: "₦1,500" },
    { name: "Boiled Egg", desc: "Simple boiled egg.", price: "₦1,500" },
    { name: "Sausage", desc: "Tasty sausage side.", price: "₦500" },
  ],
  cocktails: [
    { name: "Blue Chill", desc: "Pineapple juice, coconut liqueur, vodka, blue curaçao.", price: "₦6,500" },
    { name: "Bubbles Delight", desc: "Orange juice, pineapple juice, white rum, vodka, bubble gum.", price: "₦5,500" },
    { name: "Daiquiri (Classic/Strawberry)", desc: "Fruit, white rum, triple sec, lime juice.", price: "₦6,500" },
    { name: "Hawaii Blue", desc: "Pineapple juice, white rum, coconut cream, vodka, blue curaçao.", price: "₦4,500" },
    { name: "Killing Me Softly", desc: "Orange, pineapple, passion juices, vodka, white rum, lime.", price: "₦5,500" },
    { name: "Long Island", desc: "Vodka, tequila, rum, gin, cointreau, lemon juice, cola.", price: "₦7,500" },
    { name: "Margarita", desc: "Tequila, triple sec, fresh lime juice.", price: "₦5,000" },
    { name: "Pina Colada", desc: "Coconut cream, pineapple juice, coconut rum.", price: "₦5,000" },
    { name: "Reeplay Diva", desc: "Cranberry juice, vodka, grapefruit.", price: "₦5,000" },
    { name: "Screaming Orgasm", desc: "Irish cream, coffee liqueur, amaretto, vodka, milk.", price: "₦6,500" },
    { name: "Sex on the Beach", desc: "Orange juice, peach schnapps, vodka, cranberry juice.", price: "₦6,000" },
    { name: "Tequila Sunrise", desc: "Orange juice, tequila, grenadine.", price: "₦6,000" },
    { name: "Oreo Cookies & Cream", desc: "Oreo cookies blended with vanilla ice cream.", price: "₦7,500" },
    { name: "Coffee Baileys Island", desc: "Irish cream, coffee liqueur, vodka, vanilla ice cream.", price: "₦7,500" },
    { name: "Vanilla / Chocolate Shake", desc: "Classic ice cream shake.", price: "₦6,500" },
    { name: "Banana Smoothie", desc: "Ripe banana blended with plain yogurt and milk.", price: "₦5,500" },
    { name: "Frutizilous Smoothie", desc: "Apple, banana, pineapple, strawberry syrup.", price: "₦5,500" },
    { name: "Chapman", desc: "Iconic non-alcoholic cocktail.", price: "₦4,000" },
    { name: "Pop Lola", desc: "Vibrant fruity blend with a fizzy twist.", price: "₦4,000" },
    { name: "B-52 Shot", desc: "Coffee liqueur, Irish cream, Grand Marnier.", price: "₦4,000" },
    { name: "Tequila Shot", desc: "Classic Mexican ritual salt, tequila, lime.", price: "₦2,000" },
  ],
  bottles: [
    { name: "Ace of Spades", desc: "Champagne.", price: "₦900,000" },
    { name: "Dom Pérignon", desc: "Champagne.", price: "₦700,000" },
    { name: "Luc Belaire Rosé", desc: "Sparkling.", price: "₦100,000" },
    { name: "Hennessy XO", desc: "Cognac.", price: "₦600,000" },
    { name: "Hennessy VSOP", desc: "Cognac.", price: "₦170,000" },
    { name: "Martell VSOP", desc: "Cognac.", price: "₦145,000" },
    { name: "Hennessy VS", desc: "Cognac.", price: "₦100,000" },
    { name: "Glenfiddich 12Y", desc: "Single Malt.", price: "₦90,000" },
    { name: "Jameson Black Barrel", desc: "Irish Whiskey.", price: "₦75,000" },
    { name: "Johnnie Walker Black", desc: "Blended Scotch.", price: "₦70,000" },
    { name: "Jack Daniel's", desc: "Tennessee Whiskey.", price: "₦55,000" },
    { name: "Don Julio", desc: "Tequila.", price: "₦750,000" },
    { name: "Clase Azul Reposado", desc: "Premium Tequila.", price: "₦600,000" },
    { name: "Casamigos", desc: "Tequila.", price: "₦300,000" },
    { name: "Olmeca", desc: "Tequila.", price: "₦60,000" },
    { name: "Cîroc", desc: "Vodka.", price: "₦65,000" },
    { name: "Absolut Vodka", desc: "Vodka.", price: "₦45,000" },
    { name: "Baileys Original", desc: "Irish Cream.", price: "₦45,000" },
    { name: "Jagermeister", desc: "Liqueur.", price: "₦35,000" },
    { name: "Carlo Rossi", desc: "Red Wine.", price: "₦30,000" },
    { name: "Four Cousins", desc: "Red Wine.", price: "₦20,000" },
    { name: "André Rosé", desc: "Sparkling Wine.", price: "₦20,000" },
  ],
  beverages: [
    { name: "Desperado", desc: "Beer.", price: "₦2,000" },
    { name: "Budweiser", desc: "Beer.", price: "₦2,000" },
    { name: "Heineken", desc: "Beer.", price: "₦2,000" },
    { name: "Guinness Stout", desc: "Stout.", price: "₦2,000" },
    { name: "Goldberg", desc: "Beer.", price: "₦1,500" },
    { name: "Monster", desc: "Energy Drink.", price: "₦2,000" },
    { name: "Climax", desc: "Energy Drink.", price: "₦2,000" },
    { name: "Cranberry Juice", desc: "Pack.", price: "₦12,000" },
    { name: "Soft Drinks", desc: "Coke / Fanta / Sprite.", price: "₦700" },
    { name: "Table Water", desc: "Chilled.", price: "₦500" },
  ]
};

const parsePrice = (priceStr: string) => parseInt((priceStr || '0').replace(/[^0-9]/g, ''), 10);
const formatPrice = (price: number) => "₦" + price.toLocaleString();

const generateWhatsAppText = (order: PastOrder) => {
  const separator = "--------------------------------";
  const dateStr = new Date(order.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

  let lines = [
      `🧾 *REEPLAY LOUNGE ORDER*`,
      separator,
      `🆔 *Order:* ${order.id}`,
      `📅 *Date:* ${dateStr}`,
      separator,
      `👤 *Customer:* ${order.customerName}`,
      `📞 *Phone:* ${order.customerPhone}`,
      `🛵 *Type:* ${order.type.toUpperCase()}`,
  ];

  if (order.type === 'delivery') {
       lines.push(`📍 *Address:* ${order.details.split('(')[0].trim()}`);
  } else {
       lines.push(`⏰ *Time:* ${order.details.replace('Pickup: ', '')}`);
  }

  lines.push(separator);
  lines.push(`*ORDER SUMMARY*`);

  order.items.forEach(item => {
      // Improve readability of system items
      let itemName = item.name.replace("Plastic Container", "Container").replace("Paper Bag", "Bag");
      lines.push(`${item.quantity}x ${itemName}`);
      lines.push(`   @ ${formatPrice(item.priceRaw)} = ${formatPrice(item.priceRaw * item.quantity)}`);
  });

  if (order.specialRequests) {
      lines.push(separator);
      lines.push(`📝 *Note:* ${order.specialRequests}`);
  }

  lines.push(separator);
  lines.push(`💰 *TOTAL:* ............... ${formatPrice(order.total)}`);
  
  if (order.deliveryPin) {
      lines.push(separator);
      lines.push(`🔐 *PIN:* ${order.deliveryPin}`);
      lines.push(`(Show this PIN to the rider)`);
  }
  
  lines.push(separator);
  lines.push(`_Thank you for vibing with us!_`);

  return lines.join('\n');
};

const needsContainer = (itemName: string) => {
  return !NO_CONTAINER_KEYWORDS.some(keyword => itemName.toLowerCase().includes(keyword));
};

const MenuItemCard: React.FC<{
  item: MenuItem & { isSoldOut?: boolean };
  categoryId: string;
  quantityInCart: number;
  onAdd: (item: MenuItem, categoryId: string) => void;
  onUpdateQuantity: (item: MenuItem, delta: number, categoryId: string) => void;
  onOpenModal: (item: MenuItem) => void;
  theme: 'dark' | 'light';
}> = ({ item, categoryId, quantityInCart, onAdd, onUpdateQuantity, onOpenModal, theme }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleAddClick = () => {
    if (item.isSoldOut) return;
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        if (CUSTOMIZABLE_CATEGORIES.includes(categoryId)) { 
          onOpenModal(item); 
        } else {
          onAdd(item, categoryId);
          triggerFeedback();
        }
    }, 1000);
  };

  const triggerFeedback = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const isDark = theme === 'dark';
  const hasQuantity = quantityInCart > 0;

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden p-4 md:p-6 rounded-2xl transition-all flex flex-col justify-between group
        ${isDark 
          ? 'bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:bg-black/60 hover:border-purple-500/50' 
          : 'bg-white/80 backdrop-blur-xl border border-purple-200/50 shadow-lg shadow-purple-500/10 hover:bg-white/90 hover:shadow-purple-500/20'}
      `}
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
          {CATEGORIES.find(c => c.id === categoryId)?.label || categoryId}
         </span>
        </div>
<h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
        </div>
        <span className="text-lg font-black text-yellow-500 font-mono">{item.price}</span>
      </div>
      
      <div className="flex justify-end mt-2 relative items-center">
         <AnimatePresence>
            {isAdded && (
              <MotionDiv
                initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
                animate={{ opacity: 0, y: -100, x: 50, rotate: 12, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute right-0 top-0 pointer-events-none z-20"
              >
                <div className="p-2 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)]">
                   <ShoppingBag className="w-5 h-5 text-white" />
                </div>
              </MotionDiv>
            )}
         </AnimatePresence>

        {item.isSoldOut ? (
  <div className="px-5 py-2 rounded-lg text-sm font-bold bg-red-500/20 text-red-400 border border-red-500/30">
    Sold Out
  </div>
) : hasQuantity && !CUSTOMIZABLE_CATEGORIES.includes(categoryId) ? (
  <MotionDiv 
    initial={{ opacity: 0, scale: 0.8 }} 
    animate={{ opacity: 1, scale: 1 }}
    className="flex items-center gap-3 bg-purple-900/40 border border-purple-500/50 rounded-lg p-1"
  >
    <button 
      onClick={() => onUpdateQuantity(item, -1, categoryId)} 
      className="w-8 h-8 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
    >
      <Minus className="w-4 h-4" />
    </button>
    <span className="font-bold text-white w-4 text-center">{quantityInCart}</span>
    <button 
      onClick={() => onUpdateQuantity(item, 1, categoryId)} 
      className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-600 hover:bg-purple-500 text-white transition-colors"
    >
      <Plus className="w-4 h-4" />
    </button>
  </MotionDiv>
) : (
  <MotionButton
    whileTap={!isProcessing ? { scale: 0.95 } : {}}
    onClick={handleAddClick}
    disabled={isProcessing || !!item.isSoldOut}
    className={`
      relative z-0 flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300
      ${isDark ? 'bg-white/10 hover:bg-purple-600 text-white' : 'bg-gray-200 hover:bg-purple-600 hover:text-white text-gray-800'}
      ${isProcessing ? 'opacity-80 cursor-wait' : ''}
    `}
  >
    {isProcessing ? (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    ) : (
      CUSTOMIZABLE_CATEGORIES.includes(categoryId) ? (
        <>Customize <ChevronRight className="w-4 h-4" /></>
      ) : "Add to Order"
    )}
  </MotionButton>
)}
      </div>
    </MotionDiv>
  );
};

const getStatusBadge = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'delivered' || s === 'completed') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-1 rounded-full border border-green-200">
        <CheckCheck className="w-3 h-3" /> Completed
      </span>
    );
  }
  if (s === 'out for delivery') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-2 py-1 rounded-full border border-purple-200">
        <Bike className="w-3 h-3" /> Out for Delivery
      </span>
    );
  }
  if (s === 'confirmed') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-1 rounded-full border border-blue-200">
        <ChefHat className="w-3 h-3" /> Confirmed
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full border border-yellow-200">
      <Clock className="w-3 h-3 animate-pulse" /> Pending
    </span>
  );
};
const STATUS_STEPS = ['Pending', 'Confirmed', 'Out for Delivery', 'Completed'];

const StatusTracker: React.FC<{ status: string }> = ({ status }) => {
  const currentIndex = STATUS_STEPS.findIndex(
    s => s.toLowerCase() === status.toLowerCase()
  );
  const stepIcons = [Clock, ChefHat, Bike, CheckCheck];
  return (
    <div className="bg-[#111] px-4 py-4 border-b border-white/10">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 text-center font-bold">
        Order Status
      </p>
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-purple-500 z-0 transition-all duration-700"
          style={{ width: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
        />
        {STATUS_STEPS.map((step, i) => {
          const Icon = stepIcons[i];
          const isActive = i === currentIndex;
          const isDone = i < currentIndex;
          return (
            <div key={step} className="flex flex-col items-center gap-1 z-10 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500
                ${isDone ? 'bg-purple-600 text-white' :
                  isActive ? 'bg-purple-500 text-white ring-2 ring-purple-300 ring-offset-1 ring-offset-[#111]' :
                  'bg-white/10 text-gray-600'}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider text-center leading-tight
                ${isActive ? 'text-purple-400' : isDone ? 'text-gray-400' : 'text-gray-600'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
// --- Main Component ---
const Menu: React.FC<MenuProps> = ({ onBack, theme }) => {
  const [activeCategory, setActiveCategory] = useState('rice');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItemExtended[]>(() => {
  try {
    const saved = localStorage.getItem('reeplay_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
});
  const [history, setHistory] = useState<PastOrder[]>([]);
  const [returningUser, setReturningUser] = useState<string | null>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartView, setCartView] = useState<CartView>('items');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [lastOrder, setLastOrder] = useState<PastOrder | null>(null);

  const [selectedMealItem, setSelectedMealItem] = useState<MenuItem | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  // Builder States
  const [builderStep, setBuilderStep] = useState(0); // 0: Spirit, 1: Mixers, 2: Garnish
  const [builderSpirit, setBuilderSpirit] = useState<string | null>(null);
  const [builderMixers, setBuilderMixers] = useState<string[]>([]);
  const [builderGarnishes, setBuilderGarnishes] = useState<string[]>([]);
  
  const [orderId, setOrderId] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('pickup');
  const [deliveryZoneId, setDeliveryZoneId] = useState('select');
  const [address, setAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [pickupError, setPickupError] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState(''); 
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedDeliveryPin, setGeneratedDeliveryPin] = useState<string | null>(null);
  
  const [needsBag, setNeedsBag] = useState(true);
  const [liveStatus, setLiveStatus] = useState<string>('Pending');

  const [menuItems, setMenuItems] = useState<Record<string, Array<MenuItem & { isSoldOut?: boolean }>>>({});
  const [menuLoading, setMenuLoading] = useState(true);

useEffect(() => {
  setMenuLoading(true);
  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name');

    if (error || !data) {
      console.error('Error fetching menu:', error);
      return;
    }

    console.log('Fetched menu data count:', data.length);
    console.log('Sold out item sample:', data.find((r: any) => r.is_sold_out));

    const grouped: Record<string, Array<MenuItem & { isSoldOut?: boolean }>> = {};
    data.forEach((row: any) => {
      if (!grouped[row.category_id]) grouped[row.category_id] = [];
      grouped[row.category_id].push({
        name: row.name,
        desc: row.description,
        price: '₦' + Number(row.price).toLocaleString(),
        isSoldOut: row.is_sold_out,
      });
    });
    setMenuItems(grouped);
    setMenuLoading(false);
  };
  fetchMenu();
}, []);

  const isDark = theme === 'dark';

  useEffect(() => {
    const profile = orderService.getUserProfile();
    
    if (profile.name) {
      setReturningUser(profile.name);
      setCustomerName(profile.name);
    }
    if (profile.phone) {
      setCustomerPhone(profile.phone);
    }
    
    // Initial fetch of history
    const loadHistory = async () => {
      try {
        const data = await orderService.getHistory();
        setHistory(data);
      } catch (e) {
        console.error("Failed to load history", e);
      }
    };
    loadHistory();
  }, []);
  
  useEffect(() => {
    if (!isHistoryOpen) return;

    console.log('History modal opened, starting polling...');

    const pollOrders = async () => {
      try {
        console.log('Polling orders...');
        const data = await orderService.getHistory();
        console.log('Orders fetched:', data.map(o => ({ id: o.id, status: o.status })));
        setHistory(data);
      } catch (e) {
        console.error('Error polling orders:', e);
      }
    };

    // Poll immediately on open
    pollOrders();

    // Then poll every 5 seconds
    const interval = setInterval(pollOrders, 5000);

    return () => clearInterval(interval);
  }, [isHistoryOpen]);
useEffect(() => {
  if (!isReceiptOpen || !lastOrder) return;
  setLiveStatus(lastOrder.status);

 const pollStatus = async () => {
  const { data } = await supabase
    .from('orders')
    .select('status')
    .eq('visual_id', lastOrder.id)
    .single();
  if (data && data.status !== liveStatus) {
    setLiveStatus(data.status);
    // Play chime on status change
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523, ctx.currentTime);
      oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.6);
    } catch (e) {}
  }
};

  const interval = setInterval(pollStatus, 5000);
  return () => clearInterval(interval);
}, [isReceiptOpen, lastOrder?.id]);
useEffect(() => {
  if (!isCartOpen) {
    setCartView('items');
  }
}, [isCartOpen]);

useEffect(() => {
  localStorage.setItem('reeplay_cart', JSON.stringify(cart));
}, [cart]);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPickupTime(val);
    if (!val) {
        setPickupError('');
        return;
    }
    const [h, m] = val.split(':').map(Number);
    const totalMins = h * 60 + m;
    const start = 15 * 60; // 3:00 PM
    const end = 22 * 60 + 30; // 10:30 PM

    if (totalMins < start || totalMins > end) {
        setPickupError('Pickup is only available between 3:00 PM and 10:30 PM.');
    } else {
        setPickupError('');
    }
  };

  const validateName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 3) return "Name is too short.";
    if (trimmed.split(' ').length < 2) return "Please enter your full name (First & Last).";
    if (/[^a-zA-Z\s'-]/.test(trimmed)) return "Name should only contain letters.";
    return "";
  };

  const validatePhone = (phone: string) => {
    const clean = phone.replace(/\s+/g, '');
    const nigerianPhoneRegex = /^(0\d{10}|\+234\d{10})$/;
    if (!nigerianPhoneRegex.test(clean)) {
        return "Enter a valid Nigerian number (e.g. 08012345678 or +23480...)";
    }
    return "";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerName(val);
    if (val) setNameError(validateName(val));
    else setNameError('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerPhone(val);
    if (val) setPhoneError(validatePhone(val));
    else setPhoneError('');
  };

  const filteredItems = useMemo(() => {
    if (searchQuery.length > 0) {
      const results: MenuItemExtended[] = [];
      Object.entries(menuItems).forEach(([catId, items]) => {
        items.forEach(item => {
          if (
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.desc.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            results.push({ ...item, categoryId: catId });
          }
        });
      });
      return results;
    }
    const items = menuItems[activeCategory] || [];
    return items.map(item => ({ ...item, categoryId: activeCategory }));
   }, [activeCategory, searchQuery, menuItems]);

  const addToCart = (item: MenuItem, category: string, quantity: number = 1, mods: string[] = [], customPrice?: number) => {
    if (navigator.vibrate) navigator.vibrate(50); 
    setCart(prev => {
      let newCart = [...prev];
      const basePrice = parsePrice(item.price);
      let unitPrice = customPrice || basePrice;

      const uniqueId = `${item.name}-${mods.sort().join('-')}`;
      const existingIndex = newCart.findIndex(i => `${i.name}-${(i.modifiers || []).sort().join('-')}` === uniqueId);

      if (existingIndex > -1) {
        newCart[existingIndex].quantity += quantity;
      } else {
        newCart.push({ ...item, priceRaw: unitPrice, quantity, modifiers: mods, categoryId: category });
      }
      return newCart;
    });
  };

  const updateQuantityFromCard = (item: MenuItem, delta: number, categoryId: string) => {
    setCart(prev => {
        let newCart = [...prev];
        const uniqueId = `${item.name}-`;
        const existingIndex = newCart.findIndex(i => `${i.name}-${(i.modifiers || []).sort().join('-')}` === uniqueId);

        if (existingIndex > -1) {
            newCart[existingIndex].quantity += delta;
            if (newCart[existingIndex].quantity <= 0) {
                newCart.splice(existingIndex, 1);
            }
        } else if (delta > 0) {
            newCart.push({ ...item, priceRaw: parsePrice(item.price), quantity: delta, modifiers: [], categoryId: categoryId });
        }
        return newCart;
    });
  };

  const updateCartItemQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const newCart = [...prev];
      if (newCart[index]) {
          newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
      }
      return newCart;
    });
  };

  const calculateBuilderTotal = () => {
    let total = 0;
    if (builderSpirit) {
      total += BUILDER_DATA.spirits.find(s => s.id === builderSpirit)?.price || 0;
    }
    builderMixers.forEach(id => {
      total += BUILDER_DATA.mixers.find(m => m.id === id)?.price || 0;
    });
    builderGarnishes.forEach(id => {
      total += BUILDER_DATA.garnishes.find(g => g.id === id)?.price || 0;
    });
    return total;
  };

  const handleAddBuiltDrink = () => {
    if (!builderSpirit) return;
    const spiritObj = BUILDER_DATA.spirits.find(s => s.id === builderSpirit);
    const mixerNames = builderMixers.map(id => BUILDER_DATA.mixers.find(m => m.id === id)?.name || '');
    const garnishNames = builderGarnishes.map(id => BUILDER_DATA.garnishes.find(g => g.id === id)?.name || '');
    const modifiers = [...mixerNames, ...garnishNames];
    
    const customItem: MenuItem = {
      name: `Custom ${spiritObj?.name}`,
      desc: `Custom built drink with ${modifiers.join(', ')}`,
      price: formatPrice(calculateBuilderTotal())
    };

    addToCart(customItem, 'builder', 1, modifiers, calculateBuilderTotal());
    showToast("Custom Drink Created!");
    setBuilderSpirit(null);
    setBuilderMixers([]);
    setBuilderGarnishes([]);
    setBuilderStep(0);
    setActiveCategory('rice');
  };

  const toggleBuilderItem = (list: string[], setList: (l: string[]) => void, id: string) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleCustomizationSubmit = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!selectedMealItem) return;
    let totalPrice = parsePrice(selectedMealItem.price);
    const modifiersList: string[] = [];
    selectedAddOns.forEach(id => {
      const addon = KITCHEN_ADDONS.find(a => a.id === id);
      if (addon) {
        totalPrice += addon.price;
        modifiersList.push(addon.name);
      }
    });
    addToCart(selectedMealItem, activeCategory, 1, modifiersList, totalPrice);
    showToast(`${selectedMealItem.name} added to cart!`);
    setTimeout(() => {
        setIsMealModalOpen(false);
        setSelectedAddOns([]);
        setSelectedMealItem(null);
        setIsCartOpen(false); 
    }, 50);
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const performConfirmAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'clear') {
      setCart([]);
      setIsCartOpen(false);
    } else if (confirmAction.type === 'remove' && confirmAction.itemIndex !== undefined) {
      setCart(prev => prev.filter((_, i) => i !== confirmAction.itemIndex));
    }
    setConfirmAction(null);
  };

  const cartSubTotal = useMemo(() => cart.reduce((t, i) => t + (i.priceRaw * i.quantity), 0), [cart]);
  
  const containerRequiredCount = useMemo(() => {
    return cart.reduce((total, item) => {
        if (['rice', 'pasta', 'sides'].includes(item.categoryId)) {
            if (needsContainer(item.name)) {
                return total + item.quantity;
            }
        }
        return total;
    }, 0);
  }, [cart]);

  const containerCost = containerRequiredCount * CONTAINER_PRICE;

  const baggableItemCount = useMemo(() => {
    return cart.reduce((total, item) => {
         if (['rice', 'pasta', 'sides'].includes(item.categoryId)) {
             return total + item.quantity;
         }
         return total;
    }, 0);
  }, [cart]);

  const bagCount = useMemo(() => {
    if (!needsBag || baggableItemCount === 0) return 0;
    return Math.ceil(baggableItemCount / 2);
  }, [needsBag, baggableItemCount]);

  const bagFee = bagCount * PAPER_BAG_PRICE;
  const vatAmount = cartSubTotal * VAT_RATE;
  const deliveryFee = orderType === 'delivery' ? (DELIVERY_ZONES.find(z => z.id === deliveryZoneId)?.price || 0) : 0;
  const finalTotal = cartSubTotal + vatAmount + containerCost + bagFee + deliveryFee;
  const paystackConfig = {
  reference: new Date().getTime().toString(),
  email: `${customerPhone.replace(/\D/g, '')}@reeplay.order`,
  amount: Math.round(finalTotal * 100),
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  channels: ['card', 'bank_transfer'] as any,
};

const initializePayment = usePaystackPayment(paystackConfig);

  const canCheckout = useMemo(() => {
    if (!customerName || !customerPhone || nameError || phoneError) return false;
    if (orderType === 'delivery') {
      return deliveryZoneId !== 'select' && address.length > 5;
    } else {
      return pickupTime !== '' && !pickupError;
    }
  }, [customerName, customerPhone, nameError, phoneError, orderType, deliveryZoneId, address, pickupTime, pickupError]);

  const handleConfirmOrder = async () => {
    if (!canCheckout) return;
    setIsSubmitting(true);

  // Unlock AudioContext on mobile with user gesture
     try {
      const ctx = new AudioContext();
        await ctx.resume();
        ctx.close();
      } catch (e) {}
    // Generate Order ID & Pin
    const id = '#' + Math.floor(1000 + Math.random() * 9000);
    setOrderId(id);
    const pin = orderType === 'delivery' ? Math.floor(100000 + Math.random() * 899999).toString() : null;
    setGeneratedDeliveryPin(pin);

    // Prepare items for DB
    const finalItems = [...cart];
    if (containerRequiredCount > 0) {
        finalItems.push({
            name: EXTRAS.container.name,
            desc: EXTRAS.container.desc,
            price: EXTRAS.container.price,
            priceRaw: CONTAINER_PRICE,
            quantity: containerRequiredCount,
            categoryId: 'packaging'
        } as any);
    }
    if (bagCount > 0) {
        finalItems.push({
             name: EXTRAS.bag.name,
             desc: `${EXTRAS.bag.desc} (Fits ~2 Meals)`,
             price: EXTRAS.bag.price,
             priceRaw: PAPER_BAG_PRICE,
             quantity: bagCount,
             categoryId: 'packaging'
        } as any);
    }
    if (orderType === 'delivery' && deliveryFee > 0) {
        finalItems.push({
             name: 'Delivery Fee',
             desc: DELIVERY_ZONES.find(z => z.id === deliveryZoneId)?.label || 'Delivery',
             price: formatPrice(deliveryFee),
             priceRaw: deliveryFee,
             quantity: 1,
             categoryId: 'service'
        } as any);
    }
    if (vatAmount > 0) {
        finalItems.push({
            name: 'VAT (7.5%)',
            desc: 'Tax',
            price: formatPrice(vatAmount),
            priceRaw: vatAmount,
            quantity: 1,
            categoryId: 'tax'
        } as any);
    }

    const newOrder: PastOrder = {
        id,
        date: new Date().toISOString(),
        items: finalItems.map(i => ({ 
          name: i.name + (i.modifiers?.length ? ` (${i.modifiers.join(', ')})` : ''), 
          quantity: i.quantity, 
          priceRaw: i.priceRaw 
        })),
        total: finalTotal,
        type: orderType,
        details: orderType === 'pickup' ? `Pickup: ${pickupTime}` : `${address} (${deliveryZoneId})`,
        customerName,
        customerPhone: customerPhone.replace(/\D/g, ''),
        status: 'Pending', 
        deliveryPin: pin || undefined,
        specialRequests: specialRequests || undefined
    };

    try {
        // Save to Firebase
        await orderService.saveOrder(newOrder);
        orderService.updateProfile(customerName, customerPhone);
        
        // Refresh local history with the new data from Firestore
        const updatedHistory = await orderService.getHistory();
        setHistory(updatedHistory);
        setLastOrder(newOrder);
        
        setIsSubmitting(false);
        setIsCartOpen(false);
        setHistory(updatedHistory);
        setLastOrder(newOrder);

        setIsSubmitting(false);
        setIsCartOpen(false);
        setIsReceiptOpen(true);
        setCart([]);
        setIsReceiptOpen(true);
        setCart([]);
    } catch (e) {
        console.error(e);
        showToast("Error placing order. Please check your connection.");
        setIsSubmitting(false);
    }
  };

  const sendToWhatsApp = () => {
    if (!lastOrder) return;
    const text = generateWhatsAppText(lastOrder);
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyReceipt = () => {
    if (!lastOrder) return;
    const text = generateWhatsAppText(lastOrder);
    navigator.clipboard.writeText(text);
    showToast("Receipt copied!");
  };

  const openInstagram = () => {
    window.open(IG_DM_LINK, '_blank');
  };

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 50 }}
      className={`fixed inset-0 z-[70] overflow-y-auto transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}
    >
      <MenuBackground theme={theme} />

      <div className="min-h-screen pb-32 px-4 md:px-8 max-w-7xl mx-auto pt-4 relative z-10">
        <div className={`flex justify-between items-center sticky top-0 z-50 py-4 -mx-4 px-4 md:mx-0 md:px-0 backdrop-blur-xl transition-colors duration-300 border-b ${isDark ? 'bg-black/80 border-white/5' : 'bg-white/80 border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/10 hover:bg-purple-600' : 'bg-gray-200 hover:bg-purple-600 hover:text-white'}`}>
              <ArrowLeft />
            </button>
            <button 
              onClick={() => {
                console.log('History button clicked, current isHistoryOpen:', isHistoryOpen);
                setIsHistoryOpen(true);
              }}
              className={`p-2 rounded-full transition-colors flex items-center gap-2 px-4 ${isDark ? 'bg-white/10 hover:bg-yellow-600' : 'bg-gray-200 hover:bg-yellow-500 hover:text-white'}`}
            >
              <History className="w-5 h-5" />
              <span className="text-sm font-bold hidden md:inline">My Orders</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="text-right block">
                  <h2 className="text-xl font-bold">Menu</h2>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Order for Pickup or Delivery</p>
              </div>
          </div>
        </div>
        
        <div className="py-2">
            <NoticeBanner theme={theme} />
        </div>

        <AnimatePresence>
            {returningUser && (
                <MotionDiv 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="mb-4 bg-purple-900/20 border border-purple-500/30 rounded-xl p-3 flex items-center gap-3">
                        <div className="p-2 bg-purple-600 rounded-full">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Welcome back, {returningUser}!</p>
                            <p className="text-xs text-purple-300">We've saved your details for a faster checkout.</p>
                        </div>
                    </div>
                </MotionDiv>
            )}
        </AnimatePresence>
        
        <div className="pt-2 pb-2">
            <div className="relative max-w-md mx-auto mb-6">
              <input 
                type="text" 
                placeholder="Search food, drinks, or cocktails..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className={`w-full border rounded-full py-3 pl-12 pr-4 outline-none transition-all
                  ${isDark 
                    ? 'bg-white/5 border-white/10 text-white focus:border-purple-500 placeholder:text-gray-500 focus:bg-white/10' 
                    : 'bg-white/80 border-gray-300 text-gray-900 focus:border-purple-500 placeholder:text-gray-500 shadow-sm'}
                `} 
              />
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>

            {!searchQuery && activeCategory !== 'builder' && <PromoCarousel />}
        </div>
        
        {!searchQuery && activeCategory !== 'builder' && (
            <div className={`sticky top-[73px] z-40 py-3 mb-6 -mx-4 px-4 md:mx-0 md:px-0 backdrop-blur-xl border-b transition-colors duration-300 ${isDark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-gray-200'}`}>
               <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => setActiveCategory(cat.id)} 
                    className={`
                      flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap border transition-all font-medium text-sm
                      ${activeCategory === cat.id 
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg' 
                        : isDark 
                          ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10' 
                          : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'}
                    `}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
        )}

        {/* --- DRINK LAB BUILDER --- */}
        {activeCategory === 'builder' ? (
          <div className="max-w-3xl mx-auto space-y-8 pb-24">
             <div className="flex items-center gap-4 mb-4">
                 <button onClick={() => { setActiveCategory('rice'); setBuilderStep(0); setBuilderSpirit(null); }} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                     <ArrowLeft className="w-5 h-5 text-white" />
                 </button>
                 <h2 className="text-xl font-bold text-white">Back to Food</h2>
             </div>
             
             {/* Progress Bar */}
             <div className="flex justify-between items-center mb-6 relative">
               <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-700 -z-10" />
               {['Base Spirit', 'Mixers', 'Garnish'].map((step, idx) => (
                 <div key={idx} className={`flex flex-col items-center gap-2 ${builderStep >= idx ? 'opacity-100' : 'opacity-40'}`}>
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${builderStep >= idx ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                     {idx + 1}
                   </div>
                   <span className="text-xs font-bold uppercase">{step}</span>
                 </div>
               ))}
             </div>

             <div className={`p-6 rounded-3xl text-center border transition-all ${isDark ? 'bg-black/50 backdrop-blur-md border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-white/80 border-white'}`}>
                <h2 className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                   {builderStep === 0 && "Choose Your Poison"}
                   {builderStep === 1 && "Add Some Splash"}
                   {builderStep === 2 && "The Finishing Touch"}
                </h2>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                   {builderStep === 0 && "Start with a solid foundation."}
                   {builderStep === 1 && "Select up to 2 mixers."}
                   {builderStep === 2 && "Garnishes make it perfect."}
                </p>
             </div>

             {/* Step 1: Spirits */}
             {builderStep === 0 && (
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {BUILDER_DATA.spirits.map(spirit => (
                      <button
                        key={spirit.id}
                        onClick={() => { setBuilderSpirit(spirit.id); setBuilderStep(1); }}
                        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group h-32 flex flex-col justify-between
                          ${builderSpirit === spirit.id 
                            ? `${spirit.color} border-transparent text-white shadow-lg scale-[1.02]` 
                            : isDark ? 'bg-black/40 border-white/10 hover:border-purple-500 text-gray-300 hover:bg-white/5' : 'bg-white border-gray-200 hover:border-purple-500 text-gray-700'}
                        `}
                      >
                        <div className="font-bold text-lg">{spirit.name}</div>
                        <div className={`text-sm ${builderSpirit === spirit.id ? 'text-white/80' : 'text-yellow-500 font-mono'}`}>
                          {formatPrice(spirit.price)}
                        </div>
                      </button>
                    ))}
                  </div>
             )}

             {/* Step 2: Mixers */}
             {builderStep === 1 && (
                 <>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {BUILDER_DATA.mixers.map(mixer => (
                        <button
                          key={mixer.id}
                          onClick={() => toggleBuilderItem(builderMixers, setBuilderMixers, mixer.id)}
                          className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group
                            ${builderMixers.includes(mixer.id)
                              ? `bg-blue-600 border-transparent text-white shadow-lg` 
                              : isDark ? 'bg-black/40 border-white/10 hover:border-blue-500 text-gray-300' : 'bg-white border-gray-200 hover:border-blue-500 text-gray-700'}
                          `}
                        >
                           <div className="flex justify-between items-center">
                              <span className="font-bold">{mixer.name}</span>
                              {builderMixers.includes(mixer.id) && <CheckCircle className="w-5 h-5"/>}
                           </div>
                           <span className="text-xs text-yellow-500 font-mono block mt-1">+{formatPrice(mixer.price)}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between pt-6">
                        <button onClick={() => setBuilderStep(0)} className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5">Back</button>
                        <button onClick={() => setBuilderStep(2)} className="px-8 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 shadow-lg">Next Step</button>
                    </div>
                 </>
             )}

             {/* Step 3: Garnishes */}
             {builderStep === 2 && (
                 <>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {BUILDER_DATA.garnishes.map(garnish => (
                        <button
                          key={garnish.id}
                          onClick={() => toggleBuilderItem(builderGarnishes, setBuilderGarnishes, garnish.id)}
                          className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group
                            ${builderGarnishes.includes(garnish.id)
                              ? `bg-pink-600 border-transparent text-white shadow-lg` 
                              : isDark ? 'bg-black/40 border-white/10 hover:border-pink-500 text-gray-300' : 'bg-white border-gray-200 hover:border-pink-500 text-gray-700'}
                          `}
                        >
                           <div className="flex justify-between items-center">
                              <span className="font-bold">{garnish.name}</span>
                              {builderGarnishes.includes(garnish.id) && <CheckCircle className="w-5 h-5"/>}
                           </div>
                           <span className="text-xs text-yellow-500 font-mono block mt-1">
                             {garnish.price > 0 ? `+${formatPrice(garnish.price)}` : 'Free'}
                           </span>
                        </button>
                      ))}
                    </div>
                    
                    <div className={`mt-8 p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                        <h3 className="text-lg font-bold mb-4">Your Mix Summary</h3>
                        <div className="flex justify-between mb-2">
                           <span className="text-gray-400">Base Spirit</span>
                           <span className="font-bold">{BUILDER_DATA.spirits.find(s => s.id === builderSpirit)?.name}</span>
                        </div>
                         <div className="flex justify-between mb-2">
                           <span className="text-gray-400">Mixers</span>
                           <span className="text-right">{builderMixers.length > 0 ? builderMixers.map(m => BUILDER_DATA.mixers.find(x => x.id === m)?.name).join(', ') : 'None'}</span>
                        </div>
                         <div className="flex justify-between mb-4 border-b border-white/10 pb-4">
                           <span className="text-gray-400">Garnish</span>
                           <span className="text-right">{builderGarnishes.length > 0 ? builderGarnishes.map(g => BUILDER_DATA.garnishes.find(x => x.id === g)?.name).join(', ') : 'None'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-bold">Total Price</span>
                            <span className="text-2xl font-black text-yellow-500 font-mono">{formatPrice(calculateBuilderTotal())}</span>
                        </div>
                    </div>

                    <div className="flex justify-between pt-6">
                        <button onClick={() => setBuilderStep(1)} className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5">Back</button>
                        <button onClick={handleAddBuiltDrink} className="flex-1 ml-4 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2">
                            <Wand2 className="w-5 h-5" /> Add to Order
                        </button>
                    </div>
                 </>
             )}
          </div>
        ) : (
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
              {menuLoading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className={`p-4 md:p-6 rounded-2xl animate-pulse
                    ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                    <div className={`h-5 rounded mb-3 w-3/4 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                    <div className={`h-3 rounded mb-2 w-full ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                    <div className={`h-3 rounded mb-4 w-2/3 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                    <div className="flex justify-between items-center mt-4">
                      <div className={`h-5 rounded w-20 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                      <div className={`h-8 rounded-lg w-24 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                    </div>
                  </div>
                ))
              ) : filteredItems.map((item, i) => {
                const uniqueId = `${item.name}-`;
                const cartItem = cart.find(c => `${c.name}-${(c.modifiers || []).sort().join('-')}` === uniqueId);
                const qty = cartItem ? cartItem.quantity : 0;
                return (
                  <MenuItemCard 
                      key={`${item.name}-${i}`} 
                      item={item} 
                      categoryId={item.categoryId} 
                      quantityInCart={qty}
                      onAdd={addToCart} 
                      onUpdateQuantity={updateQuantityFromCard}
                      onOpenModal={(it) => { setSelectedMealItem(it); setIsMealModalOpen(true); }} 
                      theme={theme}
                  />
                )
              })}
              {!menuLoading && filteredItems.length === 0 && (
                <div className={`col-span-full text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No items found for "{searchQuery}". Try another category or term.</p>
                </div>
              )}
         </div>
        )}
      </div>

      <AnimatePresence>
        {toastMessage && (
          <MotionDiv
             initial={{ opacity: 0, y: -50 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className={`fixed top-24 left-1/2 -translate-x-1/2 z-[90] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold whitespace-nowrap pointer-events-none ${
               toastType === 'success' ? 'bg-green-600' : 'bg-red-600'
             }`}
          >
            <CheckCircle className="w-5 h-5" /> {toastMessage}
          </MotionDiv>
        )}
      </AnimatePresence>

      {activeCategory !== 'builder' && (
        <MotionButton
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory('builder')}
            className="fixed bottom-32 md:bottom-24 right-6 z-[80] bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.6)] flex items-center gap-2 group overflow-hidden"
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Wand2 className="w-6 h-6 text-white" />
            <span className="text-white font-bold hidden group-hover:block transition-all whitespace-nowrap">Create Your Vibe</span>
        </MotionButton>
      )}

      {cart.length > 0 && activeCategory !== 'builder' && (
        <MotionButton 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsCartOpen(true)} 
          className="fixed bottom-10 md:bottom-8 right-6 z-[80] bg-[#111] border border-white/20 p-4 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
        >
          <ShoppingBag className="w-6 h-6 text-white" />
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#111]">
            {cart.reduce((a, b) => a + b.quantity, 0)}
          </span>
        </MotionButton>
      )}

      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
             <MotionDiv className={`p-6 rounded-xl border max-w-xs w-full text-center shadow-2xl ${isDark ? 'bg-[#18181b] border-white/10' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Are you sure?</h3>
                <div className="flex gap-3 mt-4">
                    <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 bg-gray-200 text-black rounded-lg">Cancel</button>
                    <button onClick={performConfirmAction} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg">Remove</button>
                </div>
             </MotionDiv>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMealModalOpen && selectedMealItem && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <MotionDiv
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsMealModalOpen(false)}
               className="absolute inset-0 bg-black/90 backdrop-blur-md"
             />
             <MotionDiv className="relative w-full max-w-md bg-[#18181b] border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-2">{selectedMealItem.name}</h3>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {KITCHEN_ADDONS.map(addon => (
                         <div key={addon.id} onClick={() => toggleAddOn(addon.id)} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${selectedAddOns.includes(addon.id) ? 'bg-purple-900/30 border-purple-500' : 'border-white/10 hover:bg-white/5'}`}>
                             <div className="flex items-center gap-3">
                                 <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedAddOns.includes(addon.id) ? 'bg-purple-500 border-purple-500' : 'border-gray-500'}`}>
                                     {selectedAddOns.includes(addon.id) && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                                 </div>
                                 <span className="text-white">{addon.name}</span>
                             </div>
                             <span className="text-yellow-500 font-mono">+{addon.price}</span>
                         </div>
                    ))}
                </div>
                <button onClick={handleCustomizationSubmit} className="w-full py-3 bg-purple-600 text-white rounded-xl mt-4">Add to Order</button>
             </MotionDiv>
          </div>
        )}
      </AnimatePresence>

      {/* --- HISTORY MODAL --- */}
      <AnimatePresence>
        {isHistoryOpen && (
            <MotionDiv 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className={`fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm`}
            >
                <MotionDiv 
                    initial={{ scale: 0.95 }} 
                    animate={{ scale: 1 }}
                    className="w-full max-w-lg bg-[#18181b] border border-white/10 rounded-2xl h-[80vh] flex flex-col shadow-2xl"
                >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-2xl">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                           <History className="w-5 h-5 text-purple-500" /> Order History
                        </h3>
                        <button onClick={() => setIsHistoryOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><X /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                                <History className="w-16 h-16 opacity-20" />
                                <p>No past orders found.</p>
                            </div>
                        ) : (
                            history.map((order, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => { setLastOrder(order); setIsReceiptOpen(true); setIsHistoryOpen(false); }}
                                    className={`p-4 border rounded-xl transition-colors cursor-pointer group
                                    ${['pending', 'confirmed', 'out for delivery'].includes(order.status?.toLowerCase())
                                      ? 'border-purple-500/50 bg-purple-900/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-pulse-slow'
                                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-xs font-mono text-gray-500">#{order.id}</span>
                                            <p className="text-white font-bold text-sm mt-1">
                                                {new Date(order.date).toLocaleDateString()} • {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-yellow-500 font-mono font-bold">{formatPrice(order.total)}</span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-white/5 pt-2 mt-2">
                                        <span className="truncate flex-1">
                                            {order.items.length} items: {order.items.map(i => i.name).join(', ')}
                                        </span>
                                        <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const reorderItems = order.items
                                          .filter((i: any) => !['Plastic Container', 'Paper Bag', 'Delivery Fee', 'VAT (7.5%)'].includes(i.name))
                                          .map((i: any) => ({
                                            name: i.name,
                                            desc: '',
                                            price: '₦' + i.priceRaw.toLocaleString(),
                                            priceRaw: i.priceRaw,
                                            quantity: i.quantity,
                                            modifiers: [],
                                            categoryId: 'reorder',
                                            isSoldOut: false,
                                          }));
                                        setCart(reorderItems);
                                        setIsHistoryOpen(false);
                                        setIsCartOpen(true);
                                        showToast('Order added to cart!');
                                      }}
                                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-full"
                                    >
                                      Reorder
                                    </button>
                                    <ChevronRight className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </MotionDiv>
            </MotionDiv>
        )}
      </AnimatePresence>

      {/* --- RECEIPT MODAL --- */}
      <AnimatePresence>
        {isReceiptOpen && lastOrder && (
            <MotionDiv className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <MotionDiv 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white text-black w-full max-w-sm rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="bg-[#111] text-white p-4 flex justify-between items-center">
                        <h2 className="font-bold flex items-center gap-2"><CheckCircle className="text-green-500" /> Order Ready</h2>
                        <button onClick={() => setIsReceiptOpen(false)}><X className="w-5 h-5"/></button>
                    </div>
                  <StatusTracker status={liveStatus} /> 
                    {/* Receipt Paper */}
                    <div className="bg-white p-6 overflow-y-auto custom-scrollbar relative flex-1">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Reeplay Lounge</h2>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Ogbomoso</p>
                        </div>
                        
                        <div className="space-y-4 font-mono text-sm border-b-2 border-dashed border-gray-300 pb-6 mb-6">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Order ID</span>
                                <span className="font-bold">{lastOrder.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Date</span>
                                <span>{new Date(lastOrder.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Customer</span>
                                <span className="capitalize">{lastOrder.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                            <span className="text-gray-500">Est. Wait</span>
                            <span className="font-bold">
                                {lastOrder.type === 'delivery' ? '30 – 45 mins' : '15 – 20 mins'}
                            </span>
                        </div>
                        </div>

                        <div className="space-y-3 font-mono text-sm mb-6">
                            {lastOrder.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-start">
                                    <div className="flex-1 pr-4">
                                        <span className="font-bold">{item.quantity}x</span> {item.name}
                                    </div>
                                    <span>{formatPrice(item.priceRaw * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t-2 border-black pt-4 space-y-2 font-mono">
                            <div className="flex justify-between text-xl font-black">
                                <span>TOTAL</span>
                                <span>{formatPrice(lastOrder.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Footer Actions */}
                    <div className="p-4 bg-gray-100 space-y-3 relative z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                        <div className="receipt-jagged-edge absolute -top-4 left-0 w-full transform rotate-180"></div>
                        
                        <button 
                            onClick={sendToWhatsApp}
                            className="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all"
                        >
                            <MessageCircle className="w-5 h-5" /> Send to WhatsApp
                        </button>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={openInstagram}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Instagram className="w-5 h-5" /> Instagram
                            </button>
                            <button 
                                onClick={copyReceipt}
                                className="px-4 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm"
                            >
                                <Copy className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </MotionDiv>
            </MotionDiv>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <MotionDiv 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            
            <MotionDiv 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className={`fixed top-0 right-0 h-full w-full max-w-md z-[101] flex flex-col shadow-2xl border-l ${isDark ? 'bg-[#121212] border-white/10' : 'bg-white border-gray-200'}`}
            >
                 <div className={`flex-none p-6 border-b flex justify-between items-center ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                        {cartView === 'checkout' && (
                            <button onClick={() => setCartView('items')} className={`p-2 rounded-full -ml-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}>
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h2 className={`text-xl font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {cartView === 'items' ? 'Your Order' : 'Checkout'}
                        </h2>
                    </div>
                    <button onClick={() => setIsCartOpen(false)}><ChevronDown /></button>
                </div>

                {cartView === 'items' && (
                    <div className="flex-1 overflow-y-auto p-6">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col">
                        <div className="flex flex-col items-center justify-center text-center opacity-50 py-8">
                          <ShoppingBag className="w-12 h-12 mb-3" />
                          <p className="text-sm">Your cart is empty.</p>
                        </div>
                        <div className="border-t border-white/10 pt-4">
                          <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Popular Items
                          </p>
                          <div className="space-y-2">
                            {[
                              { name: 'Jollof Rice', price: '₦4,500', categoryId: 'rice' },
                              { name: 'Chicken Shawarma', price: '₦3,700', categoryId: 'sides' },
                              { name: 'Long Island', price: '₦7,500', categoryId: 'cocktails' },
                              { name: 'Pepper Chicken', price: '₦4,000', categoryId: 'sides' },
                            ].map(item => (
                              <div key={item.name} className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all
                                ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
                                onClick={() => {
                                  addToCart({ name: item.name, desc: '', price: item.price }, item.categoryId);
                                  showToast(`${item.name} added!`);
                                }}
                              >
                                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-yellow-500 font-mono text-sm">{item.price}</span>
                                  <Plus className="w-4 h-4 text-purple-500" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={`${item.name}-${idx}`} className={`mb-4 p-4 rounded-xl border flex flex-col gap-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</h4>
                                            {item.modifiers && item.modifiers.length > 0 && (
                                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {item.modifiers.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                        <p className={`font-mono font-bold ${isDark ? 'text-yellow-500' : 'text-purple-600'}`}>
                                            {formatPrice(item.priceRaw * item.quantity)}
                                        </p>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <button 
                                            onClick={() => setConfirmAction({ type: 'remove', itemIndex: idx })}
                                            className="text-xs text-red-500 hover:text-red-400 font-bold flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3 h-3" /> Remove
                                        </button>
                                        
                                        <div className="flex items-center gap-3 bg-black/20 rounded-lg p-1">
                                            <button 
                                                onClick={() => updateCartItemQuantity(idx, -1)}
                                                className={`w-7 h-7 flex items-center justify-center rounded-md ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-gray-100 shadow-sm'}`}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateCartItemQuantity(idx, 1)}
                                                className="w-7 h-7 flex items-center justify-center rounded-md bg-purple-600 hover:bg-purple-500 text-white"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {cart.length > 0 && (
                            <div className="mt-4">
                                <button onClick={() => setCartView('checkout')} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg">Proceed to Checkout</button>
                            </div>
                        )}
                    </div>
                )}

                 {cartView === 'checkout' && (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-20 custom-scrollbar">
                             {(containerRequiredCount > 0 || bagCount > 0) && (
                                <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-blue-50 border-blue-100'}`}>
                                    <div className="flex items-start gap-3">
                                        <PackageOpen className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                        <div className="flex-1">
                                            <h4 className={`text-sm font-bold ${isDark ? 'text-blue-100' : 'text-blue-900'}`}>Packaging Added</h4>
                                            <div className={`mt-2 space-y-1 text-xs ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                                                {containerRequiredCount > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>{containerRequiredCount}x Takeout Containers</span>
                                                        <span>{formatPrice(containerCost)}</span>
                                                    </div>
                                                )}
                                                {bagCount > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>{bagCount}x Paper Bags</span>
                                                        <span>{formatPrice(bagFee)}</span>
                                                    </div>
                                                )}
                                                <div className="pt-2 mt-2 border-t border-blue-500/20 flex items-center justify-between">
                                                    <span>Need a paper bag?</span>
                                                    <button onClick={() => setNeedsBag(!needsBag)} className="text-lg">
                                                        {needsBag ? <ToggleRight className="w-8 h-8 text-blue-500" /> : <ToggleLeft className="w-8 h-8 opacity-50" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             )}

                            <div className="space-y-2">
                                <label className={`text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Order Type</label>
                                <div className={`flex p-1 rounded-xl ${isDark ? 'bg-black/50' : 'bg-gray-100'}`}>
                                    <button onClick={() => setOrderType('pickup')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${orderType === 'pickup' ? 'bg-purple-600 text-white shadow-lg' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Pickup</button>
                                    <button onClick={() => setOrderType('delivery')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${orderType === 'delivery' ? 'bg-purple-600 text-white shadow-lg' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Delivery</button>
                                </div>
                            </div>
                            
                            {orderType === 'pickup' ? (
                                <div className="space-y-2">
                                    <label className={`text-xs uppercase font-bold flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}><Clock className="w-3 h-3"/> Pickup Time</label>
                                    <input type="time" min="15:00" max="22:30" value={pickupTime} onChange={handleTimeChange} className={`w-full border p-3 rounded-xl outline-none focus:border-purple-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'} ${pickupError ? 'border-red-500' : ''}`} />
                                    <p className="text-[10px] text-gray-500">Service begins at 3:00 PM (15:00).</p>
                                    {pickupError && <p className="text-red-500 text-xs mt-1">{pickupError}</p>}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                     <div className="space-y-2">
                                        <label className={`text-xs uppercase font-bold flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}><MapPin className="w-3 h-3"/> Delivery Area</label>
                                        <select value={deliveryZoneId} onChange={e => setDeliveryZoneId(e.target.value)} className={`w-full border p-3 rounded-xl outline-none focus:border-purple-500 appearance-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'}`}>
                                        {DELIVERY_ZONES.map(z => <option key={z.id} value={z.id} className={isDark ? "bg-gray-900" : "bg-white"}>{z.label} {z.price > 0 ? `(+${z.price})` : ''}</option>)}
                                        </select>
                                    </div>
                                    <textarea placeholder="Hostel Name, Room Number, Description..." value={address} onChange={e => setAddress(e.target.value)} className={`w-full border p-3 rounded-xl outline-none focus:border-purple-500 resize-none h-24 text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'}`}/>
                                </div>
                            )}

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className={`text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your Name</label>
                                    <input type="text" placeholder="First & Last Name" value={customerName} onChange={handleNameChange} className={`w-full border p-3 rounded-xl text-sm outline-none focus:border-purple-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'} ${nameError ? 'border-red-500' : ''}`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone</label>
                                    <input type="tel" placeholder="080... or +234..." value={customerPhone} onChange={handlePhoneChange} className={`w-full border p-3 rounded-xl text-sm outline-none focus:border-purple-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'} ${phoneError ? 'border-red-500' : ''}`} />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <label className={`text-xs uppercase font-bold flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}><FileText className="w-3 h-3"/> Special Requests (Optional)</label>
                                <textarea placeholder="E.g., No onions, extra spicy, separate sauce..." value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} className={`w-full border p-3 rounded-xl outline-none focus:border-purple-500 resize-none h-20 text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'}`}/>
                            </div>
                        </div>
                        <div className={`flex-none p-6 border-t ${isDark ? 'bg-[#18181b] border-white/10' : 'bg-white border-gray-200'}`}>
                            <button onClick={handleConfirmOrder} disabled={!canCheckout || isSubmitting} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canCheckout ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg' : isDark ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5"/> : (
                                <>Confirm Order <span className="bg-black/20 px-2 py-0.5 rounded text-xs ml-1 font-mono">{formatPrice(finalTotal)}</span></>
                                )}
                            </button>
                            {!canCheckout && <p className="text-red-400 text-xs text-center mt-2">Please fix the errors above to continue.</p>}
                        </div>
                    </div>
                 )}
            </MotionDiv>
          </>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
};

export default Menu;