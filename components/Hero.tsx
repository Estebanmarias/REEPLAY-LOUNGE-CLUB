import React from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Sparkles } from 'lucide-react';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

interface HeroProps {
  onMenuClick: () => void;
  onReservationClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onMenuClick, onReservationClick }) => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-20 pb-10">
      <MotionDiv
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} // Smooth cubic-bezier
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="inline-block px-4 py-1.5 mb-2 border border-purple-500/50 rounded-full bg-purple-900/30 backdrop-blur-sm">
          <span className="text-purple-300 text-sm font-semibold tracking-widest uppercase">Welcome to the Vibe</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight drop-shadow-2xl leading-tight">
          REEPLAY <br />
          <span className="text-purple-500">LOUNGE & CLUB</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
          The Pulse of Ogbomosho
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-12">
          {/* Button 1: Gold - Triggers Reservation Modal */}
          <MotionButton
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(234,179,8,0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onReservationClick}
            className="w-full sm:w-auto px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all flex items-center justify-center gap-2 group"
          >
            Special Reservation
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </MotionButton>

          {/* Button 2: Purple - Opens Menu */}
          <MotionButton
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(168,85,247,0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
            className="w-full sm:w-auto px-8 py-4 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2"
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