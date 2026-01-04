import React from 'react';
import { MapPin, Instagram, Twitter, Ghost, ArrowUpRight } from 'lucide-react';

const Footer: React.FC = () => {
  const mapLink = "https://www.google.com/maps/search/?api=1&query=Reeplay+Lounge+Ogbomosho";

  return (
    <footer id="location" className="relative bg-black pt-20 pb-10 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left: Brand & Address */}
        <div>
          <h2 className="text-3xl font-black text-white mb-6">REEPLAY</h2>
          <div className="space-y-4 text-gray-400">
            <div className="flex items-start gap-3">
              <MapPin className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
              <p className="text-lg leading-relaxed">
                Ground Floor, Triple SK World,<br />
                Under G Rd, Lautech,<br />
                Ogbomosho.
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-6">
            <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-purple-600 transition-colors text-white">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-yellow-500 transition-colors text-white">
              <Ghost className="w-5 h-5" />
            </a>
            <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-blue-500 transition-colors text-white">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Right: CTA */}
        <div className="flex flex-col items-start lg:items-end">
          <a 
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-3 px-8 py-5 bg-white text-black rounded-2xl font-bold text-xl hover:bg-gray-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            Get Directions
            <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
          <p className="mt-4 text-gray-500 text-sm">
            Find your way to the pulse.
          </p>
        </div>
      </div>

      <div className="mt-20 pt-8 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>&copy; 2026 Reeplay Lounge & Club. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;