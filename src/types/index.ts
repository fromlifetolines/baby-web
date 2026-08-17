export type ViewState = 'portal' | 'matrix' | 'dashboard' | 'reveal';

export type AppMode = 'guest' | 'projector' | 'admin';

export type GuessRecord = {
  id?: string;
  name: string;
  selections: string[]; // exactly 3 item IDs
  timestamp: any;
  avatarSeed?: number;
};

export type GameState = {
  isRevealed: boolean;
  actualItems: string[]; // 3 actual picked item IDs
  revealedAt?: number;
  lastResetTimestamp?: number;
};

export type WinnerScore = {
  name: string;
  score: number; // 0, 1, 2, 3 matches
  matchedItemIds: string[];
  rank: 'champion' | 'runner_up' | 'third_place' | 'participant';
};

export type ToastMessage = {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
};
