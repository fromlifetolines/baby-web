import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyConfig, GameState, GuessRecord, WinnerScore } from '../types';
import { ZHUAZHOU_ITEMS } from '../config/itemsData';
import { X, Download, Share2, Sparkles, Award, Heart, Check } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyConfig: PartyConfig;
  gameState: GameState;
  guesses: GuessRecord[];
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  partyConfig,
  gameState,
  guesses,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const babyName = partyConfig.babyName || '星唯';
  const allPool = [...ZHUAZHOU_ITEMS, ...(partyConfig.customItems || [])];

  const actualItemData = (gameState.actualItems || [])
    .map((id) => allPool.find((it) => it.id === id))
    .filter(Boolean);

  // Compute Champions
  const actualSet = new Set(gameState.actualItems || []);
  const champions = guesses.filter(
    (g) => (g.selections || []).filter((id) => actualSet.has(id)).length === 3
  );

  const downloadCertificate = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Luxury Gold Dark Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, '#120500');
    bgGrad.addColorStop(0.5, '#240B04');
    bgGrad.addColorStop(1, '#080200');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Outer Decorative Golden Border
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, 1000, 1840);

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.25)';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 960, 1800);

    // 2. Header Emblem
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px "Outfit", sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('✨ OFFICIAL ZHUASZHOU MEMORIAL CERTIFICATE ✨', 540, 180);

    ctx.font = 'bold 72px "Outfit", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${babyName} 1 歲抓周紀念大典`, 540, 280);

    ctx.font = '40px sans-serif';
    ctx.fillStyle = '#FFC107';
    ctx.fillText('天 選 志 業 榮 譽 榜 單', 540, 350);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 400);
    ctx.lineTo(880, 400);
    ctx.stroke();

    // 3. Top 3 Winning Items Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.roundRect?.(100, 460, 880, 520, [32]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('🌟 寶寶親抓三大命定志業 🌟', 540, 530);

    actualItemData.slice(0, 3).forEach((item: any, idx) => {
      const yOffset = 620 + idx * 110;
      const medals = ['🥇 第一順位', '🥈 第二順位', '🥉 第三順位'];
      ctx.textAlign = 'left';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillStyle = '#FFC107';
      ctx.fillText(medals[idx], 180, yOffset);

      ctx.font = 'bold 44px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(item.name, 420, yOffset);

      ctx.font = '34px sans-serif';
      ctx.fillStyle = '#FFB6C1';
      ctx.fillText(`(${item.meaning})`, 650, yOffset);
    });

    // 4. Champion Winners Section
    ctx.textAlign = 'center';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('👑 猜中三項 · 特等神預言家榜單 👑', 540, 1080);

    const winnerNames = champions.map((c) => c.name).join('、 ') || '全體親友同心祝福 · 志在參與！';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(winnerNames, 540, 1160);

    // 5. Custom Prize Showcase Box
    if (partyConfig.prize?.enabled) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
      ctx.roundRect?.(140, 1260, 800, 280, [28]);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.stroke();

      ctx.font = 'bold 38px sans-serif';
      ctx.fillStyle = '#FFD700';
      ctx.fillText('🎁 本場大典榮譽大獎', 540, 1340);

      ctx.font = 'bold 46px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(partyConfig.prize.title || '精美好禮', 540, 1420);

      ctx.font = '32px sans-serif';
      ctx.fillStyle = '#FFC107';
      ctx.fillText(partyConfig.prize.claimedNote || '請洽主辦人領取', 540, 1480);
    }

    // 6. Watermark Footer
    ctx.font = 'bold 30px "Outfit", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('Powered by BabyWeb · 抓周派對即時互動系統', 540, 1780);
    ctx.fillText('https://fromlifetolines.github.io/baby-web/', 540, 1830);

    // Export & Download
    const link = document.createElement('a');
    link.download = `${babyName}_抓周大典榮譽紀念證書.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg rounded-[36px] bg-zinc-950 text-white border-2 border-amber-400/60 shadow-2xl p-6 sm:p-8 z-10 text-center space-y-5"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-amber-400 text-amber-950 flex items-center justify-center mx-auto shadow-lg">
              <Award size={36} />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading text-2xl font-black text-amber-300">
                {babyName} 抓周榮譽紀念證書 📜
              </h3>
              <p className="text-xs text-white/60 font-cute">
                已將三大天選志業、中獎親友榜單與專屬好禮自動封裝為高畫質圖卡！
              </p>
            </div>

            {/* Preview Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-zinc-900 to-black border border-amber-400/30 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-black text-amber-400">三大命定志業</span>
                <span className="text-xs text-white/60">{actualItemData.length} 項確定</span>
              </div>
              <div className="flex items-center gap-2">
                {actualItemData.slice(0, 3).map((item: any, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-xl bg-white/10 text-xs font-bold text-white">
                    {item.name}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10">
                <span className="text-xs font-black text-amber-400 block mb-1">神預言家貴賓</span>
                <p className="text-xs text-white/80 truncate">
                  {champions.map((c) => c.name).join('、 ') || '全體親友熱情支持！'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={downloadCertificate}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-heading font-black text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-400/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Download size={20} />
                <span>立即下載高清紀念圖 (1080x1920)</span>
              </button>

              <p className="text-[11px] text-white/40 font-cute">
                完美適配 Instagram 限時動態、Facebook 與 LINE 群組分享 📱
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
