import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, serverTimestamp, writeBatch, setLogLevel } from 'firebase/firestore';

setLogLevel('silent');
const env = await initializeTestEnvironment({
  projectId: 'demo-baby-web-security',
  firestore: { rules: readFileSync(new URL('./firestore.rules.proposed', import.meta.url), 'utf8') },
});
let checks = 0;
const succeeds = async p => { await assertSucceeds(p); checks++; };
const fails = async p => { await assertFails(p); checks++; };
try {
  const ownerUid = 'test-owner-uid';
  const owner = env.authenticatedContext(ownerUid).firestore();
  const publicDb = env.unauthenticatedContext().firestore();
  const guest = env.authenticatedContext('guest-uid', { firebase: { sign_in_provider: 'anonymous' } }).firestore();
  const stranger = env.authenticatedContext('other-uid').firestore();
  const anonymousOwner = env.authenticatedContext(ownerUid, { firebase: { sign_in_provider: 'anonymous' } }).firestore();
  const configPath = 'rooms/xingwei/settings/config';
  const statePath = 'rooms/xingwei/gameState/current';
  const rolePath = `rooms/xingwei/admins/${ownerUid}`;
  const votePath = 'rooms/xingwei/guesses/guest-uid';
  const config = { activeItemIds: ['item_01', 'item_09', 'item_16', 'custom_1'] };
  await env.withSecurityRulesDisabled(async ctx => {
    await setDoc(doc(ctx.firestore(), rolePath), { active: true, role: 'owner' });
    await setDoc(doc(ctx.firestore(), configPath), config);
    await setDoc(doc(ctx.firestore(), statePath), { isRevealed: false });
  });
  let serial = 0;
  const issue = async () => {
    const code = (++serial).toString(16).padStart(32, '0');
    await succeeds(setDoc(doc(owner, 'rooms/xingwei/voteInvites', code), { usedBy: '', usedAt: null }));
    return code;
  };
  const voteData = code => ({
    name: 'test guest', selections: ['item_01', 'item_09', 'item_16'],
    timestamp: serverTimestamp(), createdAt: Date.now(), roomId: 'xingwei', inviteId: code,
  });
  const redeem = (db, uid, code, patch = {}, room = 'xingwei') => {
    const batch = writeBatch(db);
    batch.update(doc(db, 'rooms', room, 'voteInvites', code), { usedBy: uid, usedAt: serverTimestamp() });
    batch.set(doc(db, 'rooms', room, 'guesses', uid), { ...voteData(code), ...patch });
    return batch.commit();
  };
  await succeeds(getDoc(doc(publicDb, configPath)));
  await fails(getDoc(doc(publicDb, rolePath)));
  await fails(getDoc(doc(stranger, rolePath)));
  await succeeds(getDoc(doc(owner, rolePath)));
  await fails(setDoc(doc(stranger, rolePath), { active: true, role: 'owner' }));
  await fails(setDoc(doc(owner, rolePath), { active: true, role: 'owner' }));
  await fails(setDoc(doc(publicDb, configPath), config));
  await fails(setDoc(doc(stranger, statePath), { isRevealed: true }));
  await fails(setDoc(doc(owner, 'rooms/otherparty/settings/config'), config));
  await fails(setDoc(doc(anonymousOwner, configPath), config));
  const code = await issue();
  const invite = doc(guest, 'rooms/xingwei/voteInvites', code);
  await fails(getDoc(invite));
  await fails(getDocs(collection(guest, 'rooms/xingwei/voteInvites')));
  await fails(setDoc(doc(guest, 'rooms/xingwei/voteInvites', 'f'.repeat(32)), { usedBy: '', usedAt: null }));
  await fails(setDoc(doc(publicDb, votePath), voteData(code)));
  await fails(setDoc(doc(guest, votePath), voteData(code))); // must consume atomically
  await fails(setDoc(invite, { usedBy: 'guest-uid', usedAt: serverTimestamp() })); // must create vote atomically
  await fails(redeem(guest, 'other-uid', code)); // forged UID
  await fails(redeem(guest, 'guest-uid', 'f'.repeat(32))); // nonexistent invitation
  await succeeds(redeem(guest, 'guest-uid', code));
  await fails(redeem(guest, 'guest-uid', code));
  await fails(setDoc(doc(guest, votePath), { name: 'tamper' }, { merge: true }));
  await fails(deleteDoc(doc(guest, votePath)));
  await fails(setDoc(doc(owner, votePath), voteData(code))); // owner cannot rewrite vote
  await succeeds(getDocs(collection(publicDb, 'rooms/xingwei/guesses')));
  const otherCode = await issue();
  await fails(redeem(guest, 'guest-uid', otherCode)); // new code, existing UID vote
  await succeeds(deleteDoc(doc(owner, votePath)));
  await fails(redeem(guest, 'guest-uid', code)); // deletion does not revive code
  await fails(redeem(stranger, 'other-uid', code)); // new identity cannot reuse it
  await fails(setDoc(doc(owner, 'rooms/xingwei/voteInvites', code), { usedBy: '', usedAt: null }));
  await fails(deleteDoc(doc(owner, 'rooms/xingwei/voteInvites', code)));
  for (const invalid of [
    { selections: ['item_01', 'item_01', 'item_01'] },
    { selections: ['item_01', 'item_09', 'inactive'] },
    { selections: [1, 'item_09', 'item_16'] },
    { selections: ['item_01', 'item_09'] }, { selections: 'item_01' },
    { name: 'x'.repeat(61) }, { name: '' }, { extra: true },
    { roomId: 'otherparty' }, { timestamp: new Date(0) }, { createdAt: -1 },
    { inviteId: 'x'.repeat(10000) },
  ]) await fails(redeem(guest, 'guest-uid', otherCode, invalid));
  // Rejected attempts leave the invitation unused.
  await succeeds(redeem(guest, 'guest-uid', otherCode, { selections: ['item_01', 'item_09', 'custom_1'] }));
  await succeeds(deleteDoc(doc(owner, votePath)));
  const raceCode = await issue();
  await succeeds(setDoc(doc(owner, statePath), { isRevealed: true }));
  await fails(redeem(guest, 'guest-uid', raceCode));
  await succeeds(setDoc(doc(owner, statePath), { isRevealed: false }));
  const race = await Promise.allSettled([
    redeem(guest, 'guest-uid', raceCode), redeem(stranger, 'other-uid', raceCode),
  ]);
  assert.equal(race.filter(r => r.status === 'fulfilled').length, 1, 'invitation race accepted twice'); checks++;
  for (const uid of ['guest-uid', 'other-uid']) await succeeds(deleteDoc(doc(owner, 'rooms/xingwei/guesses', uid)));
  const nextCode = await issue();
  await succeeds(deleteDoc(doc(owner, statePath)));
  await fails(redeem(guest, 'guest-uid', nextCode));
  await succeeds(setDoc(doc(owner, statePath), { isRevealed: false }));
  await succeeds(deleteDoc(doc(owner, configPath)));
  await fails(redeem(guest, 'guest-uid', nextCode));
  await succeeds(setDoc(doc(owner, configPath), config));
  await fails(redeem(guest, 'guest-uid', nextCode, { roomId: 'otherparty' }, 'otherparty'));
  await succeeds(redeem(guest, 'guest-uid', nextCode)); // new round needs a fresh code
  await env.withSecurityRulesDisabled(async ctx => {
    await setDoc(doc(ctx.firestore(), rolePath), { active: false, role: 'owner' });
  });
  await fails(setDoc(doc(owner, statePath), { isRevealed: true }));
  await fails(deleteDoc(doc(owner, votePath)));
  await fails(setDoc(doc(owner, 'rooms/xingwei/voteInvites', 'e'.repeat(32)), { usedBy: '', usedAt: null }));
  process.stdout.write(`Firestore Rules Emulator: ${checks} checks passed, including one-time invitation replay and concurrent redemption.\n`);
} finally { await env.cleanup(); }
