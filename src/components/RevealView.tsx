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
  const [countdown, setCountdown] = useState<number | null>(3);
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  // Step 1: Cute 3-2-1 Bouncing Countdown
  useEffect(() => {
    let current = 3;
    const interval = setInterval(() => {
      current -= 1;
      if (current >= 0) {
        setCountdown(current);
      } else {
        clearInterval(interval);
        setCountdown(null);
        setIsAnimationDone(true);
        triggerPastelConfetti();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Step 2: Massive Confetti Explosion (Pink, Gold, White, Rose)
  const triggerPastelConfetti = () => {
    try {
      const end = Date.now() + 4 * 1000;
      const pastelColors = ['#FF6F61', '#FFB6C1', '#FFD700', '#FFFFFF', '#B76E79', '#FFE4E1'];

      (function frame() {
        confetti({
          particleCount: 8,
          angle: 60,
          spread: 65,
          origin: { x: 0 },
          colors: pastelColors,
        });
        confetti({
          particleCount: 8,
          angle: 120,
          spread: 65,
          origin: { x: 1 },
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

  const actualItemData = (gameState.actualItems || [])
    .map((id) => ZHUAZHOU_ITEMS.find((it) => it.id === id))
    .filter(Boolean) as ZhuazhouItem[];

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
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative">
      {/* 3-2-1 Bouncing Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#FFFAF0]/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 2.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="relative"
            >
              <span className="font-heading text-[120px] sm:text-[180px] leading-none font-black text-pastel-coral drop-shadow-xl select-none block">
                {countdown === 0 ? '🎉' : countdown}
              </span>
              <p className="font-heading text-2xl sm:text-4xl font-bold text-brown-text mt-4">
                星唯抓周結果揭曉中... 🎀
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Revealed View */}
      {isAnimationDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blush-100 border border-blush-200 text-pastel-rose text-xs font-bold font-cute mb-3 shadow-sm"
            >
              <PartyPopper size={16} />
              <span>THE GRAND REVEAL COMPLETE</span>
            </motion.div>
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-black text-brown-text leading-tight">
              星唯抓周結果大揭曉！ 🌸
            </h1>
            <p className="font-cute text-lg sm:text-xl text-brown-muted font-bold mt-2">
              這是星唯在一歲抓周大典親自挑選的三大志業物品 🎀
            </p>
          </div>

          {/* Step 3: The 3 Winning Items Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {actualItemData.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="liquid-glass p-7 rounded-[32px] border-2 border-pastel-coral text-center relative overflow-hidden shadow-soft-pink bg-gradient-to-b from-white/95 via-blush-50/80 to-white/95"
              >
                <div className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-pastel-coral text-white font-heading text-xs font-black shadow-md">
                  第 {idx + 1} 順位
                </div>

                <div className="my-4 flex items-center justify-center">
                  <div className="w-24 h-24 p-3 rounded-2xl bg-white border-2 border-blush-200 flex items-center justify-center shadow-md">
                    <img src={item.iconPath} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                </div>

                <h3 className="font-heading text-2xl font-black text-brown-text mt-2">
                  {item.name}
                </h3>
                <p className="font-heading text-lg font-bold text-pastel-rose">
                  {item.meaning}
                </p>
                <p className="text-xs text-brown-muted mt-2 font-cute font-medium">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Current User Result Card */}
          {currentUserResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="liquid-glass p-6 rounded-[28px] border-2 border-pastel-coral mb-10 text-center bg-gradient-to-r from-blush-50 via-white to-blush-50 shadow-md"
            >
              <h3 className="text-lg font-bold text-brown-text mb-1">
                親愛的 <span className="text-pastel-coral font-black">{currentUser}</span>
              </h3>
              <p className="text-sm text-brown-muted font-cute font-bold">
                您本次成功命中 <strong className="text-pastel-coral text-lg font-black">{currentUserResult.score}</strong> / 3 項！
                {currentUserResult.score > 0
                  ? ' 🎉 太神準了！感謝您對星唯的祝福！'
                  : ' 💖 感謝您的熱情參與，願這份祝福陪伴星唯平安健康長大！'}
              </p>
            </motion.div>
          )}

          {/* Step 4: The Leaderboard Podium (Gold 3, Silver 2, Bronze 1) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy size={28} className="text-pastel-coral" />
                <h2 className="font-heading text-2xl sm:text-3xl font-black text-brown-text">
                  獲獎貴賓榜單 (THE PODIUM)
                </h2>
              </div>
              <button
                onClick={onOpenStickerModal}
                className="px-4 py-2 rounded-2xl pastel-btn-primary text-xs font-heading font-black transition-all flex items-center gap-1.5 shadow-md"
              >
                <Sparkles size={14} />
                <span>領取 LINE 貼圖</span>
              </button>
            </div>

            {/* 👑 冠軍 (Champion) - Match 3 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="liquid-glass p-6 sm:p-7 rounded-[32px] border-2 border-amber-300 shadow-soft-pink bg-gradient-to-r from-amber-50/90 via-white to-amber-50/90"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-2xl text-amber-500 border border-amber-200">
                    <Crown size={28} className="fill-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-2xl font-black text-amber-800">
                        👑 冠軍 (CHAMPION) · 猜中 3 樣
                      </h3>
                      <span className="text-xl">🥇</span>
                    </div>
                    <p className="text-xs text-brown-muted font-cute font-bold">
                      榮獲「抓周神預言家」最高榮譽 + 星唯專屬 LINE 貼圖大賞！
                    </p>
                  </div>
                </div>
                <span className="text-xs font-heading font-black px-4 py-1.5 rounded-full bg-amber-200 text-amber-900 w-fit">
                  {champions.length} 人獲獎
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {champions.length > 0 ? (
                  champions.map((winner, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-2xl bg-amber-100/90 border-2 border-amber-300 text-amber-900 font-black text-sm shadow-sm flex items-center gap-1.5"
                    >
                      <span>🌟</span>
                      <span>{winner.name}</span>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-brown-muted font-cute font-medium italic">
                    本次暫無貴賓 3 樣全中（神祕感十足！）
                  </p>
                )}
              </div>
            </motion.div>

            {/* 👑 亞軍 (Runner-up) - Match 2 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="liquid-glass p-6 sm:p-7 rounded-[32px] border-2 border-slate-300 shadow-soft-pink bg-gradient-to-r from-slate-50/90 via-white to-slate-50/90"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-100 rounded-2xl text-slate-500 border border-slate-200">
                    <Crown size={28} className="fill-slate-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-2xl font-black text-slate-800">
                        👑 亞軍 (RUNNER-UP) · 猜中 2 樣
                      </h3>
                      <span className="text-xl">🥈</span>
                    </div>
                    <p className="text-xs text-brown-muted font-cute font-bold">
                      榮獲「心有靈犀獎」+ 星維專屬精選貼圖！
                    </p>
                  </div>
                </div>
                <span className="text-xs font-heading font-black px-4 py-1.5 rounded-full bg-slate-200 text-slate-800 w-fit">
                  {runnersUp.length} 人獲獎
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {runnersUp.length > 0 ? (
                  runnersUp.map((winner, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-2xl bg-white border border-slate-300 text-slate-800 font-bold text-sm shadow-sm"
                    >
                      {winner.name}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-brown-muted font-cute font-medium italic">暫無名單</p>
                )}
              </div>
            </motion.div>

            {/* 👑 季軍 (Third Place) - Match 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="liquid-glass p-6 sm:p-7 rounded-[32px] border-2 border-orange-200 shadow-soft-pink bg-gradient-to-r from-orange-50/80 via-white to-orange-50/80"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-2xl text-orange-500 border border-orange-200">
                    <Crown size={28} className="fill-orange-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-2xl font-black text-orange-900">
                        👑 季軍 (THIRD PLACE) · 猜中 1 樣
                      </h3>
                      <span className="text-xl">🥉</span>
                    </div>
                    <p className="text-xs text-brown-muted font-cute font-bold">
                      榮獲「幸運默契獎」！
                    </p>
                  </div>
                </div>
                <span className="text-xs font-heading font-black px-4 py-1.5 rounded-full bg-orange-200 text-orange-900 w-fit">
                  {thirdPlaces.length} 人獲獎
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {thirdPlaces.length > 0 ? (
                  thirdPlaces.map((winner, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-white border border-orange-200 text-brown-text font-medium text-xs shadow-sm"
                    >
                      {winner.name}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-brown-muted font-cute font-medium italic">暫無名單</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Baby Sticker Reward Showcase */}
          <div className="mt-12 text-center">
            <h3 className="font-heading text-xl font-bold text-brown-text mb-6 flex items-center justify-center gap-2">
              <Sparkles size={20} className="text-pastel-coral" />
              <span>星唯專屬 LINE 貼圖包 (STICKER REWARDS)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {BABY_STICKERS.map((sticker) => (
                <motion.div
                  key={sticker.id}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  onClick={onOpenStickerModal}
                  className="liquid-glass p-5 rounded-[28px] border-2 border-blush-200 hover:border-pastel-coral cursor-pointer text-center shadow-sm"
                >
                  <div className="w-24 h-24 mx-auto mb-3 p-2 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                    <img src={sticker.image} alt={sticker.name} className="w-full h-full object-contain" />
                  </div>
                  <h4 className="font-heading text-lg font-black text-pastel-coral">{sticker.tag}</h4>
                  <p className="text-xs text-brown-muted mt-1 font-cute">{sticker.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
