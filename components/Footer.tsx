import React from 'react';
import { MapPin, Instagram, Video, Ghost, ArrowUpRight, MessageCircle, Moon, Sun } from 'lucide-react';

interface FooterProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const Footer: React.FC<FooterProps> = ({ theme, toggleTheme }) => {
  const isDark = theme === 'dark';

  // Updated to 'dir' (directions) to immediately start navigation/route planning
  const mapLink = "https://www.google.com/maps/dir/?api=1&destination=Triple+SK+World+Under+G+Ogbomoso";
  const whatsappLink = "https://wa.me/2349060621425";
  const tiktokLink = "https://www.tiktok.com/@reeplaylounge"; 
  const igLink = "https://instagram.com/reeplaylounge_ogbomoso";

  return (
    <footer id="location" className={`relative pt-20 pb-36 md:pb-10 px-6 border-t transition-colors duration-500 ${isDark ? 'bg-black border-white/10' : 'bg-gray-100 border-gray-200'}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left: Brand & Address */}
        <div>
          <h2 className={`text-3xl font-black mb-6 tracking-tight ${isDark ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400' : 'text-gray-900'}`}>
            LOCATE THE VIBE
          </h2>
          <div className={`space-y-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
            <a href={igLink} target="_blank" rel="noopener noreferrer" className={`p-3 rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-purple-600 text-white' : 'bg-white hover:bg-purple-600 hover:text-white text-gray-700 shadow-sm'}`} aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className={`p-3 rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-yellow-500 text-white' : 'bg-white hover:bg-yellow-500 hover:text-white text-gray-700 shadow-sm'}`} aria-label="Snapchat">
              <Ghost className="w-5 h-5" />
            </a>
            {/* Using Video icon for TikTok as Lucide generic set sometimes lacks brand icons */}
            <a href={tiktokLink} target="_blank" rel="noopener noreferrer" className={`p-3 rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-pink-500 text-white' : 'bg-white hover:bg-pink-500 hover:text-white text-gray-700 shadow-sm'}`} aria-label="TikTok">
              <Video className="w-5 h-5" />
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={`p-3 rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-green-500 text-white' : 'bg-white hover:bg-green-500 hover:text-white text-gray-700 shadow-sm'}`} aria-label="WhatsApp">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Right: CTA */}
        <div className="flex flex-col items-start lg:items-end">
          <a 
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative inline-flex items-center gap-3 px-8 py-5 rounded-2xl font-bold text-xl transition-all ${isDark ? 'bg-white text-black hover:bg-gray-200 shadow-[0_0_40px_rgba(255,255,255,0.1)]' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'}`}
          >
            Get Directions
            <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
          <p className={`mt-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Find your way to the pulse.
          </p>
        </div>
      </div>

      <div className={`mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${isDark ? 'border-white/5 text-gray-600' : 'border-gray-200 text-gray-500'}`}>
        <p className="text-sm">&copy; 2026 Reeplay Lounge & Club. All rights reserved.</p>
        
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all
            ${isDark 
              ? 'bg-white/10 text-white hover:bg-white/20' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
          `}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-yellow-400" /> Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-purple-600" /> Dark Mode
            </>
          )}
        </button>
      </div>
    </footer>
  );
};

export default Footer;