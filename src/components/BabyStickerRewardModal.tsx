import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BABY_STICKERS } from '../config/itemsData';
import { X, Sparkles, Download, Share2, Heart } from 'lucide-react';

interface BabyStickerRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BabyStickerRewardModal: React.FC<BabyStickerRewardModalProps> = ({
  isOpen,
  onClose,
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
            className="fixed inset-0 bg-[#010828]/85 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="liquid-glass relative w-full max-w-xl p-6 sm:p-8 rounded-[28px] border border-neon/40 shadow-2xl z-10 text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-cream-muted hover:text-white hover:bg-white/10"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neon/10 border border-neon/30 text-neon text-xs font-mono mb-3">
              <Sparkles size={14} />
              <span>SPECIAL REWARD UNLOCKED</span>
            </div>

            <h2 className="font-anton text-3xl text-cream tracking-wide uppercase mb-1">
              EXCLUSIVE LINE STICKER PACK
            </h2>
            <p className="font-condiment text-2xl text-neon mb-6">
              星維一歲生日限定 · 寶寶表情包貼圖
            </p>

            {/* Sticker Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {BABY_STICKERS.map((sticker) => (
                <div
                  key={sticker.id}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-neon/40 transition-all flex flex-col items-center justify-between"
                >
                  <div className="w-24 h-24 p-2 bg-white/5 rounded-2xl flex items-center justify-center mb-3">
                    <img src={sticker.image} alt={sticker.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="font-anton text-base text-cream tracking-wide">
                    {sticker.tag}
                  </span>
                  <p className="text-[11px] text-cream-muted mt-1">{sticker.description}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-cream-muted font-mono leading-relaxed mb-6">
              🎁 凡前 3 名預測命中或參與抓周大典的貴賓，即可獲得星維專屬高解析度貼圖包！
            </p>

            <div className="flex gap-3">
              <a
                href={`${import.meta.env.BASE_URL}assets/baby/qiumi.svg`}
                download="xingwei-qiumi.svg"
                className="flex-1 py-3.5 px-4 rounded-2xl bg-neon text-space-900 font-anton text-sm tracking-wider font-bold shadow-lg hover:bg-[#60e000] flex items-center justify-center gap-2"
              >
                <Download size={16} />
                <span>下載限定貼圖包</span>
              </a>
              <button
                onClick={onClose}
                className="px-6 py-3.5 rounded-2xl bg-white/5 border border-white/15 text-sm font-bold text-cream hover:bg-white/10"
              >
                返回
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
