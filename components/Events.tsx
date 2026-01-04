import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Music2, Moon, ArrowRight, Mic, Loader2 } from 'lucide-react';
import { EventItem } from '../types';
import RsvpModal from './RsvpModal';
import { client } from '../lib/sanity';

// Fallback data in case Sanity is not connected or empty
const FALLBACK_EVENTS: EventItem[] = [
  {
    day: "Friday",
    title: "Flash Friday",
    description: "Kickstart the weekend with the hottest DJ sets and special bottle service offers.",
    tag: "Live DJ • 10 PM Till Dawn"
  },
  {
    day: "Sunday",
    title: "Sunday Chill",
    description: "Wind down the weekend with smooth Afro-beats, outdoor vibes, and suya.",
    tag: "Relax • Outdoor • Food"
  },
  {
    day: "Wednesday",
    title: "Comedy Night",
    description: "Break the midweek slump with roaring laughter. Featuring top stand-up acts.",
    tag: "Live Comedy • 8 PM"
  }
];

const Events: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Query for 'weeklyEvent' document type
        const query = `*[_type == "weeklyEvent"] | order(order asc) {
          day,
          title,
          description,
          tag
        }`;
        const data = await client.fetch(query);
        
        if (data && data.length > 0) {
          setEvents(data);
        } else {
          setEvents(FALLBACK_EVENTS);
        }
      } catch (error) {
        console.error("Sanity fetch error:", error);
        setEvents(FALLBACK_EVENTS);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getEventStyle = (idx: number) => {
    // Rotating styles based on index
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
      <RsvpModal 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        eventName={selectedEvent || ''} 
      />

      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
          Events & Nights
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          More than just a club. Check back regularly for upcoming nights.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, idx) => {
            const style = getEventStyle(idx);
            const Icon = style.Icon;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                onHoverStart={() => setHoveredIdx(idx)}
                onHoverEnd={() => setHoveredIdx(null)}
                transition={{ duration: 0.5 }}
                className="group relative overflow-hidden rounded-3xl cursor-pointer bg-white/5"
              >
                {/* Glass Background */}
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

                    {/* Animated RSVP Button */}
                    <motion.button
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
                    </motion.button>
                  </div>
                </div>
                
                {/* Decorative Glow */}
                <div className={`absolute -bottom-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-50
                  ${style.glowColor}
                `} />
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Events;