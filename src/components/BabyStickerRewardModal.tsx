import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BABY_STICKERS } from '../config/itemsData';
import { X, Sparkles, Download, Heart } from 'lucide-react';

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
            className="fixed inset-0 bg-[#3D281D]/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            className="liquid-glass relative w-full max-w-xl p-6 sm:p-8 rounded-[36px] border-2 border-blush-300 shadow-2xl z-10 text-center bg-white/95"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2.5 rounded-full text-brown-muted hover:text-brown-text hover:bg-blush-100"
            >
              <X size={20} />
            </button>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blush-100 border border-blush-200 text-pastel-rose text-xs font-cute font-bold mb-3">
              <Sparkles size={14} />
              <span>SPECIAL REWARD UNLOCKED</span>
            </div>

            <h2 className="font-heading text-3xl font-black text-brown-text mb-1">
              星唯專屬 LINE 貼圖包 🎀
            </h2>
            <p className="font-cute text-sm text-brown-muted mb-6 font-bold">
              星唯 1 歲抓周紀念 · 限量寶寶表情包
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {BABY_STICKERS.map((sticker) => (
                <div
                  key={sticker.id}
                  className="p-4 rounded-3xl bg-blush-50/60 border-2 border-blush-200 hover:border-pastel-coral transition-all flex flex-col items-center justify-between shadow-sm"
                >
                  <div className="w-24 h-24 p-2 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                    <img src={sticker.image} alt={sticker.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="font-heading text-base font-black text-brown-text">
                    {sticker.tag}
                  </span>
                  <p className="text-[11px] text-brown-muted mt-1 font-cute">{sticker.description}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-brown-muted font-cute font-bold leading-relaxed mb-6">
              🎁 凡前 3 名預測命中或參與抓周大典的貴賓，即可獲得星唯專屬高解析度貼圖包！
            </p>

            <div className="flex gap-3">
              <a
                href={`${import.meta.env.BASE_URL}assets/baby/qiumi.svg`}
                download="xingwei-qiumi.svg"
                className="flex-1 py-3.5 px-4 rounded-2xl pastel-btn-primary font-heading text-sm font-black tracking-wider shadow-md flex items-center justify-center gap-2"
              >
                <Download size={16} />
                <span>下載限定貼圖包</span>
              </a>
              <button
                onClick={onClose}
                className="px-6 py-3.5 rounded-2xl bg-cream-100 border border-blush-200 text-sm font-bold text-brown-text hover:bg-blush-100"
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
