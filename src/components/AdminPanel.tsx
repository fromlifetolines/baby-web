import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZHUAZHOU_ITEMS } from '../config/itemsData';
import { GameState } from '../types';
import { 
  ShieldAlert, 
  X, 
  Sparkles, 
  RotateCcw, 
  Flame, 
  Check, 
  Lock, 
  Eye 
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onTriggerReveal: (actualItems: string[]) => void;
  onResetGame: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  gameState,
  onTriggerReveal,
  onResetGame,
}) => {
  const [selectedActualIds, setSelectedActualIds] = useState<string[]>(
    gameState.actualItems?.length === 3 ? gameState.actualItems : ['item_09', 'item_16', 'item_01']
  );
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleToggleItem = (id: string) => {
    if (selectedActualIds.includes(id)) {
      setSelectedActualIds(selectedActualIds.filter((it) => it !== id));
    } else {
      if (selectedActualIds.length >= 3) {
        // replace the first or show alert
        setSelectedActualIds([...selectedActualIds.slice(1), id]);
        return;
      }
      setSelectedActualIds([...selectedActualIds, id]);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple party admin passcode (or leave blank to proceed)
    if (password === '8888' || password === '1st' || password === 'xingwei' || password === '') {
      setIsUnlocked(true);
      setErrorMsg('');
    } else {
      setErrorMsg('密碼錯誤 (預設密碼可直接按解鎖或輸入 8888)');
    }
  };

  const handleTrigger = () => {
    if (selectedActualIds.length !== 3) {
      setErrorMsg('請勾選星維實際抓取的精確 3 個品項！');
      return;
    }
    onTriggerReveal(selectedActualIds);
    onClose();
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
            className="fixed inset-0 bg-[#010828]/85 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="liquid-glass relative w-full max-w-2xl p-6 sm:p-8 rounded-[28px] border border-neon/40 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-cream-muted hover:text-white hover:bg-white/10"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-neon/10 border border-neon/30 text-neon">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h2 className="font-anton text-2xl tracking-wider text-cream uppercase">
                  HOST & ADMIN CONTROL PROTOCOL
                </h2>
                <p className="text-xs text-cream-muted font-mono">
                  抓周大典主持人中控台 · 控制全場同步開獎
                </p>
              </div>
            </div>

            {!isUnlocked ? (
              <form onSubmit={handleUnlock} className="space-y-4 py-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <Lock className="mx-auto text-neon mb-2" size={32} />
                  <p className="text-sm font-bold text-cream">請輸入主持人管理密碼</p>
                  <p className="text-xs text-cream-muted mt-1">（預設直接按解鎖即可進入控制台）</p>
                </div>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="輸入管理密碼 (如: 8888)"
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/20 text-cream placeholder-white/30 focus:outline-none focus:border-neon"
                />

                {errorMsg && <p className="text-xs text-rose-400 font-medium">⚠️ {errorMsg}</p>}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-neon text-space-900 font-anton text-base tracking-wider font-bold shadow-lg hover:bg-[#60e000]"
                >
                  UNLOCK CONTROL PANEL (進入中控)
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Step 1: Select 3 Actual Picked Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-cream flex items-center gap-2">
                      <Sparkles className="text-neon" size={16} />
                      請選取星維【實際抓取】的 3 項物品 (ACTUAL 3 PICKS)：
                    </label>
                    <span className="text-xs font-mono text-neon font-bold">
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
                          className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                            isPicked
                              ? 'bg-neon/20 border-neon text-cream shadow-[0_0_10px_rgba(111,255,0,0.3)] font-bold'
                              : 'bg-white/5 border-white/10 text-cream-muted hover:border-white/30'
                          }`}
                        >
                          <img src={item.iconPath} alt="" className="w-6 h-6 object-contain" />
                          <span className="text-xs">{item.name}</span>
                          {isPicked && <Check size={14} className="ml-auto text-neon" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {errorMsg && <p className="text-xs text-rose-400 font-medium">⚠️ {errorMsg}</p>}

                {/* Step 2: Big Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <button
                    onClick={handleTrigger}
                    disabled={selectedActualIds.length !== 3}
                    className={`w-full py-4 px-6 rounded-2xl font-anton tracking-widest text-lg uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                      selectedActualIds.length === 3
                        ? 'bg-neon text-space-900 font-bold shadow-[0_0_30px_rgba(111,255,0,0.6)] hover:bg-[#60e000] cursor-pointer'
                        : 'bg-white/5 text-cream-muted/40 border border-white/10 cursor-not-allowed'
                    }`}
                  >
                    <Flame size={22} />
                    <span>🔥 TRIGGER REVEAL PROTOCOL (引爆全場同步開獎)</span>
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (window.confirm('確定要重設全場遊戲狀態為未揭曉嗎？')) {
                          onResetGame();
                          onClose();
                        }
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-cream-muted hover:text-white hover:border-rose-400/50 flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={14} />
                      <span>重設為預測中狀態 (RESET)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
