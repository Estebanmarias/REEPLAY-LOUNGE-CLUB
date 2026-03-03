import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin, Phone, CheckCircle, Loader2 } from 'lucide-react';

const MotionDiv = motion.div as any;

const ContactUs: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    // Construct the mailto link to open user's email client
    const subject = encodeURIComponent(`Contact Form: ${formState.subject}`);
    const body = encodeURIComponent(
      `Name: ${formState.name}\nEmail: ${formState.email}\n\nMessage:\n${formState.message}`
    );
    
    // Small delay to show "Sending..." state before opening mail client
    setTimeout(() => {
      window.location.href = `mailto:reeplayclub@gmail.com?subject=${subject}&body=${body}`;
      
      setStatus('success');
      setFormState({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-20 px-6 max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">GET IN TOUCH</h2>
        <div className="h-1 w-24 bg-purple-600 mx-auto rounded-full"></div>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          Have a question about an event, a private booking, or just want to say hello? Drop us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <MotionDiv 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-black/40 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-lg"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Contact Info</h3>
            <div className="space-y-6">
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=Triple+SK+World+Under+G+Ogbomoso" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start gap-4 group hover:bg-white/5 p-2 -ml-2 rounded-xl transition-all"
              >
                <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">Visit Us</h4>
                  <p className="text-gray-400">Triple SK World, Under G Rd,<br/>Ogbomosho, Nigeria</p>
                </div>
              </a>
              
              <a 
                href="tel:09061203547"
                className="flex items-start gap-4 group hover:bg-white/5 p-2 -ml-2 rounded-xl transition-all"
              >
                <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-yellow-400 transition-colors">Call Us</h4>
                  <p className="text-gray-400">0906 062 1425</p>
                </div>
              </a>

              <a 
                href="mailto:reeplayclub@gmail.com"
                className="flex items-start gap-4 group hover:bg-white/5 p-2 -ml-2 rounded-xl transition-all"
              >
                <div className="p-3 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-400 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-pink-400 transition-colors">Email Us</h4>
                  <p className="text-gray-400">reeplayclub@gmail.com</p>
                </div>
              </a>
            </div>
          </MotionDiv>
        </div>

        {/* Contact Form */}
        <MotionDiv
           initial={{ opacity: 0, x: 20 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           className="bg-black/40 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl"
        >
          {status === 'success' ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <MotionDiv 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mb-6 text-green-500"
              >
                <CheckCircle className="w-10 h-10" />
              </MotionDiv>
              <h3 className="text-2xl font-bold text-white mb-2">Opening Mail Client...</h3>
              <p className="text-gray-400">Please complete the send action in your email app.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase ml-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formState.name}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors placeholder:text-gray-600"
                    placeholder="Your Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase ml-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formState.email}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors placeholder:text-gray-600"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase ml-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formState.subject}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors placeholder:text-gray-600"
                  placeholder="How can we help?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase ml-1">Message</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formState.message}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors resize-none placeholder:text-gray-600"
                  placeholder="Write your message here..."
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                {status === 'submitting' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {status === 'submitting' ? 'Preparing Email...' : 'Send Message'}
              </button>
            </form>
          )}
        </MotionDiv>
      </div>
    </section>
  );
};

export default ContactUs;
