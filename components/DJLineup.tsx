import React from 'react';
import { motion } from 'framer-motion';
import { Disc, Mic2, Radio } from 'lucide-react';

const MotionDiv = motion.div as any;

interface DJLineupProps {
  theme: 'dark' | 'light';
}

const DJLineup: React.FC<DJLineupProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  const mockLineup = [
    { day: 'Friday', event: 'Flash Friday', genre: 'Afrobeats & Amapiano', time: '10 PM' },
    { day: 'Saturday', event: 'Retro Rewind', genre: 'Old School & Hip Hop', time: '9 PM' },
    { day: 'Sunday', event: 'Chill Sessions', genre: 'Smooth Jazz & Soul', time: '7 PM' },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto relative overflow-hidden">
      <div className="text-center mb-12 relative z-10">
        <h2 className={`text-3xl md:text-5xl font-black mb-4 uppercase ${isDark ? 'text-white' : 'text-[#2D2438]'}`}>
          Weekly Lineup
        </h2>
        <div className={`h-1 w-20 mx-auto rounded-full ${isDark ? 'bg-purple-600' : 'bg-purple-400'}`}></div>
      </div>

      {/* Container with Blur Effect */}
      <div className="relative">
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 blur-sm pointer-events-none select-none grayscale`}>
          {mockLineup.map((slot, idx) => (
            <div 
              key={idx}
              className={`p-8 rounded-2xl border flex flex-col items-center text-center gap-4
                ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/60 border-gray-200'}
              `}
            >
              <div className="p-4 rounded-full bg-white/5">
                {idx === 0 ? <Disc className="w-8 h-8" /> : idx === 1 ? <Radio className="w-8 h-8" /> : <Mic2 className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-xl font-bold">{slot.day}</h3>
                <p className="text-sm font-bold text-purple-500">{slot.event}</p>
              </div>
              <p className="text-xs opacity-60">{slot.genre} • {slot.time}</p>
            </div>
          ))}
        </div>

        {/* Coming Soon Overlay */}
        <MotionDiv 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="absolute inset-0 flex items-center justify-center z-20"
        >
          <div className={`px-10 py-6 rounded-xl shadow-2xl backdrop-blur-md border transform -rotate-3
            ${isDark 
              ? 'bg-black/80 border-purple-500/50 shadow-purple-500/20' 
              : 'bg-white/90 border-purple-200 shadow-xl'}
          `}>
             <h3 className={`text-4xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500`}>
               Coming Soon
             </h3>
             <p className={`text-center text-xs font-bold uppercase tracking-widest mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
               DJ Roster Revealing Next Week
             </p>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
};

export default DJLineup;