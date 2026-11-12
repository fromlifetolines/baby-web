import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

mkdirSync('security/screenshots', { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
try {
  for (const size of [{ name: 'mobile', width: 390, height: 844 }, { name: 'desktop', width: 1440, height: 900 }]) {
    const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
    await page.goto('http://127.0.0.1:4173/baby-web/?room=xingwei', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.locator('button[title="主持人後台 (Admin Panel)"]').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('button[title="主持人後台 (Admin Panel)"]').click();
    await page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('input[type="password"]').waitFor({ state: 'visible' });
    const label = await page.locator('input[type="email"]').locator('xpath=ancestor::form').innerText();
    assert.ok(label.includes('Firebase'));
    assert.ok(!label.includes('0819'), 'legacy PIN appeared in login form');
    assert.ok(!label.includes('vip888'), 'legacy agency passcode appeared in login form');
    await page.screenshot({ path: `security/screenshots/admin-login-${size.name}.png`, fullPage: true });
    await page.close();
    const guest = await browser.newPage({ viewport: { width: size.width, height: size.height } });
    await guest.goto('http://127.0.0.1:4173/baby-web/?room=xingwei', { waitUntil: 'domcontentloaded' });
    await guest.getByPlaceholder('建議使用暱稱，例如：舅舅 Howard、阿嬤、好友...').fill('測試暱稱');
    await guest.locator('input[type="checkbox"]').check();
    await guest.getByRole('button', { name: '進入預測大典 (ENTER)' }).click();
    const inviteInput = guest.getByRole('textbox', { name: '一次性邀請碼', exact: true });
    await inviteInput.fill('A'.repeat(32));
    assert.equal(await inviteInput.inputValue(), 'a'.repeat(32));
    assert.equal(await inviteInput.getAttribute('maxlength'), '32');
    await guest.screenshot({ path: `security/screenshots/vote-invitation-${size.name}.png`, fullPage: true });
    await guest.close();
  }
  // Checkout must not pretend to process payments or provision rooms.
  const landing = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await landing.goto('http://127.0.0.1:4173/baby-web/', { waitUntil: 'domcontentloaded' });
  await landing.getByRole('button', { name: /立即開通此方案/ }).click();
  const unavailable = landing.getByRole('dialog', { name: '方案開通狀態' });
  await unavailable.waitFor({ state: 'visible' });
  assert.match(await unavailable.innerText(), /線上開通尚未開放/);
  assert.equal(await unavailable.locator('input').count(), 0, 'Fake checkout collected user data');
  await landing.close();

  process.stdout.write('UI smoke: mobile/desktop owner login, guest invitation input, and safe checkout notice passed.\n');
} finally {
  await browser.close();
}
