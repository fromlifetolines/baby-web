import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundCosmos: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Noise Texture */}
      <div className="noise-overlay" />

      {/* Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-20" />

      {/* Atmospheric Neon Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#6FFF00]/10 blur-[120px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[130px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.1, 0.22, 0.1],
          x: [0, 25, 0],
          y: [0, -25, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute bottom-10 -right-20 w-[550px] h-[550px] rounded-full bg-[#6FFF00]/8 blur-[140px]"
      />

      {/* Subtle Star Particles */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cream"
            style={{
              top: `${(i * 37) % 100}%`,
              left: `${(i * 59) % 100}%`,
              width: `${(i % 3) + 1.5}px`,
              height: `${(i % 3) + 1.5}px`,
              opacity: 0.2 + ((i % 5) * 0.15),
              boxShadow: (i % 2 === 0) ? '0 0 8px #6FFF00' : '0 0 6px #EFF4FF',
            }}
          />
        ))}
      </div>
    </div>
  );
};
