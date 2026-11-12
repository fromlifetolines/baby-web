import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

mkdirSync('security/screenshots', { recursive: true });
const browser = await chromium.launch({ headless: true });
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
    const label = await page.locator('form').first().innerText();
    assert.ok(label.includes('Firebase'));
    assert.ok(!label.includes('0819'), 'legacy PIN appeared in login form');
    assert.ok(!label.includes('vip888'), 'legacy agency passcode appeared in login form');
    await page.screenshot({ path: `security/screenshots/admin-login-${size.name}.png`, fullPage: true });
    await page.close();
  }
  process.stdout.write('UI smoke: mobile and desktop owner login forms rendered correctly.\n');
} finally {
  await browser.close();
}
