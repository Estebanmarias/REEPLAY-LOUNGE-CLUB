import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Music, Ticket, Share2, Loader2 } from 'lucide-react';
import RsvpModal from './RsvpModal';
import { client, urlFor } from '../lib/sanity';

interface EventsPageProps {
  onBack: () => void;
}

interface SanityEvent {
  _id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  image: any;
  description: string;
  price: string;
}

// Fallback if no Sanity connection
const FALLBACK_EVENTS: SanityEvent[] = [
  {
    _id: "1",
    title: "Flash Friday",
    date: "This Friday",
    time: "10:00 PM - Dawn",
    category: "Party",
    image: null, // Logic handles null image
    description: "Kickstart the weekend with the hottest DJ sets and special bottle service offers.",
    price: "Free Entry"
  },
  {
    _id: "2",
    title: "Sunday Chill & Grill",
    date: "This Sunday",
    time: "4:00 PM - 11:00 PM",
    category: "Vibe",
    image: null,
    description: "Wind down the weekend with smooth Afro-beats, outdoor vibes, and spicy suya.",
    price: "Reservation Recommended"
  }
];

const EventsPage: React.FC<EventsPageProps> = ({ onBack }) => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [events, setEvents] = useState<SanityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  // Fetch from Sanity
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const query = `*[_type == "upcomingEvent"] | order(eventDate asc) {
          _id,
          title,
          date,
          time,
          category,
          image,
          description,
          price
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

  // Simple countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const target = new Date();
      target.setHours(22, 0, 0, 0); // Target 10 PM tonight
      if (now > target) target.setDate(target.getDate() + 1);
      
      const diff = target.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getImageUrl = (imageSource: any) => {
    if (!imageSource) return "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=800&auto=format&fit=crop";
    return urlFor(imageSource)?.width(800).url();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto relative z-20"
    >
      <RsvpModal 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        eventName={selectedEvent || ''} 
      />

      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
           <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            UPCOMING EVENTS
          </h1>
          <p className="text-gray-400 text-sm md:text-base mt-1 flex items-center gap-2">
            Next event starts in: <span className="font-mono text-yellow-500 font-bold">{timeLeft}</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading events...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event, idx) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-[#111] border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/50 transition-colors"
            >
              {/* Image Section */}
              <div className="h-64 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent z-10" />
                <img 
                  src={getImageUrl(event.image)} 
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
                  {event.category}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 md:p-8 relative z-20 -mt-10">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-3xl font-bold text-white leading-tight group-hover:text-purple-400 transition-colors">
                    {event.title}
                  </h2>
                  <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-5 h-5 mr-3 text-purple-500" />
                    <span className="font-medium">{event.date}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Clock className="w-5 h-5 mr-3 text-yellow-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPin className="w-5 h-5 mr-3 text-red-500" />
                    <span>Reeplay Lounge, Ogbomosho</span>
                  </div>
                   <div className="flex items-center text-gray-300">
                    <Ticket className="w-5 h-5 mr-3 text-green-500" />
                    <span className="uppercase text-sm font-bold tracking-wider">{event.price}</span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {event.description}
                </p>

                <button 
                  onClick={() => setSelectedEvent(event.title)}
                  className="w-full py-4 bg-white/5 hover:bg-purple-600 text-white font-bold rounded-xl border border-white/10 hover:border-purple-500 transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                >
                  Reserve for this Event <Music className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default EventsPage;