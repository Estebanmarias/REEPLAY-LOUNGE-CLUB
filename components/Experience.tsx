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

const Experience: React.FC = () => {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">The Experience</h2>
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
              bg-white/5 backdrop-blur-md border border-white/10
              hover:bg-white/10 transition-colors duration-300
              ${idx === 3 || idx === 4 ? 'md:col-span-1 lg:col-span-1' : ''} 
              ${/* Center the last 2 items on large screens if desired, but 3 cols flows nicely */ ''}
            `}
          >
            <div className="mb-6 inline-block p-4 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
              <feature.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">
              {feature.description}
            </p>
          </MotionDiv>
        ))}
      </div>
    </section>
  );
};

export default Experience;