import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyConfig, ThemeStyle } from '../types';
import { ZHUAZHOU_ITEMS } from '../config/itemsData';
import { 
  X, 
  Palette, 
  Sparkles, 
  Gift, 
  Check, 
  Copy, 
  ExternalLink, 
  Save, 
  Upload, 
  Baby, 
  Grid3X3,
  QrCode,
  Sliders,
  HelpCircle
} from 'lucide-react';

interface PartyCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PartyConfig;
  onSaveConfig: (newConfig: Partial<PartyConfig>) => Promise<void>;
}

const THEME_OPTIONS: { id: ThemeStyle; name: string; desc: string; gradient: string; previewBadge: string }[] = [
  {
    id: 'gold-dark',
    name: '🌟 柏青哥金芒 (FEVER Gold)',
    desc: '沉穩奢華黑金，金光璀璨，視覺震撼開獎狂歡必備',
    gradient: 'from-amber-950 via-zinc-900 to-black',
    previewBadge: 'bg-amber-400 text-amber-950',
  },
  {
    id: 'blush-pink',
    name: '🌸 甜美櫻花粉 (Blush Pink)',
    desc: '粉嫩溫馨甜心，如糖果般可愛，女寶周歲經典首選',
    gradient: 'from-pink-900 via-rose-950 to-neutral-900',
    previewBadge: 'bg-pink-400 text-pink-950',
  },
  {
    id: 'baby-blue',
    name: '🌊 蔚藍小王子 (Baby Blue)',
    desc: '清爽天空蔚藍，陽光朝氣活力，男寶派對首選',
    gradient: 'from-sky-950 via-blue-950 to-neutral-900',
    previewBadge: 'bg-sky-400 text-sky-950',
  },
  {
    id: 'warm-cream',
    name: '🌿 韓系暖杏木質 (Warm Cream)',
    desc: '大地奶茶色系，文青柔和高質感，溫潤質感派對',
    gradient: 'from-stone-900 via-amber-950 to-stone-900',
    previewBadge: 'bg-amber-200 text-amber-950',
  },
];

export const PartyCustomizerModal: React.FC<PartyCustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'theme' | 'items' | 'prize' | 'share'>('info');

  // Form states
  const [roomId, setRoomId] = useState(config.roomId || 'xingwei');
  const [babyName, setBabyName] = useState(config.babyName || '星唯');
  const [subtitle, setSubtitle] = useState(config.subtitle || '');
  const [babyAvatar, setBabyAvatar] = useState(config.babyAvatar || '');
  const [themeColor, setThemeColor] = useState<ThemeStyle>(config.themeColor || 'gold-dark');
  const [activeItemIds, setActiveItemIds] = useState<string[]>(config.activeItemIds || ZHUAZHOU_ITEMS.map((i) => i.id));
  const [customItems, setCustomItems] = useState<CustomZhuazhouItem[]>(config.customItems || []);
  
  // New Custom Item Form Inputs
  const [newItemName, setNewItemName] = useState('');
  const [newItemMeaning, setNewItemMeaning] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemSymbol, setNewItemSymbol] = useState('🎁');

  // Prize states
  const [prizeEnabled, setPrizeEnabled] = useState(config.prize?.enabled ?? true);
  const [prizeTitle, setPrizeTitle] = useState(config.prize?.title || '星唯專屬 LINE 貼圖包 & 精美神秘好禮');
  const [prizeDesc, setPrizeDesc] = useState(config.prize?.description || '預測成功猜中前 3 項的貴賓，可獲得專屬大獎！');
  const [prizeClaimNote, setPrizeClaimNote] = useState(config.prize?.claimedNote || '活動結束後請憑手機獲獎畫面，向現場爸媽領取禮品！');

  const [isSaving, setIsSaving] = useState(false);
  const [copiedType, setCopiedType] = useState<'guest' | 'projector' | null>(null);

  // Sync internal state when config prop updates or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setRoomId(config.roomId || 'xingwei');
      setBabyName(config.babyName || '星唯');
      setSubtitle(config.subtitle || '');
      setBabyAvatar(config.babyAvatar || '');
      setThemeColor(config.themeColor || 'gold-dark');
      setActiveItemIds(config.activeItemIds || ZHUAZHOU_ITEMS.map((i) => i.id));
      setCustomItems(config.customItems || []);
      setPrizeEnabled(config.prize?.enabled ?? true);
      setPrizeTitle(config.prize?.title || '星唯專屬 LINE 貼圖包 & 精美神秘好禮');
      setPrizeDesc(config.prize?.description || '預測成功猜中前 3 項的貴賓，可獲得專屬大獎！');
      setPrizeClaimNote(config.prize?.claimedNote || '活動結束後請憑手機獲獎畫面，向現場爸媽領取禮品！');
    }
  }, [isOpen, config]);

  // Combined Items (Builtin 22 + User Custom Items)
  const allAvailableItems = React.useMemo(() => {
    return [...ZHUAZHOU_ITEMS, ...customItems];
  }, [customItems]);

  // Toggle item selection
  const handleToggleItem = (itemId: string) => {
    if (activeItemIds.includes(itemId)) {
      if (activeItemIds.length <= 6) {
        alert('抓周品項至少需保留 6 項，以供親友預測！');
        return;
      }
      setActiveItemIds(activeItemIds.filter((id) => id !== itemId));
    } else {
      setActiveItemIds([...activeItemIds, itemId]);
    }
  };

  const handleSelectAll = () => {
    setActiveItemIds(allAvailableItems.map((i) => i.id));
  };

  // Add a newly typed custom item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemMeaning.trim()) {
      alert('請填寫物品名稱與志業象徵！');
      return;
    }

    const newId = `custom_${Date.now()}`;
    const created: CustomZhuazhouItem = {
      id: newId,
      name: newItemName.trim(),
      meaning: newItemMeaning.trim(),
      symbol: newItemSymbol || '🎁',
      category: '創意自訂',
      desc: newItemDesc.trim() || `${newItemMeaning.trim()}，展翅高飛！`,
      iconPath: `${import.meta.env.BASE_URL || '/'}assets/items/stamp.svg`,
      isCustom: true,
    };

    setCustomItems([...customItems, created]);
    setActiveItemIds([...activeItemIds, newId]);
    setNewItemName('');
    setNewItemMeaning('');
    setNewItemDesc('');
  };

  // Delete a custom item
  const handleDeleteCustomItem = (itemId: string) => {
    setCustomItems(customItems.filter((it) => it.id !== itemId));
    setActiveItemIds(activeItemIds.filter((id) => id !== itemId));
  };

  // Image Upload helper
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('上傳照片建議小於 2MB 唷！');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setBabyAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveConfig({
        roomId,
        babyName,
        subtitle,
        babyAvatar,
        themeColor,
        activeItemIds,
        customItems,
        prize: {
          enabled: prizeEnabled,
          title: prizeTitle,
          description: prizeDesc,
          claimedNote: prizeClaimNote,
          imageUrl: babyAvatar,
        },
      });
      setIsSaving(false);
      onClose();
    } catch (err) {
      console.error(err);
      alert('儲存失敗，請檢查網路連線');
      setIsSaving(false);
    }
  };

  // Share links generator
  const origin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const guestUrl = `${origin}?room=${roomId}`;
  const projectorUrl = `${origin}?room=${roomId}&view=projector`;

  const copyToClipboard = (text: string, type: 'guest' | 'projector') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 25 }}
            className="relative w-full max-w-3xl rounded-[36px] border-2 border-amber-400/40 shadow-2xl z-10 max-h-[92vh] flex flex-col bg-zinc-950 text-white overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-400 text-amber-950 shadow-md">
                  <Sliders size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-xl sm:text-2xl font-black text-amber-300">
                      派對專屬客製化後台 (STUDIO) 👑
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/10 border border-white/20 text-amber-200">
                      SaaS Pro
                    </span>
                  </div>
                  <p className="text-xs text-white/60 font-cute">
                    自訂寶寶照片、專屬顏色、勾選抓周道具與即時開獎獎品展示
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 p-3 bg-white/5 border-b border-white/10 overflow-x-auto text-xs font-bold font-heading">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0 transition-all ${
                  activeTab === 'info'
                    ? 'bg-amber-400 text-amber-950 shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Baby size={16} />
                <span>寶寶基本資料</span>
              </button>

              <button
                onClick={() => setActiveTab('theme')}
                className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0 transition-all ${
                  activeTab === 'theme'
                    ? 'bg-amber-400 text-amber-950 shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Palette size={16} />
                <span>派對主題色</span>
              </button>

              <button
                onClick={() => setActiveTab('items')}
                className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0 transition-all ${
                  activeTab === 'items'
                    ? 'bg-amber-400 text-amber-950 shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Grid3X3 size={16} />
                <span>抓周品項庫 ({activeItemIds.length}/22)</span>
              </button>

              <button
                onClick={() => setActiveTab('prize')}
                className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0 transition-all ${
                  activeTab === 'prize'
                    ? 'bg-amber-400 text-amber-950 shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Gift size={16} />
                <span>猜中獲獎獎品</span>
              </button>

              <button
                onClick={() => setActiveTab('share')}
                className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0 transition-all ${
                  activeTab === 'share'
                    ? 'bg-amber-400 text-amber-950 shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <QrCode size={16} />
                <span>房間與分享連結</span>
              </button>
            </div>

            {/* Tab Content Panels */}
            <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6">
              {/* TAB 1: BABY INFO */}
              {activeTab === 'info' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-3xl bg-white/5 border border-white/10">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-lg group shrink-0">
                      <img
                        src={babyAvatar || config.babyAvatar}
                        alt="Baby"
                        className="w-full h-full object-cover"
                      />
                      <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <Upload size={20} className="text-amber-400 mb-1" />
                        <span className="text-[10px] text-white font-bold">點擊更換</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <h4 className="font-heading font-black text-lg text-amber-300">
                        寶寶大頭貼更換
                      </h4>
                      <p className="text-xs text-white/60">
                        支援 JPG、PNG 照片，照片會自動套用全場大螢幕、開獎動畫與親友投票首頁光暈中。
                      </p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-amber-950 font-bold text-xs cursor-pointer transition-all border border-amber-400/40">
                        <Upload size={14} />
                        <span>上傳自訂寶寶照片</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/80 mb-2">
                        👶 寶寶名字 / 暱稱
                      </label>
                      <input
                        type="text"
                        value={babyName}
                        onChange={(e) => setBabyName(e.target.value)}
                        placeholder="例如：星唯、小太陽、念念"
                        className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-amber-400 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/80 mb-2">
                        🔑 專屬派對房間代碼 (Room ID)
                      </label>
                      <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        placeholder="例如：xingwei, party01"
                        className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-amber-300 font-mono text-sm placeholder-white/30 focus:outline-none focus:border-amber-400 font-bold"
                      />
                      <span className="text-[10px] text-white/40 mt-1 block">
                        僅允許英文小寫與數字，多房間各自獨立不衝突
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 mb-2">
                      📝 首頁歡迎標語 / 抓周祝福詞
                    </label>
                    <textarea
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      rows={3}
                      placeholder="請親朋好友精準預測星唯即將抓取的前 3 項志業，見證璀璨未來！"
                      className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-amber-400 text-xs leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: THEME PALETTE */}
              {activeTab === 'theme' && (
                <div className="space-y-4">
                  <p className="text-xs text-white/70">
                    選擇最符合您抓周現場佈置與寶寶氣質的沉浸式主題色調：
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {THEME_OPTIONS.map((theme) => {
                      const isSelected = themeColor === theme.id;
                      return (
                        <div
                          key={theme.id}
                          onClick={() => setThemeColor(theme.id)}
                          className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 bg-gradient-to-br ${theme.gradient} ${
                            isSelected
                              ? 'border-amber-400 shadow-xl scale-[1.02]'
                              : 'border-white/15 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-heading font-black text-base text-white">
                              {theme.name}
                            </h4>
                            {isSelected && (
                              <span className="p-1 rounded-full bg-amber-400 text-amber-950">
                                <Check size={14} className="font-black" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/70 font-cute leading-relaxed">
                            {theme.desc}
                          </p>
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full w-fit ${theme.previewBadge}`}>
                            {isSelected ? '✓ 啟用中' : '預覽套用'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: ZHUAZHOU ITEMS SELECTION & CUSTOM ITEMS */}
              {activeTab === 'items' && (
                <div className="space-y-6">
                  {/* Top Bar: Count & Select All */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <h4 className="font-heading text-sm font-black text-amber-300">
                        道具勾選庫：當前已啟用 {activeItemIds.length} / {allAvailableItems.length} 項
                      </h4>
                      <p className="text-xs text-white/60">
                        您可以勾選啟用當天準備的道具，或在下方自行輸入創意道具！未勾選的品項不會出現在賓客投票選項中。
                      </p>
                    </div>

                    <button
                      onClick={handleSelectAll}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                    >
                      全部全選 ({allAvailableItems.length}項)
                    </button>
                  </div>

                  {/* ➕ Add Custom Item Form */}
                  <form onSubmit={handleAddCustomItem} className="p-4 sm:p-5 rounded-2xl bg-amber-400/10 border-2 border-dashed border-amber-400/40 space-y-3">
                    <h5 className="font-heading font-black text-xs text-amber-300 flex items-center gap-1.5">
                      <Sparkles size={14} />
                      <span>新增專屬創意抓周道具 (例如：聽診器、名牌包、高爾夫球桿、相機...)</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="物品名稱（如：法拉利車鑰）"
                        className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-amber-400 placeholder-white/30"
                      />
                      <input
                        type="text"
                        value={newItemMeaning}
                        onChange={(e) => setNewItemMeaning(e.target.value)}
                        placeholder="志業象徵（如：頂級超跑賽車手）"
                        className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-amber-400 placeholder-white/30"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newItemDesc}
                          onChange={(e) => setNewItemDesc(e.target.value)}
                          placeholder="寓意說明（如：馳騁賽道奪冠）"
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-amber-400 placeholder-white/30"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-heading font-black text-xs shrink-0 cursor-pointer shadow-md transition-all"
                        >
                          ＋ 加入
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Items Grid (Built-in + Custom) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {allAvailableItems.map((item) => {
                      const isEnabled = activeItemIds.includes(item.id);
                      const isCustom = 'isCustom' in item && item.isCustom;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItem(item.id)}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 relative group ${
                            isEnabled
                              ? 'bg-amber-400/15 border-amber-400/80 text-white font-black shadow-md'
                              : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                          }`}
                        >
                          {item.iconPath ? (
                            <img src={item.iconPath} alt="" className="w-6 h-6 object-contain shrink-0" />
                          ) : (
                            <span className="text-xl shrink-0">{item.symbol || '🎁'}</span>
                          )}
                          <div className="truncate flex-1">
                            <p className="text-xs truncate flex items-center gap-1">
                              <span>{item.name}</span>
                              {isCustom && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 font-bold">
                                  自訂
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-amber-300/80 font-normal truncate">{item.meaning}</p>
                          </div>
                          {isEnabled && <Check size={14} className="ml-auto text-amber-400 shrink-0" />}

                          {isCustom && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomItem(item.id);
                              }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center shadow hover:scale-110 transition-transform"
                              title="刪除此自訂品項"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: CUSTOM PRIZE */}
              {activeTab === 'prize' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Gift className="text-amber-400" size={24} />
                      <div>
                        <h4 className="font-heading font-black text-sm text-white">
                          啟用自訂中獎禮物展示
                        </h4>
                        <p className="text-xs text-white/60">
                          開獎榜單上不再只顯示貼圖，可呈現您為賓客準備的真實好禮！
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={prizeEnabled}
                      onChange={(e) => setPrizeEnabled(e.target.checked)}
                      className="w-5 h-5 accent-amber-400 cursor-pointer rounded"
                    />
                  </div>

                  {prizeEnabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-2">
                          🎁 獎品名稱 / 大獎標題
                        </label>
                        <input
                          type="text"
                          value={prizeTitle}
                          onChange={(e) => setPrizeTitle(e.target.value)}
                          placeholder="例如：星巴克飲料券 2 張 & 星唯專屬純金紀念牌"
                          className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-2">
                          📜 獎品說明 / 獲獎資格
                        </label>
                        <input
                          type="text"
                          value={prizeDesc}
                          onChange={(e) => setPrizeDesc(e.target.value)}
                          placeholder="例如：猜中前 3 項大獎者直接獲得！猜中 2 項獲得星唯精選好禮！"
                          className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/80 mb-2">
                          💬 現場領獎指示備註 (Claimed Note)
                        </label>
                        <input
                          type="text"
                          value={prizeClaimNote}
                          onChange={(e) => setPrizeClaimNote(e.target.value)}
                          placeholder="例如：開獎後請拿著手機得獎畫面，至舞台前向爸媽領取！"
                          className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SHARE & ROOM URLS */}
              {activeTab === 'share' && (
                <div className="space-y-5">
                  <div className="p-5 rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center gap-3">
                    <QrCode size={28} className="text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-heading font-black text-sm text-amber-300">
                        專屬派對即時房間：{roomId}
                      </h4>
                      <p className="text-xs text-white/70">
                        電腦大螢幕投影與親友手機請開啟相同房間代碼，即能自動達成 100% 實時同步！
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Guest Mobile Link */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          📱 賓客手機投票專屬連結 (QR Code 內容)
                        </span>
                        <button
                          onClick={() => copyToClipboard(guestUrl, 'guest')}
                          className="px-3 py-1 rounded-xl bg-amber-400 text-amber-950 font-bold text-xs flex items-center gap-1 hover:bg-amber-300 transition-all"
                        >
                          <Copy size={12} />
                          <span>{copiedType === 'guest' ? '已複製！' : '複製連結'}</span>
                        </button>
                      </div>
                      <p className="font-mono text-xs text-white/80 break-all bg-black/40 p-2.5 rounded-xl">
                        {guestUrl}
                      </p>
                    </div>

                    {/* Big Screen Projector Link */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                          🖥️ 現場電腦/投影機大螢幕專屬連結
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(projectorUrl, 'projector')}
                            className="px-3 py-1 rounded-xl bg-sky-400 text-sky-950 font-bold text-xs flex items-center gap-1 hover:bg-sky-300 transition-all"
                          >
                            <Copy size={12} />
                            <span>{copiedType === 'projector' ? '已複製！' : '複製連結'}</span>
                          </button>
                          <a
                            href={projectorUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                            title="另開投影視窗"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                      <p className="font-mono text-xs text-white/80 break-all bg-black/40 p-2.5 rounded-xl">
                        {projectorUrl}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Action Footer */}
            <div className="p-4 sm:p-5 border-t border-white/10 flex items-center justify-between bg-white/5">
              <span className="text-xs text-white/50 font-cute">
                修改後將透過雲端自動同步給所有連線中的大螢幕與手機 ⚡
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-2xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all"
                >
                  取消
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-heading font-black flex items-center gap-2 shadow-lg hover:shadow-amber-400/20 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save size={16} />
                  <span>{isSaving ? '同步儲存中...' : '儲存並同步至全場 (SAVE)'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
