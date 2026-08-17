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
import { ZHUAZHOU_ITEMS, ZhuazhouItem } from '../config/itemsData';
import { GuessRecord } from '../types';
import { 
  Trophy, 
  Activity, 
  Sparkles, 
  Flame, 
  Radio, 
  Clock, 
  Users, 
  CheckCircle2 
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DashboardViewProps {
  currentUser: string;
  userSelections?: string[];
  guesses: GuessRecord[];
  onOpenStickerModal: () => void;
  onOpenAdmin: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  userSelections = [],
  guesses,
  onOpenStickerModal,
  onOpenAdmin,
}) => {
  // Aggregate selections counts
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

  // Chart.js Data Configuration (Horizontal Bars with Neon Cyberpunk Styling)
  const chartData = useMemo(() => {
    // Show top 8 or all 16 items sorted
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
            if (!chartArea) return '#6FFF00';
            const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
            gradient.addColorStop(0, 'rgba(111, 255, 0, 0.2)');
            gradient.addColorStop(1, 'rgba(111, 255, 0, 0.95)');
            return gradient;
          },
          borderColor: '#6FFF00',
          borderWidth: 1.5,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 18,
        },
      ],
    };
  }, [sortedStats]);

  const chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(1, 8, 40, 0.95)',
        titleColor: '#6FFF00',
        bodyColor: '#EFF4FF',
        borderColor: 'rgba(111, 255, 0, 0.4)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        titleFont: { family: 'Anton', size: 14 },
        bodyFont: { family: 'Noto Sans TC', size: 13 },
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
          color: '#8EA3D7',
          font: { family: 'Anton', size: 12 },
          stepSize: 1,
        },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#EFF4FF',
          font: { family: 'Noto Sans TC', size: 13, weight: 'bold' as const },
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
      {/* Top Banner Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-neon"></span>
            </span>
            <span className="text-xs font-mono tracking-widest text-neon uppercase font-bold">
              REAL-TIME WAR ROOM PROTOCOL · LIVE STREAMING
            </span>
          </div>
          <h1 className="font-anton text-3xl sm:text-4xl lg:text-5xl tracking-wide uppercase text-cream">
            LIVE PREDICTION DASHBOARD
          </h1>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Floating Reward Pill */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenStickerModal}
            className="liquid-glass px-4 py-2.5 rounded-full border-neon/40 text-xs font-mono text-cream hover:border-neon shadow-[0_0_15px_rgba(111,255,0,0.2)] flex items-center gap-2 bg-gradient-to-r from-neon/10 to-transparent"
          >
            <Sparkles size={16} className="text-neon animate-spin" />
            <span className="font-bold text-neon">🎁 TOP 3 REWARD:</span>
            <span>Exclusive LINE Stickers</span>
          </motion.button>

          {/* Connected Total Pill */}
          <div className="liquid-glass px-4 py-2.5 rounded-full text-xs font-mono text-cream flex items-center gap-2">
            <Users size={14} className="text-neon" />
            <span>已收到 <strong className="text-neon">{guesses.length}</strong> 位貴賓預測</span>
          </div>
        </div>
      </div>

      {/* User's Own Submitted Selections Card */}
      {userItemsData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass p-5 rounded-[24px] border-neon/30 mb-8 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-neon/10 border border-neon/30 text-neon">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-xs font-mono text-cream-muted uppercase">您的專屬預測單 (YOUR PICKS)</p>
                <h4 className="text-base font-bold text-cream">
                  {currentUser}，您已成功送出 3 項抓周預測：
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {userItemsData.map((item, idx) => (
                <div
                  key={item.id}
                  className="px-3.5 py-1.5 rounded-xl bg-neon/10 border border-neon/40 text-cream flex items-center gap-2 text-xs font-bold shadow-sm"
                >
                  <img src={item.iconPath} alt="" className="w-5 h-5 object-contain" />
                  <span>#{idx + 1} {item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Top 3 Predicted Cards Highlight */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="text-neon" size={20} />
          <h3 className="font-anton text-xl tracking-wider text-cream uppercase">
            CURRENT TOP 3 MOST PREDICTED ITEMS (即時人氣榜首)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {top3Items.map((item, rankIdx) => {
            const medals = ['🥇 第一名', '🥈 第二名', '🥉 第三名'];
            const rankColors = [
              'border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.2)]',
              'border-slate-300/40 shadow-[0_0_20px_rgba(203,213,225,0.15)]',
              'border-amber-700/40 shadow-[0_0_20px_rgba(180,83,9,0.15)]',
            ];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rankIdx * 0.1 }}
                className={`liquid-glass p-6 rounded-[24px] border ${rankColors[rankIdx]} relative overflow-hidden flex flex-col justify-between`}
              >
                {/* Background ambient badge */}
                <div className="absolute top-2 right-4 font-anton text-5xl opacity-10 text-cream select-none">
                  #{rankIdx + 1}
                </div>

                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-anton tracking-wider text-cream font-bold">
                    {medals[rankIdx]}
                  </span>
                  <span className="font-anton text-xl text-neon">{item.count} 票</span>
                </div>

                <div className="flex items-center gap-4 my-2 relative z-10">
                  <div className="w-16 h-16 p-2 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <img src={item.iconPath} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-anton text-2xl text-cream tracking-wide uppercase">
                      {item.name}
                    </h4>
                    <p className="text-sm font-bold text-neon">{item.meaning}</p>
                    <p className="text-xs text-cream-muted font-mono">{item.desc}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-white/5 relative z-10">
                  <div className="flex justify-between text-xs font-mono text-cream-muted mb-1">
                    <span>支持比例</span>
                    <span className="text-neon font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-neon rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Chart.js Bar Chart & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Horizontal Bar Chart */}
        <div className="lg:col-span-2 liquid-glass p-6 sm:p-8 rounded-[28px] border border-white/15 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-neon">
                <Activity size={22} />
              </div>
              <div>
                <h3 className="font-anton text-xl tracking-wider text-cream uppercase">
                  VOTING DISTRIBUTION MATRIX
                </h3>
                <p className="text-xs text-cream-muted font-mono">
                  即時票數分佈統計 · TOP 10 志業項目
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-neon flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
              <span>LIVE UPDATING</span>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-[360px] sm:h-[420px] w-full relative">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Right 1 Col: Live Activity Feed */}
        <div className="liquid-glass p-6 sm:p-7 rounded-[28px] border border-white/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Radio className="text-neon" size={20} />
                <h3 className="font-anton text-lg tracking-wider text-cream uppercase">
                  LIVE GUEST FEED
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cream-muted">即時動態</span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {guesses.slice(0, 10).map((guess) => {
                const guessItemNames = (guess.selections || [])
                  .map((id) => ZHUAZHOU_ITEMS.find((it) => it.id === id)?.name)
                  .filter(Boolean);

                return (
                  <motion.div
                    key={guess.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-neon/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-cream">{guess.name}</span>
                      <span className="text-[10px] font-mono text-cream-muted/70 flex items-center gap-1">
                        <Clock size={10} />
                        剛剛
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {guessItemNames.map((name, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-neon/10 border border-neon/30 text-[11px] font-medium text-neon"
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

          {/* Admin Control Link & Party Status */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-cream-muted">
            <span>抓周大典倒數中...</span>
            <button
              onClick={onOpenAdmin}
              className="text-neon hover:underline font-bold"
            >
              ⚙️ 主持人後台 (ADMIN)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
