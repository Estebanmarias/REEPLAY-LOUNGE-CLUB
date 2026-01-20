import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Monitor, Car, Target, Zap, ArrowRight, Trophy } from 'lucide-react';

const MotionDiv = motion.div as any;

interface GameZoneProps {
  onBookGame: () => void;
  theme: 'dark' | 'light';
}

const GameZone: React.FC<GameZoneProps> = ({ onBookGame, theme }) => {
  // GameZone is always dark/neon themed regardless of global theme
  const isDark = true; 

  const games = [
    {
      id: 'ps5',
      title: 'PS5 ARENA',
      desc: '4K HDR visuals with DualSense feedback. FIFA 24 & COD ready.',
      specs: '65" Screens • 4 Controllers',
      icon: Gamepad2,
      color: 'text-blue-400',
      border: 'group-hover:border-blue-500',
      shadow: 'group-hover:shadow-blue-500/20'
    },
    {
      id: 'vr',
      title: 'VR STATION',
      desc: 'Immersive Meta Quest 3 experience. Step into another dimension.',
      specs: 'Room Scale • Haptic Suits',
      icon: Monitor,
      color: 'text-purple-400',
      border: 'group-hover:border-purple-500',
      shadow: 'group-hover:shadow-purple-500/20'
    },
    {
      id: 'sim',
      title: 'RACING SIM',
      desc: 'Logitech G29 wheel with force feedback and racing bucket seat.',
      specs: 'F1 & GT Gran Turismo',
      icon: Car,
      color: 'text-red-400',
      border: 'group-hover:border-red-500',
      shadow: 'group-hover:shadow-red-500/20'
    },
    {
      id: 'snooker',
      title: 'SNOOKER PRO',
      desc: 'Professional full-size table for the sharks. Premium cues available.',
      specs: 'Standard Board • Lounge Area',
      icon: Target,
      color: 'text-green-400',
      border: 'group-hover:border-green-500',
      shadow: 'group-hover:shadow-green-500/20'
    }
  ];

  return (
    <section id="games" className="py-24 px-6 bg-[#050505] relative overflow-hidden border-y border-white/5">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
               <span className="text-cyan-400 font-mono text-sm tracking-widest uppercase">Level Up</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">
              GAME <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">ZONE</span>
            </h2>
            <p className="text-gray-400 mt-2 max-w-lg">
              Compete, conquer, and chill. High-performance setups for serious gamers.
            </p>
          </div>
          
          <button 
            onClick={onBookGame}
            className="group px-8 py-4 bg-white/5 border border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 font-bold rounded-xl transition-all flex items-center gap-3 backdrop-blur-md"
          >
            <Trophy className="w-5 h-5" /> Book A Station
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, idx) => (
            <MotionDiv
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`group relative p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 transition-all duration-300 hover:-translate-y-2 ${game.border} ${game.shadow} hover:shadow-2xl`}
            >
              <div className={`p-4 rounded-xl bg-white/5 w-fit mb-6 ${game.color} group-hover:scale-110 transition-transform duration-300`}>
                <game.icon className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2 font-mono uppercase">{game.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4 min-h-[40px]">
                {game.desc}
              </p>
              
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{game.specs}</span>
                <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 ${game.color}`} />
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GameZone;