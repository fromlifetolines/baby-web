import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundPastel: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#FFFAF0]">
      {/* Soft Pastel Pink Gradient Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-blush-200/50 blur-[90px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -35, 0],
          y: [0, 25, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/4 -right-24 w-[550px] h-[550px] rounded-full bg-pastel-pink/30 blur-[100px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 25, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute -bottom-20 left-1/3 w-[600px] h-[600px] rounded-full bg-cream-200/60 blur-[110px]"
      />

      {/* Floating Sparkles & Hearts */}
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
            className="absolute text-pastel-coral/50 select-none pointer-events-none"
            style={{
              top: `${(i * 19) % 95}%`,
              left: `${(i * 29) % 95}%`,
              fontSize: `${(i % 3) * 6 + 12}px`,
            }}
          >
            {i % 3 === 0 ? '✨' : i % 3 === 1 ? '💖' : '🌸'}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
