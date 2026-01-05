import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, ZoomIn, X, Camera, Loader2 } from 'lucide-react';
import { client, urlFor } from '../lib/sanity';

const MotionDiv = motion.div as any;
const MotionImg = motion.img as any;

interface GalleryPageProps {
  onBack: () => void;
}

// Fallback images in case Sanity is empty or fails
const FALLBACK_IMAGES = [
  "https://i.imgur.com/8Qe79wT.jpg",
  "https://i.imgur.com/W2f9Rj1.jpg",
  "https://i.imgur.com/Gz4z1cO.jpg",
  "https://i.imgur.com/j8nQ1Wn.jpg",
  "https://i.imgur.com/M6L5lQo.jpg",
  "https://i.imgur.com/z2qg1oE.jpg",
  "https://i.imgur.com/T0bH1gE.jpg",
  "https://i.imgur.com/8JqL9wM.jpg",
  "https://i.imgur.com/k2e8l2v.jpg",
  "https://i.imgur.com/j8s9d2z.jpg",
  "https://i.imgur.com/H1z2e9q.jpg",
  "https://i.imgur.com/6rE8l1c.jpg",
  "https://i.imgur.com/2sQ3s2d.jpg"
];

const GalleryPage: React.FC<GalleryPageProps> = ({ onBack }) => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      // Prevent network error if Project ID is not set
      if (client.config().projectId === 'replace-with-your-project-id') {
         console.log("Sanity Project ID not set, using fallback gallery images.");
         setImages(FALLBACK_IMAGES.sort(() => Math.random() - 0.5));
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
          // Shuffle initially
          setImages(urls.sort(() => Math.random() - 0.5));
        } else {
          setImages(FALLBACK_IMAGES.sort(() => Math.random() - 0.5));
        }
      } catch (error) {
        console.error("Failed to load gallery images from Sanity", error);
        setImages(FALLBACK_IMAGES.sort(() => Math.random() - 0.5));
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
    <MotionDiv
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
        <MotionDiv layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((img, idx) => (
              <MotionDiv
                layout
                key={img + idx} // Unique key for shuffle animation
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
            <button className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-red-500 transition-colors">
              <X className="w-8 h-8" />
            </button>
            <MotionImg
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Full view"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border border-white/10"
              onClick={(e: any) => e.stopPropagation()}
            />
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
};

export default GalleryPage;