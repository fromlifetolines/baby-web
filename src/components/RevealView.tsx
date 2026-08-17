import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ZHUAZHOU_ITEMS, ZhuazhouItem, BABY_STICKERS } from '../config/itemsData';
import { GuessRecord, GameState, WinnerScore } from '../types';
import { Trophy, Award, Sparkles, Star, RefreshCcw, PartyPopper } from 'lucide-react';

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

  // Cinematic 3s Countdown on mount
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
        triggerVictoryConfetti();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const triggerVictoryConfetti = () => {
    try {
      const end = Date.now() + 3.5 * 1000;
      const colors = ['#6FFF00', '#EFF4FF', '#FFD700', '#FF69B4', '#00FFFF'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch (e) {
      console.warn("Confetti trigger warning:", e);
    }
  };

  const actualItemData = (gameState.actualItems || [])
    .map((id) => ZHUAZHOU_ITEMS.find((it) => it.id === id))
    .filter(Boolean) as ZhuazhouItem[];

  // Calculate scores for all guests
  const { goldWinners, silverWinners, bronzeWinners, participantWinners, currentUserResult } =
    React.useMemo(() => {
      const actualSet = new Set(gameState.actualItems || []);
      const scored: WinnerScore[] = guesses.map((g) => {
        const matches = (g.selections || []).filter((id) => actualSet.has(id));
        let rank: WinnerScore['rank'] = 'participant';
        if (matches.length === 3) rank = 'gold';
        else if (matches.length === 2) rank = 'silver';
        else if (matches.length === 1) rank = 'bronze';

        return {
          name: g.name,
          score: matches.length,
          matchedItemIds: matches,
          rank,
        };
      });

      const gold = scored.filter((w) => w.rank === 'gold');
      const silver = scored.filter((w) => w.rank === 'silver');
      const bronze = scored.filter((w) => w.rank === 'bronze');
      const participants = scored.filter((w) => w.rank === 'participant');

      const userRes = scored.find((w) => w.name === currentUser);

      return {
        goldWinners: gold,
        silverWinners: silver,
        bronzeWinners: bronze,
        participantWinners: participants,
        currentUserResult: userRes,
      };
    }, [gameState.actualItems, guesses, currentUser]);

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative">
      {/* 3-Second Cinematic Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#010828]/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6 animate-screen-shake"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative"
            >
              <span className="font-anton text-[120px] sm:text-[180px] leading-none text-neon neon-text-glow font-black select-none">
                {countdown === 0 ? 'START!' : countdown}
              </span>
              <p className="font-condiment text-3xl sm:text-4xl text-cream tracking-wide mt-4">
                The Destiny Protocol is Revealing...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Revealed Screen */}
      {isAnimationDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header Title */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass border-neon/40 text-neon text-xs font-mono mb-3"
            >
              <PartyPopper size={16} />
              <span>THE DESTINY PROTOCOL COMPLETE</span>
            </motion.div>
            <h1 className="font-anton text-4xl sm:text-5xl md:text-6xl tracking-wide uppercase text-cream neon-text-glow">
              XING-WEI'S DESTINY REVEALED!
            </h1>
            <p className="font-condiment text-2xl sm:text-3xl text-neon mt-2">
              抓周結果揭曉 · 星維選中的三大志業
            </p>
          </div>

          {/* 3 Actual Items Picked Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {actualItemData.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="liquid-glass p-7 rounded-[28px] border-2 border-neon text-center relative overflow-hidden shadow-[0_0_30px_rgba(111,255,0,0.3)] bg-gradient-to-b from-neon/10 via-transparent to-transparent"
              >
                {/* Neon Pick Order */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-neon text-space-900 font-anton text-xs font-bold tracking-wider">
                  志業 #{idx + 1}
                </div>

                <div className="my-4 flex items-center justify-center">
                  <div className="w-24 h-24 p-3 rounded-2xl bg-white/5 border border-neon/30 flex items-center justify-center shadow-[0_0_20px_rgba(111,255,0,0.3)]">
                    <img src={item.iconPath} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                </div>

                <h3 className="font-anton text-2xl text-cream tracking-wide uppercase mt-2">
                  {item.name}
                </h3>
                <p className="font-anton text-lg text-neon tracking-wide">
                  {item.meaning}
                </p>
                <p className="text-xs text-cream-muted mt-2 font-body font-medium">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Current User Status Banner */}
          {currentUserResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="liquid-glass p-6 rounded-[24px] border-neon/40 mb-12 text-center bg-gradient-to-r from-neon/15 via-white/5 to-neon/15"
            >
              <h3 className="text-lg font-bold text-cream mb-1">
                親愛的 <span className="text-neon">{currentUser}</span>
              </h3>
              <p className="text-sm text-cream-muted">
                您本次成功命中 <strong className="text-neon text-base">{currentUserResult.score}</strong> / 3 項志業！
                {currentUserResult.score > 0
                  ? ' 🎉 太神準了！感謝您對星維的滿滿祝福！'
                  : ' 💖 感謝您的參與，心意百分百，祝星維健康快樂長大！'}
              </p>
            </motion.div>
          )}

          {/* Winners Podium Section (Framer Motion Staggered) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy size={28} className="text-neon" />
                <h2 className="font-anton text-2xl sm:text-3xl text-cream uppercase tracking-wide">
                  THE PREDICTION PODIUM (獲獎貴賓榜單)
                </h2>
              </div>
              <button
                onClick={onOpenStickerModal}
                className="px-4 py-2 rounded-2xl liquid-glass border-neon/40 text-xs font-anton tracking-wider text-neon hover:bg-neon hover:text-space-900 transition-all flex items-center gap-2"
              >
                <Sparkles size={14} />
                <span>領取 LINE 貼圖獎勵</span>
              </button>
            </div>

            {/* Gold Tier - Match 3 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="liquid-glass p-6 rounded-[24px] border border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.2)] bg-amber-500/5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🥇</span>
                  <div>
                    <h3 className="font-anton text-xl text-amber-300 tracking-wide uppercase">
                      GOLD TIER · 命中 3 項 (MATCH 3)
                    </h3>
                    <p className="text-xs text-cream-muted font-mono">
                      榮獲「抓周神預言家」最高榮譽 + 星維獨家 LINE 貼圖全套！
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold w-fit">
                  {goldWinners.length} 人獲獎
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {goldWinners.length > 0 ? (
                  goldWinners.map((winner, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-xl bg-amber-400/20 border border-amber-400/50 text-cream font-bold text-sm shadow-md flex items-center gap-2"
                    >
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      {winner.name}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-cream-muted/60 font-mono italic">
                    本次暫無貴賓 3 項全中（太刺激了！）
                  </p>
                )}
              </div>
            </motion.div>

            {/* Silver Tier - Match 2 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="liquid-glass p-6 rounded-[24px] border border-slate-300/40 shadow-[0_0_20px_rgba(203,213,225,0.1)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🥈</span>
                  <div>
                    <h3 className="font-anton text-xl text-slate-200 tracking-wide uppercase">
                      SILVER TIER · 命中 2 項 (MATCH 2)
                    </h3>
                    <p className="text-xs text-cream-muted font-mono">
                      榮獲「心有靈犀獎」+ 星維專屬精選貼圖！
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-300/20 text-slate-200 font-bold w-fit">
                  {silverWinners.length} 人獲獎
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {silverWinners.length > 0 ? (
                  silverWinners.map((winner, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/20 text-cream font-medium text-sm"
                    >
                      {winner.name}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-cream-muted/60 font-mono italic">暫無命中 2 項名單</p>
                )}
              </div>
            </motion.div>

            {/* Bronze Tier - Match 1 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="liquid-glass p-6 rounded-[24px] border border-amber-700/40"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🥉</span>
                  <div>
                    <h3 className="font-anton text-xl text-amber-600 tracking-wide uppercase">
                      BRONZE TIER · 命中 1 項 (MATCH 1)
                    </h3>
                    <p className="text-xs text-cream-muted font-mono">
                      榮獲「幸運祝福獎」！
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-700/20 text-amber-400 font-bold w-fit">
                  {bronzeWinners.length} 人獲獎
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {bronzeWinners.length > 0 ? (
                  bronzeWinners.map((winner, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-cream-muted text-xs"
                    >
                      {winner.name}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-cream-muted/60 font-mono italic">暫無名單</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Baby Sticker Celebration Gallery */}
          <div className="mt-12 text-center">
            <h3 className="font-anton text-xl text-cream tracking-wide uppercase mb-6 flex items-center justify-center gap-2">
              <Sparkles size={20} className="text-neon" />
              <span>BABY XING-WEI CELEBRATION STICKERS (貼圖大賞)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {BABY_STICKERS.map((sticker) => (
                <motion.div
                  key={sticker.id}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  onClick={onOpenStickerModal}
                  className="liquid-glass p-5 rounded-[24px] border border-white/10 hover:border-neon cursor-pointer text-center"
                >
                  <div className="w-24 h-24 mx-auto mb-3 p-2 bg-white/5 rounded-2xl flex items-center justify-center">
                    <img src={sticker.image} alt={sticker.name} className="w-full h-full object-contain" />
                  </div>
                  <h4 className="font-anton text-lg text-neon">{sticker.tag}</h4>
                  <p className="text-xs text-cream-muted mt-1">{sticker.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
