import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, PartyPopper, Heart, Briefcase, Star, MessageSquare, CheckCircle, ArrowRight } from 'lucide-react';

const MotionDiv = motion.div as any;

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OCCASIONS = [
  { id: 'birthday', label: 'Birthday', icon: PartyPopper, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/50' },
  { id: 'date', label: 'Date / Proposal', icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/50' },
  { id: 'corporate', label: 'Corporate', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/50' },
  { id: 'vip', label: 'VIP Table', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50' },
  { id: 'casual', label: 'Casual / Other', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/50' },
];

const WHATSAPP_LINK = "https://wa.me/message/JL7FQ3VJU44YN1";

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Details, 2: Success
  const [formData, setFormData] = useState({
    occasion: 'birthday',
    date: '',
    time: '',
    guests: '',
    name: '',
    phone: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const sendToWhatsApp = () => {
    const text = `*New Reservation Request - Reeplay Lounge* 🥂%0A%0A*Type:* ${formData.occasion.toUpperCase()}%0A*Date:* ${formData.date}%0A*Time:* ${formData.time}%0A*Guests:* ${formData.guests}%0A*Name:* ${formData.name}%0A*Notes:* ${formData.notes}`;
    window.open(`${WHATSAPP_LINK}?text=${text}`, '_blank');
    onClose();
    setTimeout(() => setStep(1), 500); // Reset after close
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Content */}
          <MotionDiv
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            className="relative w-full max-w-2xl bg-[#121212] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  SPECIAL RESERVATION
                </h2>
                <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">Make it Memorable</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              {step === 1 ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Occasion Selector */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Select Occasion</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {OCCASIONS.map((occ) => {
                        const Icon = occ.icon;
                        const isSelected = formData.occasion === occ.id;
                        return (
                          <div
                            key={occ.id}
                            onClick={() => setFormData({ ...formData, occasion: occ.id })}
                            className={`
                              cursor-pointer p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 text-center
                              ${isSelected 
                                ? `${occ.bg} ${occ.border} ring-1 ring-${occ.color.split('-')[1]}-500` 
                                : 'bg-white/5 border-transparent hover:bg-white/10'}
                            `}
                          >
                            <Icon className={`w-6 h-6 ${isSelected ? occ.color : 'text-gray-400'}`} />
                            <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-400'}`}>{occ.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase">
                        <Calendar className="w-4 h-4 text-purple-500" /> Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        required
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase">
                        <Clock className="w-4 h-4 text-yellow-500" /> Time
                      </label>
                      <input
                        type="time"
                        name="time"
                        required
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Guests & Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase">
                        <Users className="w-4 h-4 text-blue-500" /> Guests
                      </label>
                      <input
                        type="number"
                        name="guests"
                        placeholder="e.g. 4"
                        required
                        min="1"
                        value={formData.guests}
                        onChange={handleInputChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase">
                        <MessageSquare className="w-4 h-4 text-green-500" /> Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase">Special Requests / Notes</label>
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="Any decorations? Specific bottle service? Surprise details?"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-black text-lg uppercase tracking-widest rounded-xl shadow-lg shadow-yellow-900/20 transition-all transform hover:scale-[1.01]"
                  >
                    Submit Request
                  </button>

                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
                  <MotionDiv
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </MotionDiv>
                  
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">Almost Done!</h3>
                    <p className="text-gray-400 max-w-sm mx-auto">
                      Click below to send your request details directly to our reservations team on WhatsApp for instant confirmation.
                    </p>
                  </div>

                  <button
                    onClick={sendToWhatsApp}
                    className="flex items-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl transition-all shadow-lg"
                  >
                    Send to WhatsApp <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  <button onClick={() => setStep(1)} className="text-gray-500 hover:text-white text-sm">
                    Back to Edit
                  </button>
                </div>
              )}
            </div>
          </MotionDiv>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReservationModal;