# Vote identity hardening — candidate, not production acceptance

## Boundary
Guest writes formerly used random document IDs without authentication. The candidate uses a Firebase Auth UID as the vote ID and requires a private 128-bit invitation issued by the room owner. Voting atomically consumes the invitation and creates the UID vote. Rules verify both writes with getAfter(). Updates are denied even to owners; owner deletion permits a new round after reset. Config and state must exist, selections must be three distinct active IDs, and the room must not be revealed. Existing owner sessions are reused. Anonymous users are treated as signed out by the owner hook.

Each invitation permits one successful vote; new anonymous identities alone cannot vote. Invitations are bearer credentials: distribute one privately per guest, never publish unused codes, and keep Firebase Auth quotas/monitoring in place. This limits accepted votes to issued invitations; it does not prevent request flooding or anonymous-account creation. App Check and trusted backend rate limits remain additional defenses.

Owner UI creates 10 codes at a time using crypto.getRandomValues. Guests enter a code on the selection screen. Unused codes are owner-readable only; consumed codes may appear in public vote documents and cannot be reused. Deleting votes/resetting the room does not revive consumed codes. A new round requires fresh invitations. Public leaderboard display remains unchanged, with the existing nickname/privacy consent in PortalView. Settings/game-state owner writes preserve existing schema behavior; this is not a full security-rules audit.

## Production prerequisites (not yet verified)
1. Keep deny-all rules until rollout prerequisites are satisfied. Never use allow-all.
2. Enable Anonymous provider in Firebase Authentication; do not change the email/password owner account.
3. Verify owner authorization document against the intended Auth account. User reports this is done; agent has only seen redacted screenshots.
4. Confirm authoritative settings/config has nonempty activeItemIds, and gameState/current has isRevealed boolean. Missing either fails closed. The UI's local defaults do not provision these documents.
5. Review preexisting random-ID votes: they do not occupy UID paths, so previous participants could cast one more vote after migration. Do not delete live votes automatically.
6. User selected one-time invitations. Confirm the existing public nickname display remains acceptable; distribute codes privately only after acceptance.
7. Review emulator results, enable Anonymous Auth, deploy matching frontend, then publish the reviewed rules. Missing settings/state keep voting closed; an owner can then save config and initialize state through the secured UI. Generate codes for a dedicated acceptance room first. This branch does not auto-publish Firebase rules.

## Production acceptance still required
Use a dedicated acceptance room with authoritative config/state and a provisioned owner; do not clear real votes.
- Signed-out guest votes once, receives success only after server commit; reload retains Firebase identity.
- Repeat/concurrent vote is denied, including after removing app guest localStorage keys.
- Different client with independent identity cannot reuse a consumed code; it needs a fresh owner-issued code. Two clients racing one code produce one accepted vote.
- Owner email/password login still works after anonymous guest participation; unauthorized and revoked users cannot modify settings/state or delete votes.
- Revealed room, nonexistent room, invalid or inactive items are denied.
- Owner reveals and projector/guest updates across devices.
- Owner reset atomically clears acceptance votes and reopens the round; same guest may vote again only with a NEW invitation. Spent codes remain spent.
- Denied writes show failure, never false success. No public admin writes.

No production Firebase writes or successful production acceptance are claimed here.

## Local verification (2026-11-12)
- TypeScript check and Vite production build passed (existing bundle size warning remains).
- Firestore Emulator: 65 assertions, including valid/custom-item votes, immutable votes, isolated owner permissions, forged UID, missing/consumed invitations, omission of either atomic write, two-identity concurrent redemption, failed-validation rollback, missing config/state, reveal closure, fresh-invitation reset, and revoked owners.
- Chromium UI smoke: mobile/desktop owner-login form, guest invitation input, and unavailable-checkout notice passed; no real Firebase write in UI smoke.
- Read-only candidate review found no concrete bypass in the UID/one-time invitation boundary. Production/browser Auth integration still requires acceptance with the real project.
- No production Firebase writes were performed. Formal production acceptance remains blocked by unavailable console/browser control and Firebase credentials in this executor.

I've set up prototype Security Rules to keep the data in Firestore safe. They are designed to be secure for room-owner authorization, immutable UID votes, and atomic one-time invitation redemption. However, you should review and verify them before broadly sharing your app. If you'd like, I can help you harden these rules.
