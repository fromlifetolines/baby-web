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
  actionText = '好 唷 (CONFIRM)',
  onAction,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#3D281D]/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="liquid-glass relative w-full max-w-md p-6 sm:p-8 rounded-[32px] border-2 border-blush-300 shadow-2xl z-10 bg-white/95"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-brown-muted hover:text-brown-text hover:bg-blush-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-2xl bg-blush-100 border border-blush-200 text-pastel-coral">
                {type === 'error' && <AlertCircle className="text-rose-500" size={24} />}
                {type === 'warning' && <AlertCircle className="text-amber-500" size={24} />}
                {type === 'success' && <CheckCircle2 className="text-emerald-500" size={24} />}
                {type === 'info' && <Info className="text-pastel-coral" size={24} />}
              </div>
              <h3 className="font-heading font-black text-xl text-brown-text">
                {title}
              </h3>
            </div>

            {message && (
              <p className="text-brown-muted text-sm leading-relaxed mb-6 font-cute font-medium">
                {message}
              </p>
            )}

            {children}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  if (onAction) onAction();
                  onClose();
                }}
                className="w-full py-3.5 px-6 rounded-2xl pastel-btn-primary font-heading font-black text-base shadow-md cursor-pointer"
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
