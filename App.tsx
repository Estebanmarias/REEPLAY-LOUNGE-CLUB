import React, { useState } from 'react';
import BackgroundSlider from './components/BackgroundSlider';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Events from './components/Events';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import Menu from './components/Menu';
import { AnimatePresence, motion } from 'framer-motion';

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

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'menu'>('home');

  return (
    <main className="relative min-h-screen text-white overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* Fixed Background */}
      <BackgroundSlider />

      {/* Content Switcher */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero onMenuClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setView('menu');
              }} />
              <AboutSection />
              <Experience />
              <Events />
              <Reviews />
              <Footer />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Menu onBack={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setView('home');
              }} />
              <Footer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default App;