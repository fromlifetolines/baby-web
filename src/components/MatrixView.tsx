import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { ZHUAZHOU_ITEMS, ZhuazhouItem } from '../config/itemsData';
import { Sparkles, AlertCircle, ArrowLeft, Send, Heart, Check } from 'lucide-react';

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
        setErrorMessage('已達選取上限！每位貴賓僅能精選 3 項抓周物品 🌸');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSubmit = () => {
    if (selectedIds.length !== 3) {
      setErrorMessage(`請再選取 ${3 - selectedIds.length} 個品項（必須選滿 3 項）`);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToPortal}
            className="p-3 rounded-2xl liquid-glass text-brown-muted hover:text-brown-text hover:border-pastel-coral transition-colors"
            title="返回上一頁"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-pastel-coral animate-ping" />
              <p className="text-xs font-cute font-bold tracking-wider text-pastel-rose uppercase">
                XING-WEI'S 1ST BIRTHDAY
              </p>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-brown-text">
              請挑選 3 項抓周物品 🎀
            </h2>
          </div>
        </div>

        {/* User Badge & Sticker Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenStickerModal}
            className="px-4 py-2.5 rounded-2xl liquid-glass text-xs font-cute font-bold text-brown-text hover:border-pastel-coral transition-colors flex items-center gap-2 shadow-sm"
          >
            <Sparkles size={14} className="text-pastel-coral" />
            <span>貼圖大賞</span>
          </button>
          <div className="px-4 py-2 rounded-2xl liquid-glass border-blush-300 text-xs font-medium text-brown-text flex items-center gap-2 shadow-sm">
            <span className="text-brown-muted font-bold">預測貴賓:</span>
            <span className="font-bold text-pastel-coral">{userName}</span>
          </div>
        </div>
      </div>

      {/* Instruction Note */}
      <div className="mb-6 p-4 rounded-3xl liquid-glass border-blush-200 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-brown-muted font-cute font-medium">
          <Heart size={16} className="text-pastel-coral fill-pastel-coral shrink-0" />
          <span>
            請在 16 個品項中選取 <strong className="text-pastel-rose font-black">3 項</strong> 您認為星唯最有可能抓取的志業物品。
          </span>
        </div>
        <div className="text-xs font-cute font-bold text-pastel-coral">
          {selectedIds.length === 3 ? '🎉 已選滿 3 項，隨時可送出！' : `還需選擇 ${3 - selectedIds.length} 項`}
        </div>
      </div>

      {/* Error Alert Toast */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-2xl bg-blush-100 border border-blush-300 text-rose-700 text-sm flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-2 font-bold font-cute">
              <AlertCircle size={18} className="text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-500 underline font-bold"
            >
              關閉
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 16 Items Pastel Cards Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {ZHUAZHOU_ITEMS.map((item, index) => {
          const isSelected = selectedIds.includes(item.id);
          const order = getSelectionOrder(item.id);

          return (
            <Tilt
              key={item.id}
              tiltMaxAngleX={10}
              tiltMaxAngleY={10}
              perspective={900}
              scale={isSelected ? 1.04 : 1.01}
              transitionSpeed={350}
              gyroscope={true}
              className="h-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.02 }}
                onClick={() => toggleSelection(item.id)}
                className={`liquid-glass cursor-pointer h-full p-5 sm:p-6 rounded-[28px] transition-all duration-300 flex flex-col justify-between relative group ${
                  isSelected ? 'selected' : 'hover:border-blush-300 hover:shadow-soft-pink'
                }`}
              >
                {/* Top Badge: Category & Order */}
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-[11px] font-cute font-bold px-2.5 py-0.5 rounded-full bg-cream-100 text-brown-muted border border-blush-200">
                    {item.category}
                  </span>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-7 h-7 rounded-full bg-pastel-coral text-white font-heading font-black text-sm flex items-center justify-center shadow-md"
                    >
                      #{order}
                    </motion.div>
                  )}
                </div>

                {/* Card Center: Icon Illustration */}
                <div className="py-3 flex flex-col items-center justify-center relative z-10">
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 p-2 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? 'scale-110 drop-shadow-md'
                        : 'group-hover:scale-105 opacity-85'
                    }`}
                  >
                    <img
                      src={item.iconPath}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Card Bottom: Titles & Meaning */}
                <div className="text-center mt-2 relative z-10">
                  <h3
                    className={`font-heading text-lg sm:text-xl font-bold transition-colors ${
                      isSelected ? 'text-pastel-coral' : 'text-brown-text'
                    }`}
                  >
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className="text-xs sm:text-sm font-bold text-pastel-rose">
                      {item.meaning}
                    </span>
                  </div>
                  <p className="text-[11px] text-brown-muted mt-1 line-clamp-1 font-cute">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            </Tilt>
          );
        })}
      </div>

      {/* Floating Bottom Progress Tray */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-40"
      >
        <div className="liquid-glass p-4 sm:p-5 rounded-[28px] border-2 border-blush-300 shadow-2xl bg-white/95 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Selected items tray */}
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <div className="shrink-0 flex items-center gap-1.5 font-heading">
              <span className="text-xs font-bold text-brown-muted">已選取:</span>
              <span className="text-xl font-black text-pastel-coral">{selectedIds.length}/3</span>
            </div>

            <div className="flex items-center gap-2">
              {[0, 1, 2].map((idx) => {
                const item = selectedItemsData[idx];
                return (
                  <div
                    key={idx}
                    className={`h-11 px-3 rounded-2xl border-2 flex items-center gap-2 transition-all ${
                      item
                        ? 'bg-blush-50 border-pastel-coral text-brown-text shadow-sm'
                        : 'bg-cream-50 border-dashed border-blush-200 text-brown-muted/50'
                    }`}
                  >
                    {item ? (
                      <>
                        <img src={item.iconPath} alt="" className="w-5 h-5 object-contain" />
                        <span className="text-xs font-black whitespace-nowrap">{item.name}</span>
                      </>
                    ) : (
                      <span className="text-xs font-cute whitespace-nowrap">第 {idx + 1} 項</span>
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
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-heading font-black text-base tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                selectedIds.length === 3
                  ? 'pastel-btn-primary active:scale-95 cursor-pointer'
                  : 'bg-blush-100 text-brown-muted/40 border border-blush-200 cursor-not-allowed'
              }`}
            >
              <Send size={18} />
              <span>送出預測 (SUBMIT)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
