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
import { ZHUAZHOU_ITEMS, BABY_AVATAR_IMG } from '../config/itemsData';
import { GuessRecord } from '../types';
import { 
  Sparkles, 
  Trophy, 
  Users, 
  Heart, 
  Flame, 
  QrCode, 
  Smartphone, 
  ArrowRight,
  Clock
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ProjectorViewProps {
  guesses: GuessRecord[];
  onOpenAdmin: () => void;
}

export const ProjectorView: React.FC<ProjectorViewProps> = ({ guesses, onOpenAdmin }) => {
  const base = import.meta.env.BASE_URL || '/';

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
      percentage: total > 0 ? Math.round(((counts[item.id] || 0) / (guesses.length || 1)) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    return {
      sortedStats: stats,
      top3Items: stats.slice(0, 3),
      totalVotesCount: total,
    };
  }, [guesses]);

  const chartData = useMemo(() => {
    const displayStats = sortedStats.slice(0, 10);
    return {
      labels: displayStats.map((item) => `${item.name} (${item.meaning})`),
      datasets: [
        {
          label: '得票數',
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
          borderWidth: 2,
          borderRadius: 14,
          borderSkipped: false,
          barThickness: 22,
        },
      ],
    };
  }, [sortedStats]);

  const chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 600,
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
        padding: 16,
        cornerRadius: 18,
        titleFont: { family: 'Quicksand', size: 16, weight: 'bold' },
        bodyFont: { family: 'Zen Maru Gothic', size: 14 },
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
          font: { family: 'Quicksand', size: 14, weight: 'bold' },
          stepSize: 1,
        },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#5C4033',
          font: { family: 'Zen Maru Gothic', size: 14, weight: 'bold' as const },
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto flex flex-col justify-between select-none">
      {/* Top Banner Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
            <motion.div
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="w-full h-full rounded-full p-1 bg-gradient-to-tr from-pastel-coral via-pastel-pink to-cream-200 shadow-soft-pink"
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-inner">
                <img
                  src={BABY_AVATAR_IMG}
                  alt="星唯"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blush-100 text-pastel-rose text-xs font-bold tracking-wider mb-1">
              ✨ PROJECTOR LIVE BIG SCREEN · 全場大螢幕投影 ✨
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brown-text">
              星唯 1 歲抓周大典 · 即時預測戰況
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="liquid-glass px-5 py-2.5 rounded-full border-2 border-pastel-coral text-brown-text font-heading font-bold text-base sm:text-lg flex items-center gap-2.5 shadow-md">
            <Users size={20} className="text-pastel-coral" />
            <span>已收到 <strong className="text-pastel-coral text-xl sm:text-2xl font-black">{guesses.length}</strong> 位貴賓預測</span>
          </div>

          <button
            onClick={onOpenAdmin}
            className="p-2.5 rounded-2xl liquid-glass text-brown-muted hover:text-pastel-coral transition-colors"
            title="主持人控制台"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Main 16:9 Screen Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch mb-6">
        
        {/* LEFT / MAIN SECTION (7 Columns): Live Chart & Top 3 Spotlight */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* Top 3 Popularity Spotlight Cards */}
          <div className="liquid-glass p-5 rounded-[32px] border-2 border-blush-300 shadow-xl bg-white/90">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-lg sm:text-xl font-black text-brown-text flex items-center gap-2">
                <Trophy size={20} className="text-pastel-coral" />
                <span>{guesses.length === 0 ? '人氣榜首（虛位以待）' : '人氣榜首前三名 (TOP 3)'}</span>
              </h3>
              <span className="text-xs font-cute text-brown-muted font-bold">
                {guesses.length === 0 ? '等待首投' : '即時票選領先'}
              </span>
            </div>

            {guesses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-gradient-to-r from-blush-50 via-cream-100 to-blush-50 border-2 border-dashed border-blush-300 text-center flex flex-col items-center justify-center gap-2 shadow-inner"
              >
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white text-pastel-coral text-xs font-heading font-black shadow-sm">
                  <Sparkles size={14} className="text-pastel-coral" />
                  <span>🏆 人氣榜首（虛位以待）</span>
                </div>
                <h4 className="font-heading text-xl sm:text-2xl font-black text-brown-text mt-1">
                  ✨ 等待親友投下第一個預測... ✨
                </h4>
                <p className="text-xs sm:text-sm font-cute font-bold text-pastel-rose">
                  快掃描右側 QR Code，投下第一票成為首位預言家！
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {top3Items.map((item, idx) => {
                  const medals = ['🥇 第一名', '🥈 第二名', '🥉 第三名'];
                  const bgs = [
                    'bg-amber-50/80 border-amber-300', 
                    'bg-slate-50/80 border-slate-300', 
                    'bg-orange-50/80 border-orange-300'
                  ];
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border-2 ${bgs[idx]} flex flex-col justify-between shadow-sm`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-heading font-black text-brown-text px-2 py-0.5 rounded-md bg-white">
                          {medals[idx]}
                        </span>
                        <span className="font-heading font-black text-base text-pastel-coral">
                          {item.count} 票
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 my-1">
                        <div className="w-10 h-10 p-1 bg-white rounded-xl flex items-center justify-center border border-blush-200 shrink-0">
                          <img src={item.iconPath} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <h4 className="font-heading font-black text-brown-text text-sm">
                            {item.name}
                          </h4>
                          <p className="text-[11px] font-bold text-pastel-rose">{item.meaning}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Real-time Horizontal Bar Chart */}
          <div className="liquid-glass p-6 sm:p-7 rounded-[32px] border-2 border-blush-300 shadow-xl flex-1 flex flex-col justify-between bg-white/90 min-h-[380px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blush-100 text-pastel-coral">
                  <Flame size={20} />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-black text-brown-text">
                    全品項票數排行榜 (REAL-TIME RANKING)
                  </h2>
                  <p className="text-xs text-brown-muted font-cute">前 10 名熱門抓周物品票數分佈</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-pastel-coral font-bold font-cute text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-pastel-coral animate-ping" />
                <span>實時動態連線</span>
              </div>
            </div>

            <div className="h-[320px] sm:h-[360px] w-full relative">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* RIGHT / SIDE SECTION (5 Columns): High-Visibility Persistent QR Code Card & Live Feed */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          
          {/* 📱 HIGH-VISIBILITY SCAN QR CODE FROSTED GLASS CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="liquid-glass p-6 sm:p-8 rounded-[36px] border-2 border-blush-300 shadow-2xl relative overflow-hidden bg-white/95 text-center flex flex-col items-center justify-between"
            style={{
              boxShadow: '0 20px 40px -15px rgba(255, 111, 97, 0.2), 0 0 0 1px rgba(255, 182, 193, 0.4)',
            }}
          >
            {/* Subtle floating background ambient glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-pink/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cream-200/40 rounded-full blur-2xl pointer-events-none" />

            {/* Top Badge Tag */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-blush-100 text-pastel-coral text-xs font-heading font-black tracking-wider shadow-sm mb-3">
              <Sparkles size={14} className="animate-spin" />
              <span>✨ 現場即時互動 · 掃碼預測 ✨</span>
            </div>

            {/* Headline */}
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-brown-text tracking-tight mb-1">
              📱 掃碼參加星唯抓周預測
            </h2>
            <p className="text-xs sm:text-sm font-cute font-bold text-pastel-rose mb-4">
              開啟手機相機對準 QR Code，即刻投下命定三票！
            </p>

            {/* High-Contrast Pure White QR Image Container for Instant Long-Distance Focus */}
            <div className="relative my-2 p-4 bg-white rounded-3xl border-2 border-blush-200 shadow-card-bouncy group">
              <img
                src={`${base}assets/qrcode.png`}
                alt="Scan to Vote QR Code"
                className="w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] object-contain rounded-xl"
              />
              
              {/* Center cute baby badge overlay on QR code */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full p-1 bg-white shadow-md border border-blush-200 pointer-events-none">
                <img
                  src={BABY_AVATAR_IMG}
                  alt="星唯"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            {/* URL Footer & Call to Action */}
            <div className="mt-3 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cream-100 border border-blush-200 text-xs font-bold text-brown-text shadow-inner">
                <Smartphone size={14} className="text-pastel-coral" />
                <span className="font-mono text-[11px] text-pastel-rose">
                  fromlifetolines.github.io/baby-web/
                </span>
              </div>
              <p className="text-[11px] text-brown-muted font-cute font-medium pt-1">
                免下載 App · 支援所有 iPhone / Android 智慧型手機相機
              </p>
            </div>
          </motion.div>

          {/* Recent Submissions Activity Feed */}
          <div className="liquid-glass p-5 rounded-[32px] border-2 border-blush-200 shadow-lg bg-white/85">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-base font-bold text-brown-text flex items-center gap-2">
                <Clock size={16} className="text-pastel-coral" />
                <span>最新賓客動態 (LATEST VOTES)</span>
              </h3>
              <span className="text-[11px] font-cute text-brown-muted">實時更新</span>
            </div>

            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {guesses.length === 0 ? (
                <p className="text-xs text-center py-4 text-brown-muted font-cute">
                  尚未有預測，請掃描上方 QR Code 投下第一票！
                </p>
              ) : (
                guesses.slice(0, 5).map((g) => (
                  <div
                    key={g.id}
                    className="p-2.5 rounded-xl bg-white border border-blush-200 text-xs flex items-center justify-between shadow-sm"
                  >
                    <span className="font-bold text-brown-text">{g.name}</span>
                    <span className="text-pastel-coral font-bold text-[11px]">已完成 3 項志業預測 🎀</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Instructions */}
      <footer className="liquid-glass p-3.5 rounded-full border-2 border-blush-200 text-center font-cute font-bold text-brown-muted flex items-center justify-center gap-2 shadow-sm text-xs sm:text-sm">
        <Heart size={16} className="text-pastel-coral fill-pastel-coral" />
        <span>請貴賓踴躍掃碼預測，大典即將由主持人公布星唯抓周結果並頒發貼圖大獎！</span>
      </footer>
    </div>
  );
};
