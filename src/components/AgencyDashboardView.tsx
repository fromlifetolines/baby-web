import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyConfig } from '../types';
import { 
  Building2, 
  Plus, 
  ExternalLink, 
  Copy, 
  Trash2, 
  Calendar, 
  Users, 
  ArrowLeft, 
  Check, 
  Sparkles,
  Layers,
  Lock
} from 'lucide-react';

interface AgencyPartyItem {
  roomId: string;
  babyName: string;
  date: string;
  totalGuesses?: number;
  isRevealed?: boolean;
}

interface AgencyDashboardViewProps {
  onBackToMain: () => void;
  onEnterParty: (roomId: string) => void;
}

export const AgencyDashboardView: React.FC<AgencyDashboardViewProps> = ({
  onBackToMain,
  onEnterParty,
}) => {
  const [agencyKey, setAgencyKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return localStorage.getItem('babyweb_agency_auth') === 'true';
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Agency Managed Parties from LocalStorage / Cloud
  const [parties, setParties] = useState<AgencyPartyItem[]>(() => {
    try {
      const stored = localStorage.getItem('babyweb_agency_parties');
      return stored ? JSON.parse(stored) : [
        { roomId: 'xingwei', babyName: '星唯', date: '2025-08-19', totalGuesses: 18 },
        { roomId: 'demo_party', babyName: '小太陽', date: '2026-09-20', totalGuesses: 0 },
      ];
    } catch {
      return [{ roomId: 'xingwei', babyName: '星唯', date: '2025-08-19', totalGuesses: 18 }];
    }
  });

  // Modal for new party creation
  const [isCreating, setIsCreating] = useState(false);
  const [newBabyName, setNewBabyName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('babyweb_agency_parties', JSON.stringify(parties));
  }, [parties]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (agencyKey === 'vip888' || agencyKey === '0819') {
      setIsAuthorized(true);
      localStorage.setItem('babyweb_agency_auth', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('授權碼錯誤！請輸入公關專屬月租授權碼');
    }
  };

  const handleCreateParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBabyName.trim()) {
      alert('請輸入寶寶姓名！');
      return;
    }
    const cleanId = newRoomId.trim() 
      ? newRoomId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') 
      : `party_${Math.random().toString(36).substring(2, 7)}`;

    const newParty: AgencyPartyItem = {
      roomId: cleanId,
      babyName: newBabyName.trim(),
      date: newDate || new Date().toISOString().split('T')[0],
      totalGuesses: 0,
    };

    setParties([newParty, ...parties]);
    setIsCreating(false);
    setNewBabyName('');
    setNewDate('');
    setNewRoomId('');
  };

  const handleDeleteParty = (roomId: string) => {
    if (window.confirm(`確定要刪除房間 ${roomId} 嗎？此動作將移除該活動清單。`)) {
      setParties(parties.filter((p) => p.roomId !== roomId));
    }
  };

  const handleCopyLink = (roomId: string, view: 'guest' | 'projector') => {
    const origin = window.location.origin + window.location.pathname;
    const url = view === 'projector' ? `${origin}?room=${roomId}&view=projector` : `${origin}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(roomId + view);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-6xl mx-auto select-none text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMain}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="返回官網首頁"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-400 text-amber-950 font-black text-xs">
                B2B AGENCY
              </span>
              <p className="text-xs font-mono text-amber-300">公關公司 / 派對總管專屬多房間後台</p>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
              抓周派對場次總管儀表板 👑
            </h1>
          </div>
        </div>

        {isAuthorized && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-heading font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            <span>＋ 建立新抓周派對房間</span>
          </button>
        )}
      </div>

      {!isAuthorized ? (
        /* Login Form */
        <div className="max-w-md mx-auto py-16 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-400 text-amber-950 flex items-center justify-center mx-auto shadow-xl">
            <Lock size={32} />
          </div>
          <h2 className="font-heading text-2xl font-black text-white">
            請輸入公關專屬授權碼
          </h2>
          <p className="text-xs text-white/60 font-cute">
            月約與年約合作公關、攝影棚與飯店專案夥伴請在此輸入專屬管理金鑰解鎖。
          </p>

          <form onSubmit={handleUnlock} className="space-y-4 pt-2">
            <input
              type="password"
              value={agencyKey}
              onChange={(e) => setAgencyKey(e.target.value)}
              placeholder="請輸入公關總管密碼（如 vip888 或 0819）"
              className="w-full px-5 py-4 rounded-2xl bg-white/10 border-2 border-white/20 text-center text-white placeholder-white/40 focus:outline-none focus:border-amber-400 font-bold"
              autoFocus
            />
            {errorMsg && <p className="text-xs text-rose-400 font-bold">⚠️ {errorMsg}</p>}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-amber-400 text-amber-950 font-heading font-black text-sm shadow-lg hover:bg-amber-300 transition-all cursor-pointer"
            >
              進入公關管理看板 (ENTER)
            </button>
          </form>
        </div>
      ) : (
        /* Parties Grid */
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/70 font-cute">
              當月已開啟 <strong className="text-amber-300 font-black">{parties.length}</strong> 場抓周派對（無限開房方案）
            </span>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ● 公關 VIP 訂閱有效中
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {parties.map((p) => (
              <motion.div
                key={p.roomId}
                whileHover={{ y: -3 }}
                className="p-6 rounded-3xl bg-white/10 border-2 border-white/15 hover:border-amber-400/80 shadow-xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold">
                      房號: {p.roomId}
                    </span>
                    <button
                      onClick={() => handleDeleteParty(p.roomId)}
                      className="text-white/40 hover:text-rose-400 p-1 transition-colors"
                      title="刪除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h3 className="font-heading text-2xl font-black text-white mt-1">
                    {p.babyName} 1 歲抓周
                  </h3>
                  <p className="text-xs text-white/60 font-cute flex items-center gap-1.5 mt-1">
                    <Calendar size={14} className="text-amber-400" />
                    <span>活動日期：{p.date}</span>
                  </p>
                </div>

                {/* Quick Link Buttons */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCopyLink(p.roomId, 'guest')}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Copy size={12} />
                      <span>{copiedId === p.roomId + 'guest' ? '已複製！' : '賓客手機'}</span>
                    </button>

                    <button
                      onClick={() => handleCopyLink(p.roomId, 'projector')}
                      className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-xs font-bold text-sky-300 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Copy size={12} />
                      <span>{copiedId === p.roomId + 'projector' ? '已複製！' : '大螢幕投影'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onEnterParty(p.roomId)}
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-heading font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <span>進入派對中控台</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* New Party Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-[32px] bg-zinc-950 border-2 border-amber-400 shadow-2xl p-6 sm:p-8 z-10 space-y-4"
            >
              <h3 className="font-heading text-xl font-black text-amber-300">
                建立新抓周派對場次 🎀
              </h3>

              <form onSubmit={handleCreateParty} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1.5">
                    👶 寶寶姓名
                  </label>
                  <input
                    type="text"
                    value={newBabyName}
                    onChange={(e) => setNewBabyName(e.target.value)}
                    placeholder="例如：安安、晨晨"
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1.5">
                    📅 活動日期
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1.5">
                    🔑 專屬房號 (選填，留空自動生成)
                  </label>
                  <input
                    type="text"
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value)}
                    placeholder="例如：anan2026"
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-amber-300 font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-3 rounded-xl bg-white/10 text-white text-xs font-bold"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-amber-400 text-amber-950 font-heading font-black text-xs shadow-md hover:bg-amber-300 cursor-pointer"
                  >
                    立即生成房間
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
