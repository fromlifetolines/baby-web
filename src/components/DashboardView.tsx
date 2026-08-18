import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ZHUAZHOU_ITEMS, ZhuazhouItem, BABY_STICKERS, BABY_AVATAR_IMG } from '../config/itemsData';
import { GuessRecord } from '../types';
import { 
  Sparkles, 
  Flame, 
  Users, 
  CheckCircle2, 
  Clock, 
  Monitor, 
  Heart,
  Settings,
  Gift
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DashboardViewProps {
  currentUser: string;
  userSelections?: string[];
  guesses: GuessRecord[];
  onOpenStickerModal: () => void;
  onOpenAdmin: () => void;
  onSwitchToProjector: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  userSelections = [],
  guesses,
  onOpenStickerModal,
  onOpenAdmin,
  onSwitchToProjector,
}) => {
  // Compute votes
  const { sortedStats, top3Items, totalVotesCount } = useMemo(() => {
    const counts: Record<string, number> = {};
    ZHUAZHOU_ITEMS.forEach((item) => {
      counts[item.id] = 0;
    });

    let total = 0;
    guesses.forEach((g) => {
      (g.selections || []).forEach((itemId) => {
        counts[itemId] = (counts[itemId] || 0) + 1;
        total++;
      });
    });

    const stats = ZHUAZHOU_ITEMS.map((item) => ({
      ...item,
      count: counts[item.id] || 0,
      percentage: total > 0 ? Math.round(((counts[item.id] || 0) / guesses.length) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    return {
      sortedStats: stats,
      top3Items: stats.slice(0, 3),
      totalVotesCount: total,
    };
  }, [guesses]);

  // Chart.js Configuration - Soft Pink & Rose Gold gradients with #5C4033 typography
  const chartData = useMemo(() => {
    const displayStats = sortedStats.slice(0, 10);
    return {
      labels: displayStats.map((item) => `${item.name} (${item.meaning})`),
      datasets: [
        {
          label: '得票數 (Votes)',
          data: displayStats.map((item) => item.count),
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return '#FFB6C1';
            const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
            gradient.addColorStop(0, '#FFE4E6');
            gradient.addColorStop(1, '#FF6F61');
            return gradient;
          },
          borderColor: '#FF6F61',
          borderWidth: 1.5,
          borderRadius: 12,
          borderSkipped: false,
          barThickness: 20,
        },
      ],
    };
  }, [sortedStats]);

  const chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 700,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#5C4033',
        bodyColor: '#B76E79',
        borderColor: '#FFB6C1',
        borderWidth: 2,
        padding: 12,
        cornerRadius: 16,
        titleFont: { family: 'Quicksand', size: 14, weight: 'bold' },
        bodyFont: { family: 'Zen Maru Gothic', size: 13 },
        callbacks: {
          label: (context) => {
            const xVal = context.parsed?.x ?? 0;
            return ` 得票數: ${xVal} 票 (${Math.round((xVal / (guesses.length || 1)) * 100)}% 貴賓支持)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#8C7265',
          font: { family: 'Quicksand', size: 12, weight: 'bold' },
          stepSize: 1,
        },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#5C4033',
          font: { family: 'Zen Maru Gothic', size: 13, weight: 'bold' as const },
        },
        border: { display: false },
      },
    },
  };

  const userItemsData = userSelections
    .map((id) => ZHUAZHOU_ITEMS.find((item) => item.id === id))
    .filter(Boolean) as ZhuazhouItem[];

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {/* Top Banner with Baby Xing-Wei Avatar Bubble */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Baby Avatar Bubble (08.png) with soft glowing border */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0">
            <motion.div
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="w-full h-full rounded-full p-1 bg-gradient-to-tr from-pastel-coral via-pastel-pink to-cream-200 shadow-soft-pink"
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-inner">
                <img
                  src={BABY_AVATAR_IMG}
                  alt="星唯"
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={onOpenStickerModal}
                  title="星唯抓周紀念"
                />
              </div>
            </motion.div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pastel-coral opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pastel-coral"></span>
              </span>
              <span className="text-xs font-cute font-bold tracking-wider text-pastel-rose uppercase">
                LIVE PREDICTION DASHBOARD · 即時戰況
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-brown-text">
              星唯抓周即時預測榜單 🌸
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenStickerModal}
            className="cute-pill px-4 py-2 text-xs font-cute font-bold text-brown-text hover:border-pastel-coral flex items-center gap-2 shadow-sm"
          >
            <Sparkles size={16} className="text-pastel-coral animate-spin" />
            <span className="text-pastel-coral">🎁 限定貼圖獎勵</span>
          </button>

          <button
            onClick={onSwitchToProjector}
            className="cute-pill px-4 py-2 text-xs font-cute font-bold text-brown-text hover:border-pastel-coral flex items-center gap-1.5 shadow-sm"
          >
            <Monitor size={14} className="text-pastel-rose" />
            <span>投影大螢幕模式</span>
          </button>

          <div className="cute-pill px-4 py-2 text-xs font-cute font-bold text-brown-text flex items-center gap-2 shadow-sm">
            <Users size={14} className="text-pastel-coral" />
            <span>已收到 <strong className="text-pastel-coral">{guesses.length}</strong> 位預測</span>
          </div>
        </div>
      </div>

      {/* Post-submit Waiting Status Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="liquid-glass p-6 rounded-[28px] border-2 border-blush-300 mb-8 relative overflow-hidden bg-gradient-to-r from-white/90 via-blush-50/80 to-white/90"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blush-100 text-pastel-coral border border-blush-200">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-cute font-bold px-2.5 py-0.5 rounded-full bg-pastel-coral text-white">
                  預測已送出
                </span>
                <span className="text-xs text-brown-muted font-bold">Waiting for Reveal...</span>
              </div>
              <h4 className="text-base font-bold text-brown-text mt-1">
                {currentUser ? `${currentUser}，您已完成抓周預測！` : '感謝您的參與！'}
              </h4>
            </div>
          </div>

          {userItemsData.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {userItemsData.map((item, idx) => (
                <div
                  key={item.id}
                  className="px-3.5 py-1.5 rounded-2xl bg-white border-2 border-blush-200 text-brown-text flex items-center gap-2 text-xs font-bold shadow-sm"
                >
                  <img src={item.iconPath} alt="" className="w-5 h-5 object-contain" />
                  <span>#{idx + 1} {item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Top 3 Predicted Items Spotlight */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="text-pastel-coral" size={20} />
          <h3 className="font-heading text-xl font-black text-brown-text">
            當前人氣前三名 (TOP 3 PREDICTIONS)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {top3Items.map((item, rankIdx) => {
            const medals = ['🥇 第一名', '🥈 第二名', '🥉 第三名'];
            const rankStyles = [
              'border-amber-300 bg-amber-50/50 shadow-soft-pink',
              'border-slate-300 bg-slate-50/50 shadow-soft-pink',
              'border-orange-300 bg-orange-50/50 shadow-soft-pink',
            ];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rankIdx * 0.1 }}
                className={`liquid-glass p-6 rounded-[28px] border-2 ${rankStyles[rankIdx]} relative overflow-hidden flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="px-3 py-1 rounded-full bg-white text-xs font-heading font-black text-brown-text shadow-sm">
                    {medals[rankIdx]}
                  </span>
                  <span className="font-heading font-black text-xl text-pastel-coral">
                    {item.count} 票
                  </span>
                </div>

                <div className="flex items-center gap-4 my-2 relative z-10">
                  <div className="w-16 h-16 p-2 rounded-2xl bg-white border border-blush-200 flex items-center justify-center shrink-0 shadow-sm">
                    <img src={item.iconPath} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-heading text-2xl font-bold text-brown-text">
                      {item.name}
                    </h4>
                    <p className="text-sm font-bold text-pastel-rose">{item.meaning}</p>
                    <p className="text-xs text-brown-muted line-clamp-1 font-cute">{item.desc}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-blush-200 relative z-10">
                  <div className="flex justify-between text-xs font-cute text-brown-muted font-bold mb-1">
                    <span>支持比例</span>
                    <span className="text-pastel-coral font-black">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-blush-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-pastel-pink to-pastel-coral rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Chart & Live Guest Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Soft Pastel Horizontal Bar Chart */}
        <div className="lg:col-span-2 liquid-glass p-6 sm:p-8 rounded-[32px] border-2 border-blush-200 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading text-xl font-bold text-brown-text">
                全品項票數即時統計 (LIVE VOTING STATS)
              </h3>
              <p className="text-xs text-brown-muted font-cute font-medium">
                即時統計每位賓客的熱門預測志業
              </p>
            </div>
            <span className="text-xs font-cute font-bold text-pastel-coral flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pastel-coral animate-ping" />
              <span>實時同步中</span>
            </span>
          </div>

          <div className="h-[360px] sm:h-[420px] w-full relative">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Right 1 Col: Live Activity Feed */}
        <div className="liquid-glass p-6 sm:p-7 rounded-[32px] border-2 border-blush-200 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-brown-text">
                賓客即時動態 (GUEST FEED)
              </h3>
              <span className="text-xs font-cute text-brown-muted">實時更新</span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {guesses.slice(0, 10).map((guess) => {
                const guessItemNames = (guess.selections || [])
                  .map((id) => ZHUAZHOU_ITEMS.find((it) => it.id === id)?.name)
                  .filter(Boolean);

                return (
                  <motion.div
                    key={guess.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3.5 rounded-2xl bg-white border border-blush-200 hover:border-pastel-coral transition-colors shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-brown-text">{guess.name}</span>
                      <span className="text-[10px] font-cute text-brown-muted flex items-center gap-1">
                        <Clock size={10} />
                        剛剛
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {guessItemNames.map((name, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-lg bg-blush-50 border border-blush-200 text-[11px] font-bold text-pastel-rose"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-blush-200 flex items-center justify-between text-xs font-cute text-brown-muted">
            <span>靜待星唯抓周揭曉...</span>
            <button
              onClick={onOpenAdmin}
              className="text-pastel-coral hover:underline font-bold flex items-center gap-1"
            >
              <Settings size={12} />
              <span>主持人後台</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🎁 The Sticker Award (貼圖大賞) Section in Frosted Liquid Glass Grid */}
      <div className="liquid-glass p-6 sm:p-8 rounded-[36px] border-2 border-blush-300 shadow-xl bg-gradient-to-b from-white/95 via-blush-50/60 to-white/95">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blush-100 text-pastel-coral border border-blush-200">
              <Gift size={24} />
            </div>
            <div>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-brown-text flex items-center gap-2">
                <span>貼圖大賞 🎁</span>
                <span className="text-xs font-cute px-3 py-0.5 rounded-full bg-pastel-coral text-white font-bold">
                  星唯 1 歲專屬
                </span>
              </h3>
              <p className="text-xs text-brown-muted font-cute font-medium mt-0.5">
                精選星唯可愛表情包，活動結束即可獲贈高解析度貼圖！
              </p>
            </div>
          </div>

          <button
            onClick={onOpenStickerModal}
            className="pastel-btn-primary px-5 py-2.5 rounded-2xl text-xs font-heading font-black shadow-md flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles size={14} />
            <span>查看下載全套貼圖</span>
          </button>
        </div>

        {/* 3 Frosted Sticker Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {BABY_STICKERS.map((sticker) => (
            <motion.div
              key={sticker.id}
              whileHover={{ scale: 1.03, y: -4 }}
              onClick={onOpenStickerModal}
              className="p-5 rounded-[28px] bg-white/90 border-2 border-blush-200 hover:border-pastel-coral transition-all cursor-pointer flex flex-col items-center justify-between text-center shadow-card-bouncy"
            >
              <div className="w-28 h-28 p-2 bg-gradient-to-b from-blush-50 to-white rounded-2xl flex items-center justify-center mb-3 shadow-inner border border-blush-100">
                <img
                  src={sticker.image}
                  alt={sticker.name}
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>
              <h4 className="font-heading text-lg font-black text-brown-text">
                {sticker.tag}
              </h4>
              <p className="text-xs text-brown-muted mt-1 font-cute font-medium">
                {sticker.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
