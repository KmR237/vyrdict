import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS = path.join(__dirname, 'screenshots');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Go to login page and take screenshot
  console.log('--- Step 1: Login page ---');
  await page.goto('http://localhost:3009/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS, '01-login-page.png'), fullPage: true });
  console.log('Screenshot: 01-login-page.png');

  // 2. Login with credentials
  console.log('--- Step 2: Logging in ---');
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
  if (await emailInput.count() > 0) {
    await emailInput.fill('yvanmaah@gmail.com');
    console.log('Email filled');
  } else {
    console.log('No email input found. Page content:');
    console.log(await page.content().then(c => c.substring(0, 2000)));
  }

  // Look for PIN input
  const pinInput = page.locator('input[type="password"], input[name="pin"], input[placeholder*="PIN"], input[placeholder*="pin"], input[inputmode="numeric"]').first();
  if (await pinInput.count() > 0) {
    await pinInput.fill('1234');
    console.log('PIN filled');
  } else {
    // Maybe individual PIN digits
    const pinDigits = page.locator('input[maxlength="1"]');
    const count = await pinDigits.count();
    if (count >= 4) {
      const digits = '1234';
      for (let i = 0; i < 4; i++) {
        await pinDigits.nth(i).fill(digits[i]);
      }
      console.log('PIN digits filled');
    } else {
      console.log('No PIN input found');
    }
  }

  // Submit
  const submitBtn = page.locator('button[type="submit"], button:has-text("Connexion"), button:has-text("Se connecter"), button:has-text("Login")').first();
  if (await submitBtn.count() > 0) {
    await submitBtn.click();
    console.log('Submit clicked');
  } else {
    console.log('No submit button found');
  }

  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOTS, '02-after-login.png'), fullPage: true });
  console.log('Screenshot: 02-after-login.png');
  console.log('Current URL after login:', page.url());

  // 3. Go to dashboard
  console.log('--- Step 3: Dashboard ---');
  await page.goto('http://localhost:3009/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS, '03-dashboard.png'), fullPage: true });
  console.log('Screenshot: 03-dashboard.png');
  console.log('Dashboard URL:', page.url());

  // 4. Go to main page and upload file
  console.log('--- Step 4: Upload test ---');
  await page.goto('http://localhost:3009', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS, '04-main-page.png'), fullPage: true });
  console.log('Screenshot: 04-main-page.png');

  // Look for file input
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    const testFile = path.join(__dirname, 'test-red.png');
    await fileInput.setInputFiles(testFile);
    console.log('File uploaded');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOTS, '05-after-upload.png'), fullPage: true });
    console.log('Screenshot: 05-after-upload.png');
  } else {
    // Maybe a drop zone or button that triggers file input
    console.log('No file input found directly. Looking for upload zone...');
    const uploadZone = page.locator('[class*="upload"], [class*="drop"], [data-testid*="upload"], button:has-text("Upload"), button:has-text("Importer"), label:has-text("Upload"), label:has-text("Importer")').first();
    if (await uploadZone.count() > 0) {
      console.log('Found upload zone, clicking...');
      await uploadZone.click();
      await page.waitForTimeout(1000);
    }
    // Try hidden file input
    const hiddenInput = page.locator('input[type="file"]').first();
    if (await hiddenInput.count() > 0) {
      const testFile = path.join(__dirname, 'test-red.png');
      await hiddenInput.setInputFiles(testFile);
      console.log('File uploaded via hidden input');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(SCREENSHOTS, '05-after-upload.png'), fullPage: true });
    } else {
      console.log('No file input found at all');
      await page.screenshot({ path: path.join(SCREENSHOTS, '05-no-upload-found.png'), fullPage: true });
    }
  }

  // 5. Check dashboard after upload
  console.log('--- Step 5: Dashboard after upload ---');
  await page.goto('http://localhost:3009/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS, '06-dashboard-after-upload.png'), fullPage: true });
  console.log('Screenshot: 06-dashboard-after-upload.png');
  console.log('Dashboard URL:', page.url());

  // Get page text content for analysis
  const dashText = await page.locator('body').innerText();
  console.log('Dashboard content (first 1000 chars):', dashText.substring(0, 1000));

  await browser.close();
  console.log('\n--- Done! All screenshots saved ---');
})();
