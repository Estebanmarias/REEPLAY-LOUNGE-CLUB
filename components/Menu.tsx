import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flame, Wine, Utensils, Crown, GlassWater, Plus, Minus, ShoppingBag, X, Search, ChevronRight, Loader2, Trash2, MapPin, Clock, CheckCircle, History, ChefHat, Bike, CheckCheck, PartyPopper, AlertCircle } from 'lucide-react';
import { orderService, PastOrder } from '../lib/orderService';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

// --- Types ---
interface MenuItem {
  name: string;
  desc: string;
  price: string;
}

interface CartItemExtended extends MenuItem {
  priceRaw: number;
  quantity: number;
  modifiers?: string[];
}

interface MenuProps {
  onBack: () => void;
}

type OrderType = 'pickup' | 'delivery';

// --- Constants & Data ---
const IG_DM_LINK = "https://ig.me/m/reeplaylounge_ogbomoso"; 
const VAT_RATE = 0.075; 

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

const CATEGORIES = [
  { id: 'rice', label: 'Rice Specialties', icon: Utensils },
  { id: 'pasta', label: 'Pasta & Noodles', icon: Utensils },
  { id: 'sides', label: 'Sides & Bites', icon: Flame },
  { id: 'cocktails', label: 'Cocktails & Shakes', icon: Wine },
  { id: 'bottles', label: 'Bottle Service', icon: Crown },
  { id: 'beverages', label: 'Beer & Drinks', icon: GlassWater },
];

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

const parsePrice = (priceStr: string) => parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
const formatPrice = (price: number) => "₦" + price.toLocaleString();

// --- Sub-Components ---

const MenuItemCard: React.FC<{
  item: MenuItem;
  categoryId: string;
  onAdd: (item: MenuItem) => void;
  onOpenModal: (item: MenuItem) => void;
}> = ({ item, categoryId, onAdd, onOpenModal }) => {
  const [isAdded, setIsAdded] = useState(false);
  
  const handleClick = () => {
    // Only open modal for customizable food items (rice/pasta/sides)
    if (['rice', 'pasta', 'sides'].includes(categoryId)) { 
      onOpenModal(item); 
    } else {
      onAdd(item);
      triggerFeedback();
    }
  };

  const triggerFeedback = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden p-6 rounded-2xl border border-white/10 bg-black/40 hover:bg-black/60 hover:border-purple-500/30 transition-all flex flex-col justify-between group"
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
        </div>
        <span className="text-lg font-black text-yellow-500 font-mono">{item.price}</span>
      </div>
      
      <div className="flex justify-end mt-2 relative">
         {/* Flying Icon Animation */}
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

        <MotionButton
          whileTap={{ scale: 0.95 }}
          onClick={handleClick}
          className={`
            relative z-0 flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300
            ${isAdded 
              ? 'bg-green-600/20 text-green-500 border border-green-500/50' 
              : 'bg-white/10 hover:bg-purple-600 text-white'}
          `}
        >
          {['rice', 'pasta', 'sides'].includes(categoryId) ? (
            <>Customize <ChevronRight className="w-4 h-4" /></>
          ) : (
            isAdded ? <><CheckCircle className="w-4 h-4" /> Added</> : "Add to Order"
          )}
        </MotionButton>
      </div>
    </MotionDiv>
  );
};

// --- Main Component ---

const Menu: React.FC<MenuProps> = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState('rice');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItemExtended[]>([]);
  const [history, setHistory] = useState<PastOrder[]>([]);
  
  // Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Customization State
  const [selectedMealItem, setSelectedMealItem] = useState<MenuItem | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  
  // Checkout Form State
  const [orderId, setOrderId] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('pickup');
  const [deliveryZoneId, setDeliveryZoneId] = useState('select');
  const [address, setAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedDeliveryPin, setGeneratedDeliveryPin] = useState<string | null>(null);

  useEffect(() => {
    setHistory(orderService.getHistory());
    setCustomerName(localStorage.getItem('reeplay_user_name') || '');
    setCustomerPhone(localStorage.getItem('reeplay_user_phone') || '');
  }, []);

  const filteredItems = useMemo(() => {
    const items = MENU_ITEMS[activeCategory] || [];
    if (!searchQuery) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeCategory, searchQuery]);

  // Cart Logic
  const addToCart = (item: MenuItem, quantity: number = 1, mods: string[] = [], customPrice?: number) => {
    setCart(prev => {
      let newCart = [...prev];
      const basePrice = parsePrice(item.price);
      let unitPrice = customPrice || basePrice;

      const uniqueId = `${item.name}-${mods.sort().join('-')}`;
      const existingIndex = newCart.findIndex(i => `${i.name}-${(i.modifiers || []).sort().join('-')}` === uniqueId);

      if (existingIndex > -1) {
        newCart[existingIndex].quantity += quantity;
      } else {
        newCart.push({ ...item, priceRaw: unitPrice, quantity, modifiers: mods });
      }
      
      // Auto-add Bag charge if not present for orders
      if (!newCart.find(i => i.name === EXTRAS.bag.name)) {
        newCart.push({ ...EXTRAS.bag, priceRaw: parsePrice(EXTRAS.bag.price), quantity: 1, desc: "Required for takeout" });
      }

      return newCart;
    });
  };

  const handleCustomizationSubmit = () => {
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
    addToCart(selectedMealItem, 1, modifiersList, totalPrice);
    setIsMealModalOpen(false);
    setSelectedAddOns([]);
    setSelectedMealItem(null);
    setIsCartOpen(true);
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const cartSubTotal = useMemo(() => cart.reduce((t, i) => t + (i.priceRaw * i.quantity), 0), [cart]);
  const vatAmount = cartSubTotal * VAT_RATE;
  const deliveryFee = orderType === 'delivery' ? (DELIVERY_ZONES.find(z => z.id === deliveryZoneId)?.price || 0) : 0;
  const finalTotal = cartSubTotal + vatAmount + deliveryFee;

  const canCheckout = useMemo(() => {
    if (!customerName || !customerPhone) return false;
    if (orderType === 'delivery') {
      return deliveryZoneId !== 'select' && address.length > 5;
    } else {
      return pickupTime !== '';
    }
  }, [customerName, customerPhone, orderType, deliveryZoneId, address, pickupTime]);

  const handleConfirmOrder = () => {
    if (!canCheckout) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      const id = '#' + Math.floor(1000 + Math.random() * 9000);
      setOrderId(id);
      const pin = orderType === 'delivery' ? Math.floor(100000 + Math.random() * 899999).toString() : null;
      setGeneratedDeliveryPin(pin);

      const newOrder: PastOrder = {
        id,
        date: new Date().toISOString(),
        items: cart.map(i => ({ 
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
        deliveryPin: pin || undefined
      };

      orderService.saveOrder(newOrder);
      setHistory(orderService.getHistory());
      localStorage.setItem('reeplay_user_name', customerName);
      localStorage.setItem('reeplay_user_phone', customerPhone);
      
      setIsSubmitting(false);
      setIsCartOpen(false);
      setIsReceiptOpen(true);
      setCart([]);
    }, 1500);
  };

  // Status Badge Logic for History
  const getStatusDisplay = (status: string) => {
    const s = status.toLowerCase();
    
    if (s === 'delivered' || s === 'completed') {
      return {
        badge: (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
            <CheckCheck className="w-3 h-3" /> Completed
          </span>
        ),
        bgIcon: <CheckCircle className="w-32 h-32 text-green-500/10 absolute -bottom-6 -right-6 transform rotate-12" />
      };
    }
    if (s === 'out for delivery') {
      return {
        badge: (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-500 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">
            <Bike className="w-3 h-3" /> On Route
          </span>
        ),
        bgIcon: <Bike className="w-32 h-32 text-purple-500/10 absolute -bottom-6 -right-6 transform -rotate-12" />
      };
    }
    if (s === 'confirmed') {
      return {
        badge: (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
            <ChefHat className="w-3 h-3" /> Cooking
          </span>
        ),
        bgIcon: <ChefHat className="w-32 h-32 text-blue-500/10 absolute -bottom-6 -right-6 transform rotate-6" />
      };
    }
    // Default Pending
    return {
      badge: (
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
          <Clock className="w-3 h-3 animate-pulse" /> Pending
        </span>
      ),
      bgIcon: <Clock className="w-32 h-32 text-yellow-500/10 absolute -bottom-6 -right-6 transform -rotate-12" />
    };
  };

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="relative min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto z-20"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-purple-600 transition-colors">
            <ArrowLeft />
          </button>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 bg-white/10 rounded-full hover:bg-yellow-600 transition-colors flex items-center gap-2 px-4"
          >
            <History className="w-5 h-5" />
            <span className="text-sm font-bold hidden md:inline">My Orders</span>
          </button>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">Menu</h2>
          <p className="text-xs text-gray-400">Order for Pickup or Delivery</p>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="mb-8 sticky top-20 z-30 bg-black pt-2 pb-4">
        <div className="relative max-w-md mx-auto mb-4">
          <input 
            type="text" 
            placeholder="Search for Jollof, Drinks, Cocktails..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:border-purple-500 outline-none placeholder:text-gray-500 transition-all focus:bg-white/10" 
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)} 
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap border transition-all font-medium text-sm
                ${activeCategory === cat.id ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}
              `}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
        {filteredItems.map((item, i) => (
          <MenuItemCard 
            key={i} 
            item={item} 
            categoryId={activeCategory} 
            onAdd={addToCart} 
            onOpenModal={(it) => { setSelectedMealItem(it); setIsMealModalOpen(true); }} 
          />
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No items found for "{searchQuery}". Try another category or term.</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <MotionButton 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsCartOpen(true)} 
          className="fixed bottom-8 right-8 z-40 bg-purple-600 hover:bg-purple-500 p-4 rounded-full shadow-[0_0_30px_rgba(147,51,234,0.5)] flex items-center justify-center transition-all hover:scale-110 group"
        >
          <ShoppingBag className="w-6 h-6 text-white" />
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#111]">
            {cart.reduce((a, b) => a + b.quantity, 0)}
          </span>
        </MotionButton>
      )}

      {/* --- CUSTOMIZATION MODAL --- */}
      <AnimatePresence>
        {isMealModalOpen && selectedMealItem && (
          <MotionDiv 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[110] flex items-end md:items-center justify-center p-0 md:p-4"
          >
            <MotionDiv 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="w-full max-w-md bg-[#18181b] border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedMealItem.name}</h3>
                  <p className="text-yellow-500 font-mono text-lg">{selectedMealItem.price}</p>
                </div>
                <button onClick={() => setIsMealModalOpen(false)} className="p-2 bg-white/10 rounded-full hover:bg-red-500/20 hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Add Extras</h4>
                  <div className="space-y-2">
                    {KITCHEN_ADDONS.map(addon => {
                      const isSelected = selectedAddOns.includes(addon.id);
                      return (
                        <div 
                          key={addon.id} 
                          onClick={() => toggleAddOn(addon.id)}
                          className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-purple-600/20 border-purple-500' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                          <span className={isSelected ? 'text-white' : 'text-gray-300'}>{addon.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono text-yellow-500">+{addon.price}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-500'}`}>
                              {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <button 
                  onClick={handleCustomizationSubmit}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-all"
                >
                  Add to Cart
                </button>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* --- CART DRAWER --- */}
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
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#121212] z-[101] flex flex-col shadow-2xl border-l border-white/10"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-black uppercase tracking-wider">Your Order</h2>
                <div className="flex items-center gap-3">
                    {cart.length > 0 && (
                        <button 
                            onClick={() => {
                                if(window.confirm('Clear all items from your cart?')) setCart([]);
                            }}
                            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-400/10 rounded-full border border-red-400/20 hover:bg-red-400/20 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                    <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                    <X />
                    </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-white">{item.name}</p>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">+ {item.modifiers.join(', ')}</p>
                          )}
                        </div>
                        <p className="text-yellow-500 font-mono text-sm">{formatPrice(item.priceRaw * item.quantity)}</p>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                         <div className="flex items-center gap-3 bg-black/30 rounded-lg p-1">
                            <button onClick={() => setCart(c => {
                              const nc = [...c];
                              if(nc[idx].quantity > 1) nc[idx].quantity--;
                              return nc;
                            })} className="p-1 hover:text-purple-500"><Minus className="w-4 h-4"/></button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => setCart(c => {
                              const nc = [...c];
                              nc[idx].quantity++;
                              return nc;
                            })} className="p-1 hover:text-purple-500"><Plus className="w-4 h-4"/></button>
                         </div>
                         <button onClick={() => setCart(c => c.filter((_, i) => i !== idx))} className="text-red-500/70 hover:text-red-500">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-[#18181b] border-t border-white/10">
                  <div className="space-y-4 mb-6">
                    <div className="flex bg-black/50 p-1 rounded-xl">
                      <button onClick={() => setOrderType('pickup')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${orderType === 'pickup' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Pickup</button>
                      <button onClick={() => setOrderType('delivery')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${orderType === 'delivery' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Delivery</button>
                    </div>

                    {orderType === 'pickup' ? (
                       <div className="space-y-2">
                          <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Pickup Time</label>
                          <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-purple-500" />
                       </div>
                    ) : (
                       <div className="space-y-3">
                          <div className="space-y-2">
                            <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1"><MapPin className="w-3 h-3"/> Delivery Area</label>
                            <select value={deliveryZoneId} onChange={e => setDeliveryZoneId(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-purple-500 appearance-none">
                              {DELIVERY_ZONES.map(z => <option key={z.id} value={z.id} className="bg-gray-900">{z.label} {z.price > 0 ? `(+${z.price})` : ''}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs text-gray-400 uppercase font-bold">Address Details</label>
                             <textarea placeholder="Hostel Name, Room Number, Description..." value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-purple-500 resize-none h-20 text-sm"/>
                          </div>
                       </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Your Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-sm outline-none focus:border-purple-500" />
                      <input type="tel" placeholder="Phone Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-sm outline-none focus:border-purple-500" />
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-white/10 pt-4 mb-4 text-sm">
                    <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatPrice(cartSubTotal)}</span></div>
                    <div className="flex justify-between text-gray-400"><span>VAT (7.5%)</span><span>{formatPrice(vatAmount)}</span></div>
                    {orderType === 'delivery' && <div className="flex justify-between text-gray-400"><span>Delivery Fee</span><span>{formatPrice(deliveryFee)}</span></div>}
                    <div className="flex justify-between text-xl font-bold text-white mt-2"><span>Total</span><span className="text-yellow-500">{formatPrice(finalTotal)}</span></div>
                  </div>

                  <button onClick={handleConfirmOrder} disabled={!canCheckout || isSubmitting} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canCheckout ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}>
                    {isSubmitting ? <Loader2 className="animate-spin w-5 h-5"/> : (
                      <>Confirm Order <span className="bg-black/20 px-2 py-0.5 rounded text-xs ml-1">{formatPrice(finalTotal)}</span></>
                    )}
                  </button>
                  {!canCheckout && <p className="text-red-400 text-xs text-center mt-2">Please fill in all details correctly.</p>}
                </div>
              )}
            </MotionDiv>
          </>
        )}
      </AnimatePresence>

      {/* --- HISTORY MODAL --- */}
      <AnimatePresence>
        {isHistoryOpen && (
          <MotionDiv 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                  <History className="text-yellow-500" />
                  <h3 className="text-xl font-bold text-white">Order History</h3>
                </div>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No orders yet.</p>
                  </div>
                ) : (
                  history.map((order, idx) => {
                    const statusConfig = getStatusDisplay(order.status);
                    return (
                      <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-3 z-10 relative">
                          <div>
                            <p className="font-mono text-xs text-gray-500">ID: {order.id}</p>
                            <p className="font-bold text-white text-lg">{formatPrice(order.total)}</p>
                          </div>
                          {statusConfig.badge}
                        </div>
                        
                        <div className="space-y-1 mb-4 z-10 relative">
                          {order.items.map((item, i) => (
                             <div key={i} className="text-sm text-gray-300 flex justify-between">
                               <span>{item.quantity}x {item.name}</span>
                             </div>
                          ))}
                        </div>

                        <div className="border-t border-white/5 pt-3 flex justify-between items-center text-xs text-gray-400 z-10 relative">
                           <span>{new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           <span className="uppercase font-bold">{order.type}</span>
                        </div>
                        
                        {/* Status Watermark */}
                        {statusConfig.bgIcon}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* --- RECEIPT MODAL --- */}
      <AnimatePresence>
        {isReceiptOpen && (
           <MotionDiv 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/95 z-[130] flex items-center justify-center p-4 backdrop-blur-md"
           >
              <div className="bg-white text-black p-6 md:p-8 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500" />
                 
                 <div className="text-center border-b-2 border-black border-dashed pb-6 mb-6">
                   <h3 className="font-black text-2xl tracking-tighter">REEPLAY LOUNGE</h3>
                   <p className="text-xs text-gray-600 mt-1 uppercase">Order Receipt</p>
                   <p className="font-mono text-sm mt-2">ID: {orderId}</p>
                 </div>

                 {generatedDeliveryPin && (
                   <div className="bg-black text-white p-4 rounded-xl text-center mb-6">
                     <p className="text-xs uppercase text-gray-400 mb-1">Delivery PIN</p>
                     <p className="text-3xl font-mono font-bold tracking-widest text-yellow-500">{generatedDeliveryPin}</p>
                     <p className="text-[10px] text-gray-500 mt-1">Show this to the rider</p>
                   </div>
                 )}

                 <div className="space-y-2 mb-6 text-sm font-mono max-h-40 overflow-y-auto custom-scrollbar-light">
                   {history[0]?.items.map((i, idx) => (
                     <div key={idx} className="flex justify-between">
                       <span className="truncate pr-2">{i.quantity}x {i.name}</span>
                       <span className="whitespace-nowrap">{formatPrice(i.priceRaw * i.quantity)}</span>
                     </div>
                   ))}
                 </div>

                 <div className="border-t-2 border-black border-dashed pt-4 mb-6">
                   <div className="flex justify-between text-xl font-bold">
                     <span>TOTAL</span>
                     <span>{formatPrice(history[0]?.total || 0)}</span>
                   </div>
                 </div>

                 <button onClick={() => window.open(IG_DM_LINK)} className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl mb-3 hover:bg-purple-700 transition-colors">Send to Instagram</button>
                 <button onClick={() => setIsReceiptOpen(false)} className="w-full py-3 text-gray-500 font-bold hover:text-black transition-colors">Close Receipt</button>
              </div>
           </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
};

export default Menu;