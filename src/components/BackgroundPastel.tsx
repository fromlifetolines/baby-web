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
      blob1: 'bg-amber-600/30',
      blob2: 'bg-yellow-500/20',
      blob3: 'bg-rose-900/40',
      symbols: ['✨', '🌟', '👑', '💰'],
      textColor: 'text-amber-400/40',
    },
    'blush-pink': {
      bg: '#FFF5F7',
      blob1: 'bg-pink-300/40',
      blob2: 'bg-rose-200/40',
      blob3: 'bg-amber-100/50',
      symbols: ['🌸', '💖', '🎀', '✨'],
      textColor: 'text-pink-400/50',
    },
    'baby-blue': {
      bg: '#F0F9FF',
      blob1: 'bg-sky-300/40',
      blob2: 'bg-blue-200/40',
      blob3: 'bg-cyan-100/50',
      symbols: ['⭐', '✈️', '🌊', '✨'],
      textColor: 'text-sky-500/50',
    },
    'warm-cream': {
      bg: '#FAF7F2',
      blob1: 'bg-amber-200/40',
      blob2: 'bg-orange-100/50',
      blob3: 'bg-stone-200/40',
      symbols: ['🌿', '🧸', '✨', '💛'],
      textColor: 'text-amber-600/40',
    },
  }[theme] || {
    bg: '#0A0503',
    blob1: 'bg-amber-600/30',
    blob2: 'bg-yellow-500/20',
    blob3: 'bg-rose-900/40',
    symbols: ['✨', '🌟', '👑'],
    textColor: 'text-amber-400/40',
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-700"
      style={{ backgroundColor: themeStyles.bg }}
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
