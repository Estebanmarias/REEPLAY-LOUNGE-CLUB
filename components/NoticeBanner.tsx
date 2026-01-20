import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X } from 'lucide-react';

const MotionDiv = motion.div as any;

const NoticeBanner: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => {
  const [isVisible, setIsVisible] = useState(true);
  const isDark = theme === 'dark';

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative z-50"
      >
        <div className={`px-4 py-3 flex items-start justify-between gap-3 border-b
          ${isDark 
            ? 'bg-gradient-to-r from-blue-900/40 to-black border-blue-500/20' 
            : 'bg-gradient-to-r from-blue-100 to-white border-blue-200'}
        `}>
          <div className="flex gap-3">
            <div className={`p-1.5 rounded-full mt-0.5 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Pre-orders are Open
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Kitchen & Delivery service begins daily at <strong>3:00 PM</strong>. Secure your slot now!
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className={`p-1 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </MotionDiv>
    </AnimatePresence>
  );
};

export default NoticeBanner;