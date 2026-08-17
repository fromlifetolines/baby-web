import React, { useState, useEffect } from 'react';
import { BackgroundPastel } from './components/BackgroundPastel';
import { PortalView } from './components/PortalView';
import { MatrixView } from './components/MatrixView';
import { DashboardView } from './components/DashboardView';
import { ProjectorView } from './components/ProjectorView';
import { RevealView } from './components/RevealView';
import { AdminPanel } from './components/AdminPanel';
import { BabyStickerRewardModal } from './components/BabyStickerRewardModal';
import { LiquidModal } from './components/LiquidModal';
import { 
  subscribeToGuesses, 
  subscribeToGameState, 
  submitGuessToDb, 
  updateGameStateInDb, 
  resetAllGuessesInDb 
} from './config/firebase';
import { GuessRecord, GameState, ViewState, AppMode } from './types';
import { Settings, Sparkles, Monitor, Home, Heart } from 'lucide-react';

export const App: React.FC = () => {
  // Mode from URL query params
  const [appMode, setAppMode] = useState<AppMode>('guest');
  
  // Navigation & User State
  const [view, setView] = useState<ViewState>('portal');
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('xingwei_current_user_v2') || '';
  });
  const [userSelections, setUserSelections] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('xingwei_user_selections_v2');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

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

    if (viewParam === 'projector') {
      setAppMode('projector');
    }

    if (adminParam === '0819') {
      setAdminPreUnlocked(true);
      setIsAdminOpen(true);
    } else if (adminParam !== null) {
      setIsAdminOpen(true);
    }
  }, []);

  // Restore guest state on reload
  useEffect(() => {
    if (appMode === 'guest') {
      if (userName && userSelections.length === 3) {
        setView('dashboard');
      } else if (userName) {
        setView('matrix');
      }
    }
  }, [appMode]);

  // Subscribe to real-time guesses & gameState
  useEffect(() => {
    const unsubGuesses = subscribeToGuesses((updatedGuesses) => {
      setGuesses(updatedGuesses);
    });

    const unsubGameState = subscribeToGameState((updatedGameState) => {
      setGameState(updatedGameState);
      // CRITICAL SYNC: Instantly transition to Grand Reveal when revealed!
      if (updatedGameState.isRevealed) {
        setView('reveal');
      }
    });

    return () => {
      if (unsubGuesses) unsubGuesses();
      if (unsubGameState) unsubGameState();
    };
  }, []);

  // Handler: Enter Portal
  const handleEnterPortal = (name: string) => {
    setUserName(name);
    localStorage.setItem('xingwei_current_user_v2', name);
    setView('matrix');
  };

  // Handler: Submit Selections
  const handleSubmitSelections = async (selections: string[]) => {
    try {
      setUserSelections(selections);
      localStorage.setItem('xingwei_user_selections_v2', JSON.stringify(selections));
      await submitGuessToDb(userName, selections);
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
    await updateGameStateInDb({
      isRevealed: true,
      actualItems,
    });
  };

  // Handler: Admin Reset Game
  const handleResetGame = async () => {
    await updateGameStateInDb({
      isRevealed: false,
    });
    await resetAllGuessesInDb();
    if (appMode === 'guest') {
      setView(userName ? (userSelections.length === 3 ? 'dashboard' : 'matrix') : 'portal');
    }
  };

  return (
    <div className="relative min-h-screen text-brown-text overflow-x-hidden font-body select-none">
      {/* Background Soft Pastel Blobs & Sparkles */}
      <BackgroundPastel />

      {/* Top Navbar */}
      <header className="relative z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-blush-200/80 bg-white/70 backdrop-blur-md">
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
            <span className="font-heading text-lg sm:text-xl font-black text-brown-text block leading-none">
              星唯 1 歲生日抓周
            </span>
            <span className="text-[11px] text-pastel-rose font-cute font-bold tracking-wider uppercase">
              Xing-Wei's 1st Birthday
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {appMode === 'projector' ? (
            <button
              onClick={() => setAppMode('guest')}
              className="px-3.5 py-2 rounded-2xl liquid-glass text-xs font-cute font-bold text-brown-text hover:border-pastel-coral flex items-center gap-1.5 shadow-sm"
            >
              <Home size={14} className="text-pastel-coral" />
              <span>切換回賓客預測</span>
            </button>
          ) : (
            <button
              onClick={() => setAppMode('projector')}
              className="px-3.5 py-2 rounded-2xl liquid-glass text-xs font-cute font-bold text-brown-text hover:border-pastel-coral hidden sm:flex items-center gap-1.5 shadow-sm"
            >
              <Monitor size={14} className="text-pastel-rose" />
              <span>大螢幕投影</span>
            </button>
          )}

          <button
            onClick={() => setIsStickerModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl liquid-glass text-xs font-cute font-bold text-brown-text hover:border-pastel-coral hidden sm:flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles size={14} className="text-pastel-coral" />
            <span>限定貼圖</span>
          </button>

          {/* Admin Lock Button */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="p-2.5 rounded-2xl liquid-glass text-brown-muted hover:text-pastel-coral hover:border-pastel-coral transition-all shadow-sm"
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
          />
        ) : appMode === 'projector' ? (
          <ProjectorView
            guesses={guesses}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />
        ) : (
          <>
            {view === 'portal' && (
              <PortalView
                onEnter={handleEnterPortal}
                onOpenStickerModal={() => setIsStickerModalOpen(true)}
              />
            )}

            {view === 'matrix' && (
              <MatrixView
                userName={userName}
                onSubmitSelections={handleSubmitSelections}
                onBackToPortal={() => setView('portal')}
                onOpenStickerModal={() => setIsStickerModalOpen(true)}
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
        initialUnlocked={adminPreUnlocked}
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
    </div>
  );
};
export default App;
