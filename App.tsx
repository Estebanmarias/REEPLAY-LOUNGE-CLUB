import React, { useState, useEffect } from 'react';
import BackgroundSlider from './components/BackgroundSlider';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Events from './components/Events';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import Menu from './components/Menu';
import EventsPage from './components/EventsPage';
import GalleryPage from './components/GalleryPage';
import Navbar from './components/Navbar';
import ReservationModal from './components/ReservationModal';
import ContactUs from './components/ContactUs';
import DJLineup from './components/DJLineup';
import OpeningHours from './components/OpeningHours';
import CursorTrail from './components/CursorTrail'; 
import { AnimatePresence, motion } from 'framer-motion';

const MotionDiv = motion.div as any;

// Simple About Section Component localized here for simplicity as it's small
const AboutSection: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => {
  const isDark = theme === 'dark';
  return (
    <section className="py-20 px-6 max-w-3xl mx-auto text-center relative z-10">
      <div className={`p-8 md:p-12 rounded-3xl border shadow-2xl backdrop-blur-xl transition-all duration-500
        ${isDark 
          ? 'bg-black/50 border-white/10' 
          : 'bg-white/70 border-white/40 shadow-purple-500/5'}
      `}>
        <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-[#2D2438]'}`}>About Us</h2>
        <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Reeplay Lounge & Club is not just a destination; it's a feeling. 
          Located in the heart of Ogbomosho, we redefine nightlife with premium service, 
          electrifying ambiance, and a community that knows how to celebrate life. 
          Whether you're here to unwind or unleash, you're exactly where you need to be.
        </p>
      </div>
    </section>
  );
};

type ViewState = 'home' | 'menu' | 'events' | 'gallery';
type Theme = 'dark' | 'light';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');

  // Handle Theme Persistence
  useEffect(() => {
    const storedTheme = localStorage.getItem('reeplay_theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('reeplay_theme', newTheme);
  };

  // Handle Hash Changes & Smooth Scrolling
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      
      // Main Views
      if (['home', 'menu', 'events', 'gallery'].includes(hash)) {
        setView(hash as ViewState);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } 
      // Sections on Home Page (e.g. #contact, #location)
      else if (['contact', 'location'].includes(hash)) {
        setView('home');
        // Give React a moment to render the Home view if we weren't there
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
      else if (!hash) {
        setView('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Set initial view based on hash
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newView: ViewState) => {
    window.location.hash = newView;
  };

  return (
    <main className={`relative min-h-screen overflow-x-hidden selection:bg-purple-500 selection:text-white transition-colors duration-500 
      ${theme === 'dark' 
        ? 'text-white bg-black' 
        : 'text-[#2D2438] bg-gradient-to-br from-[#FDFBF7] to-[#EAE5D9]'
      }`}
    >
      {/* Global Cursor Trail */}
      <CursorTrail />

      {/* Fixed Background - Only visible in dark mode or Home view mostly */}
      <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
        <BackgroundSlider />
      </div>

      {/* Navigation (Always visible toggle) */}
      <Navbar 
        onNavigate={navigateTo} 
        currentView={view} 
        onOpenReservation={() => setIsReservationOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Special Reservation Modal */}
      <ReservationModal 
        isOpen={isReservationOpen} 
        onClose={() => setIsReservationOpen(false)} 
      />

      {/* Content Switcher */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <MotionDiv
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero 
                onMenuClick={() => navigateTo('menu')} 
                onReservationClick={() => setIsReservationOpen(true)}
                theme={theme}
              />
              <AboutSection theme={theme} />
              <Experience theme={theme} />
              <DJLineup theme={theme} />
              <Events theme={theme} />
              <Reviews theme={theme} />
              <OpeningHours theme={theme} />
              <ContactUs />
              <Footer theme={theme} toggleTheme={toggleTheme} />
            </MotionDiv>
          )}

          {view === 'menu' && (
            <MotionDiv
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Menu onBack={() => navigateTo('home')} theme={theme} />
              <Footer theme={theme} toggleTheme={toggleTheme} />
            </MotionDiv>
          )}

          {view === 'events' && (
            <MotionDiv
              key="events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EventsPage onBack={() => navigateTo('home')} />
              <Footer theme={theme} toggleTheme={toggleTheme} />
            </MotionDiv>
          )}

          {view === 'gallery' && (
            <MotionDiv
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GalleryPage onBack={() => navigateTo('home')} />
              <Footer theme={theme} toggleTheme={toggleTheme} />
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default App;