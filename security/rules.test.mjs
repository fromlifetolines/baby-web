import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';

const rules = readFileSync(new URL('./firestore.rules.proposed', import.meta.url), 'utf8');
const env = await initializeTestEnvironment({
  projectId: 'demo-baby-web-security',
  firestore: { rules },
});

try {
  const ownerUid = 'test-owner-uid';
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'rooms', 'xingwei', 'admins', ownerUid), {
      active: true,
      role: 'owner'
    });
    await setDoc(doc(ctx.firestore(), 'rooms', 'otherparty', 'settings', 'config'), {
      babyName: 'sample'
    });
  });

  const guest = env.unauthenticatedContext().firestore();
  const owner = env.authenticatedContext(ownerUid).firestore();
  const stranger = env.authenticatedContext('other-uid').firestore();

  const configPath = 'rooms/xingwei/settings/config';
  const statePath = 'rooms/xingwei/gameState/current';
  const rolePath = `rooms/xingwei/admins/${ownerUid}`;
  const otherPath = 'rooms/otherparty/settings/config';

  await assertSucceeds(getDoc(doc(guest, configPath)));
  await assertFails(getDoc(doc(guest, rolePath)));
  await assertFails(getDoc(doc(stranger, rolePath)));
  await assertSucceeds(getDoc(doc(owner, rolePath)));

  await assertFails(setDoc(doc(guest, configPath), { babyName: 'not allowed' }));
  await assertFails(setDoc(doc(stranger, statePath), { isRevealed: true }));
  await assertFails(deleteDoc(doc(stranger, otherPath)));
  await assertFails(setDoc(doc(stranger, rolePath), { active: true, role: 'owner' }));
  await assertSucceeds(setDoc(doc(owner, configPath), { babyName: 'updated' }));
  await assertSucceeds(setDoc(doc(owner, statePath), { isRevealed: false }));
  await assertFails(setDoc(doc(owner, otherPath), { babyName: 'forbidden' }));

  const validVote = () => ({
    name: 'test guest', selections: ['item_01', 'item_09', 'item_16'],
    timestamp: serverTimestamp(), createdAt: Date.now(), roomId: 'xingwei',
  });
  const vote = await assertSucceeds(addDoc(collection(guest, 'rooms', 'xingwei', 'guesses'), validVote()));
  await assertSucceeds(getDocs(collection(guest, 'rooms', 'xingwei', 'guesses')));
  await assertFails(setDoc(vote, { name: 'tamper' }, { merge: true }));
  await assertFails(deleteDoc(vote));
  await assertFails(addDoc(collection(guest, 'rooms', 'xingwei', 'guesses'), {
    ...validVote(), selections: ['item_01', 'item_01', 'item_01'],
  }));

  // Revoked owner must be denied even when still signed in.
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), rolePath), { active: false, role: 'owner' });
  });
  await assertFails(setDoc(doc(owner, statePath), { isRevealed: true }));
  assert.ok(true, 'security rules tests passed');
  process.stdout.write('Firestore Rules Emulator: 15 permission scenarios passed.\n');
} finally {
  await env.cleanup();
}
