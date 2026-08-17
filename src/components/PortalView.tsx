import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, User } from 'lucide-react';

interface PortalViewProps {
  onEnter: (userName: string) => void;
  onOpenStickerModal: () => void;
}

const QUICK_TITLES = ['舅舅', '阿嬤', '阿公', '姑姑', '乾爹', '姨婆', '叔叔', '乾媽', '好友'];

export const PortalView: React.FC<PortalViewProps> = ({ onEnter, onOpenStickerModal }) => {
  const [name, setName] = useState('');
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = selectedPrefix 
      ? (name.startsWith(selectedPrefix) ? name : `${selectedPrefix} ${name}`.trim())
      : name.trim();

    if (!finalName) {
      setErrorMsg('請輸入稱謂與姓名，讓星維知道是誰在為他祝福！');
      return;
    }
    setErrorMsg('');
    onEnter(finalName);
  };

  const handleChipClick = (prefix: string) => {
    setSelectedPrefix(prefix);
    if (!name.includes(prefix)) {
      setName((prev) => `${prefix} ${prev.replace(/^(舅舅|阿嬤|阿公|姑姑|乾爹|姨婆|叔叔|乾媽|好友)\s*/, '')}`.trim());
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="liquid-glass w-full max-w-xl p-8 sm:p-10 md:p-12 rounded-[28px] border border-white/10 text-center relative overflow-hidden"
      >
        {/* Hologram Corner Accents */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#6FFF00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Baby Xing-Wei Avatar Preview */}
        <div className="relative mx-auto mb-6 w-24 h-24 sm:w-28 sm:h-28">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            className="w-full h-full rounded-full p-1 bg-gradient-to-tr from-[#6FFF00] via-cyan-400 to-[#6FFF00]/40 shadow-[0_0_25px_rgba(111,255,0,0.4)]"
          >
            <div className="w-full h-full rounded-full bg-[#010828] flex items-center justify-center overflow-hidden">
              <img
                src={`${import.meta.env.BASE_URL}assets/baby/qiumi.svg`}
                alt="Baby Xing-Wei"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain hover:scale-110 transition-transform duration-300 cursor-pointer"
                onClick={onOpenStickerModal}
                title="點擊查看專屬 LINE 貼圖獎勵"
              />
            </div>
          </motion.div>
          <button
            onClick={onOpenStickerModal}
            className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-[#6FFF00] text-[#010828] font-anton text-xs tracking-wider font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-1"
          >
            <Sparkles size={12} />
            LINE STICKER
          </button>
        </div>

        {/* Title & Accents */}
        <div className="space-y-1 mb-6">
          <h1 className="font-anton text-3xl sm:text-4xl md:text-5xl tracking-wide uppercase text-cream leading-tight">
            XING-WEI'S 1ST BIRTHDAY
          </h1>
          <p className="font-condiment text-2xl sm:text-3xl text-neon -rotate-2 neon-text-glow pt-1">
            The Prediction Protocol
          </p>
          <p className="text-xs sm:text-sm text-cream-muted font-medium pt-2">
            抓周大典即時預測矩陣 · 請精準預測星維即將抓取的前 3 項志業
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left mt-6">
          <div>
            <label className="block text-xs font-anton tracking-wider text-cream-muted uppercase mb-2 flex items-center gap-1.5">
              <User size={14} className="text-neon" />
              請輸入您的稱謂與姓名 (ENTER TITLE & NAME)
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="例如：舅舅 Howard、阿嬤、乾爹 Ken..."
                className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/15 text-cream placeholder-white/30 focus:outline-none focus:border-neon focus:ring-2 focus:ring-neon/30 transition-all font-body text-base"
                autoFocus
              />
            </div>
            {errorMsg && (
              <p className="text-rose-400 text-xs mt-2 font-medium flex items-center gap-1">
                ⚠️ {errorMsg}
              </p>
            )}
          </div>

          {/* Quick Selection Tags */}
          <div>
            <span className="text-[11px] text-cream-muted block mb-2 font-mono">
              快速稱謂選擇 (QUICK PRESETS):
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_TITLES.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => handleChipClick(title)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedPrefix === title
                      ? 'bg-neon text-space-900 font-bold shadow-[0_0_10px_rgba(111,255,0,0.4)]'
                      : 'bg-white/5 border border-white/10 text-cream-muted hover:border-white/30 hover:text-white'
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full group relative py-4 px-8 rounded-2xl bg-transparent border-2 border-neon text-cream font-anton tracking-widest text-lg uppercase transition-all duration-300 hover:bg-neon hover:text-space-900 neon-btn-glow flex items-center justify-center gap-3 overflow-hidden font-bold"
            >
              <span className="relative z-10">ENTER SYSTEM (進入預測協定)</span>
              <ArrowRight
                size={20}
                className="relative z-10 transform group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </form>

        {/* Security / System Footer Note */}
        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-cream-muted font-mono">
          <ShieldCheck size={14} className="text-neon" />
          <span>FIREBASE SECURE PROTOCOL · LIVE SYNCHRONIZED</span>
        </div>
      </motion.div>
    </div>
  );
};
