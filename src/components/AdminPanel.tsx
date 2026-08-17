import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZHUAZHOU_ITEMS } from '../config/itemsData';
import { GameState } from '../types';
import { 
  X, 
  Sparkles, 
  RotateCcw, 
  PartyPopper, 
  Check, 
  Lock, 
  ShieldCheck,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onTriggerReveal: (actualItems: string[]) => void;
  onResetGame: () => void;
  onResetAllData: () => Promise<void>;
  initialUnlocked?: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  gameState,
  onTriggerReveal,
  onResetGame,
  onResetAllData,
  initialUnlocked = false,
}) => {
  const [selectedActualIds, setSelectedActualIds] = useState<string[]>(
    gameState.actualItems?.length === 3 ? gameState.actualItems : ['item_09', 'item_16', 'item_01']
  );
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(initialUnlocked);
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleToggleItem = (id: string) => {
    if (selectedActualIds.includes(id)) {
      setSelectedActualIds(selectedActualIds.filter((it) => it !== id));
    } else {
      if (selectedActualIds.length >= 3) {
        setSelectedActualIds([...selectedActualIds.slice(1), id]);
        return;
      }
      setSelectedActualIds([...selectedActualIds, id]);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '0819') {
      setIsUnlocked(true);
      setErrorMsg('');
    } else {
      setErrorMsg('密碼錯誤！請輸入正確的主持人管理密碼');
    }
  };

  const handleTrigger = () => {
    if (selectedActualIds.length !== 3) {
      setErrorMsg('請勾選星唯實際抓取的 3 個志業品項！');
      return;
    }
    onTriggerReveal(selectedActualIds);
    onClose();
  };

  const handleExecuteResetAllData = async () => {
    try {
      setIsResetting(true);
      await onResetAllData();
      setIsResetting(false);
      setShowConfirmResetModal(false);
      onClose();
    } catch (e) {
      console.error(e);
      setIsResetting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#3D281D]/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="liquid-glass relative w-full max-w-2xl p-6 sm:p-8 rounded-[36px] border-2 border-pastel-coral shadow-2xl z-10 max-h-[90vh] overflow-y-auto bg-white/95"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2.5 rounded-full text-brown-muted hover:text-brown-text hover:bg-blush-100"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-blush-100 border border-blush-200 text-pastel-coral">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-black text-brown-text">
                  主持人抓周開獎中控台 🎀
                </h2>
                <p className="text-xs text-brown-muted font-cute font-bold">
                  選定星唯實際抓取的 3 樣物品，一鍵引爆全場大螢幕與手機同步開獎！
                </p>
              </div>
            </div>

            {!isUnlocked ? (
              <form onSubmit={handleUnlock} className="space-y-4 py-6">
                <div className="p-5 rounded-3xl bg-blush-50 border border-blush-200 text-center">
                  <Lock className="mx-auto text-pastel-coral mb-2" size={32} />
                  <p className="text-base font-bold text-brown-text">請輸入主持人管理密碼</p>
                </div>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="請輸入主持人密碼"
                  className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-blush-200 text-brown-text placeholder-brown-muted/50 focus:outline-none focus:border-pastel-coral text-center"
                  autoFocus
                />

                {errorMsg && <p className="text-xs text-rose-500 font-bold text-center">⚠️ {errorMsg}</p>}

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl pastel-btn-primary font-heading text-base font-black tracking-wider shadow-md"
                >
                  解鎖開獎控制台 (UNLOCK)
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Step 1: Select 3 Actual Picked Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-black text-brown-text flex items-center gap-2 font-heading">
                      <Sparkles className="text-pastel-coral" size={18} />
                      請勾選星唯【實際抓取】的 3 樣志業物品：
                    </label>
                    <span className="text-xs font-heading font-black text-pastel-coral">
                      {selectedActualIds.length}/3 已選
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {ZHUAZHOU_ITEMS.map((item) => {
                      const isPicked = selectedActualIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItem(item.id)}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                            isPicked
                              ? 'bg-blush-100 border-pastel-coral text-brown-text font-black shadow-sm'
                              : 'bg-white border-blush-200 text-brown-muted hover:border-pastel-coral'
                          }`}
                        >
                          <img src={item.iconPath} alt="" className="w-6 h-6 object-contain" />
                          <span className="text-xs">{item.name}</span>
                          {isPicked && <Check size={14} className="ml-auto text-pastel-coral font-black" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {errorMsg && <p className="text-xs text-rose-500 font-bold">⚠️ {errorMsg}</p>}

                {/* Step 2: Trigger Reveal Button */}
                <div className="space-y-3 pt-4 border-t border-blush-200">
                  <button
                    onClick={handleTrigger}
                    disabled={selectedActualIds.length !== 3}
                    className={`w-full py-4 px-6 rounded-2xl font-heading font-black text-lg tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                      selectedActualIds.length === 3
                        ? 'pastel-btn-primary cursor-pointer'
                        : 'bg-blush-100 text-brown-muted/40 border border-blush-200 cursor-not-allowed'
                    }`}
                  >
                    <PartyPopper size={22} />
                    <span>🎉 公布星唯的抓周結果！ (TRIGGER REVEAL)</span>
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Reset State only */}
                    <button
                      onClick={() => {
                        if (window.confirm('確定要重設全場開獎狀態回預測中嗎？')) {
                          onResetGame();
                          onClose();
                        }
                      }}
                      className="py-3 px-4 rounded-2xl bg-cream-100 border border-blush-200 text-xs font-cute font-bold text-brown-muted hover:text-brown-text hover:border-rose-400 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <RotateCcw size={14} />
                      <span>重設開獎狀態 (RESET STATE)</span>
                    </button>

                    {/* Prominent Danger Button: Reset All Data */}
                    <button
                      onClick={() => setShowConfirmResetModal(true)}
                      className="py-3 px-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-xs font-cute font-black text-rose-600 hover:bg-rose-100 hover:border-rose-500 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Trash2 size={14} />
                      <span>🧹 一鍵清空所有測試資料 (歸零)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Confirm Reset Data Modal */}
          <AnimatePresence>
            {showConfirmResetModal && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                <div 
                  onClick={() => setShowConfirmResetModal(false)}
                  className="fixed inset-0 bg-[#3D281D]/75 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="liquid-glass relative w-full max-w-md p-6 rounded-[32px] border-2 border-rose-400 shadow-2xl z-10 bg-white text-center"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
                    <AlertTriangle size={28} />
                  </div>
                  <h3 className="font-heading text-xl font-black text-brown-text mb-2">
                    確認清空所有投票紀錄？
                  </h3>
                  <p className="text-xs text-rose-600 font-cute font-bold leading-relaxed mb-6">
                    確定要清空所有賓客的投票紀錄嗎？此動作無法復原！
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={handleExecuteResetAllData}
                      disabled={isResetting}
                      className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 text-white font-heading font-black text-sm shadow-md hover:bg-rose-700 active:scale-95 disabled:opacity-50"
                    >
                      {isResetting ? '清空中...' : '確定清空歸零'}
                    </button>
                    <button
                      onClick={() => setShowConfirmResetModal(false)}
                      disabled={isResetting}
                      className="px-5 py-3 rounded-2xl bg-cream-100 border border-blush-200 text-sm font-bold text-brown-text hover:bg-blush-100"
                    >
                      取消
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};
