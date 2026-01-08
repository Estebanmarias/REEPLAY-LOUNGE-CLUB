import React from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Sparkles } from 'lucide-react';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

interface HeroProps {
  onMenuClick: () => void;
  onReservationClick: () => void;
  theme?: 'dark' | 'light';
}

const Hero: React.FC<HeroProps> = ({ onMenuClick, onReservationClick, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-24 pb-10">
      <MotionDiv
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} // Smooth cubic-bezier
        className="max-w-4xl mx-auto space-y-8 w-full"
      >
        <div className={`inline-block px-4 py-1.5 mb-2 border rounded-full backdrop-blur-sm
          ${isDark 
            ? 'border-purple-500/50 bg-purple-900/30' 
            : 'border-yellow-600/30 bg-white/40'}
        `}>
          <span className={`text-sm font-bold tracking-widest uppercase ${isDark ? 'text-purple-300' : 'text-yellow-700'}`}>
            Welcome to the Vibe
          </span>
        </div>
        
        <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tight drop-shadow-2xl leading-tight
          ${isDark 
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400' 
            : 'text-transparent bg-clip-text bg-gradient-to-br from-[#2D2438] via-[#4A3B5C] to-[#2D2438]'}
        `}>
          REEPLAY <br />
          <span className={isDark ? 'text-purple-500' : 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-500'}>
            LOUNGE & CLUB
          </span>
        </h1>
        
        <p className={`text-xl md:text-2xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed
          ${isDark ? 'text-gray-300' : 'text-gray-700 font-medium'}
        `}>
          The Pulse of Ogbomosho
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-12">
          {/* Button 1: Gold - Triggers Reservation Modal */}
          <MotionButton
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(234,179,8,0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onReservationClick}
            className={`w-full sm:w-auto px-8 py-4 font-bold rounded-xl flex items-center justify-center gap-2 group transition-all shadow-lg
              ${isDark 
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-yellow-500/30'}
            `}
          >
            Special Reservation
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </MotionButton>

          {/* Button 2: Purple - Opens Menu */}
          <MotionButton
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(168,85,247,0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
            className={`w-full sm:w-auto px-8 py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg
               ${isDark 
                ? 'bg-purple-700 hover:bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                : 'bg-white text-purple-700 border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50'}
            `}
          >
            <UtensilsCrossed className="w-5 h-5" />
            Order Food & Drinks
          </MotionButton>
        </div>
      </MotionDiv>
    </section>
  );
};

export default Hero;