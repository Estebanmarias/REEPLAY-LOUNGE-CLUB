import React from 'react';
import { motion, Variants } from 'framer-motion';

interface MenuBackgroundProps {
  theme: 'dark' | 'light';
}

const MenuBackground: React.FC<MenuBackgroundProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  // Animation variants for the floating blobs
  const blobVariants: Variants = {
    animate: {
      x: [0, 30, -20, 0],
      y: [0, -50, 20, 0],
      scale: [1, 1.2, 0.9, 1],
      rotate: [0, 20, -10, 0],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const blobVariants2: Variants = {
    animate: {
      x: [0, -40, 30, 0],
      y: [0, 40, -30, 0],
      scale: [1, 1.1, 0.8, 1],
      rotate: [0, -15, 10, 0],
      transition: {
        duration: 25,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-700 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      
      {/* Mesh Gradient Base */}
      <div className={`absolute inset-0 opacity-40 ${isDark ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.2),rgba(0,0,0,0))]' : 'bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),rgba(255,255,255,0))]'}`} />

      {/* Floating Blob 1 (Purple/Blue) */}
      <motion.div
        variants={blobVariants}
        animate="animate"
        className={`absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-[80px] opacity-40
          ${isDark ? 'bg-purple-900' : 'bg-purple-200'}
        `}
      />

      {/* Floating Blob 2 (Pink/Red) */}
      <motion.div
        variants={blobVariants2}
        animate="animate"
        className={`absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[80px] opacity-30
          ${isDark ? 'bg-blue-900' : 'bg-blue-200'}
        `}
      />

      {/* Floating Blob 3 (Bottom Center) */}
      <motion.div
        animate={{
          x: [0, 20, -20, 0],
          y: [0, 30, -30, 0],
          scale: [1, 1.3, 0.9, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-30
          ${isDark ? 'bg-indigo-900' : 'bg-pink-200'}
        `}
      />

      {/* Noise Texture Overlay for "Grainy" Premium Feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
    </div>
  );
};

export default MenuBackground;