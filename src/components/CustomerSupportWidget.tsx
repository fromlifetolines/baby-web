import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ExternalLink, HelpCircle, Clock, Send, Sparkles } from 'lucide-react';

interface CustomerSupportWidgetProps {
  lineUrl?: string;
  supportHours?: string;
}

const FAQ_LIST = [
  {
    q: '如何讓現場大螢幕或投影機同步顯示？',
    a: '使用筆電連接投影機或電視，打開瀏覽器輸入「大螢幕專屬網址」（或點擊右上角「大螢幕投影」），按下 F11 進入全螢幕即可！',
  },
  {
    q: '現場親友如何投票？需要下載 App 嗎？',
    a: '完全不需要下載任何 App！親友只需打開手機相機對準投影螢幕上的 QR Code，就能立即進入選稱謂與預測投票。',
  },
  {
    q: '抓周道具可以自己更改或增加嗎？',
    a: '可以！主辦人點擊右上角「派對客製」，可以在「抓周品項庫」中勾選要啟用的道具，也可以自行輸入任何專屬創意道具。',
  },
  {
    q: '開獎時大螢幕跟親友手機會同步嗎？',
    a: '會的！主持人點擊開獎後，全場連線的手機與電腦大螢幕會於同一秒啟動 3, 2, 1 柏青哥開獎動效與得獎名冊！',
  },
];

export const CustomerSupportWidget: React.FC<CustomerSupportWidgetProps> = ({
  lineUrl = 'https://line.me/ti/p/~babyweb_service', // 可填入商用 LINE 官方帳號
  supportHours = '週一至週五 09:00 - 18:00 (抓周週末全日專人待命)',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* Expanded Support Modal / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 sm:w-96 rounded-[32px] p-5 sm:p-6 mb-3 bg-zinc-950/95 text-white border-2 border-amber-400/40 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-md">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-amber-300">
                    BabyWeb 官方線上客服 🌸
                  </h3>
                  <p className="text-[11px] text-white/50 font-cute">常見問題與即時專人支援</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Operating Hours Banner */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 flex items-center gap-2 text-xs text-amber-200/90 font-cute">
              <Clock size={16} className="text-amber-400 shrink-0" />
              <span>客服時段：{supportHours}</span>
            </div>

            {/* Quick FAQ List */}
            <div className="space-y-2 mb-5 max-h-56 overflow-y-auto pr-1">
              <span className="text-[11px] font-bold text-white/40 block mb-1">
                熱門常見問題 (FAQ)
              </span>
              {FAQ_LIST.map((faq, idx) => {
                const isExpanded = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveFaq(isExpanded ? null : idx)}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-white/90">
                      <span className="flex items-center gap-1.5">
                        <HelpCircle size={14} className="text-amber-400 shrink-0" />
                        <span>{faq.q}</span>
                      </span>
                      <span className="text-white/40 text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                    {isExpanded && (
                      <p className="mt-2 text-white/70 font-cute pl-5 leading-relaxed text-[11px]">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Contact LINE Official Button */}
            <a
              href={lineUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-heading font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>加入 LINE 官方真人客服諮詢</span>
              <ExternalLink size={14} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-amber-500 text-amber-950 font-heading font-black text-xs flex items-center gap-2 shadow-xl hover:shadow-amber-400/30 border-2 border-white/80 cursor-pointer"
      >
        <MessageCircle size={18} className="animate-pulse" />
        <span className="hidden sm:inline">線上客服支援</span>
        <span className="sm:hidden">客服</span>
      </motion.button>
    </div>
  );
};
