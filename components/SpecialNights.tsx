import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { upcomingSpecialEvents } from '../staticData';

const MotionDiv = motion.div as any;

interface SpecialNightsProps {
  onReservationClick: () => void;
  theme?: 'dark' | 'light';
}

const SpecialNights: React.FC<SpecialNightsProps> = ({ onReservationClick, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className={`text-3xl md:text-5xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#2D2438]'}`}>
            Special Nights
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Exclusive events curated for the ultimate vibe.
          </p>
        </div>
        
        {/* Decorative Line/Indicator */}
        <div className="hidden md:block h-1 flex-1 mx-8 bg-gradient-to-r from-purple-500/50 to-transparent rounded-full" />
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto gap-6 pb-8 -mx-6 px-6 md:mx-0 md:px-0 no-scrollbar snap-x snap-mandatory">
        {upcomingSpecialEvents.map((event, idx) => (
          <MotionDiv
            key={event.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className={`
              snap-center flex-shrink-0 w-[300px] md:w-[350px] relative rounded-3xl overflow-hidden border group flex flex-col
              ${isDark 
                ? 'bg-black/40 border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)]' 
                : 'bg-white/80 border-purple-200/50 shadow-xl shadow-purple-500/10'}
            `}
          >
            {/* Image Area */}
            <div className="h-48 overflow-hidden relative">
               <img 
                 src={event.image} 
                 alt={event.title} 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
               <div className="absolute bottom-4 left-4">
                 <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                   {event.category}
                 </span>
               </div>
            </div>

            {/* Content Area */}
            <div className="p-6 flex flex-col gap-4 flex-1">
              <div>
                <h3 className={`text-2xl font-bold leading-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {event.title}
                </h3>
                <div className={`flex items-center gap-4 text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {event.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {event.time}</span>
                </div>
              </div>

              <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'} flex-1`}>
                {event.description}
              </p>

              <button
                onClick={onReservationClick}
                className={`
                  w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-auto
                  ${isDark 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-700'}
                `}
              >
                Book Now <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </MotionDiv>
        ))}
        
        {upcomingSpecialEvents.length === 0 && (
            <div className={`w-full text-center py-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                No special events scheduled at the moment.
            </div>
        )}
      </div>
    </section>
  );
};

export default SpecialNights;