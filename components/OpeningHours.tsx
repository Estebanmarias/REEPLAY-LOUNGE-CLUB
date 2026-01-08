import React from 'react';
import { Clock, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

interface OpeningHoursProps {
  theme: 'dark' | 'light';
}

const OpeningHours: React.FC<OpeningHoursProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  const schedule = [
    { days: "Mon - Thu", hours: "Open 24 Hours", note: "Lounge & Bar Service" },
    { days: "Fri - Sat", hours: "Open 24 Hours", note: "Club Night Starts @ 10PM" },
    { days: "Sunday", hours: "Open 24 Hours", note: "Chill Vibes All Day" }
  ];

  return (
    <section className={`py-20 px-6 border-y transition-colors duration-500
      ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-[#f4f2ed] border-gray-200'}
    `}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Visual Timeline */}
        <div>
           <div className="mb-8">
             <h2 className={`text-3xl font-black mb-2 uppercase ${isDark ? 'text-white' : 'text-[#2D2438]'}`}>Opening Hours</h2>
             <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>The doors are always open for you.</p>
           </div>

           <div className="space-y-6">
             {schedule.map((item, idx) => (
               <MotionDiv 
                 key={idx}
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: idx * 0.1 }}
                 className={`flex items-start gap-4 p-4 rounded-xl border transition-all
                   ${isDark 
                     ? 'bg-white/5 border-white/5 hover:bg-white/10' 
                     : 'bg-white border-gray-200 shadow-sm'}
                 `}
               >
                 <div className={`p-3 rounded-full ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                   <Clock className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.days}</h4>
                   <p className={`font-mono font-medium ${isDark ? 'text-yellow-500' : 'text-purple-700'}`}>{item.hours}</p>
                   <p className="text-xs text-gray-500 mt-1">{item.note}</p>
                 </div>
               </MotionDiv>
             ))}
           </div>
        </div>

        {/* Contact Quick Links */}
        <div className={`p-8 rounded-3xl border flex flex-col justify-center h-full text-center
            ${isDark 
              ? 'bg-gradient-to-br from-purple-900/20 to-black border-white/10' 
              : 'bg-white border-gray-200 shadow-xl'}
        `}>
           <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>For Inquiries & VIP</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="tel:09060621425" className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all group
                  ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}
              `}>
                 <Phone className="w-8 h-8 mb-3 text-green-500 group-hover:scale-110 transition-transform" />
                 <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Call Us</span>
                 <span className="text-xs text-gray-500 mt-1">0906 062 1425</span>
              </a>

              <a href="mailto:reeplaylounge@gmail.com" className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all group
                  ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}
              `}>
                 <Mail className="w-8 h-8 mb-3 text-blue-500 group-hover:scale-110 transition-transform" />
                 <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Email Us</span>
                 <span className="text-xs text-gray-500 mt-1">reeplaylounge@gmail.com</span>
              </a>
           </div>

           <p className={`mt-8 text-sm italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
             "We never sleep so you can dream."
           </p>
        </div>

      </div>
    </section>
  );
};

export default OpeningHours;