import React, { useState } from 'react';
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
import { AnimatePresence, motion } from 'framer-motion';

const MotionDiv = motion.div as any;

// Simple About Section Component localized here for simplicity as it's small
const AboutSection: React.FC = () => (
  <section className="py-20 px-6 max-w-3xl mx-auto text-center relative z-10">
    <div className="bg-black/50 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
      <h2 className="text-3xl font-bold text-white mb-6">About Us</h2>
      <p className="text-gray-300 text-lg leading-relaxed">
        Reeplay Lounge & Club is not just a destination; it's a feeling. 
        Located in the heart of Ogbomosho, we redefine nightlife with premium service, 
        electrifying ambiance, and a community that knows how to celebrate life. 
        Whether you're here to unwind or unleash, you're exactly where you need to be.
      </p>
    </div>
  </section>
);

type ViewState = 'home' | 'menu' | 'events' | 'gallery';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  const navigateTo = (newView: ViewState) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView(newView);
  };

  return (
    <main className="relative min-h-screen text-white overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* Fixed Background */}
      <BackgroundSlider />

      {/* Navigation (Always visible toggle) */}
      <Navbar 
        onNavigate={navigateTo} 
        currentView={view} 
        onOpenReservation={() => setIsReservationOpen(true)}
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
              />
              <AboutSection />
              <Experience />
              <Events />
              <Reviews />
              <ContactUs />
              <Footer />
            </MotionDiv>
          )}

          {view === 'menu' && (
            <MotionDiv
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Menu onBack={() => navigateTo('home')} theme="dark" />
              <Footer />
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
              <Footer />
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
              <Footer />
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default App;