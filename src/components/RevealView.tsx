import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ZHUAZHOU_ITEMS, ZhuazhouItem, BABY_STICKERS } from '../config/itemsData';
import { GuessRecord, GameState, WinnerScore } from '../types';
import { Trophy, Sparkles, Heart, Crown, RotateCcw, PartyPopper } from 'lucide-react';

interface RevealViewProps {
  gameState: GameState;
  guesses: GuessRecord[];
  currentUser: string;
  onOpenStickerModal: () => void;
  onResetGame?: () => void;
}

export const RevealView: React.FC<RevealViewProps> = ({
  gameState,
  guesses,
  currentUser,
  onOpenStickerModal,
  onResetGame,
}) => {
  // Pachinko FEVER 5-Second State Machine: 'gekiatsu' | 'spin' | 'slowdown' | 'jackpot' | null
  const [pachinkoPhase, setPachinkoPhase] = useState<'gekiatsu' | 'spin' | 'slowdown' | 'jackpot' | null>('gekiatsu');
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  // High-speed slot reels item indexes
  const [reelItem1, setReelItem1] = useState<ZhuazhouItem>(ZHUAZHOU_ITEMS[0]);
  const [reelItem2, setReelItem2] = useState<ZhuazhouItem>(ZHUAZHOU_ITEMS[1]);
  const [reelItem3, setReelItem3] = useState<ZhuazhouItem>(ZHUAZHOU_ITEMS[2]);

  const actualItemData = useMemo(() => {
    const items = (gameState.actualItems || [])
      .map((id) => ZHUAZHOU_ITEMS.find((it) => it.id === id))
      .filter(Boolean) as ZhuazhouItem[];
    if (items.length < 3) {
      const fallbackIds = ['item_09', 'item_16', 'item_01'];
      return fallbackIds.map((id) => ZHUAZHOU_ITEMS.find((it) => it.id === id) || ZHUAZHOU_ITEMS[0]);
    }
    return items;
  }, [gameState.actualItems]);

  // Massive Confetti Explosion (Gold, Red, Pink, White, Rose)
  const triggerPastelConfetti = () => {
    try {
      const end = Date.now() + 4.5 * 1000;
      const pastelColors = ['#FFD700', '#FF6F61', '#FF0055', '#FFFFFF', '#FFB6C1', '#00FFCC', '#B76E79'];

      (function frame() {
        confetti({
          particleCount: 12,
          angle: 60,
          spread: 75,
          origin: { x: 0, y: 0.7 },
          colors: pastelColors,
        });
        confetti({
          particleCount: 12,
          angle: 120,
          spread: 75,
          origin: { x: 1, y: 0.7 },
          colors: pastelColors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch (e) {
      console.warn("Confetti warning:", e);
    }
  };

  // Start 5000ms Pachinko FEVER Timeline
  const startPachinkoAnimation = () => {
    setPachinkoPhase('gekiatsu');
    setIsAnimationDone(false);

    // 0ms ~ 1000ms: Phase 1 (激熱預告)
    const t1 = setTimeout(() => {
      setPachinkoPhase('spin');
    }, 1000);

    // 1000ms ~ 3200ms: Phase 2 (高速柏青哥滾輪)
    const t2 = setTimeout(() => {
      setPachinkoPhase('slowdown');
    }, 3200);

    // 3200ms ~ 4200ms: Phase 3 (減速煞停與全螢幕大震動)
    const t3 = setTimeout(() => {
      setPachinkoPhase('jackpot');
      triggerPastelConfetti();
    }, 4200);

    // 4200ms ~ 5300ms: Phase 4 (JACKPOT 大當選定格爆發 -> 切入完整榜單)
    const t4 = setTimeout(() => {
      setPachinkoPhase(null);
      setIsAnimationDone(true);
    }, 5300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  useEffect(() => {
    const cleanup = startPachinkoAnimation();
    return cleanup;
  }, []);

  // Rapidly cycle items during 'spin' (40ms) and 'slowdown' (100ms)
  useEffect(() => {
    if (pachinkoPhase === 'spin' || pachinkoPhase === 'slowdown') {
      const intervalSpeed = pachinkoPhase === 'spin' ? 40 : 110;
      let idx1 = Math.floor(Math.random() * ZHUAZHOU_ITEMS.length);
      let idx2 = Math.floor(Math.random() * ZHUAZHOU_ITEMS.length);
      let idx3 = Math.floor(Math.random() * ZHUAZHOU_ITEMS.length);

      const interval = setInterval(() => {
        if (pachinkoPhase === 'slowdown') {
          // Snap progressively toward the actual items
          setReelItem1(actualItemData[0] || ZHUAZHOU_ITEMS[0]);
          setReelItem2(actualItemData[1] || ZHUAZHOU_ITEMS[1]);
          setReelItem3(actualItemData[2] || ZHUAZHOU_ITEMS[2]);
        } else {
          idx1 = (idx1 + 1) % ZHUAZHOU_ITEMS.length;
          idx2 = (idx2 + 2) % ZHUAZHOU_ITEMS.length;
          idx3 = (idx3 + 3) % ZHUAZHOU_ITEMS.length;
          setReelItem1(ZHUAZHOU_ITEMS[idx1]);
          setReelItem2(ZHUAZHOU_ITEMS[idx2]);
          setReelItem3(ZHUAZHOU_ITEMS[idx3]);
        }
      }, intervalSpeed);

      return () => clearInterval(interval);
    } else if (pachinkoPhase === 'jackpot') {
      setReelItem1(actualItemData[0] || ZHUAZHOU_ITEMS[0]);
      setReelItem2(actualItemData[1] || ZHUAZHOU_ITEMS[1]);
      setReelItem3(actualItemData[2] || ZHUAZHOU_ITEMS[2]);
    }
  }, [pachinkoPhase, actualItemData]);

  // Fast skip to full results
  const handleSkipAnimation = () => {
    setPachinkoPhase(null);
    setIsAnimationDone(true);
    triggerPastelConfetti();
  };

  // Step 4: Strict Intersection Scoring
  const { champions, runnersUp, thirdPlaces, participants, currentUserResult } = useMemo(() => {
    const actualSet = new Set(gameState.actualItems || []);

    const scoredList: WinnerScore[] = guesses.map((g) => {
      const matched = (g.selections || []).filter((id) => actualSet.has(id));
      let rank: WinnerScore['rank'] = 'participant';
      if (matched.length === 3) rank = 'champion';
      else if (matched.length === 2) rank = 'runner_up';
      else if (matched.length === 1) rank = 'third_place';

      return {
        name: g.name,
        score: matched.length,
        matchedItemIds: matched,
        rank,
      };
    });

    const champ = scoredList.filter((w) => w.rank === 'champion');
    const runner = scoredList.filter((w) => w.rank === 'runner_up');
    const third = scoredList.filter((w) => w.rank === 'third_place');
    const part = scoredList.filter((w) => w.rank === 'participant');

    const userRes = scoredList.find((w) => w.name === currentUser);

    return {
      champions: champ,
      runnersUp: runner,
      thirdPlaces: third,
      participants: part,
      currentUserResult: userRes,
    };
  }, [gameState.actualItems, guesses, currentUser]);

  return (
    <div className="min-h-screen pb-28 pt-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative text-white">
      {/* Global Background Ambient Glow & Rotating Sunburst */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#240338] via-[#140024] to-[#090012] pointer-events-none -z-20" />
      <div className="sunburst-bg animate-sunburst fixed inset-[-50%] w-[200%] h-[200%] opacity-35 pointer-events-none -z-10" />

      {/* Japanese Pachinko FEVER 5-Second Opening Animation Overlay */}
      <AnimatePresence>
        {pachinkoPhase !== null && (
          <div
            className={`fixed inset-0 z-50 overflow-hidden flex items-center justify-center select-none ${
              pachinkoPhase === 'slowdown' ? 'animate-pachinko-shake' : ''
            }`}
          >
            {/* Skip Button */}
            <button
              onClick={handleSkipAnimation}
              className="absolute top-5 right-5 z-50 px-4 py-2 rounded-full bg-white/20 hover:bg-white/35 text-white font-cute font-bold text-xs sm:text-sm backdrop-blur-md border border-white/40 shadow-xl cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span>跳過動畫 (SKIP)</span>
              <span>⏭️</span>
            </button>

            {/* PHASE 1: 激熱預告 (0ms ~ 1000ms) */}
            {pachinkoPhase === 'gekiatsu' && (
              <div className="absolute inset-0 bg-gradient-to-b from-black via-rose-950 to-black flex flex-col items-center justify-center text-center p-6 z-10">
                <div className="absolute inset-0 bg-radial from-amber-500/20 via-rose-600/25 to-transparent animate-strobe pointer-events-none" />

                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-20 flex flex-col items-center"
                >
                  <span className="px-5 py-1.5 rounded-full bg-rose-600/90 text-amber-200 border-2 border-amber-300 font-heading font-black text-sm sm:text-lg tracking-widest shadow-lg mb-6 uppercase animate-pulse">
                    🔥 超 絕 演 出 · 激 熱 預 告 🔥
                  </span>

                  <div className="animate-gekiatsu my-2">
                    <h1 className="font-heading font-black text-7xl sm:text-9xl md:text-[140px] leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFF59D] via-[#FFD700] to-[#FF0055] drop-shadow-[0_12px_35px_rgba(255,0,85,0.95)]">
                      激 熱 ！！
                    </h1>
                  </div>

                  <p className="font-heading font-black text-2xl sm:text-4xl md:text-5xl text-amber-300 tracking-widest drop-shadow-[0_0_20px_#FFD700] mt-6">
                    ⚡️ 天 選 志 業 確 定 ⚡️
                  </p>
                </motion.div>
              </div>
            )}

            {/* PHASE 2 & 3: 高速柏青哥滾輪 & 減速煞停大震動 (1000ms ~ 4200ms) */}
            {(pachinkoPhase === 'spin' || pachinkoPhase === 'slowdown') && (
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A0012] via-[#1E052B] to-[#0A0012] flex flex-col items-center justify-center p-4 sm:p-6 z-10">
                <div className="rainbow-neon-box p-6 sm:p-8 rounded-[36px] bg-black/85 backdrop-blur-2xl border-4 max-w-4xl w-full mx-auto text-center relative shadow-2xl">
                  <div className="mb-4">
                    {pachinkoPhase === 'spin' ? (
                      <span className="inline-block font-heading font-black text-xl sm:text-3xl text-amber-300 animate-pulse tracking-wider drop-shadow-[0_0_15px_#FFD700]">
                        🎰 星唯抓周 PACHINKO FEVER 777 🎰
                      </span>
                    ) : (
                      <span className="inline-block font-heading font-black text-xl sm:text-3xl text-rose-400 animate-bounce tracking-widest drop-shadow-[0_0_20px_#FF0055]">
                        🚨 大當選 倒數確定... REACH!! 🚨
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:gap-6 my-6">
                    {[
                      { item: reelItem1, rank: '第 1 順位', medal: '🥇' },
                      { item: reelItem2, rank: '第 2 順位', medal: '🥈' },
                      { item: reelItem3, rank: '第 3 順位', medal: '🥉' },
                    ].map((reel, idx) => (
                      <div
                        key={idx}
                        className={`p-3 sm:p-5 rounded-3xl bg-gradient-to-b from-gray-900 via-gray-800 to-black border-2 sm:border-3 ${
                          pachinkoPhase === 'slowdown'
                            ? 'border-amber-400 shadow-[0_0_30px_rgba(255,215,0,0.6)]'
                            : 'border-cyan-400/80 shadow-inner'
                        } flex flex-col items-center justify-between h-56 sm:h-72 relative overflow-hidden transition-all`}
                      >
                        <div className="w-full flex items-center justify-center gap-1 py-1 rounded-xl bg-white/10 border border-white/20 text-xs sm:text-sm font-heading font-black text-amber-300">
                          <span>{reel.medal}</span>
                          <span>{reel.rank}</span>
                        </div>

                        <div className="my-auto flex flex-col items-center justify-center">
                          <div className="w-20 h-20 sm:w-28 sm:h-28 p-2 rounded-2xl bg-white/95 border-2 border-amber-300 flex items-center justify-center shadow-lg transform transition-transform">
                            <img
                              src={reel.item.iconPath}
                              alt={reel.item.name}
                              className="w-full h-full object-contain drop-shadow-md"
                            />
                          </div>
                          <h3 className="font-heading font-black text-lg sm:text-2xl text-white mt-2 drop-shadow-md">
                            {reel.item.name}
                          </h3>
                        </div>

                        <span className="text-[10px] sm:text-xs font-cute text-amber-200 font-bold tracking-wider">
                          {reel.item.meaning}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs sm:text-sm font-cute font-bold text-gray-300 flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span>22 項志業高速旋轉中 · 命定結果即將定格</span>
                  </div>
                </div>
              </div>
            )}

            {/* PHASE 4: JACKPOT 5秒定格瞬間 (4200ms ~ 5300ms) */}
            {pachinkoPhase === 'jackpot' && (
              <div className="absolute inset-0 bg-gradient-to-b from-[#160024] via-[#2F0042] to-[#160024] flex flex-col items-center justify-center p-4 sm:p-6 z-10 overflow-hidden">
                <div className="sunburst-bg animate-sunburst absolute inset-[-50%] w-[200%] h-[200%] opacity-65 pointer-events-none" />

                <motion.div
                  initial={{ scale: 1.25, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 180 }}
                  className="relative z-20 max-w-4xl w-full text-center flex flex-col items-center"
                >
                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-400 text-amber-950 font-heading font-black text-sm sm:text-lg shadow-xl mb-4 border-2 border-white animate-bounce">
                    <span>👑 FEVER MAXIMUM 👑</span>
                  </div>

                  <h1 className="font-heading font-black text-4xl sm:text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-[#FFF9C4] via-[#FFD700] to-[#FF6F61] drop-shadow-[0_10px_30px_rgba(255,215,0,0.8)] leading-tight mb-2">
                    🎊 大當選 JACKPOT 確定！！ 🎊
                  </h1>
                  <p className="font-cute text-sm sm:text-xl text-amber-200 font-bold mb-6">
                    ✨ 星唯抓周三大天選志業 震撼定格揭曉 ✨
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full mb-4">
                    {actualItemData.slice(0, 3).map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ scale: 0.7, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className="p-5 sm:p-6 rounded-[28px] bg-white/95 border-3 border-amber-400 shadow-[0_0_30px_rgba(255,215,0,0.5)] text-center relative overflow-hidden"
                      >
                        <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-white font-heading font-black text-xs shadow-md mb-3">
                          第 {idx + 1} 順位
                        </div>
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 p-2 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-inner">
                          <img src={item.iconPath} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <h3 className="font-heading font-black text-xl sm:text-2xl text-brown-text">
                          {item.name}
                        </h3>
                        <p className="font-heading font-bold text-sm sm:text-base text-pastel-coral">
                          {item.meaning}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* PERMANENT DARK PACHINKO JACKPOT THEME (Main Screen) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="relative z-10"
      >
        {/* Top Header & Replay Controls */}
        <div className="text-center mb-10 pt-2">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 text-amber-950 font-heading font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(255,215,0,0.5)] border border-white/60 animate-pulse uppercase">
              <Sparkles size={16} />
              <span>✨ FEVER MAXIMUM · 抓周神選 ✨</span>
            </div>

            {/* Replay 5-second Pachinko Opening */}
            <button
              onClick={startPachinkoAnimation}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-amber-300 hover:text-white font-heading font-black text-xs sm:text-sm border border-amber-400/40 shadow-lg backdrop-blur-md transition-all cursor-pointer"
              title="再次觀賞 5 秒柏青哥開獎動效"
            >
              <span>🎰 重播開獎動畫</span>
            </button>

            <button
              onClick={onOpenStickerModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-pink-300 hover:text-white font-heading font-black text-xs sm:text-sm border border-pink-400/40 shadow-lg backdrop-blur-md transition-all cursor-pointer"
            >
              <Heart size={14} className="fill-pink-400 text-pink-400" />
              <span>限定貼圖</span>
            </button>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-[#FFF9C4] via-[#FFD700] to-[#FF6F61] drop-shadow-[0_8px_30px_rgba(255,215,0,0.85)] leading-tight tracking-tight">
            🎉 大當選 JACKPOT 確定！！ 🎉
          </h1>
          <p className="font-cute text-base sm:text-xl text-amber-200 font-bold mt-2.5 drop-shadow-md">
            ✨ 星唯抓周三大天選志業 震撼定格揭曉 ✨
          </p>
        </div>

        {/* 🌟 3 Winning Items Spotlight Cards (Figure 1 Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {actualItemData.slice(0, 3).map((item, idx) => {
            const badgeGradients = [
              'from-amber-400 via-yellow-300 to-amber-500 text-amber-950',
              'from-slate-200 via-white to-slate-300 text-slate-900',
              'from-orange-400 via-amber-300 to-orange-500 text-orange-950',
            ];
            const medalIcons = ['🥇', '🥈', '🥉'];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.88, y: 25 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="p-7 rounded-[32px] bg-white/95 border-3 border-amber-300 shadow-[0_0_35px_rgba(255,215,0,0.45)] text-center relative overflow-hidden transform hover:-translate-y-1 transition-transform"
              >
                {/* Order Pill Badge */}
                <div className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r ${badgeGradients[idx]} font-heading text-xs font-black shadow-md mb-3 border border-white/60`}>
                  <span>{medalIcons[idx]}</span>
                  <span>第 {idx + 1} 順位</span>
                </div>

                {/* Item Icon Box */}
                <div className="my-3 flex items-center justify-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 p-3 rounded-2xl bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-200 flex items-center justify-center shadow-inner">
                    <img src={item.iconPath} alt={item.name} className="w-full h-full object-contain drop-shadow-sm" />
                  </div>
                </div>

                {/* Item Details */}
                <h3 className="font-heading text-2xl sm:text-3xl font-black text-brown-text mt-2">
                  {item.name}
                </h3>
                <p className="font-heading text-base sm:text-lg font-black text-pastel-coral mt-0.5">
                  {item.meaning}
                </p>
                <p className="text-xs text-brown-muted mt-2 font-cute font-medium leading-relaxed px-2">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Current User Result Glass Card */}
        {currentUserResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-[28px] bg-white/10 backdrop-blur-xl border border-amber-400/40 mb-12 text-center shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-pink-500/10 pointer-events-none" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
              親愛的 <span className="text-amber-300 font-black text-xl">{currentUser}</span>
            </h3>
            <p className="text-sm sm:text-base text-amber-100 font-cute font-bold">
              您本次成功命中 <strong className="text-amber-300 text-xl font-black">{currentUserResult.score}</strong> / 3 項！
              {currentUserResult.score > 0
                ? ' 🎉 太神準了！榮獲抓周幸運大獎，感謝您對星唯的深切祝福！'
                : ' 💖 感謝您的熱情參與，願這份祝福陪伴星唯平安健康長大！'}
            </p>
          </motion.div>
        )}

        {/* 🏆 獲獎貴賓榜單 (THE PODIUM) - Dark Luxury Glassmorphism Theme */}
        <div className="space-y-6 mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-400/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300">
                <Trophy size={28} />
              </div>
              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-md">
                  獲獎貴賓榜單 (THE PODIUM)
                </h2>
                <p className="text-xs text-amber-200/80 font-cute font-medium">全場實時開獎結果 · 祝賀榮登預測神算榜</p>
              </div>
            </div>

            <button
              onClick={onOpenStickerModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-500 text-amber-950 font-heading font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:scale-105 cursor-pointer self-start sm:self-auto"
            >
              <Sparkles size={16} />
              <span>領取專屬 LINE 貼圖包</span>
            </button>
          </div>

          {/* 👑 冠軍 (Champion) - Match 3 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 sm:p-7 rounded-[32px] bg-gradient-to-r from-amber-500/25 via-amber-400/10 to-amber-500/25 backdrop-blur-xl border-2 border-amber-400/80 shadow-[0_0_35px_rgba(255,215,0,0.3)] relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-400/30 rounded-2xl text-amber-300 border border-amber-400/50">
                  <Crown size={28} className="fill-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-2xl font-black text-amber-300">
                      👑 冠軍 (CHAMPION) · 猜中 3 樣
                    </h3>
                    <span className="text-xl">🥇</span>
                  </div>
                  <p className="text-xs text-amber-100/90 font-cute font-bold">
                    榮獲「抓周神預言家」最高榮譽 + 星唯專屬 LINE 貼圖大賞！
                  </p>
                </div>
              </div>
              <span className="text-xs font-heading font-black px-4 py-1.5 rounded-full bg-amber-400 text-amber-950 w-fit shadow-md">
                {champions.length} 人獲獎
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {champions.length > 0 ? (
                champions.map((winner, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-2xl bg-amber-400 text-amber-950 font-black text-sm shadow-md flex items-center gap-1.5 border border-white/40"
                  >
                    <span>🌟</span>
                    <span>{winner.name}</span>
                  </span>
                ))
              ) : (
                <p className="text-xs text-amber-200/70 font-cute font-medium italic">
                  本次暫無貴賓 3 樣全中（神祕感十足！）
                </p>
              )}
            </div>
          </motion.div>

          {/* 👑 亞軍 (Runner-up) - Match 2 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 sm:p-7 rounded-[32px] bg-gradient-to-r from-slate-300/15 via-white/10 to-slate-300/15 backdrop-blur-xl border-2 border-slate-300/60 shadow-lg relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-300/25 rounded-2xl text-slate-200 border border-slate-300/40">
                  <Crown size={28} className="fill-slate-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-2xl font-black text-slate-100">
                      👑 亞軍 (RUNNER-UP) · 猜中 2 樣
                    </h3>
                    <span className="text-xl">🥈</span>
                  </div>
                  <p className="text-xs text-slate-200/80 font-cute font-bold">
                    榮獲「心有靈犀獎」+ 星唯專屬精選貼圖！
                  </p>
                </div>
              </div>
              <span className="text-xs font-heading font-black px-4 py-1.5 rounded-full bg-slate-200 text-slate-900 w-fit">
                {runnersUp.length} 人獲獎
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {runnersUp.length > 0 ? (
                runnersUp.map((winner, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 rounded-2xl bg-white/20 border border-slate-300/60 text-white font-bold text-sm shadow-sm"
                  >
                    {winner.name}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-300/70 font-cute font-medium italic">暫無名單</p>
              )}
            </div>
          </motion.div>

          {/* 👑 季軍 (Third Place) - Match 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 sm:p-7 rounded-[32px] bg-gradient-to-r from-orange-500/15 via-white/5 to-orange-500/15 backdrop-blur-xl border-2 border-orange-400/40 shadow-lg relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-400/20 rounded-2xl text-orange-300 border border-orange-400/40">
                  <Crown size={28} className="fill-orange-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-2xl font-black text-orange-200">
                      👑 季軍 (THIRD PLACE) · 猜中 1 樣
                    </h3>
                    <span className="text-xl">🥉</span>
                  </div>
                  <p className="text-xs text-orange-200/80 font-cute font-bold">
                    榮獲「幸運默契獎」！
                  </p>
                </div>
              </div>
              <span className="text-xs font-heading font-black px-4 py-1.5 rounded-full bg-orange-400 text-orange-950 w-fit">
                {thirdPlaces.length} 人獲獎
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {thirdPlaces.length > 0 ? (
                thirdPlaces.map((winner, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-white/15 border border-orange-300/40 text-orange-100 font-medium text-xs shadow-sm"
                  >
                    {winner.name}
                  </span>
                ))
              ) : (
                <p className="text-xs text-orange-300/70 font-cute font-medium italic">暫無名單</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* 🎁 Baby Sticker Reward Showcase (Dark Theme) */}
        <div className="mt-14 text-center border-t border-white/15 pt-8">
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-amber-300 mb-6 flex items-center justify-center gap-2 drop-shadow-md">
            <Sparkles size={22} className="text-amber-400" />
            <span>星唯專屬 LINE 貼圖包 (STICKER REWARDS)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {BABY_STICKERS.map((sticker) => (
              <motion.div
                key={sticker.id}
                whileHover={{ scale: 1.05, rotate: 1.5 }}
                onClick={onOpenStickerModal}
                className="p-5 rounded-[28px] bg-white/10 backdrop-blur-xl border-2 border-pink-400/30 hover:border-amber-400 cursor-pointer text-center shadow-lg transition-all"
              >
                <div className="w-24 h-24 mx-auto mb-3 p-2 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                  <img src={sticker.image} alt={sticker.name} className="w-full h-full object-contain" />
                </div>
                <h4 className="font-heading text-lg font-black text-amber-300">{sticker.tag}</h4>
                <p className="text-xs text-pink-200 mt-1 font-cute">{sticker.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
