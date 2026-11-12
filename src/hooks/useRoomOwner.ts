import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export type OwnerStatus = 'checking' | 'signed-out' | 'authorized' | 'forbidden' | 'error';

export interface RoomOwnerState {
  user: User | null;
  status: OwnerStatus;
  isOwner: boolean;
}

export const useRoomOwner = (roomId: string): RoomOwnerState => {
  const [owner, setOwner] = useState<RoomOwnerState>({
    user: null, status: 'checking', isOwner: false,
  });

  useEffect(() => {
    let unsubscribeRole: (() => void) | undefined;
    setOwner({ user: null, status: 'checking', isOwner: false });

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeRole?.();
      unsubscribeRole = undefined;

      if (!user || user.isAnonymous) {
        setOwner({ user: null, status: 'signed-out', isOwner: false });
        return;
      }

      setOwner({ user, status: 'checking', isOwner: false });
      const roleRef = doc(db, 'rooms', roomId, 'admins', user.uid);
      unsubscribeRole = onSnapshot(roleRef,
        (snapshot) => {
          const data = snapshot.data();
          const isOwner = snapshot.exists() && data?.active === true && data?.role === 'owner';
          setOwner({ user, status: isOwner ? 'authorized' : 'forbidden', isOwner });
        },
        () => {
          // Missing Rules permission or network errors must never authorize.
          setOwner({ user, status: 'error', isOwner: false });
        }
      );
    }, () => {
      setOwner({ user: null, status: 'error', isOwner: false });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeRole?.();
    };
  }, [roomId]);

  return owner;
};
