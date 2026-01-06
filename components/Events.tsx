import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Music2, Moon, ArrowRight, Mic } from 'lucide-react';
import RsvpModal from './RsvpModal';
import { weeklyEvents } from '../staticData';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

const Events: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const getEventStyle = (idx: number) => {
    const styleIdx = idx % 3;
    if (styleIdx === 0) return {
      borderColor: 'border-pink-500',
      tagColor: 'text-pink-400',
      tagBg: 'bg-pink-500/10',
      iconColor: 'text-pink-500',
      btnColor: 'bg-pink-600 hover:bg-pink-500 text-white',
      glowColor: 'bg-pink-600',
      Icon: Music2
    };
    if (styleIdx === 1) return {
      borderColor: 'border-yellow-500',
      tagColor: 'text-yellow-400',
      tagBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500',
      btnColor: 'bg-yellow-600 hover:bg-yellow-500 text-black',
      glowColor: 'bg-yellow-600',
      Icon: Moon
    };
    return {
      borderColor: 'border-purple-500',
      tagColor: 'text-purple-400',
      tagBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      btnColor: 'bg-purple-600 hover:bg-purple-500 text-white',
      glowColor: 'bg-purple-600',
      Icon: Mic
    };
  };

  return (
    <section id="events" className="py-20 px-6 max-w-7xl mx-auto">
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
        <p className="text-gray-300 max-w-2xl mx-auto">
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
              transition={{ duration: 0.5 }}
              className="group relative overflow-hidden rounded-3xl cursor-pointer bg-white/5"
            >
              <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl border border-white/10 transition-all duration-300 group-hover:bg-gray-800/80 group-hover:border-purple-500/30" />
              
              <div className="relative p-8 md:p-10 flex flex-col h-full z-10">
                <div className="flex justify-between items-start mb-6">
                  <span className={`
                    px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border
                    ${style.borderColor} ${style.tagColor} ${style.tagBg}
                  `}>
                    {event.day}
                  </span>
                  <Icon className={`${style.iconColor} w-6 h-6`} />
                </div>

                <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                  {event.title}
                </h3>
                
                <p className="text-gray-300 mb-8 flex-grow leading-relaxed">
                  {event.description}
                </p>
                
                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center text-sm font-medium text-gray-400">
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
              <div className={`absolute -bottom-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-50 ${style.glowColor}`} />
            </MotionDiv>
          );
        })}
      </div>
    </section>
  );
};

export default Events;