import React, { useState, useEffect } from 'react';
import { BackgroundPastel } from './components/BackgroundPastel';
import { PortalView } from './components/PortalView';
import { MatrixView } from './components/MatrixView';
import { DashboardView } from './components/DashboardView';
import { ProjectorView } from './components/ProjectorView';
import { RevealView } from './components/RevealView';
import { AdminPanel } from './components/AdminPanel';
import { PartyCustomizerModal } from './components/PartyCustomizerModal';
import { BabyStickerRewardModal } from './components/BabyStickerRewardModal';
import { LiquidModal } from './components/LiquidModal';
import { LandingPageView } from './components/LandingPageView';
import { AgencyDashboardView } from './components/AgencyDashboardView';
import { CustomerSupportWidget } from './components/CustomerSupportWidget';
import { 
  subscribeToGuesses, 
  subscribeToGameState, 
  subscribeToPartyConfig,
  submitGuessToDb, 
  updateGameStateInDb, 
  updatePartyConfigInDb,
  resetAllGuessesInDb,
  DEFAULT_PARTY_CONFIG
} from './config/firebase';
import { GuessRecord, GameState, ViewState, AppMode, PartyConfig } from './types';
import { Settings, Sparkles, Monitor, Home, Heart, Sliders, Globe } from 'lucide-react';

export const App: React.FC = () => {
  // Mode & Room from URL query params
  const [appMode, setAppMode] = useState<AppMode>('guest');
  const [currentRoomId, setCurrentRoomId] = useState<string>('xingwei');
  
  // Dynamic Party Config
  const [partyConfig, setPartyConfig] = useState<PartyConfig>(DEFAULT_PARTY_CONFIG);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Navigation & User State
  const [view, setView] = useState<ViewState>('portal');
  const [userName, setUserName] = useState<string>('');
  const [userSelections, setUserSelections] = useState<string[]>([]);

  // Real-time Data
  const [guesses, setGuesses] = useState<GuessRecord[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    isRevealed: false,
    actualItems: ['item_09', 'item_16', 'item_01'],
  });

  // Modals & Panels
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPreUnlocked, setAdminPreUnlocked] = useState(false);
  const [isStickerModalOpen, setIsStickerModalOpen] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'error' | 'warning' | 'success' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  // Read URL parameters for View Routing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const adminParam = params.get('admin');
    const roomParam = params.get('room');
    const agencyParam = params.get('agency');

    // If explicit agency view requested
    if (agencyParam !== null) {
      setAppMode('agency');
      setView('agency');
      return;
    }

    // If no room is specified in URL and no projector view -> show official SaaS Landing Page
    if (!roomParam && !viewParam && adminParam === null) {
      setAppMode('landing');
      setView('landing');
      return;
    }

    const activeRoom = roomParam ? roomParam.trim().toLowerCase() : 'xingwei';
    setCurrentRoomId(activeRoom);

    // Initialize user session from room-scoped storage
    const storedUser = localStorage.getItem(`guest_user_${activeRoom}`) || '';
    setUserName(storedUser);

    try {
      const storedSelections = localStorage.getItem(`guest_selections_${activeRoom}`);
      setUserSelections(storedSelections ? JSON.parse(storedSelections) : []);
    } catch {
      setUserSelections([]);
    }

    if (viewParam === 'projector') {
      setAppMode('projector');
    } else {
      setAppMode('guest');
    }

    if (adminParam === '0819') {
      setAdminPreUnlocked(true);
      setIsAdminOpen(true);
    } else if (adminParam !== null) {
      setIsAdminOpen(true);
    }
  }, []);

  // Helper to force purge local guest session
  const purgeClientSession = () => {
    try {
      localStorage.removeItem(`guest_user_${currentRoomId}`);
      localStorage.removeItem(`guest_selections_${currentRoomId}`);
      localStorage.removeItem('xingwei_current_user_v2');
      localStorage.removeItem('xingwei_user_selections_v2');
      localStorage.removeItem('hasVoted');
      localStorage.removeItem('guestName');
      localStorage.removeItem('xingwei_user_selections_live');
    } catch (e) {
      console.error(e);
    }
    setUserName('');
    setUserSelections([]);
    if (appMode === 'guest') {
      setView('portal');
    }
  };

  // Restore guest state on reload
  useEffect(() => {
    if (appMode === 'guest') {
      if (userName && userSelections.length === 3) {
        setView('dashboard');
      } else if (userName) {
        setView('matrix');
      } else {
        setView('portal');
      }
    }
  }, [appMode, userName, userSelections]);

  // Subscribe to real-time partyConfig, guesses & gameState with reactive reset handling
  useEffect(() => {
    const unsubConfig = subscribeToPartyConfig(currentRoomId, (updatedConfig) => {
      setPartyConfig(updatedConfig);
    });

    const unsubGuesses = subscribeToGuesses(currentRoomId, (updatedGuesses) => {
      setGuesses(updatedGuesses);
    });

    const unsubGameState = subscribeToGameState(currentRoomId, (updatedGameState) => {
      setGameState(updatedGameState);

      // Reactive Reset Handling via lastResetTimestamp
      if (updatedGameState.lastResetTimestamp) {
        const localAck = Number(localStorage.getItem(`last_reset_ack_${currentRoomId}`) || 0);
        if (updatedGameState.lastResetTimestamp > localAck) {
          localStorage.setItem(`last_reset_ack_${currentRoomId}`, String(updatedGameState.lastResetTimestamp));
          purgeClientSession();
          return;
        }
      }

      // CRITICAL SYNC: Instantly transition to Grand Reveal when revealed!
      if (updatedGameState.isRevealed) {
        setView('reveal');
      } else if (view === 'reveal') {
        if (appMode === 'guest') {
          setView(userName ? (userSelections.length === 3 ? 'dashboard' : 'matrix') : 'portal');
        }
      }
    });

    return () => {
      if (unsubConfig) unsubConfig();
      if (unsubGuesses) unsubGuesses();
      if (unsubGameState) unsubGameState();
    };
  }, [currentRoomId, userName, userSelections, appMode, view]);

  // Handler: Enter Portal
  const handleEnterPortal = (name: string) => {
    setUserName(name);
    localStorage.setItem(`guest_user_${currentRoomId}`, name);
    setView('matrix');
  };

  // Handler: Submit Selections
  const handleSubmitSelections = async (selections: string[]) => {
    try {
      setUserSelections(selections);
      localStorage.setItem(`guest_selections_${currentRoomId}`, JSON.stringify(selections));
      await submitGuessToDb(userName, selections, currentRoomId);
      setView('dashboard');
      setAlertModal({
        isOpen: true,
        title: '預測成功送出！ 🎀',
        message: `太棒了！${userName}，您的 3 項抓周預測已成功寫入大典紀錄，請稍候舞台開獎！`,
        type: 'success',
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Admin Trigger Reveal
  const handleTriggerReveal = async (actualItems: string[]) => {
    await updateGameStateInDb(currentRoomId, {
      isRevealed: true,
      actualItems,
    });
  };

  // Handler: Admin Reset Game State Only
  const handleResetGame = async () => {
    await updateGameStateInDb(currentRoomId, {
      isRevealed: false,
    });
    if (appMode === 'guest') {
      setView(userName ? (userSelections.length === 3 ? 'dashboard' : 'matrix') : 'portal');
    }
  };

  // Handler: Admin Reset All Data (Clean Slate & Global Purge)
  const handleResetAllData = async () => {
    await resetAllGuessesInDb(currentRoomId);
    setGuesses([]);
    purgeClientSession();
  };

  // Handler: Save Party Customizer
  const handleSaveConfig = async (newConfig: Partial<PartyConfig>) => {
    await updatePartyConfigInDb(currentRoomId, newConfig);
    setPartyConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const isRevealActive = gameState.isRevealed || view === 'reveal';
  const babyName = partyConfig.babyName || '星唯';
  const themeColor = partyConfig.themeColor || 'gold-dark';

  // Theme text styling helper for main frame
  const themeClass = isRevealActive 
    ? 'bg-[#0a0012] text-white' 
    : themeColor === 'gold-dark'
    ? 'bg-[#0A0503] text-amber-100'
    : themeColor === 'blush-pink'
    ? 'bg-[#FFF5F7] text-brown-text'
    : themeColor === 'baby-blue'
    ? 'bg-[#F0F9FF] text-slate-800'
    : 'bg-[#FAF7F2] text-[#4A3B32]';

  // If in Landing Mode -> Render Landing Page with Customer Support
  if (view === 'landing' || appMode === 'landing') {
    return (
      <div className="relative min-h-screen bg-[#07050a] text-white">
        <LandingPageView
          onEnterDemoRoom={(roomId) => {
            const url = new URL(window.location.href);
            url.searchParams.set('room', roomId);
            url.searchParams.delete('agency');
            window.location.href = url.toString();
          }}
          onOpenAgencyPortal={() => {
            const url = new URL(window.location.href);
            url.searchParams.set('agency', 'true');
            window.location.href = url.toString();
          }}
        />
        <CustomerSupportWidget />
      </div>
    );
  }

  // If in Agency Portal Mode -> Render Agency Multi-Room Management Hub
  if (view === 'agency' || appMode === 'agency') {
    return (
      <div className="relative min-h-screen bg-[#0A0714] text-white">
        <AgencyDashboardView
          onBackToLanding={() => {
            const url = new URL(window.location.href);
            url.searchParams.delete('agency');
            url.searchParams.delete('room');
            window.location.href = url.pathname;
          }}
        />
        <CustomerSupportWidget />
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen ${themeClass} overflow-x-hidden font-body select-none transition-colors duration-700`}>
      {/* Dynamic Background with Atmospheric Theme Blobs & Sparkles */}
      {!isRevealActive && <BackgroundPastel theme={themeColor} />}

      {/* Top Navbar */}
      <header className={`relative z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between border-b ${
        isRevealActive
          ? 'border-amber-400/25 bg-black/60 backdrop-blur-xl text-white'
          : 'border-blush-200/80 bg-white/70 backdrop-blur-md'
      }`}>
        <div 
          onClick={() => {
            if (appMode === 'projector') {
              setAppMode('guest');
              setView('portal');
            } else {
              setView('portal');
            }
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pastel-coral to-pastel-pink flex items-center justify-center text-white font-heading font-black text-xl shadow-md group-hover:scale-105 transition-transform">
            1
          </div>
          <div>
            <span className={`font-heading text-lg sm:text-xl font-black ${isRevealActive ? 'text-amber-300' : 'text-brown-text'} block leading-none`}>
              {babyName} 1 歲生日抓周
            </span>
            <span className={`text-[11px] ${isRevealActive ? 'text-amber-200/80' : 'text-pastel-rose'} font-cute font-bold tracking-wider uppercase`}>
              {partyConfig.roomId || currentRoomId} · 抓周大典
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Back to Official Portal / Landing link */}
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.search = '';
              window.location.href = url.pathname;
            }}
            className={`px-3 py-2 rounded-2xl ${
              isRevealActive ? 'bg-white/10 text-white/70 hover:text-white' : 'liquid-glass text-brown-muted hover:text-brown-text'
            } text-xs font-cute font-bold hidden md:flex items-center gap-1.5 shadow-sm cursor-pointer`}
            title="回到官網首頁"
          >
            <Globe size={14} />
            <span>官網首頁</span>
          </button>

          {appMode === 'projector' ? (
            <button
              onClick={() => setAppMode('guest')}
              className={`px-3.5 py-2 rounded-2xl ${
                isRevealActive ? 'bg-white/15 text-white border border-white/20' : 'liquid-glass text-brown-text'
              } text-xs font-cute font-bold hover:border-pastel-coral flex items-center gap-1.5 shadow-sm cursor-pointer`}
            >
              <Home size={14} className={isRevealActive ? 'text-amber-300' : 'text-pastel-coral'} />
              <span>切換回賓客預測</span>
            </button>
          ) : (
            <button
              onClick={() => setAppMode('projector')}
              className={`px-3.5 py-2 rounded-2xl ${
                isRevealActive ? 'bg-white/15 text-white border border-white/20' : 'liquid-glass text-brown-text'
              } text-xs font-cute font-bold hover:border-pastel-coral hidden sm:flex items-center gap-1.5 shadow-sm cursor-pointer`}
            >
              <Monitor size={14} className={isRevealActive ? 'text-amber-300' : 'text-pastel-rose'} />
              <span>大螢幕投影</span>
            </button>
          )}

          {/* Quick Customizer Studio Button */}
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className={`px-3.5 py-2 rounded-2xl ${
              isRevealActive ? 'bg-amber-400 text-amber-950 font-black' : 'bg-amber-100/90 text-amber-950 font-bold border border-amber-300'
            } text-xs font-heading flex items-center gap-1.5 shadow-sm hover:scale-105 transition-all cursor-pointer`}
            title="開啟派對客製化設定"
          >
            <Sliders size={14} />
            <span>派對客製</span>
          </button>

          <button
            onClick={() => setIsStickerModalOpen(true)}
            className={`px-3.5 py-2 rounded-2xl ${
              isRevealActive ? 'bg-white/15 text-white border border-white/20' : 'liquid-glass text-brown-text'
            } text-xs font-cute font-bold hover:border-pastel-coral hidden sm:flex items-center gap-1.5 shadow-sm cursor-pointer`}
          >
            <Sparkles size={14} className={isRevealActive ? 'text-amber-300' : 'text-pastel-coral'} />
            <span>限定貼圖</span>
          </button>

          {/* Admin Lock Button */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className={`p-2.5 rounded-2xl ${
              isRevealActive ? 'bg-white/15 text-amber-300 border border-white/20' : 'liquid-glass text-brown-muted hover:text-pastel-coral'
            } hover:border-pastel-coral transition-all shadow-sm cursor-pointer`}
            title="主持人後台 (Admin Panel)"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Router */}
      <main className="relative z-10">
        {/* If Game is Revealed -> BOTH Guest & Projector view show the Grand Reveal */}
        {gameState.isRevealed || view === 'reveal' ? (
          <RevealView
            gameState={gameState}
            guesses={guesses}
            currentUser={userName}
            onOpenStickerModal={() => setIsStickerModalOpen(true)}
            onResetGame={handleResetGame}
            partyConfig={partyConfig}
          />
        ) : appMode === 'projector' ? (
          <ProjectorView
            guesses={guesses}
            onOpenAdmin={() => setIsAdminOpen(true)}
            partyConfig={partyConfig}
          />
        ) : (
          <>
            {view === 'portal' && (
              <PortalView
                onEnter={handleEnterPortal}
                onOpenStickerModal={() => setIsStickerModalOpen(true)}
                partyConfig={partyConfig}
              />
            )}

            {view === 'matrix' && (
              <MatrixView
                userName={userName}
                onSubmitSelections={handleSubmitSelections}
                onBackToPortal={() => setView('portal')}
                onOpenStickerModal={() => setIsStickerModalOpen(true)}
                partyConfig={partyConfig}
              />
            )}

            {view === 'dashboard' && (
              <DashboardView
                currentUser={userName}
                userSelections={userSelections}
                guesses={guesses}
                onOpenStickerModal={() => setIsStickerModalOpen(true)}
                onOpenAdmin={() => setIsAdminOpen(true)}
                onSwitchToProjector={() => setAppMode('projector')}
                partyConfig={partyConfig}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        gameState={gameState}
        onTriggerReveal={handleTriggerReveal}
        onResetGame={handleResetGame}
        onResetAllData={handleResetAllData}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        initialUnlocked={adminPreUnlocked}
        partyConfig={partyConfig}
      />

      <PartyCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={partyConfig}
        onSaveConfig={handleSaveConfig}
      />

      <BabyStickerRewardModal
        isOpen={isStickerModalOpen}
        onClose={() => setIsStickerModalOpen(false)}
      />

      <LiquidModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      {/* Floating 24/7 Automated Support & FAQ Widget */}
      <CustomerSupportWidget />
    </div>
  );
};
export default App;
