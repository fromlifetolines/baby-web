import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowRight, User } from 'lucide-react';
import { PartyConfig } from '../types';

interface PortalViewProps {
  onEnter: (userName: string) => void;
  onOpenStickerModal: () => void;
  partyConfig?: PartyConfig;
}

const QUICK_TITLES = [
  '舅舅', '阿嬤', '阿公', '爺爺', '奶奶', 
  '姑姑', '乾爹', '姨婆', '叔叔', '乾媽', 
  '好友', '堂哥', '堂姐', '表哥', '表姐'
];

export const PortalView: React.FC<PortalViewProps> = ({ 
  onEnter, 
  onOpenStickerModal,
  partyConfig 
}) => {
  const [name, setName] = useState('');
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const babyName = partyConfig?.babyName || '星唯';
  const subtitle = partyConfig?.subtitle || `請親朋好友精準預測${babyName}即將抓取的前 3 項志業 🎀`;
  const avatarImg = partyConfig?.babyAvatar || `${import.meta.env.BASE_URL}assets/baby/08.png`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = selectedPrefix 
      ? (name.startsWith(selectedPrefix) ? name : `${selectedPrefix} ${name}`.trim())
      : name.trim();

    if (!finalName) {
      setErrorMsg(`請輸入稱謂與姓名，讓${babyName}知道是誰在為她祝福！`);
      return;
    }
    setErrorMsg('');
    onEnter(finalName);
  };

  const handleChipClick = (prefix: string) => {
    setSelectedPrefix(prefix);
    const prefixRegex = /^(舅舅|阿嬤|阿公|爺爺|奶奶|姑姑|乾爹|姨婆|叔叔|乾媽|好友|堂哥|堂姐|表哥|表姐)\s*/;
    setName((prev) => {
      const cleanName = prev.replace(prefixRegex, '').trim();
      return cleanName ? `${prefix} ${cleanName}` : prefix;
    });
    if (errorMsg) setErrorMsg('');
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="liquid-glass w-full max-w-xl p-8 sm:p-10 md:p-12 text-center relative overflow-hidden"
      >
        {/* Soft Decorative Ambient Circles */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-blush-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-cream-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Baby Cute Avatar */}
        <div className="relative mx-auto mb-6 w-32 h-32 sm:w-36 sm:h-36">
          <motion.div
            animate={{
              rotate: [0, 4, -4, 0],
              boxShadow: [
                '0px 0px 12px rgba(255, 182, 193, 0.4)',
                '0px 0px 35px rgba(255, 182, 193, 0.95), 0px 0px 20px rgba(255, 111, 97, 0.4)',
                '0px 0px 12px rgba(255, 182, 193, 0.4)',
              ],
            }}
            transition={{
              rotate: { repeat: Infinity, duration: 5, ease: 'easeInOut' },
              boxShadow: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' },
            }}
            className="w-full h-full rounded-full p-1.5 bg-gradient-to-tr from-pastel-coral via-pastel-pink to-cream-200"
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-inner">
              <img
                src={avatarImg}
                alt={babyName}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                onClick={onOpenStickerModal}
                title="點擊查看專屬好禮"
              />
            </div>
          </motion.div>
          <button
            onClick={onOpenStickerModal}
            className="absolute -bottom-1.5 -right-1.5 px-3 py-1 rounded-full bg-pastel-coral text-white font-cute text-xs font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-1"
          >
            <Sparkles size={12} />
            專屬禮賞
          </button>
        </div>

        {/* Header Title */}
        <div className="space-y-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/40 border border-current text-xs font-bold tracking-wider opacity-90">
            🌸 {babyName}'s 1st Birthday Party 🌸
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight drop-shadow-sm">
            {babyName} 1 歲抓周預測大典
          </h1>
          <p className="font-cute text-xs sm:text-sm md:text-base opacity-80 font-medium pt-1 tracking-tight break-keep max-w-md mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left mt-6">
          <div>
            <label className="block text-xs font-bold opacity-80 mb-2 flex items-center gap-1.5 font-cute">
              <User size={14} />
              請輸入您的稱謂與姓名 (YOUR NAME & TITLE)
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="例如：舅舅 Howard、阿嬤、奶奶、堂哥..."
                className="w-full px-5 py-4 rounded-2xl bg-white/90 dark:bg-black/40 border-2 border-current/30 text-current placeholder-current/40 focus:outline-none focus:border-current focus:ring-4 focus:ring-current/20 transition-all font-body text-base shadow-sm"
                autoFocus
              />
            </div>
            {errorMsg && (
              <p className="text-rose-500 text-xs mt-2 font-bold flex items-center gap-1">
                ⚠️ {errorMsg}
              </p>
            )}
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] opacity-70 block mb-2 font-bold">
              快速稱謂選擇 (QUICK PRESETS):
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_TITLES.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => handleChipClick(title)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-cute font-bold transition-all ${
                    selectedPrefix === title
                      ? 'bg-amber-400 text-slate-950 shadow-md scale-105 font-black'
                      : 'bg-white/70 dark:bg-white/10 text-current/80 hover:bg-white border border-current/20'
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl pastel-btn-primary font-heading text-lg font-black tracking-wider flex items-center justify-center gap-2 group cursor-pointer shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4"
          >
            <span>進入預測大典 (ENTER)</span>
            <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-blush-100 flex items-center justify-center gap-1 text-[11px] text-brown-muted/70 font-cute">
          <Heart size={12} className="text-pastel-coral fill-pastel-coral" />
          <span>每一票都承載著最溫暖的祝福 · 即時連線開獎中</span>
        </div>
      </motion.div>
    </div>
  );
};
