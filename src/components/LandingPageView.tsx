import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Flame, 
  Smartphone, 
  Monitor, 
  Crown, 
  Check, 
  ArrowRight, 
  QrCode, 
  Play, 
  ShieldCheck, 
  Award, 
  Building2, 
  Gift, 
  Sliders,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface LandingPageViewProps {
  onStartDemo: () => void;
  onEnterRoom: (roomId: string) => void;
  onOpenAgency: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onStartDemo,
  onEnterRoom,
  onOpenAgency,
}) => {
  const [customRoomInput, setCustomRoomInput] = useState('');

  // Checkout modal
  const [checkoutPlan, setCheckoutPlan] = useState<{
    name: string;
    price: string;
    planType: 'single' | 'agency';
  } | null>(null);
  const [buyerBabyName, setBuyerBabyName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{ roomId: string } | null>(null);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerBabyName.trim() || !buyerEmail.trim()) {
      alert('請填寫寶寶姓名/主辦名稱與 Email 通訊信箱！');
      return;
    }

    setIsProcessingPayment(true);
    // Simulate auto payment approval and room provisioning
    setTimeout(() => {
      const generatedRoom = `baby_${Math.random().toString(36).substring(2, 7)}`;
      setIsProcessingPayment(false);
      setPaymentSuccessData({ roomId: generatedRoom });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#07020A] text-white select-none overflow-x-hidden relative">
      {/* Dynamic Ambient Luxury Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-radial from-amber-500/20 via-rose-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="relative z-30 max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-amber-500 flex items-center justify-center text-amber-950 font-heading font-black text-xl shadow-lg">
            👑
          </div>
          <div>
            <span className="font-heading text-xl sm:text-2xl font-black text-amber-300 block leading-none">
              BabyWeb · 抓周大典
            </span>
            <span className="text-[10px] text-white/50 tracking-widest uppercase font-mono">
              Real-time Interactive Zhuazhou SaaS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAgency}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold font-heading text-amber-200 border border-amber-400/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 size={14} />
            <span className="hidden sm:inline">公關總管後台</span>
            <span className="sm:hidden">公關端</span>
          </button>

          <button
            onClick={onStartDemo}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-heading font-black text-xs shadow-md transition-all cursor-pointer"
          >
            免費體驗試玩
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-20 max-w-5xl mx-auto px-5 pt-14 pb-20 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-heading font-bold shadow-xl backdrop-blur-md"
        >
          <Sparkles size={16} className="text-amber-400 animate-spin" />
          <span>全台首創 · 現場大螢幕與手機同步開獎抓周系統</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-heading font-black text-4xl sm:text-6xl md:text-7xl leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-400 drop-shadow-lg"
        >
          讓寶寶的 1 歲抓周大典，<br />
          成為全場驚嘆的璀璨盛宴！
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-cute text-base sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
        >
          親友掃碼 3 選投票 ➔ 電腦投影實時戰況榜 ➔ 321 日式柏青哥超震撼煞停開獎！
          零下載 App，全自動雲端即時連線。
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <button
            onClick={onStartDemo}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-heading font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-2xl shadow-amber-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play size={20} className="fill-amber-950" />
            <span>立即免註冊體驗試玩 (DEMO)</span>
          </button>

          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-base border border-white/20 transition-all flex items-center justify-center gap-2"
          >
            <span>查看販售定價方案</span>
            <ChevronRight size={18} />
          </a>
        </motion.div>

        {/* Existing Room Direct Access Input */}
        <div className="pt-8 max-w-md mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customRoomInput.trim()) onEnterParty(customRoomInput.trim().toLowerCase());
            }}
            className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/15 focus-within:border-amber-400 transition-all"
          >
            <input
              type="text"
              value={customRoomInput}
              onChange={(e) => setCustomRoomInput(e.target.value)}
              placeholder="已購買？請輸入您的專屬房號 (如 xingwei)"
              className="flex-1 px-4 py-2 bg-transparent text-xs sm:text-sm text-white focus:outline-none placeholder-white/40 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-heading font-black text-xs shrink-0 cursor-pointer transition-all"
            >
              進入房間
            </button>
          </form>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            FEATURES SPOTLIGHT
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
            四大核心特色 · 打造難忘派對高潮
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Smartphone size={24} />
            </div>
            <h3 className="font-heading font-black text-lg text-white">極速掃碼零摩擦</h3>
            <p className="text-xs text-white/60 font-cute leading-relaxed">
              賓客打開相機掃描現場大螢幕 QR Code，自選叔叔舅舅等稱謂，3 秒完成命定 3 票預測！
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-400/20 text-sky-300 flex items-center justify-center">
              <Monitor size={24} />
            </div>
            <h3 className="font-heading font-black text-lg text-white">4K 投影實時戰況</h3>
            <p className="text-xs text-white/60 font-cute leading-relaxed">
              親友每投一票，現場大螢幕即時柱狀圖與前三名榜單動態跳動，全場氣氛瞬間沸騰！
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-400/20 text-rose-300 flex items-center justify-center">
              <Flame size={24} />
            </div>
            <h3 className="font-heading font-black text-lg text-white">3D 柏青哥同步開獎</h3>
            <p className="text-xs text-white/60 font-cute leading-relaxed">
              主持人按下開獎，現場大螢幕與全場手機同步倒數煞停，金幣璀璨噴發定格三樣志業！
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
              <Award size={24} />
            </div>
            <h3 className="font-heading font-black text-lg text-white">紀念證書裂變傳播</h3>
            <p className="text-xs text-white/60 font-cute leading-relaxed">
              儀式結束後一鍵生成高清證書圖片，爸媽分享 IG/LINE 群組，感動永久珍藏留念！
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-5 py-20 border-t border-white/10">
        <div className="text-center space-y-2 mb-14">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            TRANSPARENT PRICING
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-white">
            彈性定價 · 滿足家庭與商業公關需求
          </h2>
          <p className="text-sm text-white/60 font-cute">
            免簽長期合約 · 隨買隨開 · 系統自動 3 秒開通發送通行證
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1: Single Family */}
          <div className="p-8 rounded-[36px] bg-white/5 border border-white/15 flex flex-col justify-between gap-6 hover:border-amber-400/50 transition-all">
            <div className="space-y-4">
              <span className="px-3.5 py-1 rounded-full bg-white/10 text-amber-300 font-bold text-xs">
                👶 爸爸媽媽家庭自辦
              </span>
              <h3 className="font-heading text-2xl font-black text-white">單場家庭尊榮版</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white font-mono">NT$ 599</span>
                <span className="text-xs text-white/50 font-cute">/ 單場派對</span>
              </div>
              <ul className="space-y-2.5 text-xs text-white/70 font-cute pt-2">
                <li className="flex items-center gap-2">✓ 專屬派對房間保留 30 天</li>
                <li className="flex items-center gap-2">✓ 支援 100 位現場親友即時連線</li>
                <li className="flex items-center gap-2">✓ 現場 4K 投影大螢幕與動態 QR Code</li>
                <li className="flex items-center gap-2">✓ 自訂寶寶照片、標語與四大主題色</li>
                <li className="flex items-center gap-2">✓ 22 項志業勾選與自由輸入創意道具</li>
                <li className="flex items-center gap-2">✓ 一鍵下載高清抓周紀念證書榜單</li>
              </ul>
            </div>

            <button
              onClick={() => setCheckoutPlan({ name: '單場家庭尊榮版', price: 'NT$ 599', planType: 'single' })}
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-heading font-black text-sm shadow-md transition-all cursor-pointer"
            >
              立即開通此方案
            </button>
          </div>

          {/* Plan 2: Agency Pro (Recommended) */}
          <div className="p-8 rounded-[36px] bg-gradient-to-b from-amber-500/20 via-zinc-950 to-zinc-950 border-2 border-amber-400 flex flex-col justify-between gap-6 relative shadow-2xl shadow-amber-500/10 scale-105">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-amber-950 font-heading font-black text-xs shadow-md">
              👑 公關首選 · 超高 CP 值
            </div>

            <div className="space-y-4">
              <span className="px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs">
                🏢 派對顧問 / 抓周公關
              </span>
              <h3 className="font-heading text-2xl font-black text-white">公關專業月約版</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-amber-300 font-mono">NT$ 1,999</span>
                <span className="text-xs text-white/50 font-cute">/ 每月無限場</span>
              </div>
              <ul className="space-y-2.5 text-xs text-white/80 font-cute pt-2">
                <li className="flex items-center gap-2 font-bold text-amber-200">✓ 當月不限場次（無限開房）</li>
                <li className="flex items-center gap-2 font-bold text-amber-200">✓ 專屬公關多房間總管後台</li>
                <li className="flex items-center gap-2">✓ 每場無親友人數限制</li>
                <li className="flex items-center gap-2">✓ 支援公關公司專屬品牌 Logo 曝光</li>
                <li className="flex items-center gap-2">✓ 專人週末緊急活動在線支援</li>
              </ul>
            </div>

            <button
              onClick={() => setCheckoutPlan({ name: '公關專業月約版', price: 'NT$ 1,999', planType: 'agency' })}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-heading font-black text-sm shadow-xl shadow-amber-400/30 transition-all cursor-pointer"
            >
              開通公關無限方案 ⚡
            </button>
          </div>

          {/* Plan 3: Enterprise Annual */}
          <div className="p-8 rounded-[36px] bg-white/5 border border-white/15 flex flex-col justify-between gap-6 hover:border-amber-400/50 transition-all">
            <div className="space-y-4">
              <span className="px-3.5 py-1 rounded-full bg-white/10 text-amber-300 font-bold text-xs">
                🏰 知名攝影館 / 連鎖餐廳
              </span>
              <h3 className="font-heading text-2xl font-black text-white">旗艦機構年約版</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white font-mono">NT$ 15,999</span>
                <span className="text-xs text-white/50 font-cute">/ 全年包套</span>
              </div>
              <ul className="space-y-2.5 text-xs text-white/70 font-cute pt-2">
                <li className="flex items-center gap-2">✓ 全年無限派對場次</li>
                <li className="flex items-center gap-2">✓ 支援多廳/多攝影棚同時開展</li>
                <li className="flex items-center gap-2">✓ 完全客製獨立二級網域名稱</li>
                <li className="flex items-center gap-2">✓ 電子發票與對公轉帳支援</li>
              </ul>
            </div>

            <button
              onClick={() => setCheckoutPlan({ name: '旗艦機構年約版', price: 'NT$ 15,999', planType: 'agency' })}
              className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-heading font-black text-sm transition-all cursor-pointer border border-white/20"
            >
              聯繫開通年約方案
            </button>
          </div>
        </div>
      </section>

      {/* Checkout Simulator Modal */}
      <AnimatePresence>
        {checkoutPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isProcessingPayment) {
                  setCheckoutPlan(null);
                  setPaymentSuccessData(null);
                }
              }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-[36px] bg-zinc-950 border-2 border-amber-400/80 shadow-2xl p-6 sm:p-8 z-10 space-y-5"
            >
              {!paymentSuccessData ? (
                <>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <h3 className="font-heading text-xl font-black text-amber-300">
                        快速結帳開通通行證 💳
                      </h3>
                      <p className="text-xs text-white/50">{checkoutPlan.name} · {checkoutPlan.price}</p>
                    </div>
                    <button
                      onClick={() => setCheckoutPlan(null)}
                      className="p-1 rounded-full text-white/40 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-white/80 mb-1.5">
                        👶 寶寶姓名 / 主辦單位名稱
                      </label>
                      <input
                        type="text"
                        value={buyerBabyName}
                        onChange={(e) => setBuyerBabyName(e.target.value)}
                        placeholder="例如：星唯、美好時光派對工作室"
                        className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/80 mb-1.5">
                        📧 接收通知與後台通行證的 Email
                      </label>
                      <input
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="例如：service@example.com"
                        className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-xs text-amber-200/90 font-cute space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldCheck size={16} className="text-amber-400" />
                        <span>綠界 ECPay / 藍新 / Stripe 安全加密連線</span>
                      </div>
                      <p className="text-[11px] text-white/60">
                        付款完成後系統於 3 秒內自動建立派對房間並寄送開房密鑰，零人工等待！
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-heading font-black text-base shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingPayment ? '處理付款開通中...' : `立即確認支付 ${checkoutPlan.price} 並開通`}
                    </button>
                  </form>
                </>
              ) : (
                /* Payment Successful Screen */
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center mx-auto text-2xl font-black shadow-lg">
                    ✓
                  </div>
                  <h3 className="font-heading text-2xl font-black text-amber-300">
                    開通成功！專屬房間已建立 🎉
                  </h3>
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-2 text-left">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60">專屬房號 (Room ID):</span>
                      <strong className="font-mono text-amber-300">{paymentSuccessData.roomId}</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60">主辦人預設密碼:</span>
                      <strong className="font-mono text-emerald-300">0819</strong>
                    </div>
                  </div>

                  <p className="text-xs text-white/70 font-cute">
                    通知信已同步發送至 {buyerEmail}，現在即可直接進入派對房間開始客製！
                  </p>

                  <button
                    onClick={() => {
                      onEnterParty(paymentSuccessData.roomId);
                      setCheckoutPlan(null);
                    }}
                    className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-heading font-black text-sm shadow-lg transition-all cursor-pointer"
                  >
                    立即進入派對中控台 🚀
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-xs text-white/40 font-cute">
        <p>© 2026 BabyWeb Interactive Party SaaS · 華人抓周數位互動首選品牌</p>
      </footer>
    </div>
  );
};
