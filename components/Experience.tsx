import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Crown, Wind, Zap, Speaker } from 'lucide-react';
import { FeatureItem } from '../types';

const MotionDiv = motion.div as any;

const features: FeatureItem[] = [
  {
    title: "Open 24 Hours",
    description: "The party never stops. We are open all day, every day for your enjoyment.",
    icon: Clock,
  },
  {
    title: "Premium Lounge",
    description: "Exclusive seating areas with premium bottle service and comfort.",
    icon: Crown,
  },
  {
    title: "Outdoor Seating",
    description: "Enjoy the cool breeze and social atmosphere in our outdoor section.",
    icon: Wind,
  },
  {
    title: "Energetic Floor",
    description: "A spacious dance floor with lighting that pulses to the beat.",
    icon: Zap,
  },
  {
    title: "Hi-Fi Sound",
    description: "State-of-the-art sound system that lets you feel every bass drop.",
    icon: Speaker,
  },
];

interface ExperienceProps {
  theme?: 'dark' | 'light';
}

const Experience: React.FC<ExperienceProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#2D2438]'}`}>The Experience</h2>
        <div className="h-1 w-20 bg-purple-500 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <MotionDiv
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className={`
              relative overflow-hidden p-8 rounded-2xl
              backdrop-blur-md border transition-all duration-300 group
              ${isDark 
                ? 'bg-black/40 border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:bg-black/60 hover:border-purple-500/30' 
                : 'bg-white/60 border-white/60 shadow-xl shadow-purple-500/5 hover:bg-white/80 hover:border-purple-200'}
              ${idx === 3 || idx === 4 ? 'md:col-span-1 lg:col-span-1' : ''} 
            `}
          >
            <div className="mb-6 inline-block p-4 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <feature.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-3 transition-colors ${isDark ? 'text-white group-hover:text-purple-300' : 'text-gray-900 group-hover:text-purple-600'}`}>
              {feature.title}
            </h3>
            <p className={`leading-relaxed text-sm md:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {feature.description}
            </p>
          </MotionDiv>
        ))}
      </div>
    </section>
  );
};

export default Experience;