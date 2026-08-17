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
import { Sparkles, Trophy, Users, Heart, Flame, QrCode } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ProjectorViewProps {
  guesses: GuessRecord[];
  onOpenAdmin: () => void;
}

export const ProjectorView: React.FC<ProjectorViewProps> = ({ guesses, onOpenAdmin }) => {
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

  const chartData = useMemo(() => {
    const displayStats = sortedStats.slice(0, 12);
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
          barThickness: 24,
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
        bodyFont: { family: 'Zen Maru Gothic', size: 15 },
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
          font: { family: 'Quicksand', size: 15, weight: 'bold' },
          stepSize: 1,
        },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#5C4033',
          font: { family: 'Zen Maru Gothic', size: 15, weight: 'bold' as const },
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="min-h-screen p-6 sm:p-10 max-w-[1600px] mx-auto flex flex-col justify-between">
      {/* Top Banner */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-pastel-coral text-white font-heading font-black text-3xl flex items-center justify-center shadow-lg">
            1
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blush-100 text-pastel-rose text-xs font-bold tracking-wider mb-1">
              ✨ PROJECTOR LIVE BIG SCREEN · 全場大螢幕投影 ✨
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-black text-brown-text">
              星唯 1 歲抓周大典 · 即時預測戰況
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="liquid-glass px-6 py-3 rounded-full border-2 border-pastel-coral text-brown-text font-heading font-bold text-lg flex items-center gap-3 shadow-md">
            <Users size={22} className="text-pastel-coral" />
            <span>已收到 <strong className="text-pastel-coral text-2xl font-black">{guesses.length}</strong> 位貴賓預測</span>
          </div>

          <button
            onClick={onOpenAdmin}
            className="p-3 rounded-2xl liquid-glass text-brown-muted hover:text-pastel-coral"
            title="主持人控制"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Main Screen Layout: 2 Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start mb-8">
        {/* Left 8 Cols: Large Chart */}
        <div className="xl:col-span-8 liquid-glass p-8 rounded-[36px] border-2 border-blush-300 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blush-100 text-pastel-coral">
                <Flame size={24} />
              </div>
              <h2 className="font-heading text-2xl font-black text-brown-text">
                全品項票數排行榜 (REAL-TIME RANKING)
              </h2>
            </div>
            <div className="flex items-center gap-2 text-pastel-coral font-bold font-cute">
              <span className="w-3 h-3 rounded-full bg-pastel-coral animate-ping" />
              <span>全場實時連線中</span>
            </div>
          </div>

          <div className="h-[520px] w-full relative">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Right 4 Cols: Top 3 Spotlight & Recent Votes */}
        <div className="xl:col-span-4 space-y-6">
          {/* Top 3 Spotlight Cards */}
          <div className="liquid-glass p-6 rounded-[32px] border-2 border-blush-300 shadow-xl">
            <h3 className="font-heading text-xl font-black text-brown-text mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-pastel-coral" />
              <span>人氣榜首前三名 (TOP 3)</span>
            </h3>

            <div className="space-y-3">
              {top3Items.map((item, idx) => {
                const medals = ['🥇', '🥈', '🥉'];
                const bgs = ['bg-amber-100/60 border-amber-300', 'bg-slate-100/60 border-slate-300', 'bg-orange-100/60 border-orange-300'];
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border-2 ${bgs[idx]} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{medals[idx]}</span>
                      <div className="w-12 h-12 p-1.5 bg-white rounded-xl flex items-center justify-center border border-blush-200">
                        <img src={item.iconPath} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-heading font-black text-brown-text text-base">
                          {item.name}
                        </h4>
                        <p className="text-xs font-bold text-pastel-rose">{item.meaning}</p>
                      </div>
                    </div>
                    <span className="font-heading font-black text-xl text-pastel-coral">
                      {item.count} 票
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Submissions Ticker */}
          <div className="liquid-glass p-6 rounded-[32px] border-2 border-blush-300 shadow-xl">
            <h3 className="font-heading text-lg font-bold text-brown-text mb-3">
              最新預測動態 (LATEST VOTES)
            </h3>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {guesses.slice(0, 6).map((g) => (
                <div key={g.id} className="p-2.5 rounded-xl bg-white border border-blush-200 text-xs flex items-center justify-between shadow-sm">
                  <span className="font-bold text-brown-text">{g.name}</span>
                  <span className="text-pastel-rose font-bold">已送出 3 項預測</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="liquid-glass p-4 rounded-full border-2 border-blush-200 text-center font-cute font-bold text-brown-muted flex items-center justify-center gap-2 shadow-sm">
        <Heart size={16} className="text-pastel-coral fill-pastel-coral" />
        <span>請大家在手機上完成送出，主持人即將在舞台公布星唯抓周結果！</span>
      </div>
    </div>
  );
};
