import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { GuessRecord, GameState, PartyConfig } from '../types';
import { ZHUAZHOU_ITEMS, BABY_AVATAR_IMG } from './itemsData';

const firebaseConfig = {
  apiKey: "AIzaSyBXWqyZHgPDiqALhAPTdNczl-EX6HYmW_Y",
  authDomain: "baby-web-1a142.firebaseapp.com",
  projectId: "baby-web-1a142",
  storageBucket: "baby-web-1a142.firebasestorage.app",
  messagingSenderId: "145285982614",
  appId: "1:145285982614:web:c88888c5ee9d34639895b7"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Default Party Config Template
export const DEFAULT_PARTY_CONFIG: PartyConfig = {
  roomId: 'xingwei',
  babyName: '星唯',
  subtitle: '請親朋好友精準預測星唯即將抓取的前 3 項志業，見證璀璨未來！',
  babyBirthday: '2025-08-19',
  babyAvatar: BABY_AVATAR_IMG,
  themeColor: 'gold-dark',
  activeItemIds: ZHUAZHOU_ITEMS.map((item) => item.id), // All 22 items active by default
  prize: {
    enabled: true,
    title: '星唯專屬 LINE 貼圖包 & 精美神祕好禮',
    description: '預測成功猜中前 3 項的貴賓，可獲得專屬大獎！',
    imageUrl: BABY_AVATAR_IMG,
    claimedNote: '活動結束後請憑手機獲獎畫面，向現場爸媽領取禮品！',
  },
};

// Cross-tab broadcast channel factory per room
const broadcastChannels: Record<string, BroadcastChannel> = {};
const getBroadcast = (roomId: string) => {
  if (typeof window === 'undefined') return null;
  const channelName = `babyweb_sync_${roomId}`;
  if (!broadcastChannels[channelName]) {
    try {
      broadcastChannels[channelName] = new BroadcastChannel(channelName);
    } catch {
      return null;
    }
  }
  return broadcastChannels[channelName];
};

// LocalStorage key helpers
const getGuessesKey = (roomId: string) => `babyweb_guesses_${roomId}`;
const getGameStateKey = (roomId: string) => `babyweb_game_${roomId}`;
const getConfigKey = (roomId: string) => `babyweb_config_${roomId}`;

export const getStoredConfig = (roomId: string = 'xingwei'): PartyConfig => {
  try {
    const raw = localStorage.getItem(getConfigKey(roomId));
    if (raw) {
      return { ...DEFAULT_PARTY_CONFIG, ...JSON.parse(raw), roomId };
    }
  } catch (e) {
    console.warn("Error reading stored config:", e);
  }
  return { ...DEFAULT_PARTY_CONFIG, roomId };
};

export const getStoredGuesses = (roomId: string = 'xingwei'): GuessRecord[] => {
  try {
    const raw = localStorage.getItem(getGuessesKey(roomId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const getStoredGameState = (roomId: string = 'xingwei'): GameState => {
  try {
    const raw = localStorage.getItem(getGameStateKey(roomId));
    if (!raw) {
      const initial: GameState = {
        isRevealed: false,
        actualItems: ['item_09', 'item_16', 'item_01'],
        roomId,
      };
      localStorage.setItem(getGameStateKey(roomId), JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return { isRevealed: false, actualItems: ['item_09', 'item_16', 'item_01'], roomId };
  }
};

// -------------------------------------------------------------
// API: Party Config Sync (Real-time Customization)
// -------------------------------------------------------------
export const subscribeToPartyConfig = (
  roomId: string = 'xingwei',
  callback: (config: PartyConfig) => void
) => {
  let isUnmounted = false;
  const broadcast = getBroadcast(roomId);

  try {
    const docRef = doc(db, 'rooms', roomId, 'settings', 'config');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (isUnmounted) return;
      if (docSnap.exists()) {
        const data = docSnap.data() as PartyConfig;
        const merged: PartyConfig = { ...DEFAULT_PARTY_CONFIG, ...data, roomId };
        callback(merged);
        localStorage.setItem(getConfigKey(roomId), JSON.stringify(merged));
      } else {
        const initial = getStoredConfig(roomId);
        callback(initial);
      }
    }, (err) => {
      console.warn("PartyConfig onSnapshot fallback to local:", err);
      callback(getStoredConfig(roomId));
    });

    const handleMessage = (event: MessageEvent) => {
      if (isUnmounted) return;
      if (event.data?.type === 'CONFIG_UPDATE' && event.data?.payload?.roomId === roomId) {
        callback(event.data.payload);
      }
    };

    if (broadcast) broadcast.addEventListener('message', handleMessage);

    return () => {
      isUnmounted = true;
      unsubscribe();
      if (broadcast) broadcast.removeEventListener('message', handleMessage);
    };
  } catch (e) {
    console.error("Config listener setup error:", e);
    callback(getStoredConfig(roomId));
    return () => {};
  }
};

export const updatePartyConfigInDb = async (
  roomId: string,
  newConfig: Partial<PartyConfig>
): Promise<void> => {
  const current = getStoredConfig(roomId);
  const merged: PartyConfig = {
    ...current,
    ...newConfig,
    roomId,
    updatedAt: Date.now(),
  };

  try {
    await setDoc(doc(db, 'rooms', roomId, 'settings', 'config'), merged, { merge: true });
  } catch (e) {
    console.error("Firestore config update error:", e);
  }

  localStorage.setItem(getConfigKey(roomId), JSON.stringify(merged));
  const broadcast = getBroadcast(roomId);
  if (broadcast) {
    broadcast.postMessage({ type: 'CONFIG_UPDATE', payload: merged });
  }
};

// -------------------------------------------------------------
// API: Submit Guess to Firestore (Room Isolated)
// -------------------------------------------------------------
export const submitGuessToDb = async (
  name: string, 
  selections: string[],
  roomId: string = 'xingwei'
): Promise<void> => {
  try {
    // Write into subcollection: rooms/{roomId}/guesses
    await addDoc(collection(db, 'rooms', roomId, 'guesses'), {
      name,
      selections,
      timestamp: serverTimestamp(),
      createdAt: Date.now(),
      roomId,
    });
  } catch (err) {
    console.error("Firestore write error, falling back locally:", err);
    const newGuess: GuessRecord = {
      id: 'local_' + Date.now(),
      name,
      selections,
      timestamp: Date.now(),
      roomId,
    };
    const current = getStoredGuesses(roomId);
    const updated = [newGuess, ...current];
    localStorage.setItem(getGuessesKey(roomId), JSON.stringify(updated));
    const broadcast = getBroadcast(roomId);
    if (broadcast) {
      broadcast.postMessage({ type: 'NEW_GUESS', payload: newGuess });
    }
  }
};

// -------------------------------------------------------------
// API: Real-Time Listen to Guesses (Room Isolated)
// -------------------------------------------------------------
export const subscribeToGuesses = (
  roomId: string = 'xingwei',
  callback: (guesses: GuessRecord[]) => void
) => {
  let isUnmounted = false;
  const broadcast = getBroadcast(roomId);

  try {
    const q = query(collection(db, 'rooms', roomId, 'guesses'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isUnmounted) return;
      const list: GuessRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || '',
          selections: data.selections || [],
          timestamp: data.timestamp?.toDate?.()?.getTime() || data.createdAt || Date.now(),
          roomId,
        });
      });
      callback(list);
      localStorage.setItem(getGuessesKey(roomId), JSON.stringify(list));
    }, (err) => {
      console.warn("Firestore guesses onSnapshot fallback:", err);
      callback(getStoredGuesses(roomId));
    });

    const handleMessage = (event: MessageEvent) => {
      if (isUnmounted) return;
      if (event.data?.type === 'NEW_GUESS' || event.data?.type === 'RESET_GUESSES') {
        callback(getStoredGuesses(roomId));
      }
    };

    if (broadcast) broadcast.addEventListener('message', handleMessage);

    return () => {
      isUnmounted = true;
      unsubscribe();
      if (broadcast) broadcast.removeEventListener('message', handleMessage);
    };
  } catch (e) {
    console.error("Firestore setup error:", e);
    callback(getStoredGuesses(roomId));
    return () => {};
  }
};

// -------------------------------------------------------------
// API: Real-Time Listen to Game State (Reveal trigger)
// -------------------------------------------------------------
export const subscribeToGameState = (
  roomId: string = 'xingwei',
  callback: (state: GameState) => void
) => {
  let isUnmounted = false;
  const broadcast = getBroadcast(roomId);

  try {
    const docRef = doc(db, 'rooms', roomId, 'gameState', 'current');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (isUnmounted) return;
      if (docSnap.exists()) {
        const data = docSnap.data() as GameState;
        callback({ ...data, roomId });
        localStorage.setItem(getGameStateKey(roomId), JSON.stringify(data));
      } else {
        const initial = getStoredGameState(roomId);
        callback(initial);
      }
    }, (err) => {
      console.warn("GameState onSnapshot fallback:", err);
      callback(getStoredGameState(roomId));
    });

    const handleMessage = (event: MessageEvent) => {
      if (isUnmounted) return;
      if (event.data?.type === 'GAME_STATE_UPDATE') {
        callback(event.data.payload);
      }
    };

    if (broadcast) broadcast.addEventListener('message', handleMessage);

    return () => {
      isUnmounted = true;
      unsubscribe();
      if (broadcast) broadcast.removeEventListener('message', handleMessage);
    };
  } catch (e) {
    console.error("GameState listener setup error:", e);
    callback(getStoredGameState(roomId));
    return () => {};
  }
};

// -------------------------------------------------------------
// API: Admin Trigger Reveal
// -------------------------------------------------------------
export const updateGameStateInDb = async (
  roomId: string = 'xingwei',
  state: Partial<GameState>
): Promise<void> => {
  const current = getStoredGameState(roomId);
  const merged: GameState = {
    ...current,
    ...state,
    roomId,
    revealedAt: state.isRevealed ? Date.now() : undefined,
  };

  try {
    await setDoc(doc(db, 'rooms', roomId, 'gameState', 'current'), merged, { merge: true });
  } catch (e) {
    console.error("Firestore gameState update error:", e);
  }

  localStorage.setItem(getGameStateKey(roomId), JSON.stringify(merged));
  const broadcast = getBroadcast(roomId);
  if (broadcast) {
    broadcast.postMessage({ type: 'GAME_STATE_UPDATE', payload: merged });
  }
};

// -------------------------------------------------------------
// API: Reset and Clean Slate - Batch delete all guesses & reset state
// -------------------------------------------------------------
export const resetAllGuessesInDb = async (roomId: string = 'xingwei'): Promise<void> => {
  const resetTime = Date.now();
  try {
    const snap = await getDocs(collection(db, 'rooms', roomId, 'guesses'));
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach((document) => {
        batch.delete(document.ref);
      });
      await batch.commit();
    }

    await setDoc(doc(db, 'rooms', roomId, 'gameState', 'current'), {
      isRevealed: false,
      actualItems: ['item_09', 'item_16', 'item_01'],
      lastResetTimestamp: resetTime,
      roomId,
    });
  } catch (e) {
    console.error("Firestore batch delete error:", e);
  }

  // Purge all guest session and local keys for this room
  try {
    localStorage.removeItem(`guest_user_${roomId}`);
    localStorage.removeItem(`guest_selections_${roomId}`);
    localStorage.setItem(getGuessesKey(roomId), JSON.stringify([]));
    localStorage.setItem(getGameStateKey(roomId), JSON.stringify({
      isRevealed: false,
      actualItems: ['item_09', 'item_16', 'item_01'],
      lastResetTimestamp: resetTime,
      roomId,
    }));
    localStorage.setItem(`last_reset_ack_${roomId}`, String(resetTime));
  } catch (e) {
    console.error("LocalStorage clear error:", e);
  }

  const broadcast = getBroadcast(roomId);
  if (broadcast) {
    broadcast.postMessage({ type: 'RESET_GUESSES', all: [], lastResetTimestamp: resetTime, roomId });
    broadcast.postMessage({ 
      type: 'GAME_STATE_UPDATE', 
      payload: { 
        isRevealed: false, 
        actualItems: ['item_09', 'item_16', 'item_01'],
        lastResetTimestamp: resetTime,
        roomId
      } 
    });
  }
};
