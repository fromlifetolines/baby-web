export type ViewState = 'landing' | 'agency' | 'portal' | 'matrix' | 'dashboard' | 'reveal';

export type AppMode = 'guest' | 'projector' | 'admin' | 'landing' | 'agency';

export type ThemeStyle = 'gold-dark' | 'blush-pink' | 'baby-blue' | 'warm-cream';

export interface CustomPrizeConfig {
  enabled: boolean;
  title: string;
  description: string;
  imageUrl?: string;
  claimedNote?: string;
}

export interface CustomZhuazhouItem {
  id: string;
  name: string;
  meaning: string;
  iconPath?: string;
  symbol: string;
  category: string;
  desc: string;
  isCustom?: boolean;
}

export interface PartyConfig {
  roomId: string;
  babyName: string;
  subtitle: string;
  babyBirthday?: string;
  babyAvatar: string;
  themeColor: ThemeStyle;
  activeItemIds: string[]; // List of active item IDs
  customItems?: CustomZhuazhouItem[]; // User-added custom items
  prize: CustomPrizeConfig;
  updatedAt?: number;
}

export type GuessRecord = {
  id?: string;
  name: string;
  selections: string[]; // exactly 3 item IDs
  timestamp: any;
  avatarSeed?: number;
  roomId?: string;
};

export type GameState = {
  isRevealed: boolean;
  actualItems: string[]; // 3 actual picked item IDs
  revealedAt?: number;
  lastResetTimestamp?: number;
  roomId?: string;
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
