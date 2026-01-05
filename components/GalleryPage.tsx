import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, ZoomIn, X, Camera, Loader2 } from 'lucide-react';
import { client, urlFor } from '../lib/sanity';

const MotionDiv = motion.div as any;
const MotionImg = motion.img as any;

interface GalleryPageProps {
  onBack: () => void;
}

interface GalleryItem {
  id: string;
  url: string;
  rotation: number;
  spanClass: string;
}

// High-quality nightlife/club images from Unsplash
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=800&auto=format&fit=crop", // Blue lights crowd
  "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=800&auto=format&fit=crop", // DJ
  "https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=800&auto=format&fit=crop", // Cocktail
  "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=800&auto=format&fit=crop", // Disco ball/Lasers
  "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=800&auto=format&fit=crop", // Crowd hands up
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop", // Dark club vibe
  "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=800&auto=format&fit=crop", // Bar setting
  "https://images.unsplash.com/photo-1534237710431-e2fc698436d5?q=80&w=800&auto=format&fit=crop", // Smoky lights
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop", // Event crowd
  "https://images.unsplash.com/photo-1525268323886-28818290ce0e?q=80&w=800&auto=format&fit=crop", // Hookah smoke vibe
  "https://images.unsplash.com/photo-1574100004472-e536d3b6b48c?q=80&w=800&auto=format&fit=crop", // Neon
  "https://images.unsplash.com/photo-1621903649635-4672e817a586?q=80&w=800&auto=format&fit=crop"  // Bottle service
];

const GalleryPage: React.FC<GalleryPageProps> = ({ onBack }) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Helper to process raw URLs into GalleryItems with random props
  const processImages = (urls: string[]) => {
    return urls.map((url, i) => {
      // Random rotation between -3deg and 3deg for a subtle messy look
      const rotation = Math.random() * 6 - 3;
      
      // Random grid spanning for masonry effect
      // 20% chance to be big, 80% small
      const isBig = Math.random() > 0.8;
      const spanClass = isBig 
        ? 'col-span-2 row-span-2' 
        : 'col-span-1 row-span-1';

      return {
        id: `${url}-${i}-${Date.now()}`,
        url,
        rotation,
        spanClass
      };
    });
  };

  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      // Prevent network error if Project ID is not set
      if (client.config().projectId === 'replace-with-your-project-id') {
         console.log("Sanity Project ID not set, using fallback gallery images.");
         setItems(processImages(FALLBACK_IMAGES));
         setIsLoading(false);
         return;
      }

      try {
        // Fetch images from Sanity 'galleryImage' document type
        const query = `*[_type == "galleryImage"] {
          image
        }`;
        const data = await client.fetch(query);
        
        if (data && data.length > 0) {
          // Transform Sanity image objects to URLs
          const urls = data.map((item: any) => urlFor(item.image)?.width(800).url()).filter(Boolean);
          setItems(processImages(urls.length > 0 ? urls : FALLBACK_IMAGES));
        } else {
          setItems(processImages(FALLBACK_IMAGES));
        }
      } catch (error) {
        console.error("Failed to load gallery images from Sanity", error);
        setItems(processImages(FALLBACK_IMAGES));
      } finally {
        setIsLoading(false);
      }
    };
    loadImages();
  }, []);

  const shuffleImages = () => {
    setItems(prev => {
      // Create a shallow copy
      const shuffled = [...prev];
      // Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      // Re-assign random rotations/spans on shuffle for dynamic effect
      return shuffled.map(item => ({
        ...item,
        rotation: Math.random() * 8 - 4, // Slightly more rotation on shuffle
        spanClass: Math.random() > 0.8 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'
      }));
    });
  };

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto relative z-20"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4 self-start md:self-auto">
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
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-purple-600 rounded-full text-sm font-bold transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Shuffle Photos
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-400 animate-pulse">Loading vibes...</p>
        </div>
      ) : (
        /* Masonry-ish Grid */
        <MotionDiv layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[200px]">
          <AnimatePresence>
            {items.map((item, idx) => (
              <MotionDiv
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  rotate: item.rotation 
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                style={{ rotate: item.rotation }} // Apply random rotation
                className={`
                  relative group rounded-xl overflow-hidden cursor-pointer border-4 border-white/5 bg-[#111] shadow-2xl
                  ${item.spanClass}
                  hover:z-10 hover:scale-[1.05] hover:border-purple-500/50 hover:rotate-0 transition-all duration-300
                `}
                onClick={() => setSelectedImage(item.url)}
              >
                <img 
                  src={item.url} 
                  alt="Gallery Item" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </MotionDiv>
            ))}
          </AnimatePresence>
        </MotionDiv>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 backdrop-blur-md"
          >
            <button className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-red-500 transition-colors z-50">
              <X className="w-8 h-8" />
            </button>
            <MotionImg
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Full view"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-white/10"
              onClick={(e: any) => e.stopPropagation()}
            />
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
};

export default GalleryPage;