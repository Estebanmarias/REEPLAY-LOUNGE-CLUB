import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, ZoomIn, X, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

const GalleryPage: React.FC<GalleryPageProps> = ({ onBack }) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const processImages = (urls: string[]) => {
    return urls.map((url, i) => {
      const rotation = Math.random() * 6 - 3;
      const isBig = Math.random() > 0.8;
      const spanClass = isBig ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1';
      return { id: `${url}-${i}`, url, rotation, spanClass };
    });
  };

  const fetchGallery = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery')
      .select('image_url')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      setLoading(false);
      return;
    }

    setItems(processImages(data.map((row: any) => row.image_url)));
    setLoading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const shuffleImages = () => {
    setItems(prev => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.map(item => ({
        ...item,
        rotation: Math.random() * 8 - 4,
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
          <button onClick={onBack} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-3">
            GALLERY <Camera className="w-8 h-8 text-purple-500" />
          </h1>
        </div>
        <button onClick={shuffleImages} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-purple-600 rounded-full text-sm font-bold transition-all border border-white/10 shadow-lg">
          <RefreshCw className="w-4 h-4" /> Shuffle Vibes
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">Loading gallery...</div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">No images yet.</div>
      ) : (
        <MotionDiv layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          style={{ gridAutoRows: '200px' }}>
          <AnimatePresence>
            {items.map((item) => (
              <GalleryItemCard
                key={item.id}
                item={item}
                onClick={() => setSelectedImage(item.url)}
              />
            ))}
          </AnimatePresence>
        </MotionDiv>
      )}

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

const GalleryItemCard: React.FC<{ item: GalleryItem; onClick: () => void }> = ({ item, onClick }) => {
  const [hasError, setHasError] = useState(false);
  if (hasError) return null;

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, rotate: item.rotation }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{ rotate: item.rotation }}
      className={`relative group rounded-xl overflow-hidden cursor-pointer bg-[#111] shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/10 ${item.spanClass} hover:z-10 hover:scale-[1.05] hover:border-purple-500/50 hover:rotate-0 transition-all duration-300`}
      onClick={onClick}
    >
      <img
        src={item.url}
        alt="Gallery"
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setHasError(true)}
      />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
      </div>
    </MotionDiv>
  );
};

export default GalleryPage;