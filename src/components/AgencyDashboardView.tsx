import React from 'react';
import { ArrowLeft, ShieldAlert, ArrowRight } from 'lucide-react';

/**
 * Agency management previously used a public client-side passcode and a localStorage
 * boolean as authorization. That is not a security boundary. Disable this unbacked
 * multi-tenant management surface until a server-enforced per-agency access model
 * and real room provisioning exist.
 */
interface AgencyDashboardViewProps {
  onBackToMain: () => void;
  onEnterParty: (roomId: string) => void;
}

export const AgencyDashboardView: React.FC<AgencyDashboardViewProps> = ({
  onBackToMain,
  onEnterParty,
}) => (
  <main className="min-h-screen flex items-center justify-center p-6 bg-[#0A0714] text-white">
    <section className="max-w-xl w-full rounded-3xl border border-white/15 bg-white/5 p-8 space-y-5 shadow-xl">
      <ShieldAlert className="text-amber-300" size={30} aria-hidden="true" />
      <h1 className="text-2xl font-black">企業管理後台安全升級中</h1>
      <p className="text-sm text-white/80 leading-7">
        原先的前端授權碼不具備雲端管理權限保護，已停止使用。
        活動資料會保留，但目前不提供新增房間或批次管理功能。
      </p>
      <p className="text-xs text-white/70 leading-6">
        既有星唯活動的授權主持人可前往活動頁面，點選設定圖示，使用 Firebase 帳號登入。
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onBackToMain}
          className="flex-1 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold flex items-center justify-center gap-2">
          <ArrowLeft size={16} /> 返回網站首頁
        </button>
        <button type="button" onClick={() => onEnterParty('xingwei')}
          className="flex-1 rounded-xl bg-amber-400 text-amber-950 px-5 py-3 text-sm font-bold flex items-center justify-center gap-2">
          前往星唯活動 <ArrowRight size={16} />
        </button>
      </div>
    </section>
  </main>
);
