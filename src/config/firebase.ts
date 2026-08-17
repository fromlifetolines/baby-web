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
import { GuessRecord, GameState } from '../types';

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

// Cross-tab broadcast backup
const broadcast = typeof window !== 'undefined' ? new BroadcastChannel('xingwei_live_firestore_sync') : null;

// Initial state helpers
const LOCAL_STORAGE_KEY_GUESSES = 'xingwei_zhuazhou_guesses_live';
const LOCAL_STORAGE_KEY_GAME = 'xingwei_zhuazhou_gamestate_live';

export const getStoredGuesses = (): GuessRecord[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_GUESSES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const getStoredGameState = (): GameState => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_GAME);
    if (!raw) {
      const initial: GameState = {
        isRevealed: false,
        actualItems: ['item_09', 'item_16', 'item_01'],
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_GAME, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return { isRevealed: false, actualItems: ['item_09', 'item_16', 'item_01'] };
  }
};

// API: Submit Guess to Firestore
export const submitGuessToDb = async (name: string, selections: string[]): Promise<void> => {
  try {
    await addDoc(collection(db, 'guesses'), {
      name,
      selections,
      timestamp: serverTimestamp(),
      createdAt: Date.now(),
    });
  } catch (err) {
    console.error("Firestore write error:", err);
    // fallback local broadcast
    const newGuess: GuessRecord = {
      id: 'local_' + Date.now(),
      name,
      selections,
      timestamp: Date.now(),
    };
    const current = getStoredGuesses();
    const updated = [newGuess, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEY_GUESSES, JSON.stringify(updated));
    if (broadcast) {
      broadcast.postMessage({ type: 'NEW_GUESS', payload: newGuess });
    }
  }
};

// API: Real-Time Listen to Guesses on all connected devices
export const subscribeToGuesses = (callback: (guesses: GuessRecord[]) => void) => {
  let isUnmounted = false;

  try {
    const q = query(collection(db, 'guesses'), orderBy('timestamp', 'desc'));
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
        });
      });
      callback(list);
      localStorage.setItem(LOCAL_STORAGE_KEY_GUESSES, JSON.stringify(list));
    }, (err) => {
      console.warn("Firestore onSnapshot error, using local listener:", err);
      callback(getStoredGuesses());
    });

    const handleMessage = (event: MessageEvent) => {
      if (isUnmounted) return;
      if (event.data?.type === 'NEW_GUESS' || event.data?.type === 'RESET_GUESSES') {
        callback(getStoredGuesses());
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
    callback(getStoredGuesses());
    return () => {};
  }
};

// API: Real-Time Listen to Game State (Reveal trigger)
export const subscribeToGameState = (callback: (state: GameState) => void) => {
  let isUnmounted = false;

  try {
    const unsubscribe = onSnapshot(doc(db, 'gameState', 'current'), (docSnap) => {
      if (isUnmounted) return;
      if (docSnap.exists()) {
        const data = docSnap.data() as GameState;
        callback(data);
        localStorage.setItem(LOCAL_STORAGE_KEY_GAME, JSON.stringify(data));
      } else {
        const initial: GameState = { isRevealed: false, actualItems: ['item_09', 'item_16', 'item_01'] };
        callback(initial);
      }
    }, (err) => {
      console.warn("GameState onSnapshot error:", err);
      callback(getStoredGameState());
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
    callback(getStoredGameState());
    return () => {};
  }
};

// API: Admin Trigger Reveal
export const updateGameStateInDb = async (state: Partial<GameState>): Promise<void> => {
  const current = getStoredGameState();
  const merged: GameState = {
    ...current,
    ...state,
    revealedAt: state.isRevealed ? Date.now() : undefined,
  };

  try {
    await setDoc(doc(db, 'gameState', 'current'), merged, { merge: true });
  } catch (e) {
    console.error("Firestore gameState update error:", e);
  }

  localStorage.setItem(LOCAL_STORAGE_KEY_GAME, JSON.stringify(merged));
  if (broadcast) {
    broadcast.postMessage({ type: 'GAME_STATE_UPDATE', payload: merged });
  }
};

// API: Reset and Clean Slate - Batch delete all guesses & reset state
export const resetAllGuessesInDb = async (): Promise<void> => {
  try {
    const snap = await getDocs(collection(db, 'guesses'));
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach((document) => {
        batch.delete(document.ref);
      });
      await batch.commit();
    }

    await setDoc(doc(db, 'gameState', 'current'), {
      isRevealed: false,
      actualItems: ['item_09', 'item_16', 'item_01'],
    });
  } catch (e) {
    console.error("Firestore batch delete error:", e);
  }

  localStorage.setItem(LOCAL_STORAGE_KEY_GUESSES, JSON.stringify([]));
  localStorage.setItem(LOCAL_STORAGE_KEY_GAME, JSON.stringify({
    isRevealed: false,
    actualItems: ['item_09', 'item_16', 'item_01'],
  }));
  localStorage.removeItem('xingwei_user_selections_live');

  if (broadcast) {
    broadcast.postMessage({ type: 'RESET_GUESSES', all: [] });
    broadcast.postMessage({ type: 'GAME_STATE_UPDATE', payload: { isRevealed: false, actualItems: ['item_09', 'item_16', 'item_01'] } });
  }
};
