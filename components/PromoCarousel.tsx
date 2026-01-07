import React from 'react';
import { Calendar, Zap } from 'lucide-react';
import { upcomingSpecialEvents } from '../staticData';

const PromoCarousel = () => {
  const carouselItems = [...upcomingSpecialEvents, ...upcomingSpecialEvents, ...upcomingSpecialEvents, ...upcomingSpecialEvents];

  const marqueeStyle = `
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); } 
    }
    .animate-marquee {
      animation: marquee 40s linear infinite;
    }
    .animate-marquee:hover {
      animation-play-state: paused;
    }
  `;

  return (
    <div className="w-full overflow-hidden mb-8 relative z-20 group">
      <style>{marqueeStyle}</style>
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-red-400">Happening Now & Upcoming</span>
      </div>

      <div className="flex gap-4 animate-marquee w-max hover:cursor-grab active:cursor-grabbing">
        {carouselItems.map((event, i) => {
           const isLive = i === 0 || i === upcomingSpecialEvents.length; 
           return (
            <div 
              key={`${event.id}-${i}`} 
              className="relative w-[280px] h-[140px] rounded-2xl overflow-hidden border border-white/10 bg-black/60 flex-shrink-0 group/card text-left"
            >
              <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/card:opacity-40 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   {isLive ? (
                     <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-lg shadow-red-900/50">
                       <Zap className="w-3 h-3 fill-white" /> Live Now
                     </span>
                   ) : (
                     <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                       Upcoming
                     </span>
                   )}
                </div>
                <div>
                   <h4 className="text-white font-bold text-lg leading-tight mb-1 truncate">{event.title}</h4>
                   <div className="flex items-center text-xs text-gray-300 gap-2">
                      <Calendar className="w-3 h-3" /> {event.date} • {event.time}
                   </div>
                </div>
              </div>
            </div>
           )
        })}
      </div>
    </div>
  )
}

export default PromoCarousel;