import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, ZoomIn, X, Camera, Loader2 } from 'lucide-react';

interface GalleryPageProps {
  onBack: () => void;
}

// Simulated API Service
const fetchGalleryImages = async (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        "https://images.unsplash.com/photo-1574391884720-385052ff6fb6?q=80&w=800&auto=format&fit=crop", // Buffet/Food
        "https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=800&auto=format&fit=crop", // Cocktail
        "https://images.unsplash.com/photo-1570158268183-d296b2892211?q=80&w=800&auto=format&fit=crop", // Crowd
        "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=800&auto=format&fit=crop", // Lights
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop", // DJ
        "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=800&auto=format&fit=crop", // Chill
        "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=800&auto=format&fit=crop", // Atmosphere
        "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=800&auto=format&fit=crop", // Drinks
        "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=800&auto=format&fit=crop", // Bar
      ]);
    }, 1500); // 1.5s simulated network latency
  });
};

const GalleryPage: React.FC<GalleryPageProps> = ({ onBack }) => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      try {
        const data = await fetchGalleryImages();
        // Shuffle the fetched images initially
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setImages(shuffled);
      } catch (error) {
        console.error("Failed to load gallery images", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadImages();
  }, []);

  const shuffleImages = () => {
    setImages(prev => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto relative z-20"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-3">
            GALLERY <Camera className="w-8 h-8 text-purple-500" />
          </h1>
        </div>
        
        <button 
          onClick={shuffleImages}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-purple-600 rounded-full text-sm font-bold transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Shuffle
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-400 animate-pulse">Loading vibes...</p>
        </div>
      ) : (
        /* Masonry-ish Grid */
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((img, idx) => (
              <motion.div
                layout
                key={img} // Using URL as key for simplicity
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className={`
                  relative group rounded-xl overflow-hidden cursor-pointer border border-white/10
                  ${idx % 3 === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}
                  ${idx % 5 === 0 ? 'md:col-span-2' : ''}
                `}
                onClick={() => setSelectedImage(img)}
              >
                <img 
                  src={img} 
                  alt="Gallery Item" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 backdrop-blur-md"
          >
            <button className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-red-500 transition-colors">
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Full view"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GalleryPage;