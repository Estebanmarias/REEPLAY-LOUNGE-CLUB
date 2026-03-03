import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Music, Ticket, Share2, Check } from 'lucide-react';
import RsvpModal from './RsvpModal';
import { supabase } from '../lib/supabase';

const MotionDiv = motion.div as any;
const MotionImg = motion.img as any;

interface EventsPageProps {
  onBack: () => void;
}

interface SpecialEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  image: string;
  description: string;
  price: string;
  is_active: boolean;
  event_date: string;
}

const EventCard: React.FC<{
  event: SpecialEvent;
  onReserve: (title: string) => void;
  index: number;
}> = ({ event, onReserve, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isShared, setIsShared] = useState(false);

  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const handleShare = async () => {
    const shareData = {
      title: `Reeplay Lounge: ${event.title}`,
      text: `${event.title} happening on ${event.date} at Reeplay Lounge! ${event.description}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) {}
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    }
  };

  return (
    <MotionDiv
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="group relative bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:border-purple-500/50 transition-colors flex flex-col h-full"
    >
      <div className="h-72 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <MotionImg style={{ y, scale: 1.15 }} src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 shadow-lg">
          {event.category}
        </div>
      </div>

      <div className="p-6 md:p-8 relative z-20 -mt-10 bg-[#111] rounded-t-3xl border-t border-white/5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl font-bold text-white leading-tight group-hover:text-purple-400 transition-colors">
            {event.title}
          </h2>
          <button onClick={handleShare} className="p-3 bg-white/5 rounded-full hover:bg-white/10 hover:text-white transition-all flex-shrink-0 text-gray-400" title="Share Event">
            {isShared ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
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

        <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">{event.description}</p>

        <button
          onClick={() => onReserve(event.title)}
          className="w-full py-4 bg-white/5 hover:bg-purple-600 text-white font-bold rounded-xl border border-white/10 hover:border-purple-500 transition-all flex items-center justify-center gap-2 mt-auto shadow-lg"
        >
          Reserve Spot <Music className="w-4 h-4" />
        </button>
      </div>
    </MotionDiv>
  );
};

const EventsPage: React.FC<EventsPageProps> = ({ onBack }) => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: string; hours: string; mins: string; secs: string } | null>(null);
  const [nextEventName, setNextEventName] = useState<string>('');
  const [events, setEvents] = useState<SpecialEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events — sorted by date ascending so nearest is first
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true });

      if (!error && data) {
        const mapped = data.map((e: any) => ({ ...e, image: e.image_url }));
        setEvents(mapped);
        const now = new Date();
        const next = mapped.find((e: SpecialEvent) => {
          const d = new Date(e.date);
          return !isNaN(d.getTime()) && d > now;
        });
        if (next) setNextEventName(next.title);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  // Countdown to next upcoming event
  useEffect(() => {
    if (!events.length) return;
    const now = new Date();
    const next = events.find((e: SpecialEvent) => {
      const d = new Date(e.date);
      return !isNaN(d.getTime()) && d > now;
    });
    if (!next) { setTimeLeft(null); return; }

    const target = new Date(next.event_date);
    const timer = setInterval(() => {
      const diff = target.getTime() - new Date().getTime();
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: '00', hours: '00', mins: '00', secs: '00' });
        return;
      }
      setTimeLeft({
        days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
        hours: String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
        mins: String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
        secs: String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0'),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [events]);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto relative z-20"
    >
      <RsvpModal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} eventName={selectedEvent || ''} />

      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            SPECIALS
          </h1>
          <p className="text-gray-400 text-sm mt-1">Upcoming Exclusive Nights</p>
        </div>
      </div>

      {/* Countdown */}
      <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-1">Next Event Countdown</h3>
          <p className="text-purple-300 text-sm">{nextEventName || "Don't miss the vibe check."}</p>
        </div>
        {timeLeft ? (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Mins', value: timeLeft.mins },
              { label: 'Secs', value: timeLeft.secs },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center bg-black/30 rounded-xl py-4 border border-white/10">
                <span className="text-3xl md:text-5xl font-mono font-black text-white tabular-nums">{value}</span>
                <span className="text-[10px] uppercase tracking-widest text-purple-300 mt-1">{label}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No upcoming events scheduled yet.</p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">No upcoming events.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} onReserve={(title) => setSelectedEvent(title)} />
          ))}
        </div>
      )}
    </MotionDiv>
  );
};

export default EventsPage;