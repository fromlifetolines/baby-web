import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface LiquidModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  children?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const LiquidModal: React.FC<LiquidModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  children,
  actionText = '確定 (CONFIRM)',
  onAction,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#010828]/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="liquid-glass relative w-full max-w-md p-6 md:p-8 rounded-[24px] border border-white/20 shadow-2xl z-10"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6FFF00]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-cream-muted hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header Icon */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-neon">
                {type === 'error' && <AlertCircle className="text-rose-400" size={24} />}
                {type === 'warning' && <AlertCircle className="text-amber-400" size={24} />}
                {type === 'success' && <CheckCircle2 className="text-neon" size={24} />}
                {type === 'info' && <Info className="text-neon" size={24} />}
              </div>
              <h3 className="font-anton text-xl tracking-wider uppercase text-cream">
                {title}
              </h3>
            </div>

            {/* Message or Custom Content */}
            {message && (
              <p className="text-cream-muted text-sm leading-relaxed mb-6 font-body font-medium">
                {message}
              </p>
            )}

            {children}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  if (onAction) onAction();
                  onClose();
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#6FFF00] text-[#010828] font-anton tracking-wider text-base hover:bg-[#60e000] active:scale-[0.98] transition-all duration-200 neon-btn-glow font-bold"
              >
                {actionText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
