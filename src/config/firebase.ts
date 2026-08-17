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
  limit 
} from 'firebase/firestore';
import { GuessRecord, GameState } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoDummyKey-ZhuazhouApp2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "xing-wei-zhuazhou.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "xing-wei-zhuazhou",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "xing-wei-zhuazhou.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

let db: any = null;
let isFirebaseReady = false;

try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    db = getFirestore(app);
    isFirebaseReady = true;
  }
} catch (e) {
  console.warn("Firebase fallback to real-time BroadcastChannel & storage sync engine:", e);
}

const broadcast = typeof window !== 'undefined' ? new BroadcastChannel('xingwei_boutique_realtime_protocol') : null;

// Initial authentic party guests
const DEFAULT_GUESTS: GuessRecord[] = [
  { id: 'g_1', name: '舅舅 Howard', selections: ['item_09', 'item_16', 'item_01'], timestamp: Date.now() - 1000 * 60 * 20, avatarSeed: 1 },
  { id: 'g_2', name: '阿嬤 (Grandma)', selections: ['item_09', 'item_15', 'item_04'], timestamp: Date.now() - 1000 * 60 * 15, avatarSeed: 2 },
  { id: 'g_3', name: '阿公 (Grandpa)', selections: ['item_11', 'item_10', 'item_06'], timestamp: Date.now() - 1000 * 60 * 12, avatarSeed: 3 },
  { id: 'g_4', name: '姑姑 Emily', selections: ['item_01', 'item_08', 'item_02'], timestamp: Date.now() - 1000 * 60 * 10, avatarSeed: 4 },
  { id: 'g_5', name: '乾爹 Ken', selections: ['item_16', 'item_03', 'item_05'], timestamp: Date.now() - 1000 * 60 * 6, avatarSeed: 5 },
  { id: 'g_6', name: '姨婆 May', selections: ['item_04', 'item_09', 'item_13'], timestamp: Date.now() - 1000 * 60 * 3, avatarSeed: 6 },
];

const LOCAL_STORAGE_KEY_GUESSES = 'xingwei_zhuazhou_guesses_v2';
const LOCAL_STORAGE_KEY_GAME = 'xingwei_zhuazhou_gamestate_v2';

export const getStoredGuesses = (): GuessRecord[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_GUESSES);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_GUESSES, JSON.stringify(DEFAULT_GUESTS));
      return DEFAULT_GUESTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_GUESTS;
  }
};

export const getStoredGameState = (): GameState => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_GAME);
    if (!raw) {
      const initial: GameState = {
        isRevealed: false,
        actualItems: ['item_09', 'item_16', 'item_01'], // Default if triggered
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_GAME, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return { isRevealed: false, actualItems: ['item_09', 'item_16', 'item_01'] };
  }
};

// API: Submit Guess
export const submitGuessToDb = async (name: string, selections: string[]): Promise<void> => {
  const newGuess: GuessRecord = {
    id: 'guess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name,
    selections,
    timestamp: Date.now(),
    avatarSeed: Math.floor(Math.random() * 10) + 1,
  };

  if (isFirebaseReady && db) {
    try {
      await addDoc(collection(db, 'guesses'), {
        name,
        selections,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.warn("Firestore write error, falling back to local broadcast:", err);
    }
  }

  const current = getStoredGuesses();
  const updated = [newGuess, ...current];
  localStorage.setItem(LOCAL_STORAGE_KEY_GUESSES, JSON.stringify(updated));
  if (broadcast) {
    broadcast.postMessage({ type: 'NEW_GUESS', payload: newGuess, all: updated });
  }
};

// API: Subscribe to Guesses
export const subscribeToGuesses = (callback: (guesses: GuessRecord[]) => void) => {
  if (isFirebaseReady && db) {
    try {
      const q = query(collection(db, 'guesses'), orderBy('timestamp', 'desc'), limit(150));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: GuessRecord[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            name: data.name,
            selections: data.selections || [],
            timestamp: data.timestamp?.toDate?.()?.getTime() || Date.now(),
          });
        });
        if (list.length > 0) {
          callback(list);
          localStorage.setItem(LOCAL_STORAGE_KEY_GUESSES, JSON.stringify(list));
        }
      });
      return unsubscribe;
    } catch (e) {
      console.warn("Firestore snapshot error:", e);
    }
  }

  callback(getStoredGuesses());

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'NEW_GUESS' || event.data?.type === 'RESET_GUESSES') {
      callback(getStoredGuesses());
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_KEY_GUESSES) {
      callback(getStoredGuesses());
    }
  };

  if (broadcast) broadcast.addEventListener('message', handleMessage);
  window.addEventListener('storage', handleStorage);

  return () => {
    if (broadcast) broadcast.removeEventListener('message', handleMessage);
    window.removeEventListener('storage', handleStorage);
  };
};

// API: Subscribe to Game State (Reveal trigger)
export const subscribeToGameState = (callback: (state: GameState) => void) => {
  if (isFirebaseReady && db) {
    try {
      const unsubscribe = onSnapshot(doc(db, 'gameState', 'current'), (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data() as GameState);
        }
      });
      return unsubscribe;
    } catch (e) {
      console.warn("Firestore state sync error:", e);
    }
  }

  callback(getStoredGameState());

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'GAME_STATE_UPDATE') {
      callback(event.data.payload);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_KEY_GAME) {
      callback(getStoredGameState());
    }
  };

  if (broadcast) broadcast.addEventListener('message', handleMessage);
  window.addEventListener('storage', handleStorage);

  return () => {
    if (broadcast) broadcast.removeEventListener('message', handleMessage);
    window.removeEventListener('storage', handleStorage);
  };
};

// API: Admin Trigger Reveal
export const updateGameStateInDb = async (state: Partial<GameState>): Promise<void> => {
  const current = getStoredGameState();
  const merged: GameState = {
    ...current,
    ...state,
    revealedAt: state.isRevealed ? Date.now() : undefined,
  };

  if (isFirebaseReady && db) {
    try {
      await setDoc(doc(db, 'gameState', 'current'), merged, { merge: true });
    } catch (e) {
      console.warn("Firestore gameState update error:", e);
    }
  }

  localStorage.setItem(LOCAL_STORAGE_KEY_GAME, JSON.stringify(merged));
  if (broadcast) {
    broadcast.postMessage({ type: 'GAME_STATE_UPDATE', payload: merged });
  }
};

// API: Reset all guesses
export const resetAllGuessesInDb = async (): Promise<void> => {
  localStorage.setItem(LOCAL_STORAGE_KEY_GUESSES, JSON.stringify(DEFAULT_GUESTS));
  if (broadcast) {
    broadcast.postMessage({ type: 'RESET_GUESSES' });
  }
};
