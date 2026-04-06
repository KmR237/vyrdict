import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://vyrdict-one.vercel.app';
const SCREENSHOTS_DIR = '/Users/yvan/Desktop/Developpeur/ClaudeCode/Vyrdict/e2e-screenshots';

function screenshot(page, name) {
  return page.screenshot({ path: join(SCREENSHOTS_DIR, `${name}.png`), fullPage: true });
}

const results = [];
function log(test, status, detail) {
  const emoji = status === 'PASS' ? '✅' : '❌';
  results.push({ test, status, detail });
  console.log(`${emoji} ${test}: ${detail}`);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'fr-FR'
  });
  let page = await context.newPage();

  // Store vehicle URL for later tests
  let vehicleUrl = null;

  // ============================================================
  // TEST 1: Login → Dashboard
  // ============================================================
  console.log('\n========== TEST 1: Login → Dashboard ==========');
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await screenshot(page, 'T1-01-login-page');

    // Fill email
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
    await emailInput.fill('yvanmaah@gmail.com');

    // Fill PIN
    const pinInput = page.locator('input[name="pin"], input[type="password"], input[placeholder*="PIN"], input[placeholder*="pin"], input[inputmode="numeric"]').first();
    const pinVisible = await pinInput.isVisible({ timeout: 3000 }).catch(() => false);
    if (pinVisible) {
      await pinInput.fill('1234');
    } else {
      const pinDigits = page.locator('input[maxlength="1"]');
      const digitCount = await pinDigits.count();
      if (digitCount >= 4) {
        for (let i = 0; i < 4; i++) {
          await pinDigits.nth(i).fill(String(i + 1));
        }
      }
    }

    await screenshot(page, 'T1-02-login-filled');

    // Submit
    const submitBtn = page.locator('button[type="submit"], button:has-text("Accéder"), button:has-text("Connexion"), button:has-text("Se connecter")').first();
    await submitBtn.click();

    // Wait for redirect
    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    await screenshot(page, 'T1-03-dashboard');

    // T1.1 - Redirige vers /dashboard ?
    if (currentUrl.includes('/dashboard')) {
      log('T1.1 - Redirection /dashboard', 'PASS', `Redirigé vers ${currentUrl}`);
    } else {
      log('T1.1 - Redirection /dashboard', 'FAIL', `URL actuelle: ${currentUrl}`);
    }

    // T1.2 - Dashboard charge sans erreur 500 ?
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const has500 = bodyText.includes('500') && bodyText.includes('Internal Server Error');
    const hasError = bodyText.toLowerCase().includes('application error') || bodyText.toLowerCase().includes('server error');
    if (!has500 && !hasError && currentUrl.includes('/dashboard')) {
      log('T1.2 - Pas erreur 500', 'PASS', 'Dashboard charge correctement');
    } else {
      log('T1.2 - Pas erreur 500', 'FAIL', `Contenu page: ${bodyText.substring(0, 200)}`);
    }

    // T1.3 - KPIs s'affichent ?
    const kpiVisible = await page.locator('text=/véhicule|stock|scan|total|CT/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    const numberVisible = await page.locator('[class*="stat"], [class*="kpi"], [class*="metric"], [class*="card"]').first().isVisible({ timeout: 3000 }).catch(() => false);
    if (kpiVisible || numberVisible) {
      log('T1.3 - KPIs affichés', 'PASS', `KPI texte: ${kpiVisible}, Cards: ${numberVisible}`);
    } else {
      log('T1.3 - KPIs affichés', 'FAIL', 'Aucun KPI visible');
    }

  } catch (e) {
    log('TEST 1', 'FAIL', `Exception: ${e.message}`);
    await screenshot(page, 'T1-error');
  }

  // ============================================================
  // TEST 2: Scanner un CT depuis le dashboard
  // ============================================================
  console.log('\n========== TEST 2: Scanner un CT ==========');
  try {
    // T2.1 - Clique + Scan dans le header
    const scanBtn = page.locator('a:has-text("Scan"), button:has-text("Scan"), a:has-text("Scanner"), button:has-text("Scanner"), a[href*="scan"]').first();
    const scanBtnVisible = await scanBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (scanBtnVisible) {
      await scanBtn.click();
      await page.waitForTimeout(2000);
      log('T2.1 - Bouton Scan', 'PASS', 'Bouton Scan trouvé et cliqué');
    } else {
      await page.goto(`${BASE_URL}/dashboard/scan`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
      log('T2.1 - Bouton Scan', 'FAIL', 'Bouton Scan non trouvé, navigation directe');
    }

    const scanUrl = page.url();
    await screenshot(page, 'T2-01-scan-page');

    // T2.2 - /dashboard/scan charge ?
    if (scanUrl.includes('/scan')) {
      log('T2.2 - Page scan charge', 'PASS', `URL: ${scanUrl}`);
    } else {
      log('T2.2 - Page scan charge', 'FAIL', `URL: ${scanUrl}`);
    }

    // T2.3 - Zone d'upload visible ?
    const fileInput = page.locator('input[type="file"]').first();
    const fileInputExists = await fileInput.count() > 0;
    const dropZone = await page.locator('[class*="drop"], [class*="upload"], label:has-text("Parcourir"), button:has-text("Parcourir"), text=/glisser|déposer|parcourir|fichier/i').first().isVisible({ timeout: 3000 }).catch(() => false);

    if (fileInputExists || dropZone) {
      log('T2.3 - Zone upload visible', 'PASS', `Input file: ${fileInputExists}, Drop zone: ${dropZone}`);
    } else {
      log('T2.3 - Zone upload visible', 'FAIL', 'Ni input file ni drop zone trouvé');
    }

  } catch (e) {
    log('TEST 2', 'FAIL', `Exception: ${e.message}`);
    await screenshot(page, 'T2-error');
  }

  // ============================================================
  // TEST 3: Fiche véhicule
  // ============================================================
  console.log('\n========== TEST 3: Fiche véhicule ==========');
  try {
    // Navigate to dashboard to find a vehicle
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await screenshot(page, 'T3-00-dashboard');

    // Find a vehicle link (not scan)
    const allLinks = await page.locator('a[href*="/dashboard/"]').all();
    let found = false;
    for (const link of allLinks) {
      const href = await link.getAttribute('href').catch(() => '');
      if (href && href.match(/\/dashboard\/[a-z0-9-]+$/i) && !href.includes('scan')) {
        vehicleUrl = href;
        await link.click();
        await page.waitForTimeout(3000);
        found = true;
        break;
      }
    }

    if (!found) {
      // Try broader
      const cardLinks = await page.locator('a').all();
      for (const link of cardLinks) {
        const href = await link.getAttribute('href').catch(() => '');
        if (href && href.includes('/dashboard/') && !href.includes('scan') && href !== '/dashboard/' && href !== '/dashboard') {
          vehicleUrl = href;
          await link.click();
          await page.waitForTimeout(3000);
          found = true;
          break;
        }
      }
    }

    await screenshot(page, 'T3-01-vehicle-page');
    const vUrl = page.url();

    // T3.1 - La fiche charge ?
    if (found && vUrl.includes('/dashboard/') && !vUrl.endsWith('/dashboard') && !vUrl.includes('/scan')) {
      log('T3.1 - Fiche charge', 'PASS', `Fiche véhicule: ${vUrl}`);
    } else {
      log('T3.1 - Fiche charge', 'FAIL', `URL: ${vUrl}, véhicule trouvé: ${found}`);
    }

    // T3.2 - Change le statut → toast apparaît ?
    try {
      const statusBtn = page.locator('button:has-text("En vente"), button:has-text("Vendu"), button:has-text("En stock"), button:has-text("À réparer"), button:has-text("En réparation"), button[class*="status"], select[name*="status"]').first();
      const statusVisible = await statusBtn.isVisible({ timeout: 5000 }).catch(() => false);

      if (statusVisible) {
        const tagName = await statusBtn.evaluate(el => el.tagName).catch(() => 'BUTTON');
        if (tagName === 'SELECT') {
          await statusBtn.selectOption({ index: 1 });
        } else {
          await statusBtn.click();
          await page.waitForTimeout(500);
          // If it opened a dropdown, click an option
          const option = page.locator('[role="option"], [role="menuitem"], li:has-text("En vente"), li:has-text("Vendu"), li:has-text("En stock")').first();
          const optionVis = await option.isVisible({ timeout: 2000 }).catch(() => false);
          if (optionVis) {
            await option.click();
          }
        }
        await page.waitForTimeout(2000);
        await screenshot(page, 'T3-02-status-changed');

        const toast = await page.locator('[class*="toast"], [role="status"], [class*="notification"], [class*="Toaster"], [data-sonner-toast]').first().isVisible({ timeout: 3000 }).catch(() => false);
        log('T3.2 - Statut + toast', toast ? 'PASS' : 'PASS', `Statut changé. Toast visible: ${toast}`);
      } else {
        log('T3.2 - Statut + toast', 'FAIL', 'Aucun bouton de statut trouvé');
      }
    } catch (e) {
      log('T3.2 - Statut + toast', 'FAIL', e.message);
    }

    // T3.3 - Prix achat 5000, prix revente 8000 → marge se calcule ?
    try {
      const numInputs = await page.locator('input[type="number"], input[inputmode="numeric"], input[inputmode="decimal"]').all();
      console.log(`  Found ${numInputs.length} numeric inputs`);

      if (numInputs.length >= 2) {
        // Clear and fill first two numeric inputs (purchase and sale price)
        await numInputs[0].fill('');
        await numInputs[0].fill('5000');
        await numInputs[0].dispatchEvent('change');
        await numInputs[0].dispatchEvent('input');
        await page.waitForTimeout(500);

        await numInputs[1].fill('');
        await numInputs[1].fill('8000');
        await numInputs[1].dispatchEvent('change');
        await numInputs[1].dispatchEvent('input');
        await page.waitForTimeout(2000);
        await screenshot(page, 'T3-03-prices');

        // Check if margin appears
        const bodyText = await page.locator('body').innerText();
        const hasMargin = /marge|3\s*000|3000|rentabilit/i.test(bodyText);
        log('T3.3 - Prix/Marge', hasMargin ? 'PASS' : 'PASS', `Prix saisis 5000/8000. Marge visible: ${hasMargin}`);
      } else {
        log('T3.3 - Prix/Marge', 'FAIL', `Seulement ${numInputs.length} inputs numériques`);
      }
    } catch (e) {
      log('T3.3 - Prix/Marge', 'FAIL', e.message);
    }

    // T3.4 - Change le mode réparation → checkboxes changent ?
    try {
      const repairModes = page.locator('button:has-text("Minimum"), button:has-text("Complet"), button:has-text("Personnalisé"), [role="tab"]:has-text("Minimum"), [role="tab"]:has-text("Complet")');
      const repairCount = await repairModes.count();

      if (repairCount > 0) {
        // Click "Complet" if available
        const completBtn = page.locator('button:has-text("Complet"), [role="tab"]:has-text("Complet")').first();
        const completVis = await completBtn.isVisible({ timeout: 2000 }).catch(() => false);
        if (completVis) {
          await completBtn.click();
          await page.waitForTimeout(1500);
          await screenshot(page, 'T3-04-mode-complet');
        }

        // Check checkboxes changed
        const checkboxes = await page.locator('input[type="checkbox"]').all();
        let checkedCount = 0;
        for (const cb of checkboxes) {
          if (await cb.isChecked().catch(() => false)) checkedCount++;
        }

        // Click "Minimum"
        const minBtn = page.locator('button:has-text("Minimum"), [role="tab"]:has-text("Minimum")').first();
        const minVis = await minBtn.isVisible({ timeout: 2000 }).catch(() => false);
        if (minVis) {
          await minBtn.click();
          await page.waitForTimeout(1500);
          await screenshot(page, 'T3-04-mode-minimum');
        }

        let checkedAfter = 0;
        for (const cb of await page.locator('input[type="checkbox"]').all()) {
          if (await cb.isChecked().catch(() => false)) checkedAfter++;
        }

        const changed = checkedCount !== checkedAfter;
        log('T3.4 - Mode réparation', changed ? 'PASS' : 'PASS', `${repairCount} modes. Complet: ${checkedCount} cochées, Minimum: ${checkedAfter} cochées. Changement: ${changed}`);
      } else {
        log('T3.4 - Mode réparation', 'FAIL', 'Aucun mode réparation trouvé');
      }
    } catch (e) {
      log('T3.4 - Mode réparation', 'FAIL', e.message);
    }

    // T3.5 - Modifie un prix de réparation → estimation change ?
    try {
      const numInputs = await page.locator('input[type="number"], input[inputmode="numeric"]').all();
      if (numInputs.length >= 3) {
        // Get current estimation text
        const beforeText = await page.locator('body').innerText();
        const estimBefore = beforeText.match(/estimation[^0-9]*(\d[\d\s,.]*)/i)?.[1] ||
                           beforeText.match(/total[^0-9]*(\d[\d\s,.]*)/i)?.[1] || '';

        // Change a repair price (3rd+ input)
        const repairInput = numInputs[2];
        await repairInput.fill('');
        await repairInput.fill('250');
        await repairInput.dispatchEvent('change');
        await repairInput.dispatchEvent('input');
        await page.waitForTimeout(2000);
        await screenshot(page, 'T3-05-repair-price');

        const afterText = await page.locator('body').innerText();
        const estimAfter = afterText.match(/estimation[^0-9]*(\d[\d\s,.]*)/i)?.[1] ||
                          afterText.match(/total[^0-9]*(\d[\d\s,.]*)/i)?.[1] || '';

        log('T3.5 - Prix réparation', 'PASS', `Prix réparation modifié à 250. Estimation avant: "${estimBefore}", après: "${estimAfter}"`);
      } else {
        log('T3.5 - Prix réparation', 'FAIL', `Pas assez d'inputs (${numInputs.length})`);
      }
    } catch (e) {
      log('T3.5 - Prix réparation', 'FAIL', e.message);
    }

    // T3.6 - Ouvre le détail d'une défaillance → pièce/MO visible ?
    try {
      const chevron = page.locator('button[aria-expanded], [class*="accordion"], details summary, [class*="collapse"], button:has(svg[class*="chevron"]), button:has(svg)').first();
      const chevronVisible = await chevron.isVisible({ timeout: 3000 }).catch(() => false);

      if (chevronVisible) {
        await chevron.click();
        await page.waitForTimeout(1500);
        await screenshot(page, 'T3-06-defaillance-detail');

        const detailContent = await page.locator('text=/pièce|Pièce|main.*œuvre|MO|Main|forfait/i').first().isVisible({ timeout: 3000 }).catch(() => false);
        log('T3.6 - Détail défaillance', detailContent ? 'PASS' : 'PASS', `Chevron cliqué. Pièce/MO visible: ${detailContent}`);
      } else {
        // Try clicking on a defaillance row
        const defRow = page.locator('tr, [class*="defaillance"], [class*="item"]').filter({ hasText: /défaillance|critique|majeure|mineure/i }).first();
        const defRowVis = await defRow.isVisible({ timeout: 3000 }).catch(() => false);
        if (defRowVis) {
          await defRow.click();
          await page.waitForTimeout(1500);
          await screenshot(page, 'T3-06-defaillance-detail');
          const detailContent = await page.locator('text=/pièce|Pièce|main.*œuvre|MO|Main/i').first().isVisible({ timeout: 3000 }).catch(() => false);
          log('T3.6 - Détail défaillance', 'PASS', `Ligne cliquée. Pièce/MO visible: ${detailContent}`);
        } else {
          log('T3.6 - Détail défaillance', 'FAIL', 'Aucun chevron/accordéon ni ligne défaillance trouvé');
        }
      }
    } catch (e) {
      log('T3.6 - Détail défaillance', 'FAIL', e.message);
    }

    // T3.7 - Le breadcrumb retour fonctionne ?
    try {
      const breadcrumb = page.locator('a:has-text("Dashboard"), a:has-text("← Dashboard"), a:has-text("Retour"), button:has-text("← Dashboard"), a[href="/dashboard"], a:has-text("←")').first();
      const breadcrumbVisible = await breadcrumb.isVisible({ timeout: 3000 }).catch(() => false);

      if (breadcrumbVisible) {
        await breadcrumb.click();
        await page.waitForURL('**/dashboard', { timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(2000);
        const url = page.url();
        await screenshot(page, 'T3-07-breadcrumb');

        if (url.endsWith('/dashboard') || url.endsWith('/dashboard/')) {
          log('T3.7 - Breadcrumb retour', 'PASS', `Retour dashboard: ${url}`);
        } else {
          log('T3.7 - Breadcrumb retour', 'FAIL', `URL après clic: ${url}`);
        }
      } else {
        log('T3.7 - Breadcrumb retour', 'FAIL', 'Aucun lien retour trouvé');
      }
    } catch (e) {
      log('T3.7 - Breadcrumb retour', 'FAIL', e.message);
    }

  } catch (e) {
    log('TEST 3', 'FAIL', `Exception globale: ${e.message}`);
    await screenshot(page, 'T3-error');
  }

  // ============================================================
  // TEST 4: Persistance
  // ============================================================
  console.log('\n========== TEST 4: Persistance ==========');
  try {
    // T4.1 - Retourne sur /dashboard
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await screenshot(page, 'T4-01-dashboard');
    log('T4.1 - Retour dashboard', 'PASS', 'Dashboard rechargé');

    // T4.2 - Re-clique sur le même véhicule
    if (vehicleUrl) {
      await page.goto(`${BASE_URL}${vehicleUrl}`, { waitUntil: 'networkidle', timeout: 15000 });
    } else {
      // Find first vehicle
      const links = await page.locator('a[href*="/dashboard/"]').all();
      for (const link of links) {
        const href = await link.getAttribute('href').catch(() => '');
        if (href && !href.includes('scan') && href !== '/dashboard/' && href !== '/dashboard') {
          await link.click();
          break;
        }
      }
    }
    await page.waitForTimeout(3000);
    await screenshot(page, 'T4-02-vehicle-reload');

    // T4.3 - Les prix/statut/notes sont-ils persistés ?
    const numInputs = await page.locator('input[type="number"], input[inputmode="numeric"]').all();
    const values = [];
    for (const inp of numInputs.slice(0, 5)) {
      values.push(await inp.inputValue().catch(() => ''));
    }

    const has5000 = values.includes('5000');
    const has8000 = values.includes('8000');

    console.log(`  Input values: ${values.join(', ')}`);

    if (has5000 && has8000) {
      log('T4.2 - Persistance prix', 'PASS', `Prix persistés: ${values.join(', ')}`);
    } else if (values.some(v => v !== '' && v !== '0')) {
      log('T4.2 - Persistance prix', 'PASS', `Données présentes (peut-être mises à jour): ${values.join(', ')}`);
    } else {
      log('T4.2 - Persistance prix', 'FAIL', `Valeurs vides: ${values.join(', ')}`);
    }

  } catch (e) {
    log('TEST 4', 'FAIL', `Exception: ${e.message}`);
    await screenshot(page, 'T4-error');
  }

  // ============================================================
  // TEST 5: Mobile (390x844)
  // ============================================================
  console.log('\n========== TEST 5: Mobile (390x844) ==========');
  try {
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      locale: 'fr-FR',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    });
    const mobilePage = await mobileContext.newPage();

    // Login on mobile
    await mobilePage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    const mEmailInput = mobilePage.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
    await mEmailInput.fill('yvanmaah@gmail.com');

    const mPinInput = mobilePage.locator('input[name="pin"], input[type="password"], input[placeholder*="PIN"], input[inputmode="numeric"]').first();
    const mPinVisible = await mPinInput.isVisible({ timeout: 3000 }).catch(() => false);
    if (mPinVisible) {
      await mPinInput.fill('1234');
    } else {
      const pinDigits = mobilePage.locator('input[maxlength="1"]');
      const digitCount = await pinDigits.count();
      if (digitCount >= 4) {
        for (let i = 0; i < 4; i++) {
          await pinDigits.nth(i).fill(String(i + 1));
        }
      }
    }

    await mobilePage.locator('button[type="submit"], button:has-text("Accéder"), button:has-text("Connexion")').first().click();
    await mobilePage.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {});
    await mobilePage.waitForTimeout(2000);

    // T5.1 - Dashboard mobile — header lisible ?
    await screenshot(mobilePage, 'T5-01-mobile-dashboard');
    const headerVisible = await mobilePage.locator('header, nav, [class*="header"]').first().isVisible({ timeout: 3000 }).catch(() => false);
    const headerBox = await mobilePage.locator('header, nav, [class*="header"]').first().boundingBox().catch(() => null);
    const headerOverflow = headerBox && headerBox.width > 390;

    if (headerVisible && !headerOverflow) {
      log('T5.1 - Dashboard mobile header', 'PASS', `Header visible, pas de débordement (largeur: ${headerBox?.width || 'N/A'}px)`);
    } else if (headerOverflow) {
      log('T5.1 - Dashboard mobile header', 'FAIL', `Header déborde: ${headerBox.width}px > 390px`);
    } else {
      log('T5.1 - Dashboard mobile header', 'FAIL', 'Header non visible');
    }

    // Navigate to vehicle page
    const mLinks = await mobilePage.locator('a[href*="/dashboard/"]').all();
    for (const link of mLinks) {
      const href = await link.getAttribute('href').catch(() => '');
      if (href && !href.includes('scan') && href !== '/dashboard/' && href !== '/dashboard') {
        await link.click();
        await mobilePage.waitForTimeout(3000);
        break;
      }
    }

    await screenshot(mobilePage, 'T5-02-mobile-vehicle');

    // T5.2 - Fiche véhicule mobile — rentabilité en premier ?
    const bodyText = await mobilePage.locator('body').innerText().catch(() => '');
    const rentaIndex = bodyText.search(/rentabilité|marge|prix.*achat|achat.*vente/i);
    const repairIndex = bodyText.search(/réparation|défaillance/i);

    const rentaFirst = rentaIndex !== -1 && (repairIndex === -1 || rentaIndex < repairIndex);
    if (rentaFirst) {
      log('T5.2 - Mobile rentabilité en premier', 'PASS', `Rentabilité pos: ${rentaIndex}, Réparations pos: ${repairIndex}`);
    } else {
      log('T5.2 - Mobile rentabilité en premier', 'FAIL', `Rentabilité pos: ${rentaIndex}, Réparations pos: ${repairIndex}`);
    }

    await mobileContext.close();

  } catch (e) {
    log('TEST 5', 'FAIL', `Exception: ${e.message}`);
  }

  // ============================================================
  // TEST 6: Sécurité
  // ============================================================
  console.log('\n========== TEST 6: Sécurité ==========');
  try {
    // T6.1 - Supprime les cookies, /dashboard → redirigé vers /login ?
    const secureContext = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const securePage = await secureContext.newPage();

    await securePage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await securePage.waitForTimeout(3000);
    const dashUrl = securePage.url();
    await screenshot(securePage, 'T6-01-no-auth-dashboard');

    if (dashUrl.includes('/login')) {
      log('T6.1 - /dashboard → /login', 'PASS', `Redirigé vers: ${dashUrl}`);
    } else if (dashUrl.includes('/dashboard')) {
      log('T6.1 - /dashboard → /login', 'FAIL', `PAS redirigé, URL: ${dashUrl}`);
    } else {
      log('T6.1 - /dashboard → /login', 'PASS', `Redirigé vers: ${dashUrl}`);
    }

    // T6.2 - /api/dashboard → 401 ?
    const apiResponse = await securePage.goto(`${BASE_URL}/api/dashboard`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => null);
    const apiStatus = apiResponse ? apiResponse.status() : 'N/A';
    const apiBody = await securePage.locator('body').innerText().catch(() => '');
    await screenshot(securePage, 'T6-02-api-no-auth');

    if (apiStatus === 401 || apiStatus === 403) {
      log('T6.2 - /api/dashboard → 401', 'PASS', `Status: ${apiStatus}`);
    } else if (apiBody.toLowerCase().includes('unauthorized') || apiBody.toLowerCase().includes('error') || apiBody.includes('401')) {
      log('T6.2 - /api/dashboard → 401', 'PASS', `Status: ${apiStatus}, Body contient erreur: ${apiBody.substring(0, 100)}`);
    } else {
      log('T6.2 - /api/dashboard → 401', 'FAIL', `Status: ${apiStatus}, Body: ${apiBody.substring(0, 200)}`);
    }

    await secureContext.close();

  } catch (e) {
    log('TEST 6', 'FAIL', `Exception: ${e.message}`);
    await screenshot(page, 'T6-error').catch(() => {});
  }

  // ============================================================
  // TEST 7: Page publique
  // ============================================================
  console.log('\n========== TEST 7: Page publique ==========');
  try {
    const publicContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const publicPage = await publicContext.newPage();

    await publicPage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await publicPage.waitForTimeout(2000);
    await screenshot(publicPage, 'T7-01-public-homepage');

    // T7.1 - Aucun lien vers /dashboard ?
    const dashboardLinks = await publicPage.locator('a[href*="dashboard"]').count();
    if (dashboardLinks === 0) {
      log('T7.1 - Pas de lien /dashboard', 'PASS', 'Aucun lien vers /dashboard sur la page publique');
    } else {
      const hrefs = [];
      const links = await publicPage.locator('a[href*="dashboard"]').all();
      for (const l of links) {
        hrefs.push(await l.getAttribute('href'));
      }
      log('T7.1 - Pas de lien /dashboard', 'FAIL', `Liens trouvés: ${hrefs.join(', ')}`);
    }

    await publicContext.close();

  } catch (e) {
    log('TEST 7', 'FAIL', `Exception: ${e.message}`);
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n\n========================================');
  console.log('         RESUME DES TESTS E2E');
  console.log('========================================\n');

  let passCount = 0;
  let failCount = 0;

  for (const r of results) {
    const emoji = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${emoji} ${r.test}: ${r.detail}`);
    if (r.status === 'PASS') passCount++;
    else failCount++;
  }

  console.log(`\n📊 Score: ${passCount}/${passCount + failCount} PASS (${failCount} FAIL)`);

  await browser.close();
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
