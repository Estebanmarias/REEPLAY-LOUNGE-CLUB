import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Music2, Moon, ArrowRight, Mic } from 'lucide-react';
import RsvpModal from './RsvpModal';
import { weeklyEvents } from '../staticData';
import PromoCarousel from './PromoCarousel';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

interface EventsProps {
  theme?: 'dark' | 'light';
}

const Events: React.FC<EventsProps> = ({ theme = 'dark' }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const isDark = theme === 'dark';

  const getEventStyle = (idx: number) => {
    const styleIdx = idx % 3;
    // Dark mode colors
    if (isDark) {
      if (styleIdx === 0) return {
        borderColor: 'border-pink-500/30',
        hoverBorder: 'group-hover:border-pink-500',
        tagColor: 'text-pink-400',
        tagBg: 'bg-pink-500/10',
        iconColor: 'text-pink-500',
        btnColor: 'bg-pink-600 hover:bg-pink-500 text-white',
        glowColor: 'bg-pink-600',
        Icon: Music2
      };
      if (styleIdx === 1) return {
        borderColor: 'border-yellow-500/30',
        hoverBorder: 'group-hover:border-yellow-500',
        tagColor: 'text-yellow-400',
        tagBg: 'bg-yellow-500/10',
        iconColor: 'text-yellow-500',
        btnColor: 'bg-yellow-600 hover:bg-yellow-500 text-black',
        glowColor: 'bg-yellow-600',
        Icon: Moon
      };
      return {
        borderColor: 'border-purple-500/30',
        hoverBorder: 'group-hover:border-purple-500',
        tagColor: 'text-purple-400',
        tagBg: 'bg-purple-500/10',
        iconColor: 'text-purple-500',
        btnColor: 'bg-purple-600 hover:bg-purple-500 text-white',
        glowColor: 'bg-purple-600',
        Icon: Mic
      };
    } 
    // Light mode colors
    else {
       if (styleIdx === 0) return {
        borderColor: 'border-pink-200',
        hoverBorder: 'group-hover:border-pink-400',
        tagColor: 'text-pink-600',
        tagBg: 'bg-pink-100',
        iconColor: 'text-pink-600',
        btnColor: 'bg-pink-500 hover:bg-pink-600 text-white',
        glowColor: 'bg-pink-400',
        Icon: Music2
      };
      if (styleIdx === 1) return {
        borderColor: 'border-yellow-200',
        hoverBorder: 'group-hover:border-yellow-400',
        tagColor: 'text-yellow-700',
        tagBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        btnColor: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        glowColor: 'bg-yellow-400',
        Icon: Moon
      };
      return {
        borderColor: 'border-purple-200',
        hoverBorder: 'group-hover:border-purple-400',
        tagColor: 'text-purple-700',
        tagBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        btnColor: 'bg-purple-600 hover:bg-purple-700 text-white',
        glowColor: 'bg-purple-400',
        Icon: Mic
      };
    }
  };

  return (
    <section id="events" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <PromoCarousel />
      </div>

      {selectedEvent && (
        <RsvpModal 
          isOpen={!!selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          eventName={selectedEvent} 
        />
      )}

      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
          Weekly Nights
        </h2>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
          The heartbeat of Reeplay Lounge. Join us every single week for these legendary experiences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {weeklyEvents.map((event, idx) => {
          const style = getEventStyle(idx);
          const Icon = style.Icon;

          return (
            <MotionDiv
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              onHoverStart={() => setHoveredIdx(idx)}
              onHoverEnd={() => setHoveredIdx(null)}
              transition={{ duration: 0.4 }}
              className={`
                group relative overflow-hidden rounded-3xl cursor-pointer
                backdrop-blur-md border shadow-lg transition-all duration-300
                ${isDark 
                  ? 'bg-black/40 border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)]' 
                  : 'bg-white/70 border-white/50 shadow-purple-500/5'}
                ${style.hoverBorder}
              `}
            >
              
              <div className="relative p-8 md:p-10 flex flex-col h-full z-10">
                <div className="flex justify-between items-start mb-6">
                  <span className={`
                    px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border
                    ${style.borderColor} ${style.tagColor} ${style.tagBg}
                  `}>
                    {event.day}
                  </span>
                  <div className={`p-2 rounded-full border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100'} ${style.borderColor}`}>
                    <Icon className={`${style.iconColor} w-6 h-6`} />
                  </div>
                </div>

                <h3 className={`text-3xl font-bold mb-4 transition-colors ${isDark ? 'text-white group-hover:text-purple-300' : 'text-gray-800 group-hover:text-purple-600'}`}>
                  {event.title}
                </h3>
                
                <p className={`mb-8 flex-grow leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {event.description}
                </p>
                
                <div className={`pt-6 border-t flex items-center justify-between ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className={`flex items-center text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {event.tag}
                  </div>

                  <MotionButton
                    initial={{ opacity: 0, x: 20 }}
                    animate={hoveredIdx === idx ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setSelectedEvent(event.title)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-lg
                      ${style.btnColor}
                    `}
                  >
                    RSVP <ArrowRight className="w-4 h-4" />
                  </MotionButton>
                </div>
              </div>
              
              {/* Dynamic Glow Effect */}
              <div className={`absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-[80px] transition-opacity duration-500 
                ${isDark ? 'opacity-20 group-hover:opacity-40' : 'opacity-30 group-hover:opacity-60'} 
                ${style.glowColor}`} 
              />
            </MotionDiv>
          );
        })}
      </div>
    </section>
  );
};

export default Events;