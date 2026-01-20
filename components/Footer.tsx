import React from 'react';
import { MapPin, ArrowUpRight, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionA = motion.a as any;

interface FooterProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const SocialButton: React.FC<{ 
  href: string; 
  iconSrc: string; 
  label: string; 
  isDark: boolean 
}> = ({ href, iconSrc, label, isDark }) => {
  return (
    <MotionA
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`relative group flex items-center justify-center p-0.5 rounded-full overflow-hidden w-14 h-14 transition-all shadow-lg
        ${isDark ? 'shadow-purple-500/20' : 'shadow-purple-500/10'}
      `}
    >
      {/* Animated Rotating Gradient Background */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className={`absolute inset-[-100%] z-0
          ${isDark 
            ? 'bg-[conic-gradient(from_0deg,transparent_0deg,#a855f7_180deg,transparent_360deg)] opacity-100' 
            : 'bg-[conic-gradient(from_0deg,transparent_0deg,#d97706_180deg,transparent_360deg)] opacity-100'} 
        `}
      />

      {/* Inner Circle (The Button Surface) */}
      <div className={`relative z-10 w-full h-full rounded-full flex items-center justify-center transition-colors
        ${isDark ? 'bg-black group-hover:bg-[#111]' : 'bg-white group-hover:bg-gray-50'}
      `}>
        <img 
          src={iconSrc} 
          alt={label} 
          className={`w-6 h-6 object-contain transition-transform group-hover:scale-110 
            ${isDark ? 'invert brightness-200' : ''}
          `} 
        />
      </div>
    </MotionA>
  );
};

const Footer: React.FC<FooterProps> = ({ theme, toggleTheme }) => {
  const isDark = theme === 'dark';

  // Updated to 'dir' (directions) to immediately start navigation/route planning
  const mapLink = "https://www.google.com/maps/dir/?api=1&destination=Triple+SK+World+Under+G+Ogbomoso";
  const whatsappLink = "https://wa.me/2349060621425";
  const tiktokLink = "https://www.tiktok.com/@reeplaylounge"; 
  const igLink = "https://instagram.com/reeplaylounge_ogbomoso";

  // Icons URLs
  const whatsappIcon = "https://www.svgrepo.com/show/500461/whatsapp.svg";
  const igIcon = "https://www.svgrepo.com/show/512399/instagram-167.svg";
  const tiktokIcon = "https://www.svgrepo.com/show/447151/tiktok-outline.svg";

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
            <SocialButton 
              href={igLink} 
              iconSrc={igIcon} 
              label="Instagram" 
              isDark={isDark} 
            />
            <SocialButton 
              href={tiktokLink} 
              iconSrc={tiktokIcon} 
              label="TikTok" 
              isDark={isDark} 
            />
            <SocialButton 
              href={whatsappLink} 
              iconSrc={whatsappIcon} 
              label="WhatsApp" 
              isDark={isDark} 
            />
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