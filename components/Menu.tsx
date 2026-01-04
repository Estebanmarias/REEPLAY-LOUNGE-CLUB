import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flame, Wine, Beer, Utensils, Search } from 'lucide-react';

// Menu Categories
const CATEGORIES = [
  { id: 'grill', label: 'The Grill (Suya)', icon: Flame },
  { id: 'kitchen', label: 'Main Kitchen', icon: Utensils },
  { id: 'cocktails', label: 'Signatures', icon: Wine },
  { id: 'bottles', label: 'Bottle Service', icon: Beer },
];

// Mock Data based on typical Nigerian Premium Lounge offerings
const MENU_ITEMS: Record<string, Array<{ name: string; desc: string; price: string }>> = {
  grill: [
    { name: "Signature Beef Suya", desc: "Spicy, thinly sliced beef marinated in yaji spice, served with onions and cabbage.", price: "₦3,500" },
    { name: "Chicken Suya", desc: "Succulent chicken breast chunks grilled to perfection with house spice blend.", price: "₦4,000" },
    { name: "Whole Grilled Fish", desc: "Fresh Croaker or Catfish marinated in spicy sauce, served with chips or plantain.", price: "₦12,000" },
    { name: "Asun Special", desc: "Spicy peppered goat meat with a smoky flavor profile.", price: "₦5,000" },
    { name: "BBQ Chicken Wings", desc: "6 pieces of wings glazed in our secret sticky BBQ sauce.", price: "₦4,500" },
  ],
  kitchen: [
    { name: "Reeplay Jollof Rice", desc: "Smoky party jollof served with your choice of protein and plantain.", price: "₦4,500" },
    { name: "Seafood Pasta", desc: "Creamy Alfredo pasta tossed with shrimp, calamari, and fresh herbs.", price: "₦8,000" },
    { name: "Pepper Soup (Goat/Fish)", desc: "Hot and spicy broth with fresh herbs and tender meat cuts.", price: "₦4,000" },
    { name: "Chicken & Chips", desc: "Crispy fried chicken served with seasoned french fries.", price: "₦5,500" },
    { name: "Special Fried Rice", desc: "Loaded with veggies, liver, and shrimp.", price: "₦5,000" },
  ],
  cocktails: [
    { name: "The Reeplay Vibe", desc: "Our signature mix of vodka, blue curacao, and lemonade.", price: "₦5,000" },
    { name: "Chapman Deluxe", desc: "The classic Nigerian mocktail upgraded with a splash of bitters and premium garnish.", price: "₦3,000" },
    { name: "Long Island Iced Tea", desc: "A potent mix of five spirits with a splash of cola.", price: "₦6,000" },
    { name: "Strawberry Daiquiri", desc: "Frozen rum cocktail blended with fresh strawberries.", price: "₦5,500" },
    { name: "Whiskey Sour", desc: "Bourbon, lemon juice, sugar, and egg white foam.", price: "₦6,500" },
  ],
  bottles: [
    { name: "Hennessy VS", desc: "70cl Cognac.", price: "₦85,000" },
    { name: "Casamigos Reposado", desc: "Premium Tequila.", price: "₦120,000" },
    { name: "Azul", desc: "Clase Azul Reposado Tequila.", price: "₦350,000" },
    { name: "Moët & Chandon", desc: "Imperial Brut Champagne.", price: "₦90,000" },
    { name: "Ciroc Vodka", desc: "Snap Frost / Flavors.", price: "₦55,000" },
  ]
};

interface MenuProps {
  onBack: () => void;
}

const Menu: React.FC<MenuProps> = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState('grill');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="relative min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto z-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group self-start"
        >
          <div className="p-2 rounded-full bg-white/10 group-hover:bg-purple-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-medium">Back to Home</span>
        </button>

        <div className="text-left md:text-right">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            OUR MENU
          </h1>
          <p className="text-gray-300 mt-2 text-lg">Taste the vibe of Ogbomosho</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto pb-4 gap-4 mb-8 no-scrollbar">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {MENU_ITEMS[activeCategory]?.map((item, index) => (
            <motion.div
              key={item.name}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="group relative overflow-hidden p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 hover:border-purple-500/50 hover:bg-black/60 transition-all"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-black text-yellow-500 font-mono">
                    {item.price}
                  </span>
                </div>
              </div>
              
              {/* Decorative gradient line */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-purple-500 to-yellow-500 transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Info Footer */}
      <div className="mt-16 text-center p-6 rounded-xl bg-white/5 border border-white/5 mx-auto max-w-2xl">
        <p className="text-gray-400 text-sm">
          * Prices are subject to change based on availability. 
          <br />Please inform your server of any allergies before ordering.
        </p>
      </div>
    </motion.div>
  );
};

export default Menu;