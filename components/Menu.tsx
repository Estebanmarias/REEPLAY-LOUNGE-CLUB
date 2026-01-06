import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flame, Wine, Utensils, Crown, GlassWater, Plus, Minus, ShoppingBag, X, Search, ChevronRight, Loader2, Trash2, MapPin, Clock, CheckCircle } from 'lucide-react';
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
  modifiers?: string[]; // For customizations
}

interface MenuProps {
  onBack: () => void;
}

type OrderType = 'pickup' | 'delivery';

// --- Constants & Data ---
const IG_DM_LINK = "https://ig.me/m/reeplaylounge_ogbomoso"; 
const VAT_RATE = 0.075; 

// Standard Extras for Customization
const KITCHEN_ADDONS = [
  { id: 'plantain', name: 'Fried Plantain', price: 500 },
  { id: 'coleslaw', name: 'Coleslaw', price: 500 },
  { id: 'egg', name: 'Boiled Egg', price: 500 },
  { id: 'beef', name: 'Extra Beef', price: 1500 },
  { id: 'chicken', name: 'Extra Chicken', price: 2000 },
  { id: 'turkey', name: 'Fried Turkey', price: 3500 },
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
  { id: 'kitchen', label: 'Main Kitchen', icon: Utensils },
  { id: 'sides', label: 'Proteins & Sides', icon: Flame },
  { id: 'cocktails', label: 'Cocktails & Shakes', icon: Wine },
  { id: 'bottles', label: 'Bottle Service', icon: Crown },
  { id: 'beverages', label: 'Beer & Drinks', icon: GlassWater },
];

const MENU_ITEMS: Record<string, Array<MenuItem>> = {
  kitchen: [
    { name: "Jollof Rice", desc: "Classic smoky West African rice cooked in tomato and pepper base.", price: "₦4,500" },
    { name: "Native Rice", desc: "Palm oil rice with local spices, herbs, smoked catfish, beef and crayfish.", price: "₦4,500" },
    { name: "Fried Rice", desc: "Stir-fried rice with veggies and liver.", price: "₦4,500" },
    { name: "Spaghetti Bolognese", desc: "Pasta in a rich minced meat and tomato sauce.", price: "₦5,000" },
    { name: "Noodles & Egg", desc: "Classic stir-fried noodles served with egg.", price: "₦3,000" },
    { name: "Catfish Peppersoup", desc: "Spicy broth with fresh catfish (Point & Kill).", price: "₦7,000" },
  ],
  sides: [
    { name: "Gizdodo", desc: "A mix of fried plantain and gizzard in spicy sauce.", price: "₦4,000" },
    { name: "Pepper Chicken", desc: "Juicy chicken tossed in peppery seasoning.", price: "₦4,000" },
    { name: "Goat Meat Asun", desc: "Peppered grilled goat meat, smoky and tasty.", price: "₦4,000" },
    { name: "Small Chops Platter", desc: "Samosas, puff-puff, spring rolls, chicken.", price: "₦4,000" },
    { name: "French Fries", desc: "Crispy fried potato chips.", price: "₦2,000" },
  ],
  cocktails: [
    { name: "Long Island", desc: "Vodka, tequila, light rum, triple sec, gin, and cola.", price: "₦7,500" },
    { name: "Sex on the Beach", desc: "Vodka, peach schnapps, orange juice, cranberry juice.", price: "₦6,500" },
    { name: "Chapman", desc: "Reeplay special mocktail mix.", price: "₦4,000" },
  ],
  bottles: [
    { name: "Hennessy VSOP", desc: "Cognac.", price: "₦170,000" },
    { name: "Azul", desc: "Premium Tequila.", price: "₦450,000" },
    { name: "Casamigos", desc: "Tequila.", price: "₦300,000" },
    { name: "Ice Fantome", desc: "Champagne.", price: "₦85,000" },
  ],
  beverages: [
    { name: "Heineken / Budweiser", desc: "Cold Beer.", price: "₦2,000" },
    { name: "Energy Drink", desc: "Monster / Climax.", price: "₦2,500" },
    { name: "Soft Drinks", desc: "Coke / Fanta / Sprite.", price: "₦700" },
    { name: "Water", desc: "Chilled Bottle.", price: "₦500" },
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
    if (categoryId === 'kitchen') { 
      onOpenModal(item); 
    } else {
      onAdd(item);
      triggerFeedback();
    }
  };

  const triggerFeedback = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1000);
  };

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: isAdded ? 1.02 : 1 }}
      className={`relative overflow-hidden p-6 rounded-2xl border transition-all flex flex-col justify-between
        ${isAdded ? 'bg-green-900/20 border-green-500' : 'bg-black/40 border-white/10 hover:border-purple-500/50 hover:bg-black/60'}
      `}
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
        </div>
        <span className="text-lg font-black text-yellow-500 font-mono">{item.price}</span>
      </div>
      
      <MotionButton
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={`self-end mt-2 flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-colors 
          ${isAdded ? 'bg-green-600 text-white' : 'bg-white/10 hover:bg-purple-600 text-white'}`}
      >
        {categoryId === 'kitchen' ? (
          <>Customize <ChevronRight className="w-4 h-4" /></>
        ) : (
          isAdded ? <><CheckCircle className="w-4 h-4" /> Added</> : "Add to Order"
        )}
      </MotionButton>
    </MotionDiv>
  );
};

// --- Main Component ---

const Menu: React.FC<MenuProps> = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState('kitchen');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItemExtended[]>([]);
  const [history, setHistory] = useState<PastOrder[]>([]);
  
  // Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  
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

  // Initialize
  useEffect(() => {
    setHistory(orderService.getHistory());
    setCustomerName(localStorage.getItem('reeplay_user_name') || '');
    setCustomerPhone(localStorage.getItem('reeplay_user_phone') || '');
  }, []);

  // Filter Items
  const filteredItems = useMemo(() => {
    const items = MENU_ITEMS[activeCategory] || [];
    if (!searchQuery) return items;
    return items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeCategory, searchQuery]);

  // Cart Logic
  const addToCart = (item: MenuItem, quantity: number = 1, mods: string[] = [], customPrice?: number) => {
    setCart(prev => {
      let newCart = [...prev];
      const basePrice = parsePrice(item.price);
      
      // Calculate total price for one unit including modifiers
      let unitPrice = basePrice;
      if (customPrice) {
        unitPrice = customPrice;
      }

      // Create a unique ID based on name + modifiers to separate customized items
      const uniqueId = `${item.name}-${mods.sort().join('-')}`;
      
      const existingIndex = newCart.findIndex(i => `${i.name}-${(i.modifiers || []).sort().join('-')}` === uniqueId);

      if (existingIndex > -1) {
        newCart[existingIndex].quantity += quantity;
      } else {
        newCart.push({
          ...item,
          priceRaw: unitPrice,
          quantity: quantity,
          modifiers: mods
        });
      }
      
      // Auto-add Bag charge if not present (simple logic)
      if (!newCart.find(i => i.name === EXTRAS.bag.name)) {
        newCart.push({ 
          ...EXTRAS.bag, 
          priceRaw: parsePrice(EXTRAS.bag.price), 
          quantity: 1, 
          desc: "Required for takeout" 
        });
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
    setIsCartOpen(true); // Open cart to show user
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Checkout Calculations
  const cartSubTotal = useMemo(() => cart.reduce((t, i) => t + (i.priceRaw * i.quantity), 0), [cart]);
  const vatAmount = cartSubTotal * VAT_RATE;
  const deliveryFee = orderType === 'delivery' ? (DELIVERY_ZONES.find(z => z.id === deliveryZoneId)?.price || 0) : 0;
  const finalTotal = cartSubTotal + vatAmount + deliveryFee;

  // Validation
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
    
    // Simulate API delay
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
      
      // Save user details for next time
      localStorage.setItem('reeplay_user_name', customerName);
      localStorage.setItem('reeplay_user_phone', customerPhone);
      
      setIsSubmitting(false);
      setIsCartOpen(false);
      setIsReceiptOpen(true);
      setCart([]); // Clear cart
    }, 1500);
  };

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="relative min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto z-20"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-purple-600 transition-colors">
          <ArrowLeft />
        </button>
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
            placeholder="Search cravings..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:border-purple-500 outline-none" 
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
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <MotionButton 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsCartOpen(true)} 
          className="fixed bottom-8 right-8 z-40 bg-purple-600 hover:bg-purple-500 p-4 rounded-full shadow-[0_0_30px_rgba(147,51,234,0.5)] flex items-center justify-center transition-all hover:scale-110"
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
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center p-0 md:p-4"
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

      {/* --- CART DRAWER & CHECKOUT --- */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <MotionDiv 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[50]"
            />
            <MotionDiv 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#121212] z-[55] flex flex-col shadow-2xl border-l border-white/10"
            >
              {/* Cart Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-black uppercase tracking-wider">Your Order</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X />
                </button>
              </div>

              {/* Items List */}
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

              {/* Checkout Form & Totals */}
              {cart.length > 0 && (
                <div className="p-6 bg-[#18181b] border-t border-white/10">
                  <div className="space-y-4 mb-6">
                    {/* Toggle */}
                    <div className="flex bg-black/50 p-1 rounded-xl">
                      <button 
                        onClick={() => setOrderType('pickup')} 
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${orderType === 'pickup' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                      >
                        Pickup
                      </button>
                      <button 
                        onClick={() => setOrderType('delivery')} 
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${orderType === 'delivery' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                      >
                        Delivery
                      </button>
                    </div>

                    {/* Dynamic Fields */}
                    {orderType === 'pickup' ? (
                       <div className="space-y-2">
                          <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Pickup Time</label>
                          <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-purple-500" />
                       </div>
                    ) : (
                       <div className="space-y-3">
                          <div className="space-y-2">
                            <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1"><MapPin className="w-3 h-3"/> Delivery Area</label>
                            <select 
                              value={deliveryZoneId} 
                              onChange={e => setDeliveryZoneId(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-purple-500 appearance-none"
                            >
                              {DELIVERY_ZONES.map(z => <option key={z.id} value={z.id} className="bg-gray-900">{z.label} {z.price > 0 ? `(+${z.price})` : ''}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs text-gray-400 uppercase font-bold">Address Details</label>
                             <textarea 
                                placeholder="Hostel Name, Room Number, Description..." 
                                value={address} 
                                onChange={e => setAddress(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-purple-500 resize-none h-20 text-sm"
                             />
                          </div>
                       </div>
                    )}

                    {/* Common Fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Your Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-sm outline-none focus:border-purple-500" />
                      <input type="tel" placeholder="Phone Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-sm outline-none focus:border-purple-500" />
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="space-y-2 border-t border-white/10 pt-4 mb-4 text-sm">
                    <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatPrice(cartSubTotal)}</span></div>
                    <div className="flex justify-between text-gray-400"><span>VAT (7.5%)</span><span>{formatPrice(vatAmount)}</span></div>
                    {orderType === 'delivery' && <div className="flex justify-between text-gray-400"><span>Delivery Fee</span><span>{formatPrice(deliveryFee)}</span></div>}
                    <div className="flex justify-between text-xl font-bold text-white mt-2"><span>Total</span><span className="text-yellow-500">{formatPrice(finalTotal)}</span></div>
                  </div>

                  {/* Action */}
                  <button 
                    onClick={handleConfirmOrder} 
                    disabled={!canCheckout || isSubmitting}
                    className={`
                      w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                      ${canCheckout ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg' : 'bg-white/10 text-gray-500 cursor-not-allowed'}
                    `}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin w-5 h-5"/> : (
                      <>
                        Confirm Order
                        <span className="bg-black/20 px-2 py-0.5 rounded text-xs ml-1">{formatPrice(finalTotal)}</span>
                      </>
                    )}
                  </button>
                  {!canCheckout && <p className="text-red-400 text-xs text-center mt-2">Please fill in all details correctly.</p>}
                </div>
              )}
            </MotionDiv>
          </>
        )}
      </AnimatePresence>

      {/* --- RECEIPT MODAL --- */}
      <AnimatePresence>
        {isReceiptOpen && (
           <MotionDiv 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/95 z-[80] flex items-center justify-center p-4 backdrop-blur-md"
           >
              <div className="bg-white text-black p-6 md:p-8 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden">
                 {/* Receipt Effect */}
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

                 <button 
                   onClick={() => window.open(IG_DM_LINK)} 
                   className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl mb-3 hover:bg-purple-700 transition-colors"
                 >
                   Send to Instagram
                 </button>
                 <button 
                   onClick={() => setIsReceiptOpen(false)} 
                   className="w-full py-3 text-gray-500 font-bold hover:text-black transition-colors"
                 >
                   Close Receipt
                 </button>
              </div>
           </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
};

export default Menu;