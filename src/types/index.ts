export type ViewState = 'portal' | 'matrix' | 'dashboard' | 'reveal';

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
  adminPassword?: string;
};

export type WinnerScore = {
  name: string;
  score: number; // 0, 1, 2, 3
  matchedItemIds: string[];
  rank: 'gold' | 'silver' | 'bronze' | 'participant';
};

export type ToastMessage = {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
};
