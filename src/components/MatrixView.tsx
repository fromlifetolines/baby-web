import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { ZHUAZHOU_ITEMS, ZhuazhouItem } from '../config/itemsData';
import { Check, Sparkles, AlertCircle, ArrowLeft, Send } from 'lucide-react';

interface MatrixViewProps {
  userName: string;
  onSubmitSelections: (selections: string[]) => void;
  onBackToPortal: () => void;
  onOpenStickerModal: () => void;
}

export const MatrixView: React.FC<MatrixViewProps> = ({
  userName,
  onSubmitSelections,
  onBackToPortal,
  onOpenStickerModal,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleSelection = (id: string) => {
    setErrorMessage(null);
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 3) {
        setErrorMessage('已達選取上限！每位貴賓僅能精選 3 項抓周志業');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSubmit = () => {
    if (selectedIds.length !== 3) {
      setErrorMessage(`請再選取 ${3 - selectedIds.length} 個品項（必須精確選滿 3 項）`);
      return;
    }
    onSubmitSelections(selectedIds);
  };

  const getSelectionOrder = (id: string) => {
    const index = selectedIds.indexOf(id);
    return index !== -1 ? index + 1 : null;
  };

  const selectedItemsData = selectedIds
    .map((id) => ZHUAZHOU_ITEMS.find((item) => item.id === id))
    .filter(Boolean) as ZhuazhouItem[];

  return (
    <div className="min-h-screen pb-36 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToPortal}
            className="p-2.5 rounded-2xl liquid-glass text-cream-muted hover:text-white hover:border-white/30 transition-colors"
            title="返回登入畫面"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-neon animate-pulse" />
              <p className="text-xs font-mono tracking-widest text-neon uppercase">
                PREDICTION PROTOCOL V1.0
              </p>
            </div>
            <h2 className="font-anton text-2xl sm:text-3xl tracking-wide uppercase text-cream">
              THE 3D SELECTION MATRIX
            </h2>
          </div>
        </div>

        {/* User Badge & Sticker Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenStickerModal}
            className="px-3.5 py-2 rounded-2xl liquid-glass text-xs font-mono text-cream hover:border-neon transition-colors flex items-center gap-2"
          >
            <Sparkles size={14} className="text-neon" />
            <span>貼圖獎勵預覽</span>
          </button>
          <div className="px-4 py-2 rounded-2xl liquid-glass border-neon/30 text-xs font-medium text-cream flex items-center gap-2">
            <span className="text-cream-muted">預測者:</span>
            <span className="font-bold text-neon">{userName}</span>
          </div>
        </div>
      </div>

      {/* Instruction Note */}
      <div className="mb-6 p-4 rounded-2xl liquid-glass border-white/10 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-cream-muted">
          <span className="text-neon font-bold">💡 規則提示:</span>
          <span>
            滑鼠游標或手機陀螺儀可感受 3D 液態玻璃視差，請在 16 個品項中精選 <strong className="text-cream font-bold">3 項</strong> 星維會抓取的物品。
          </span>
        </div>
        <div className="text-xs font-mono text-neon font-bold">
          {selectedIds.length === 3 ? '✅ 已選滿 3 項，隨時可送出' : `⚠️ 還需選擇 ${3 - selectedIds.length} 項`}
        </div>
      </div>

      {/* Error Alert Toast */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-sm flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-300 underline hover:text-white"
            >
              關閉
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 16 Items 3D Cards Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {ZHUAZHOU_ITEMS.map((item, index) => {
          const isSelected = selectedIds.includes(item.id);
          const order = getSelectionOrder(item.id);

          return (
            <Tilt
              key={item.id}
              tiltMaxAngleX={12}
              tiltMaxAngleY={12}
              perspective={900}
              scale={isSelected ? 1.03 : 1.01}
              transitionSpeed={400}
              gyroscope={true}
              className="h-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                onClick={() => toggleSelection(item.id)}
                className={`liquid-glass cursor-pointer h-full p-5 sm:p-6 rounded-[24px] transition-all duration-300 flex flex-col justify-between relative group ${
                  isSelected ? 'selected' : 'hover:border-white/20'
                }`}
                style={{
                  boxShadow: isSelected
                    ? 'inset 0 0 18px rgba(111, 255, 0, 0.35), 0 0 25px rgba(111, 255, 0, 0.25)'
                    : 'inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Holographic Top Glow Indicator */}
                <div
                  className={`absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl transition-opacity duration-300 ${
                    isSelected ? 'bg-neon/30 opacity-100' : 'bg-white/5 opacity-0 group-hover:opacity-100'
                  }`}
                />

                {/* Card Top: Category & Order Badge */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-lg bg-white/5 text-cream-muted border border-white/10">
                    {item.category}
                  </span>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-7 h-7 rounded-full bg-neon text-space-900 font-anton text-sm font-bold flex items-center justify-center shadow-[0_0_12px_#6FFF00]"
                    >
                      #{order}
                    </motion.div>
                  )}
                </div>

                {/* Card Center: Icon & Visual */}
                <div className="py-4 flex flex-col items-center justify-center relative z-10">
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 p-3 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? 'opacity-100 scale-110 drop-shadow-[0_0_15px_rgba(111,255,0,0.5)]'
                        : 'opacity-60 grayscale-[30%] group-hover:opacity-90 group-hover:scale-105'
                    }`}
                  >
                    <img
                      src={item.iconPath}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Card Bottom: Titles & Career Meaning */}
                <div className="text-center mt-2 relative z-10">
                  <h3
                    className={`font-anton text-lg sm:text-xl tracking-wide uppercase transition-colors ${
                      isSelected ? 'text-neon neon-text-glow' : 'text-cream'
                    }`}
                  >
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <span className="text-xs sm:text-sm font-bold text-cream-muted">
                      {item.meaning}
                    </span>
                  </div>
                  <p className="text-[11px] text-cream-muted/70 mt-1 line-clamp-1 font-body">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            </Tilt>
          );
        })}
      </div>

      {/* Floating Bottom Action Bar */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-40"
      >
        <div className="liquid-glass p-4 sm:p-5 rounded-[24px] border border-white/20 shadow-2xl backdrop-blur-xl bg-space-900/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Selected items badges */}
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-mono text-cream-muted uppercase">SELECTED:</span>
              <span className="font-anton text-xl text-neon">{selectedIds.length}/3</span>
            </div>

            <div className="flex items-center gap-2">
              {[0, 1, 2].map((idx) => {
                const item = selectedItemsData[idx];
                return (
                  <div
                    key={idx}
                    className={`h-10 px-3 rounded-xl border flex items-center gap-2 transition-all ${
                      item
                        ? 'bg-neon/10 border-neon/50 text-cream'
                        : 'bg-white/5 border-dashed border-white/20 text-cream-muted/40'
                    }`}
                  >
                    {item ? (
                      <>
                        <img src={item.iconPath} alt="" className="w-5 h-5 object-contain" />
                        <span className="text-xs font-bold whitespace-nowrap">{item.name}</span>
                      </>
                    ) : (
                      <span className="text-[11px] font-mono whitespace-nowrap">第 {idx + 1} 項</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="w-full sm:w-auto shrink-0">
            <button
              onClick={handleSubmit}
              disabled={selectedIds.length !== 3}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-anton tracking-wider text-base uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                selectedIds.length === 3
                  ? 'bg-neon text-space-900 font-bold shadow-[0_0_25px_rgba(111,255,0,0.6)] hover:bg-[#60e000] active:scale-95 cursor-pointer'
                  : 'bg-white/5 text-cream-muted/40 border border-white/10 cursor-not-allowed'
              }`}
            >
              <Send size={18} />
              <span>SUBMIT PREDICTION (送出預測)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
