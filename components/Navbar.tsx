import React, { useState } from 'react';
import { Menu as MenuIcon, X, UtensilsCrossed, Calendar, Image as ImageIcon, Home, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

interface NavbarProps {
  onNavigate: (view: 'home' | 'menu' | 'events' | 'gallery') => void;
  currentView: 'home' | 'menu' | 'events' | 'gallery';
  onOpenReservation: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, onOpenReservation }) => {
  const [isOpen, setIsOpen] = useState(false);

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
        className="hidden md:block fixed top-6 right-6 z-50 p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-purple-600 transition-colors shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
      </MotionButton>

      {/* Mobile Bottom Navigation - Hidden when in Menu view to avoid overlapping cart buttons */}
      {currentView !== 'menu' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-black/90 backdrop-blur-xl border-t border-white/10 pb-safe">
          <div className="flex justify-around items-center h-16 px-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${currentView === item.id ? 'text-purple-500' : 'text-gray-400'}`}
                >
                  <item.icon className={`w-5 h-5 ${currentView === item.id ? 'fill-purple-500/20' : ''}`} />
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
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-black border-l border-white/10 z-50 flex flex-col p-8 hidden md:flex"
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
                      ${currentView === item.id ? 'text-purple-500' : 'text-white'}
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
              </div>

              <div className="mt-auto text-gray-500 text-sm">
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