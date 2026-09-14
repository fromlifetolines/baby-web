import React from 'react';
import { motion } from 'framer-motion';
import { ThemeStyle } from '../types';

interface BackgroundPastelProps {
  theme?: ThemeStyle;
}

export const BackgroundPastel: React.FC<BackgroundPastelProps> = ({ theme = 'gold-dark' }) => {
  // Theme color maps for dynamic visual atmosphere
  const themeStyles = {
    'gold-dark': {
      bg: '#0A0503',
      gradient: 'radial-gradient(ellipse at 50% 0%, rgba(217, 119, 6, 0.35) 0%, rgba(10, 5, 3, 0.98) 75%)',
      blob1: 'bg-amber-500/40',
      blob2: 'bg-yellow-400/30',
      blob3: 'bg-rose-600/35',
      symbols: ['✨', '🌟', '👑', '💰', '⚜️', '💎'],
      textColor: 'text-amber-300/60',
    },
    'blush-pink': {
      bg: '#FFF0F5',
      gradient: 'radial-gradient(ellipse at 50% 0%, rgba(251, 113, 133, 0.3) 0%, rgba(255, 240, 245, 0.95) 75%)',
      blob1: 'bg-rose-400/35',
      blob2: 'bg-pink-300/45',
      blob3: 'bg-fuchsia-300/30',
      symbols: ['🌸', '💖', '🎀', '✨', '🍼', '🌷'],
      textColor: 'text-rose-400/60',
    },
    'baby-blue': {
      bg: '#F0F9FF',
      gradient: 'radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.35) 0%, rgba(240, 249, 255, 0.95) 75%)',
      blob1: 'bg-sky-400/40',
      blob2: 'bg-blue-400/35',
      blob3: 'bg-indigo-300/30',
      symbols: ['⭐', '✈️', '🌊', '✨', '🚀', '☁️'],
      textColor: 'text-sky-500/60',
    },
    'warm-cream': {
      bg: '#FAF5EE',
      gradient: 'radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.25) 0%, rgba(250, 245, 238, 0.98) 75%)',
      blob1: 'bg-amber-300/35',
      blob2: 'bg-orange-200/40',
      blob3: 'bg-lime-200/25',
      symbols: ['🌿', '🧸', '✨', '💛', '🍃', '🍯'],
      textColor: 'text-amber-600/50',
    },
  }[theme] || {
    bg: '#0A0503',
    gradient: 'radial-gradient(ellipse at 50% 0%, rgba(217, 119, 6, 0.35) 0%, rgba(10, 5, 3, 0.98) 75%)',
    blob1: 'bg-amber-500/40',
    blob2: 'bg-yellow-400/30',
    blob3: 'bg-rose-600/35',
    symbols: ['✨', '🌟', '👑'],
    textColor: 'text-amber-300/60',
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-700"
      style={{ backgroundColor: themeStyles.bg, backgroundImage: themeStyles.gradient }}
    >
      {/* Dynamic Animated Atmospheric Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full ${themeStyles.blob1} blur-[100px]`}
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -35, 0],
          y: [0, 25, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className={`absolute top-1/4 -right-24 w-[550px] h-[550px] rounded-full ${themeStyles.blob2} blur-[110px]`}
      />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 25, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className={`absolute -bottom-20 left-1/3 w-[600px] h-[600px] rounded-full ${themeStyles.blob3} blur-[120px]`}
      />

      {/* Floating Sparkles & Icons */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + (i % 4),
              repeat: Infinity,
              delay: (i * 0.4),
              ease: 'easeInOut',
            }}
            className={`absolute ${themeStyles.textColor} select-none pointer-events-none`}
            style={{
              top: `${(i * 19) % 95}%`,
              left: `${(i * 29) % 95}%`,
              fontSize: `${(i % 3) * 6 + 12}px`,
            }}
          >
            {themeStyles.symbols[i % themeStyles.symbols.length]}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
