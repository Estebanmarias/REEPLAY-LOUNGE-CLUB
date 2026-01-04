import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';

interface HeroProps {
  onMenuClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onMenuClick }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-20 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div className="inline-block px-3 py-1 mb-4 border border-purple-500/50 rounded-full bg-purple-900/30 backdrop-blur-sm">
          <span className="text-purple-300 text-sm font-semibold tracking-wider uppercase">Welcome to the Vibe</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight drop-shadow-2xl">
          REEPLAY <br />
          <span className="text-purple-500">LOUNGE & CLUB</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide max-w-2xl mx-auto">
          The Pulse of Ogbomosho
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
          {/* Button 1: Gold */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('location')}
            className="w-full sm:w-auto px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all flex items-center justify-center gap-2 group"
          >
            Reserve a Spot
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Button 2: Purple - Now opens Menu */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
            className="w-full sm:w-auto px-8 py-4 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <UtensilsCrossed className="w-5 h-5" />
            View Menu
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;