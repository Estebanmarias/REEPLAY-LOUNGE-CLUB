import React, { useState } from 'react';
import { Menu as MenuIcon, X, UtensilsCrossed, Calendar, Image as ImageIcon, Home, Star, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

interface NavbarProps {
  onNavigate: (view: 'home' | 'menu' | 'events' | 'gallery') => void;
  currentView: 'home' | 'menu' | 'events' | 'gallery' | 'admin';
  onOpenReservation: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, onOpenReservation, theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  ] as const;

  const handleNav = (view: 'home' | 'menu' | 'events' | 'gallery') => {
    onNavigate(view);
    setIsOpen(false);
  };

  const handleReservation = () => {
    onOpenReservation();
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Toggle Button (Hidden on Mobile) */}
      <MotionButton
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`hidden md:block fixed top-6 right-6 z-50 p-3 backdrop-blur-md rounded-full transition-all shadow-lg border
          ${isDark 
            ? 'bg-white/10 border-white/10 text-white hover:bg-purple-600' 
            : 'bg-white/80 border-gray-200 text-gray-800 hover:bg-purple-600 hover:text-white'}
        `}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
      </MotionButton>

      {/* Mobile Bottom Navigation */}
      {currentView !== 'menu' && (
        <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[60] backdrop-blur-xl border-t pb-safe transition-colors duration-500
          ${isDark 
            ? 'bg-black/90 border-white/10' 
            : 'bg-white/90 border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]'}
        `}>
          <div className="flex justify-around items-center h-16 px-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors relative
                    ${currentView === item.id 
                      ? (isDark ? 'text-purple-400' : 'text-purple-600') 
                      : (isDark ? 'text-gray-500' : 'text-gray-400')}
                  `}
                >
                  {/* Active Indicator */}
                  {currentView === item.id && (
                    <motion.div 
                      layoutId="navIndicator"
                      className={`absolute -top-[1px] w-8 h-1 rounded-b-full ${isDark ? 'bg-purple-500' : 'bg-purple-600'}`}
                    />
                  )}
                  <item.icon className={`w-5 h-5 ${currentView === item.id ? 'scale-110' : 'scale-100'} transition-transform`} />
                  <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Navigation Drawer (Desktop) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 hidden md:block"
            />
            <MotionDiv
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 h-full w-full max-w-sm border-l z-50 flex flex-col p-8 hidden md:flex
                ${isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'}
              `}
            >
              <div className="mt-16 space-y-6">
                {navItems.map((item, idx) => (
                  <MotionButton
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleNav(item.id)}
                    className={`
                      w-full flex items-center gap-4 text-3xl font-black uppercase tracking-tighter hover:text-purple-500 transition-colors
                      ${currentView === item.id 
                        ? 'text-purple-500' 
                        : (isDark ? 'text-white' : 'text-gray-900')}
                    `}
                  >
                    <item.icon className="w-8 h-8" />
                    {item.label}
                  </MotionButton>
                ))}

                {/* Special Reservation Item */}
                <MotionButton
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleReservation}
                  className="w-full flex items-center gap-4 text-3xl font-black uppercase tracking-tighter text-yellow-500 hover:text-yellow-400 transition-colors mt-8 pt-8 border-t border-white/10"
                >
                  <Star className="w-8 h-8" />
                  Book Table
                </MotionButton>

                {/* Theme Toggle in Desktop Menu */}
                <MotionButton
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.6 }}
                   onClick={toggleTheme}
                   className={`w-full flex items-center gap-4 text-xl font-bold uppercase tracking-widest mt-4 transition-colors
                    ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}
                   `}
                >
                   {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                   {isDark ? 'Light Mode' : 'Dark Mode'}
                </MotionButton>
              </div>

              <div className={`mt-auto text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <p>Reeplay Lounge & Club</p>
                <p>Ogbomosho, Oyo State</p>
              </div>
            </MotionDiv>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;