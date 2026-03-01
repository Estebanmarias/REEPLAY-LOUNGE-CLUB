import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Instagram, ExternalLink } from 'lucide-react';

const MotionDiv = motion.div as any;

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventName: string;
}

const RsvpModal: React.FC<RsvpModalProps> = ({ isOpen, onClose, eventName }) => {
  const whatsappNumber = "234906021203547"; // Reeplay number
  const instagramHandle = "reeplaylounge_ogbomoso";

  const handleWhatsApp = () => {
    const text = `Hello Reeplay, I would like to RSVP for *${eventName}*`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
    onClose();
  };

  const handleInstagram = () => {
    // Direct DM link format
    window.open(`https://ig.me/m/${instagramHandle}`, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <MotionDiv
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-[#111] border border-white/10 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <h3 className="text-2xl font-bold text-white mb-2">RSVP Options</h3>
            <p className="text-gray-400 mb-8">
              How would you like to book your spot for <br/>
              <span className="text-purple-400 font-bold">{eventName}</span>?
            </p>

            <div className="space-y-4">
              <button
                onClick={handleWhatsApp}
                className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg"
              >
                <MessageCircle className="w-6 h-6" />
                Send Message on WhatsApp
              </button>

              <button
                onClick={handleInstagram}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg"
              >
                <Instagram className="w-6 h-6" />
                DM on Instagram
              </button>
            </div>

            <p className="mt-6 text-xs text-gray-500">
              We respond instantly on both platforms.
            </p>
          </MotionDiv>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RsvpModal;