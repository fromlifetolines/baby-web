import React, { useState, useEffect } from 'react';
import { BackgroundCosmos } from './components/BackgroundCosmos';
import { PortalView } from './components/PortalView';
import { MatrixView } from './components/MatrixView';
import { DashboardView } from './components/DashboardView';
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
import { GuessRecord, GameState, ViewState } from './types';
import { Settings, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation & User State
  const [view, setView] = useState<ViewState>('portal');
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('xingwei_current_user') || '';
  });
  const [userSelections, setUserSelections] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('xingwei_user_selections');
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

  // Check URL query parameters for ?admin=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdminOpen(true);
    }
  }, []);

  // Restore user session if already entered
  useEffect(() => {
    if (userName && userSelections.length === 3) {
      setView('dashboard');
    } else if (userName) {
      setView('matrix');
    }
  }, []);

  // Subscribe to real-time guesses & gameState
  useEffect(() => {
    const unsubGuesses = subscribeToGuesses((updatedGuesses) => {
      setGuesses(updatedGuesses);
    });

    const unsubGameState = subscribeToGameState((updatedGameState) => {
      setGameState(updatedGameState);
      // Auto transition all clients to reveal view when revealed
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
    localStorage.setItem('xingwei_current_user', name);
    setView('matrix');
  };

  // Handler: Submit Selections
  const handleSubmitSelections = async (selections: string[]) => {
    try {
      setUserSelections(selections);
      localStorage.setItem('xingwei_user_selections', JSON.stringify(selections));
      await submitGuessToDb(userName, selections);
      setView('dashboard');
      setAlertModal({
        isOpen: true,
        title: 'PREDICTION RECORDED',
        message: `太棒了！${userName}，您的 3 項抓周志業預測已成功寫入即時協定！`,
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
    setView(userName ? (userSelections.length === 3 ? 'dashboard' : 'matrix') : 'portal');
  };

  return (
    <div className="relative min-h-screen text-cream overflow-x-hidden font-body select-none">
      {/* Dynamic Cosmic Deep Space Background */}
      <BackgroundCosmos />

      {/* Top Navbar */}
      <header className="relative z-30 px-4 sm:px-8 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div 
          onClick={() => setView('portal')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-neon/10 border border-neon/40 flex items-center justify-center text-neon group-hover:scale-105 transition-transform">
            <span className="font-anton text-lg">1</span>
          </div>
          <div>
            <span className="font-anton text-lg sm:text-xl tracking-wider text-cream block uppercase leading-none">
              XING-WEI 1ST B-DAY
            </span>
            <span className="font-mono text-[10px] text-neon tracking-widest uppercase">
              ZHUAZHOU PROTOCOL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsStickerModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl liquid-glass text-xs font-mono text-cream hover:border-neon transition-colors hidden sm:flex items-center gap-1.5"
          >
            <Sparkles size={13} className="text-neon" />
            <span>貼圖大賞</span>
          </button>

          {/* Admin Lock Button */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="p-2 rounded-xl liquid-glass text-cream-muted hover:text-neon hover:border-neon transition-all"
            title="主持人控制中樞 (Admin Panel)"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main View Router */}
      <main className="relative z-10">
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
          />
        )}

        {view === 'reveal' && (
          <RevealView
            gameState={gameState}
            guesses={guesses}
            currentUser={userName}
            onOpenStickerModal={() => setIsStickerModalOpen(true)}
            onResetGame={handleResetGame}
          />
        )}
      </main>

      {/* Modals */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        gameState={gameState}
        onTriggerReveal={handleTriggerReveal}
        onResetGame={handleResetGame}
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
