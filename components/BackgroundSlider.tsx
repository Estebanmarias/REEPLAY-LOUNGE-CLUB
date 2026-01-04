import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IMAGES = [
  "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1920&auto=format&fit=crop", // Club Lights
  "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=1920&auto=format&fit=crop", // Bar/Drinks
  "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=1920&auto=format&fit=crop", // DJ/Atmosphere
  "https://images.unsplash.com/photo-1534237710431-e2fc698436d5?q=80&w=1920&auto=format&fit=crop", // City Night/Vibe
];

const BackgroundSlider: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-black">
      <AnimatePresence mode="popLayout">
        <motion.img
          key={index}
          src={IMAGES[index]}
          alt="Lounge Ambience"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      {/* Overlay - Black at 70% opacity */}
      <div className="absolute inset-0 bg-black/70 z-10" />
    </div>
  );
};

export default BackgroundSlider;