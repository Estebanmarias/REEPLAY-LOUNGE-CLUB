import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ArrowLeft, Flame, Wine, Utensils, Crown, GlassWater, Plus, Minus, ShoppingBag, X, Search, ChevronRight, Loader2, Trash2, MapPin, Clock, CheckCircle, History, ChefHat, Bike, CheckCheck, AlertTriangle, ArrowRight, ChevronDown, Wand2, Instagram, MessageCircle, Info, PackageOpen, ToggleLeft, ToggleRight, User, Receipt, DollarSign, ExternalLink, FileText } from 'lucide-react';
import { orderService, PastOrder } from '../lib/orderService';
import MenuBackground from './MenuBackground';
import PromoCarousel from './PromoCarousel';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

// --- Types ---
interface MenuItem {
  name: string;
  desc: string;
  price: string;
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
const WHATSAPP_LINK = "https://wa.me/2349060621425";
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
    { id: 'vodka', name: 'Vodka', price: 3000, color: 'bg-blue-500' },
    { id: 'gin', name: 'Dry Gin', price: 3000, color: 'bg-green-500' },
    { id: 'white_rum', name: 'White Rum', price: 3000, color: 'bg-yellow-500' },
    { id: 'dark_rum', name: 'Dark Rum', price: 3500, color: 'bg-amber-700' },
    { id: 'tequila', name: 'Tequila', price: 4000, color: 'bg-orange-500' },
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

const generateWhatsAppReceipt = (order: PastOrder) => {
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
  item: MenuItem;
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
    setIsProcessing(true);
    
    // 1 second delay for visual feedback
    setTimeout(() => {
        setIsProcessing(false);
        // Only open modal for specific customizable categories (Rice/Pasta)
        if (CUSTOMIZABLE_CATEGORIES.includes(categoryId)) { 
          onOpenModal(item); 
        } else {
          onAdd(item, categoryId);
          triggerFeedback();
        }
    }, 1000);
  };

  const triggerFeedback = () => {
    if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
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

        {hasQuantity && !CUSTOMIZABLE_CATEGORIES.includes(categoryId) ? (
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
                disabled={isProcessing}
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

// --- Main Component ---

const Menu: React.FC<MenuProps> = ({ onBack, theme }) => {
  const [activeCategory, setActiveCategory] = useState('rice');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItemExtended[]>([]);
  const [history, setHistory] = useState<PastOrder[]>([]);
  const [returningUser, setReturningUser] = useState<string | null>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartView, setCartView] = useState<CartView>('items');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [lastOrder, setLastOrder] = useState<PastOrder | null>(null);

  const [selectedMealItem, setSelectedMealItem] = useState<MenuItem | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

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
  const [specialRequests, setSpecialRequests] = useState(''); // New State
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedDeliveryPin, setGeneratedDeliveryPin] = useState<string | null>(null);
  
  const [needsBag, setNeedsBag] = useState(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    // 1. Initialize User Profile
    const profile = orderService.getUserProfile();
    
    // 2. Load History based on Profile
    setHistory(orderService.getHistory());

    // 3. Pre-fill form if data exists
    if (profile.name) {
      setReturningUser(profile.name);
      setCustomerName(profile.name);
    }
    if (profile.phone) {
      setCustomerPhone(profile.phone);
    }
  }, []);

  useEffect(() => {
    if (!isCartOpen) {
      setCartView('items');
    }
  }, [isCartOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
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

  // Validation functions
  const validateName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 3) return "Name is too short.";
    if (trimmed.split(' ').length < 2) return "Please enter your full name (First & Last).";
    if (/[^a-zA-Z\s'-]/.test(trimmed)) return "Name should only contain letters.";
    return "";
  };

  const validatePhone = (phone: string) => {
    const clean = phone.replace(/\s+/g, '');
    // Standard 11 digit 080... OR +234...
    // Regex: Starts with 0 and has 11 digits total OR starts with +234 and has 14 chars total
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

  const clearHistory = () => {
    localStorage.removeItem('reeplay_orders_v2');
    setHistory([]);
    setToastMessage("History cleared");
  };

  const filteredItems = useMemo(() => {
    if (searchQuery.length > 0) {
      const results: MenuItemExtended[] = [];
      Object.entries(MENU_ITEMS).forEach(([catId, items]) => {
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
    const items = MENU_ITEMS[activeCategory] || [];
    return items.map(item => ({ ...item, categoryId: activeCategory }));
  }, [activeCategory, searchQuery]);

  const addToCart = (item: MenuItem, category: string, quantity: number = 1, mods: string[] = [], customPrice?: number) => {
    if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
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
  
  // LOGIC IMPROVEMENT:
  // "Container" logic: Only for food items that are NOT in the excluded list (Shawarma, etc)
  const containerRequiredCount = useMemo(() => {
    return cart.reduce((total, item) => {
        // Must be a food category
        if (['rice', 'pasta', 'sides'].includes(item.categoryId)) {
            // Must NOT be a wrapper item (shawarma, etc)
            if (needsContainer(item.name)) {
                return total + item.quantity;
            }
        }
        return total;
    }, 0);
  }, [cart]);

  const containerCost = containerRequiredCount * CONTAINER_PRICE;

  // "Bag" logic: 1 bag for every 2 bulky items (Rice, Pasta, Sides - including Shawarma)
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

  const canCheckout = useMemo(() => {
    if (!customerName || !customerPhone || nameError || phoneError) return false;
    if (orderType === 'delivery') {
      return deliveryZoneId !== 'select' && address.length > 5;
    } else {
      return pickupTime !== '' && !pickupError;
    }
  }, [customerName, customerPhone, nameError, phoneError, orderType, deliveryZoneId, address, pickupTime, pickupError]);

  const handleConfirmOrder = () => {
    if (!canCheckout) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      const id = '#' + Math.floor(1000 + Math.random() * 9000);
      setOrderId(id);
      const pin = orderType === 'delivery' ? Math.floor(100000 + Math.random() * 899999).toString() : null;
      setGeneratedDeliveryPin(pin);

      const finalItems = [...cart];
      
      // Add detailed system items so they appear in receipt and history
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

      // Add Delivery Fee as a distinct item for receipt clarity
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
      
      // Add VAT as a distinct item for receipt clarity
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

      // SAVE ORDER & UPDATE PROFILE
      orderService.saveOrder(newOrder);
      orderService.updateProfile(customerName, customerPhone);
      
      setHistory(orderService.getHistory());
      setLastOrder(newOrder);
      
      setIsSubmitting(false);
      setIsCartOpen(false);
      setIsReceiptOpen(true);
      setCart([]);
    }, 1500);
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
        {/* ... (Header Section Remains Same) ... */}
        <div className={`flex justify-between items-center sticky top-0 z-50 py-4 -mx-4 px-4 md:mx-0 md:px-0 backdrop-blur-xl transition-colors duration-300 border-b ${isDark ? 'bg-black/80 border-white/5' : 'bg-white/80 border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/10 hover:bg-purple-600' : 'bg-gray-200 hover:bg-purple-600 hover:text-white'}`}>
              <ArrowLeft />
            </button>
            <button 
              onClick={() => setIsHistoryOpen(true)}
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

        {/* ... (Welcome Back Banner, Search, Carousel, Category Chips, Builder Mode, Menu Grid - All standard) ... */}
        {/* Welcome Back Banner */}
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

        {/* ... (Builder and Menu Grid content) ... */}
        {activeCategory === 'builder' ? (
          <div className="max-w-3xl mx-auto space-y-8 pb-24">
             {/* Builder content same as previous */}
             <div className="flex items-center gap-4 mb-4">
                 <button onClick={() => setActiveCategory('rice')} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                     <ArrowLeft className="w-5 h-5 text-white" />
                 </button>
                 <h2 className="text-xl font-bold text-white">Back to Food</h2>
             </div>

            <div className={`p-6 rounded-3xl text-center border ${isDark ? 'bg-black/50 backdrop-blur-md border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-white/80 border-white'}`}>
              <div className="inline-block p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg animate-pulse">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <h2 className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>The Drink Lab</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Mix and match to create your perfect poison.</p>
            </div>

            <div>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> 
                Choose Base Spirit
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BUILDER_DATA.spirits.map(spirit => (
                  <button
                    key={spirit.id}
                    onClick={() => setBuilderSpirit(spirit.id)}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group
                      ${builderSpirit === spirit.id 
                        ? `${spirit.color} border-transparent text-white shadow-lg scale-[1.02]` 
                        : isDark ? 'bg-black/40 border-white/10 hover:border-purple-500 text-gray-300' : 'bg-white border-gray-200 hover:border-purple-500 text-gray-700'}
                    `}
                  >
                    <div className="font-bold">{spirit.name}</div>
                    <div className={`text-xs mt-1 ${builderSpirit === spirit.id ? 'text-white/80' : 'text-yellow-500 font-mono'}`}>
                      {formatPrice(spirit.price)}
                    </div>
                    {builderSpirit === spirit.id && <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> 
                Add Mixers
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 {BUILDER_DATA.mixers.map(mixer => {
                    const isSelected = builderMixers.includes(mixer.id);
                    return (
                      <button
                        key={mixer.id}
                        onClick={() => toggleBuilderItem(builderMixers, setBuilderMixers, mixer.id)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all flex justify-between items-center
                          ${isSelected 
                            ? 'bg-purple-600 border-purple-500 text-white' 
                            : isDark ? 'bg-black/40 border-white/10 text-gray-400' : 'bg-white border-gray-200 text-gray-600'}
                        `}
                      >
                        <span>{mixer.name}</span>
                        {isSelected && <CheckCheck className="w-4 h-4" />}
                      </button>
                    );
                 })}
              </div>
            </div>

             <div>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span> 
                Finishing Touches
              </h3>
              <div className="flex flex-wrap gap-2">
                 {BUILDER_DATA.garnishes.map(garnish => {
                    const isSelected = builderGarnishes.includes(garnish.id);
                    return (
                      <button
                        key={garnish.id}
                        onClick={() => toggleBuilderItem(builderGarnishes, setBuilderGarnishes, garnish.id)}
                        className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all
                          ${isSelected 
                            ? 'bg-pink-600 border-pink-500 text-white' 
                            : isDark ? 'bg-black/40 border-white/10 text-gray-500' : 'bg-white border-gray-200 text-gray-500'}
                        `}
                      >
                        {garnish.name} {garnish.price > 0 && `(+${garnish.price})`}
                      </button>
                    );
                 })}
              </div>
            </div>
            
            <div className={`fixed bottom-0 left-0 right-0 p-4 border-t z-50 backdrop-blur-xl ${isDark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-gray-200'}`}>
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                  <div className="flex-1">
                     <div className={`text-xs uppercase font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Total Price</div>
                     <div className="text-2xl font-black text-yellow-500 font-mono">{formatPrice(calculateBuilderTotal())}</div>
                  </div>
                  <button
                    disabled={!builderSpirit}
                    onClick={handleAddBuiltDrink}
                    className={`flex-[2] py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
                      ${builderSpirit 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white' 
                        : isDark ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                  >
                    {builderSpirit ? 'Add to Order' : 'Select a Spirit'}
                  </button>
                </div>
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
            {filteredItems.map((item, i) => {
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
            {filteredItems.length === 0 && (
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
             className="fixed top-24 left-1/2 -translate-x-1/2 z-[90] bg-green-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold whitespace-nowrap pointer-events-none"
          >
            <CheckCircle className="w-5 h-5" /> {toastMessage}
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Floating Buttons */}
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

      {/* --- CONFIRMATION & MEAL MODALS --- (unchanged, just placed here for brevity) */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
             <MotionDiv 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`p-6 rounded-xl border max-w-xs w-full text-center shadow-2xl ${isDark ? 'bg-[#18181b] border-white/10' : 'bg-white border-gray-200'}`}
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-500/10 rounded-full">
                   <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Are you sure?</h3>
              <p className={`mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {confirmAction.type === 'clear' 
                  ? 'This will remove all items from your cart. This action cannot be undone.' 
                  : 'This will remove this item from your cart.'}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmAction(null)} 
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={performConfirmAction} 
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                >
                  Remove
                </button>
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
               onClick={() => {
                 setIsMealModalOpen(false);
                 setSelectedAddOns([]);
                 setSelectedMealItem(null);
               }}
               className="absolute inset-0 bg-black/90 backdrop-blur-md"
             />
             
             <MotionDiv
                initial={{ scale: 0.9, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                className="relative w-full max-w-md bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
             >
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-white/5 relative">
                  <button 
                    onClick={() => {
                        setIsMealModalOpen(false);
                        setSelectedAddOns([]);
                        setSelectedMealItem(null);
                    }}
                    className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-bold text-white pr-8">{selectedMealItem.name}</h3>
                  <p className="text-yellow-500 font-mono font-bold mt-1">{selectedMealItem.price}</p>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                   <p className="text-gray-400 text-sm mb-6 leading-relaxed">{selectedMealItem.desc}</p>
                   
                   <div className="space-y-4">
                      <h4 className="text-xs uppercase font-bold text-purple-400 tracking-widest mb-2">Add Extras (Optional)</h4>
                      {KITCHEN_ADDONS.map(addon => {
                        const isSelected = selectedAddOns.includes(addon.id);
                        return (
                           <div 
                             key={addon.id}
                             onClick={() => toggleAddOn(addon.id)}
                             className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
                               ${isSelected ? 'bg-purple-900/30 border-purple-500' : 'bg-white/5 border-transparent hover:bg-white/10'}
                             `}
                           >
                             <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-500'}`}>
                                   {isSelected && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <span className="text-white font-bold">{addon.name}</span>
                             </div>
                             <span className="text-xs font-mono text-yellow-500">+{formatPrice(addon.price)}</span>
                           </div>
                        );
                      })}
                   </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-black/50 backdrop-blur-md">
                   <div className="flex justify-between items-center mb-4 text-sm">
                      <span className="text-gray-400">Total Item Price:</span>
                      <span className="text-xl font-bold text-white font-mono">
                         {formatPrice(
                             parsePrice(selectedMealItem.price) + 
                             selectedAddOns.reduce((sum, id) => sum + (KITCHEN_ADDONS.find(k => k.id === id)?.price || 0), 0)
                         )}
                      </span>
                   </div>
                   <button
                     onClick={handleCustomizationSubmit}
                     className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                   >
                     Add to Order <Plus className="w-5 h-5" />
                   </button>
                </div>
             </MotionDiv>
          </div>
        )}
      </AnimatePresence>

      {/* --- HISTORY MODAL --- */}
      <AnimatePresence>
        {isHistoryOpen && (
          <MotionDiv 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
          >
             <MotionDiv 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md border rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden
                ${isDark ? 'bg-[#18181b] border-white/10' : 'bg-white border-white/40'}`}
            >
              <div className={`p-6 border-b flex justify-between items-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                <div>
                  <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>YOUR HISTORY</h3>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Tap to View Receipt</p>
                </div>
                <button onClick={() => setIsHistoryOpen(false)} className={`p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors ${isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-500 shadow-sm'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 p-4 custom-scrollbar bg-opacity-50">
                {history.length === 0 ? (
                  <div className={`text-center py-12 flex flex-col items-center justify-center h-full ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <div className="w-16 h-16 rounded-full bg-gray-500/10 flex items-center justify-center mb-4">
                        <Receipt className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="font-bold">No orders yet.</p>
                    <p className="text-sm mt-1">Time to start your legacy.</p>
                  </div>
                ) : (
                  history.map((order, i) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        setLastOrder(order);
                        setIsReceiptOpen(true);
                        setIsHistoryOpen(false);
                      }}
                      className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.01]
                        ${isDark 
                            ? 'bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-white/10' 
                            : 'bg-white border-gray-100 hover:border-purple-200 hover:shadow-lg shadow-sm'}
                      `}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(order.date).toLocaleDateString()} • {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="flex justify-between items-end">
                          <div>
                             <p className={`font-bold text-sm line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {order.items[0].name} 
                                {order.items.length > 1 && <span className="opacity-60 font-normal"> +{order.items.length - 1} more</span>}
                             </p>
                             <p className="text-xs text-gray-500 mt-1">ID: {order.id}</p>
                          </div>
                          <span className={`font-mono font-bold text-lg ${isDark ? 'text-yellow-500' : 'text-purple-700'}`}>
                              {formatPrice(order.total)}
                          </span>
                      </div>
                      <ChevronRight className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                  ))
                )}
              </div>
              
              {history.length > 0 && (
                <div className={`p-4 border-t ${isDark ? 'border-white/10 bg-black/40' : 'border-gray-100 bg-gray-50'}`}>
                  <button 
                    onClick={clearHistory}
                    className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Clear History
                  </button>
                </div>
              )}
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* --- RECEIPT MODAL (REALISTIC) --- */}
      <AnimatePresence>
        {isReceiptOpen && lastOrder && (
          <MotionDiv 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            {/* Paper Receipt Container */}
            <MotionDiv 
                initial={{ y: 100, scale: 0.9 }} 
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 100, scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className={`relative w-full max-w-sm ${isDark ? 'bg-[#e4e4e7]' : 'bg-[#fffcf5]'} text-black shadow-2xl overflow-hidden`}
                style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {/* Receipt Top Edge (Optional for realism, usually straight) */}
              
              <div className="p-6 pb-8 relative z-10">
                {/* Header */}
                <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        <Crown className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-widest">Reeplay</h2>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Lounge & Club • Ogbomosho</p>
                    <p className="text-[10px] text-gray-500 mt-1">{new Date(lastOrder.date).toLocaleString()}</p>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-6 text-sm">
                    {lastOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                            <span className="max-w-[70%]">{item.quantity}x {item.name}</span>
                            <span className="font-bold">{formatPrice(item.priceRaw * item.quantity)}</span>
                        </div>
                    ))}
                </div>

                {/* Special Requests */}
                {lastOrder.specialRequests && (
                    <div className="mb-6 bg-gray-100 p-2 rounded text-xs">
                        <p className="font-bold mb-1 uppercase text-[10px]">Special Instructions:</p>
                        <p className="italic">{lastOrder.specialRequests}</p>
                    </div>
                )}

                {/* Totals */}
                <div className="border-t-2 border-dashed border-gray-300 pt-4 space-y-1 mb-6">
                    <div className="flex justify-between text-xs">
                        <span>SUBTOTAL</span>
                        <span>{formatPrice(lastOrder.total * 0.9)}</span> 
                        {/* Rough calc for visual subtotal */}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>TAX/VAT</span>
                        <span>Included</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold mt-2 pt-2 border-t border-black">
                        <span>TOTAL</span>
                        <span>{formatPrice(lastOrder.total)}</span>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="bg-gray-100 p-3 rounded-lg mb-6 text-xs space-y-1">
                    <p><span className="font-bold">Customer:</span> {lastOrder.customerName}</p>
                    <p><span className="font-bold">Order ID:</span> {lastOrder.id}</p>
                    <p><span className="font-bold">Type:</span> {lastOrder.type.toUpperCase()}</p>
                    {lastOrder.deliveryPin && (
                        <p className="mt-2 pt-2 border-t border-gray-300 text-center">
                            <span className="block font-bold mb-1">DELIVERY PIN</span>
                            <span className="text-xl font-bold tracking-widest bg-white px-2 py-1 rounded border border-gray-300 block w-fit mx-auto">
                                {lastOrder.deliveryPin}
                            </span>
                        </p>
                    )}
                </div>

                {/* Barcode & Footer */}
                <div className="text-center space-y-4">
                    <div className="h-12 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/UPC-A-036000291452.svg/1200px-UPC-A-036000291452.svg.png')] bg-cover bg-center opacity-70 grayscale h-10 w-3/4 mx-auto" />
                    <p className="text-[10px] uppercase">Thank you for your vibe</p>
                    
                    {/* Action Buttons inside Receipt */}
                    <div className="flex gap-2 mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <button 
                            onClick={() => {
                                const msg = generateWhatsAppReceipt(lastOrder);
                                window.open(`${WHATSAPP_LINK}?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-green-700"
                        >
                            <MessageCircle className="w-3 h-3" /> WhatsApp
                        </button>
                        <button 
                            onClick={() => setIsReceiptOpen(false)}
                            className="flex-1 py-2 bg-gray-200 text-black rounded-lg text-xs font-bold hover:bg-gray-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
              </div>

              {/* Jagged Bottom Edge */}
              <div className={isDark ? "receipt-jagged-edge-dark" : "receipt-jagged-edge"}></div>
            </MotionDiv>

            {/* Close Button Outside */}
            <button 
                onClick={() => setIsReceiptOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* --- CART DRAWER --- (unchanged) */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <MotionDiv 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            {/* ... Cart Drawer Content ... */}
            <MotionDiv 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className={`fixed top-0 right-0 h-full w-full max-w-md z-[101] flex flex-col shadow-2xl border-l ${isDark ? 'bg-[#121212] border-white/10' : 'bg-white border-gray-200'}`}
            >
              {/* ... (Existing Cart Content same as before) ... */}
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
                <div className="flex items-center gap-2">
                    {cart.length > 0 && cartView === 'items' && (
                        <button 
                            onClick={() => setConfirmAction({ type: 'clear' })}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border transition-colors ${isDark ? 'text-red-400 bg-red-400/10 border-red-400/20 hover:bg-red-400/20' : 'text-red-600 bg-red-100 border-red-200 hover:bg-red-200'}`}
                        >
                            Clear
                        </button>
                    )}
                    <button 
                      onClick={() => setIsCartOpen(false)} 
                      className={`p-2 rounded-full flex items-center gap-1 ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-500 hover:text-black'}`}
                      title="Minimize Cart"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                </div>
              </div>

              {cartView === 'items' && (
                  <>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {cart.length === 0 ? (
                        <div className={`h-full flex flex-col items-center justify-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-bold text-lg">Your cart is empty.</p>
                            <p className="text-sm opacity-60">Start adding vibes from the menu.</p>
                        </div>
                        ) : (
                        <LayoutGroup>
                          {cart.map((item, idx) => (
                              <MotionDiv layout key={idx} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className={`p-4 rounded-xl border relative overflow-hidden ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                              <div className="flex justify-between items-start mb-2 relative z-10">
                                  <div>
                                  <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                                  {item.modifiers && item.modifiers.length > 0 && (
                                      <p className="text-xs text-gray-500 mt-1">+ {item.modifiers.join(', ')}</p>
                                  )}
                                  </div>
                                  <p className="text-yellow-500 font-mono text-sm">{formatPrice(item.priceRaw * item.quantity)}</p>
                              </div>
                              <div className="flex justify-between items-center mt-3 relative z-10">
                                  <div className={`flex items-center gap-3 rounded-lg p-1 ${isDark ? 'bg-black/30' : 'bg-gray-200'}`}>
                                      <button onClick={() => setCart(c => {
                                      const nc = [...c];
                                      if(nc[idx].quantity > 1) nc[idx].quantity--;
                                      return nc;
                                      })} className={`p-1 hover:text-purple-500 ${isDark ? 'text-white' : 'text-black'}`}><Minus className="w-4 h-4"/></button>
                                      <span className={`text-sm font-bold w-4 text-center ${isDark ? 'text-white' : 'text-black'}`}>{item.quantity}</span>
                                      <button onClick={() => setCart(c => {
                                      const nc = [...c];
                                      nc[idx].quantity++;
                                      return nc;
                                      })} className={`p-1 hover:text-purple-500 ${isDark ? 'text-white' : 'text-black'}`}><Plus className="w-4 h-4"/></button>
                                  </div>
                                  <button onClick={() => setConfirmAction({ type: 'remove', itemIndex: idx })} className="text-red-500/70 hover:text-red-500">
                                  <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                              </MotionDiv>
                          ))}
                        </LayoutGroup>
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className={`flex-none p-6 border-t z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] ${isDark ? 'bg-[#18181b] border-white/10' : 'bg-white border-gray-200'}`}>
                            <div className={`space-y-4 mb-4 text-sm border-b pb-4 mb-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                <div className="space-y-2">
                                    <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Food & Drinks</div>
                                    <div className={`flex justify-between font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                      <span>Subtotal</span>
                                      <span>{formatPrice(cartSubTotal)}</span>
                                    </div>
                                    <div className={`flex justify-between font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                      <span>VAT (7.5%)</span>
                                      <span>{formatPrice(vatAmount)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-dashed border-gray-500/20">
                                    <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Packaging & Services</div>
                                    
                                    <div className={`flex justify-between font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                      <span className="flex items-center gap-1">
                                        Containers <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-md text-gray-400">x{containerRequiredCount}</span>
                                      </span>
                                      <span>{formatPrice(containerCost)}</span>
                                    </div>
                                    
                                    {needsBag && bagCount > 0 && (
                                      <div className={`flex justify-between font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        <span className="flex items-center gap-1">
                                          Paper Bags <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-md text-gray-400">x{bagCount}</span>
                                        </span>
                                        <span>{formatPrice(bagFee)}</span>
                                      </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className={`flex justify-between text-xl font-bold mt-2 mb-4 ${isDark ? 'text-white' : 'text-black'}`}><span>Total</span><span className="text-yellow-500 font-mono">{formatPrice(finalTotal)}</span></div>
                            
                            <div className="flex gap-2">
                              <button 
                                  onClick={() => setIsCartOpen(false)}
                                  className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                              >
                                  Minimize
                              </button>
                              <button 
                                  onClick={() => setCartView('checkout')}
                                  className="flex-[2] py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                              >
                                  Checkout <ArrowRight className="w-5 h-5" />
                              </button>
                            </div>
                        </div>
                    )}
                  </>
              )}

              {cartView === 'checkout' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-20">
                        {/* ... (Checkout Form same as existing, omitted for brevity but XML contains full file) ... */}
                        {(containerRequiredCount > 0 || bagCount > 0) && (
                          <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-blue-50 border-blue-100'}`}>
                             <div className="flex items-center justify-between mb-3">
                               <h4 className={`text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-blue-800'}`}>Packaging</h4>
                               <button 
                                 onClick={() => setNeedsBag(!needsBag)}
                                 className={`transition-colors ${needsBag ? (isDark ? 'text-green-400' : 'text-green-600') : 'text-gray-500'}`}
                               >
                                  {needsBag ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                               </button>
                             </div>
                             
                             <div className="space-y-3">
                               <div className="flex items-center gap-3">
                                  <PackageOpen className={`w-5 h-5 ${isDark ? 'text-purple-500' : 'text-blue-500'}`} />
                                  <div className="flex-1">
                                     <div className="flex justify-between items-center">
                                       <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                         {needsBag ? `Premium Paper Bags (x${bagCount})` : 'No Paper Bag'}
                                       </p>
                                       {needsBag && <span className="text-xs font-mono text-yellow-500">{formatPrice(bagFee)}</span>}
                                     </div>
                                     <p className={`text-[10px] leading-tight mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                       {needsBag 
                                         ? `Required for takeaway (1 bag per 2 main items).` 
                                         : "Items will be handed over individually."}
                                     </p>
                                  </div>
                               </div>

                               <div className="flex items-center gap-3 pt-3 border-t border-dashed border-gray-500/20">
                                  <div className={`w-5 h-5 rounded flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                    <span className="text-[10px] font-bold">x{containerRequiredCount}</span>
                                  </div>
                                  <div className="flex-1">
                                     <div className="flex justify-between items-center">
                                       <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>Food Containers</p>
                                       <span className="text-xs font-mono text-yellow-500">{formatPrice(containerCost)}</span>
                                     </div>
                                     <p className="text-[10px] text-gray-500 mt-0.5">Required for unwrapped food items.</p>
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
                            <input 
                              type="time"
                              min="15:00"
                              max="22:30"
                              value={pickupTime} 
                              onChange={handleTimeChange} 
                              className={`w-full border p-3 rounded-xl outline-none focus:border-purple-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'} ${pickupError ? 'border-red-500' : ''}`} 
                            />
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
                            <div className="space-y-2">
                                <label className={`text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Address Details</label>
                                <textarea placeholder="Hostel Name, Room Number, Description..." value={address} onChange={e => setAddress(e.target.value)} className={`w-full border p-3 rounded-xl outline-none focus:border-purple-500 resize-none h-24 text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'}`}/>
                            </div>
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3 items-start">
                              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                              <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                <strong>Note:</strong> All cooked meals take 45 minutes or less to prepare and deliver. Thank you for your patience!
                              </p>
                            </div>
                        </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className={`text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your Name</label>
                                <input 
                                    type="text" 
                                    placeholder="First & Last Name" 
                                    value={customerName} 
                                    onChange={handleNameChange} 
                                    className={`w-full border p-3 rounded-xl text-sm outline-none focus:border-purple-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'} ${nameError ? 'border-red-500' : ''}`} 
                                />
                                {nameError && <p className="text-red-500 text-xs">{nameError}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className={`text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone</label>
                                <input 
                                    type="tel" 
                                    placeholder="080... or +234..." 
                                    value={customerPhone} 
                                    onChange={handlePhoneChange} 
                                    className={`w-full border p-3 rounded-xl text-sm outline-none focus:border-purple-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'} ${phoneError ? 'border-red-500' : ''}`} 
                                />
                                {phoneError && <p className="text-red-500 text-xs">{phoneError}</p>}
                            </div>
                        </div>

                        {/* Special Requests Field */}
                        <div className="space-y-2">
                            <label className={`text-xs uppercase font-bold flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <FileText className="w-3 h-3"/> Special Requests (Optional)
                            </label>
                            <textarea 
                                placeholder="E.g., No onions, extra spicy, separate sauce..." 
                                value={specialRequests} 
                                onChange={e => setSpecialRequests(e.target.value)} 
                                className={`w-full border p-3 rounded-xl outline-none focus:border-purple-500 resize-none h-20 text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'}`}
                            />
                        </div>

                    </div>

                    <div className={`flex-none p-6 border-t ${isDark ? 'bg-[#18181b] border-white/10' : 'bg-white border-gray-200'}`}>
                        <div className={`space-y-2 mb-4 text-sm`}>
                             <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}><span>Subtotal (Food & Drinks)</span><span className="font-mono">{formatPrice(cartSubTotal)}</span></div>
                             <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}><span>Packaging</span><span className="font-mono">{formatPrice(containerCost + bagFee)}</span></div>
                             <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}><span>VAT (7.5%)</span><span className="font-mono">{formatPrice(vatAmount)}</span></div>
                            {orderType === 'delivery' && <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-gray-600'}`}><span>Delivery Fee</span><span className="font-mono">{formatPrice(deliveryFee)}</span></div>}
                            <div className={`flex justify-between text-xl font-bold mt-2 ${isDark ? 'text-white' : 'text-black'}`}><span>Total to Pay</span><span className="text-yellow-500 font-mono">{formatPrice(finalTotal)}</span></div>
                        </div>

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