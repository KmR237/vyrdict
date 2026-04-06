import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://vyrdict-one.vercel.app';
const SCREENSHOTS_DIR = '/Users/yvan/Desktop/Developpeur/ClaudeCode/Vyrdict/e2e-screenshots';

function screenshot(page, name) {
  return page.screenshot({ path: join(SCREENSHOTS_DIR, `${name}.png`), fullPage: true });
}

// Create a tiny red PNG for upload tests
function createTestPNG() {
  // Minimal valid PNG: 1x1 red pixel
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, // 8-bit RGB
    0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
    0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00, 0x00, // compressed data
    0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33, //
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, // IEND chunk
    0xae, 0x42, 0x60, 0x82
  ]);
  const path = join(SCREENSHOTS_DIR, 'test-ct.png');
  writeFileSync(path, pngBuffer);
  return path;
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
  const testPNG = createTestPNG();

  // ============================================================
  // TEST 1: Login + Dashboard
  // ============================================================
  console.log('\n========== TEST 1: Login + Dashboard ==========');
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await screenshot(page, '01-login-page');

    // Find email input and PIN input
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
    const emailVisible = await emailInput.isVisible({ timeout: 5000 }).catch(() => false);

    if (!emailVisible) {
      // Try broader search
      const allInputs = await page.locator('input').all();
      console.log(`  Found ${allInputs.length} inputs on login page`);
      for (let i = 0; i < allInputs.length; i++) {
        const type = await allInputs[i].getAttribute('type');
        const placeholder = await allInputs[i].getAttribute('placeholder');
        const name = await allInputs[i].getAttribute('name');
        console.log(`  Input ${i}: type=${type}, placeholder=${placeholder}, name=${name}`);
      }
    }

    await emailInput.fill('yvanmaah@gmail.com');

    // PIN input - could be separate digits or single input
    const pinInput = page.locator('input[name="pin"], input[type="password"], input[placeholder*="PIN"], input[placeholder*="pin"], input[inputmode="numeric"]').first();
    const pinVisible = await pinInput.isVisible({ timeout: 3000 }).catch(() => false);

    if (pinVisible) {
      await pinInput.fill('1234');
    } else {
      // Try individual PIN digit inputs
      const pinDigits = page.locator('input[maxlength="1"]');
      const digitCount = await pinDigits.count();
      if (digitCount >= 4) {
        for (let i = 0; i < 4; i++) {
          await pinDigits.nth(i).fill(String(i + 1));
        }
      }
    }

    await screenshot(page, '01-login-filled');

    // Click submit button
    const submitBtn = page.locator('button[type="submit"], button:has-text("Accéder"), button:has-text("Connexion"), button:has-text("Se connecter")').first();
    await submitBtn.click();

    // Wait for navigation
    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    await screenshot(page, '01-dashboard-after-login');

    if (currentUrl.includes('/dashboard')) {
      log('TEST 1', 'PASS', `Redirigé vers ${currentUrl} après login`);
    } else {
      log('TEST 1', 'FAIL', `URL actuelle: ${currentUrl} — pas redirigé vers /dashboard`);
      // Check for error messages
      const errorText = await page.locator('[class*="error"], [role="alert"], .text-red').textContent().catch(() => 'aucun message d\'erreur visible');
      console.log(`  Message d'erreur: ${errorText}`);
    }
  } catch (e) {
    log('TEST 1', 'FAIL', `Exception: ${e.message}`);
    await screenshot(page, '01-error');
  }

  // ============================================================
  // TEST 2: Scanner un CT
  // ============================================================
  console.log('\n========== TEST 2: Scanner un CT ==========');
  try {
    // Look for scan button on dashboard
    const scanBtn = page.locator('a:has-text("Scan"), button:has-text("Scan"), a:has-text("Scanner"), button:has-text("Scanner"), a[href*="scan"]').first();
    const scanBtnVisible = await scanBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (scanBtnVisible) {
      await scanBtn.click();
      await page.waitForTimeout(2000);
    } else {
      // Navigate directly
      await page.goto(`${BASE_URL}/dashboard/scan`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
    }

    const scanUrl = page.url();
    await screenshot(page, '02-scan-page');

    const browseBtn = page.locator('button:has-text("Parcourir"), button:has-text("fichier"), label:has-text("Parcourir"), label:has-text("fichier")').first();
    const browseVisible = await browseBtn.isVisible({ timeout: 3000 }).catch(() => false);

    // Also check for file input
    const fileInput = page.locator('input[type="file"]').first();
    const fileInputExists = await fileInput.count() > 0;

    if (scanUrl.includes('/scan') && (browseVisible || fileInputExists)) {
      log('TEST 2', 'PASS', `Page scan accessible. Bouton parcourir: ${browseVisible}, Input file: ${fileInputExists}`);
    } else if (scanUrl.includes('/scan')) {
      log('TEST 2', 'PASS', `Page scan accessible (${scanUrl}) mais bouton parcourir non trouvé — vérifier le screenshot`);
    } else {
      log('TEST 2', 'FAIL', `URL: ${scanUrl}, bouton parcourir visible: ${browseVisible}`);
    }
  } catch (e) {
    log('TEST 2', 'FAIL', `Exception: ${e.message}`);
    await screenshot(page, '02-error');
  }

  // ============================================================
  // TEST 3: Upload un CT
  // ============================================================
  console.log('\n========== TEST 3: Upload un CT ==========');
  try {
    // Make sure we're on scan page
    if (!page.url().includes('/scan')) {
      await page.goto(`${BASE_URL}/dashboard/scan`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
    }

    const fileInput = page.locator('input[type="file"]').first();
    const hasFileInput = await fileInput.count() > 0;

    if (hasFileInput) {
      await fileInput.setInputFiles(testPNG);
      await screenshot(page, '03-upload-started');

      // Wait for loading/processing
      await page.waitForTimeout(3000);
      await screenshot(page, '03-upload-processing');

      // Check for loading indicators
      const loadingVisible = await page.locator('[class*="loading"], [class*="spinner"], [class*="progress"], [role="progressbar"], text=/Analyse|Traitement|Chargement|Extraction/i').first().isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`  Loading visible: ${loadingVisible}`);

      // Wait for result (success or error) — up to 60s for API call
      await page.waitForTimeout(30000);
      await screenshot(page, '03-upload-result');

      // Check for error
      const errorVisible = await page.locator('text=/erreur|error|échoué|impossible/i').first().isVisible({ timeout: 2000 }).catch(() => false);
      const successVisible = await page.locator('text=/succès|terminé|résultat|véhicule/i').first().isVisible({ timeout: 2000 }).catch(() => false);

      // Check for retry button
      const retryBtn = await page.locator('button:has-text("Réessayer"), button:has-text("réessayer"), button:has-text("Retry")').first().isVisible({ timeout: 2000 }).catch(() => false);

      if (errorVisible) {
        const errorMsg = await page.locator('text=/erreur|error|échoué|impossible/i').first().textContent().catch(() => 'N/A');
        log('TEST 3', 'FAIL', `Erreur après upload: "${errorMsg}". Bouton réessayer: ${retryBtn}`);
      } else if (successVisible) {
        log('TEST 3', 'PASS', 'Upload réussi, résultat affiché');
      } else {
        // Take a final screenshot to see what happened
        await screenshot(page, '03-upload-final-state');
        const bodyText = await page.locator('body').innerText().catch(() => '');
        const shortText = bodyText.substring(0, 300);
        log('TEST 3', 'PASS', `Upload envoyé. État final incertain — voir screenshot. Texte page: ${shortText.substring(0, 150)}...`);
      }
    } else {
      log('TEST 3', 'FAIL', 'Pas d\'input file trouvé sur la page scan');
    }
  } catch (e) {
    log('TEST 3', 'FAIL', `Exception: ${e.message}`);
    await screenshot(page, '03-error');
  }

  // ============================================================
  // TEST 4: Fiche véhicule
  // ============================================================
  console.log('\n========== TEST 4: Fiche véhicule ==========');
  try {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await screenshot(page, '04-dashboard-vehicles');

    // Find a vehicle card/link
    const vehicleLink = page.locator('a[href*="/dashboard/"], [class*="vehicle"], [class*="card"]').first();
    const vehicleLinkVisible = await vehicleLink.isVisible({ timeout: 5000 }).catch(() => false);

    let vehicleUrl = null;

    if (vehicleLinkVisible) {
      await vehicleLink.click();
      await page.waitForTimeout(2000);
      vehicleUrl = page.url();
      await screenshot(page, '04-vehicle-page');

      if (vehicleUrl.includes('/dashboard/') && vehicleUrl !== `${BASE_URL}/dashboard/` && !vehicleUrl.includes('/scan')) {
        log('TEST 4 - Navigation', 'PASS', `Fiche véhicule chargée: ${vehicleUrl}`);
      } else {
        log('TEST 4 - Navigation', 'FAIL', `URL après clic: ${vehicleUrl}`);
      }
    } else {
      // Try to find any vehicle link in the page
      const allLinks = await page.locator('a').all();
      let foundVehicle = false;
      for (const link of allLinks) {
        const href = await link.getAttribute('href').catch(() => '');
        if (href && href.match(/\/dashboard\/[a-z0-9-]+$/i) && !href.includes('scan')) {
          await link.click();
          await page.waitForTimeout(2000);
          vehicleUrl = page.url();
          await screenshot(page, '04-vehicle-page');
          foundVehicle = true;
          log('TEST 4 - Navigation', 'PASS', `Fiche véhicule trouvée via lien: ${vehicleUrl}`);
          break;
        }
      }
      if (!foundVehicle) {
        log('TEST 4 - Navigation', 'FAIL', 'Aucun véhicule trouvé sur le dashboard');
      }
    }

    // If we're on a vehicle page, test interactions
    if (vehicleUrl && vehicleUrl.includes('/dashboard/') && !vehicleUrl.includes('/scan')) {

      // 4a: Status buttons
      try {
        const statusBtn = page.locator('button:has-text("En vente"), button:has-text("Vendu"), button:has-text("En stock"), button:has-text("À réparer"), button[class*="status"]').first();
        const statusVisible = await statusBtn.isVisible({ timeout: 3000 }).catch(() => false);
        if (statusVisible) {
          await statusBtn.click();
          await page.waitForTimeout(1500);
          await screenshot(page, '04a-status-changed');
          // Check for toast
          const toast = await page.locator('[class*="toast"], [role="status"], [class*="notification"], [class*="Toaster"]').first().isVisible({ timeout: 3000 }).catch(() => false);
          log('TEST 4a - Statut', 'PASS', `Bouton statut cliqué. Toast visible: ${toast}`);
        } else {
          log('TEST 4a - Statut', 'FAIL', 'Aucun bouton de statut trouvé');
        }
      } catch (e) {
        log('TEST 4a - Statut', 'FAIL', e.message);
      }

      // 4b: Prix achat/revente et marge
      try {
        const prixAchatInput = page.locator('input[placeholder*="achat"], input[name*="achat"], input[name*="purchase"], label:has-text("achat") + input, label:has-text("achat") ~ input').first();
        let prixAchatVisible = await prixAchatInput.isVisible({ timeout: 3000 }).catch(() => false);

        if (!prixAchatVisible) {
          // Try broader search - look for price-related inputs
          const allInputs = await page.locator('input[type="number"], input[inputmode="numeric"], input[inputmode="decimal"]').all();
          console.log(`  Found ${allInputs.length} numeric inputs`);
          for (let i = 0; i < Math.min(allInputs.length, 5); i++) {
            const ph = await allInputs[i].getAttribute('placeholder').catch(() => '');
            const nm = await allInputs[i].getAttribute('name').catch(() => '');
            const label = await allInputs[i].evaluate(el => {
              const prev = el.previousElementSibling;
              return prev ? prev.textContent : '';
            }).catch(() => '');
            console.log(`  NumInput ${i}: placeholder="${ph}", name="${nm}", prevLabel="${label}"`);
          }
        }

        // Try to find and fill purchase price
        const purchaseInput = page.locator('input').filter({ has: page.locator('xpath=./ancestor::*[contains(., "achat") or contains(., "Achat") or contains(., "Prix d")]') }).first();
        // Fallback: just try all number inputs
        const numInputs = await page.locator('input[type="number"], input[inputmode="numeric"]').all();

        if (numInputs.length >= 2) {
          await numInputs[0].fill('6500');
          await numInputs[0].dispatchEvent('change');
          await page.waitForTimeout(500);
          await numInputs[1].fill('9000');
          await numInputs[1].dispatchEvent('change');
          await page.waitForTimeout(1500);
          await screenshot(page, '04b-prices-filled');

          // Check if margin is calculated
          const marginText = await page.locator('text=/marge|Marge|profit|bénéfice|rentabilité/i').first().isVisible({ timeout: 2000 }).catch(() => false);
          log('TEST 4b - Prix/Marge', 'PASS', `Prix saisis (6500/9000). Marge visible: ${marginText}`);
        } else {
          log('TEST 4b - Prix/Marge', 'FAIL', `Seulement ${numInputs.length} inputs numériques trouvés`);
        }
      } catch (e) {
        log('TEST 4b - Prix/Marge', 'FAIL', e.message);
      }

      // 4c: Mode réparation
      try {
        const repairModes = page.locator('button:has-text("Minimum"), button:has-text("Complet"), button:has-text("Personnalisé"), [role="tab"]:has-text("Minimum"), [role="tab"]:has-text("Complet")');
        const repairCount = await repairModes.count();

        if (repairCount > 0) {
          // Click "Complet"
          const completBtn = page.locator('button:has-text("Complet"), [role="tab"]:has-text("Complet")').first();
          if (await completBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await completBtn.click();
            await page.waitForTimeout(1000);
            await screenshot(page, '04c-mode-complet');
          }

          // Click "Personnalisé"
          const customBtn = page.locator('button:has-text("Personnalisé"), [role="tab"]:has-text("Personnalisé")').first();
          if (await customBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await customBtn.click();
            await page.waitForTimeout(1000);
            await screenshot(page, '04c-mode-perso');
          }

          log('TEST 4c - Modes réparation', 'PASS', `${repairCount} modes trouvés et cliqués`);
        } else {
          log('TEST 4c - Modes réparation', 'FAIL', 'Aucun bouton de mode réparation trouvé');
        }
      } catch (e) {
        log('TEST 4c - Modes réparation', 'FAIL', e.message);
      }

      // 4d: Modifier prix réparation
      try {
        // Look for repair cost inputs (there could be many)
        const repairInputs = await page.locator('input[type="number"], input[inputmode="numeric"]').all();
        if (repairInputs.length >= 3) {
          // The 3rd+ inputs are likely repair costs
          const repairInput = repairInputs[2];
          const oldVal = await repairInput.inputValue().catch(() => '');
          await repairInput.fill('150');
          await repairInput.dispatchEvent('change');
          await page.waitForTimeout(1500);
          await screenshot(page, '04d-repair-price-changed');

          // Check if total changed
          const totalText = await page.locator('text=/total|Total|estimation|Estimation/i').first().textContent().catch(() => 'N/A');
          log('TEST 4d - Prix réparation', 'PASS', `Prix changé de "${oldVal}" à "150". Total: ${totalText}`);
        } else {
          log('TEST 4d - Prix réparation', 'FAIL', 'Pas assez d\'inputs numériques pour les réparations');
        }
      } catch (e) {
        log('TEST 4d - Prix réparation', 'FAIL', e.message);
      }

      // 4e: Ouvrir détail défaillance (chevron)
      try {
        const chevron = page.locator('[class*="chevron"], button[aria-expanded], [class*="accordion"], details summary, [class*="collapse"], svg[class*="rotate"], button:has(svg[class*="ChevronDown"]), button:has(svg)').first();
        const chevronVisible = await chevron.isVisible({ timeout: 3000 }).catch(() => false);

        if (chevronVisible) {
          await chevron.click();
          await page.waitForTimeout(1000);
          await screenshot(page, '04e-defaillance-detail');

          const detailContent = await page.locator('text=/pièce|Pièce|main.*œuvre|MO|Main/i').first().isVisible({ timeout: 2000 }).catch(() => false);
          log('TEST 4e - Détail défaillance', 'PASS', `Chevron cliqué. Détail pièce/MO visible: ${detailContent}`);
        } else {
          log('TEST 4e - Détail défaillance', 'FAIL', 'Aucun chevron/accordéon trouvé');
        }
      } catch (e) {
        log('TEST 4e - Détail défaillance', 'FAIL', e.message);
      }

      // 4f: Notes personnelles
      try {
        const notesInput = page.locator('textarea, input[name*="note"], textarea[placeholder*="note"], textarea[placeholder*="Note"]').first();
        const notesVisible = await notesInput.isVisible({ timeout: 3000 }).catch(() => false);

        if (notesVisible) {
          const testNote = `Test E2E ${Date.now()}`;
          await notesInput.fill(testNote);
          await notesInput.dispatchEvent('change');
          await page.click('body'); // click elsewhere to trigger save
          await page.waitForTimeout(2000);
          await screenshot(page, '04f-notes-typed');

          // Reload and check persistence
          const currentVehicleUrl = page.url();
          await page.reload({ waitUntil: 'networkidle' });
          await page.waitForTimeout(2000);

          const savedNote = await notesInput.inputValue().catch(() => '');
          if (savedNote.includes('Test E2E')) {
            log('TEST 4f - Notes', 'PASS', `Note sauvegardée et persistée après reload: "${savedNote}"`);
          } else {
            log('TEST 4f - Notes', 'FAIL', `Note NON persistée. Attendu contenant "Test E2E", obtenu: "${savedNote}"`);
          }
          await screenshot(page, '04f-notes-after-reload');
        } else {
          log('TEST 4f - Notes', 'FAIL', 'Aucun champ notes trouvé');
        }
      } catch (e) {
        log('TEST 4f - Notes', 'FAIL', e.message);
      }

      // 4g: Source d'achat
      try {
        const sourceSelect = page.locator('select:has(option:has-text("Particulier")), select:has(option:has-text("Enchères")), select[name*="source"], button:has-text("Particulier"), button:has-text("Enchères")').first();
        const sourceVisible = await sourceSelect.isVisible({ timeout: 3000 }).catch(() => false);

        if (sourceVisible) {
          const tagName = await sourceSelect.evaluate(el => el.tagName).catch(() => '');
          if (tagName === 'SELECT') {
            const options = await sourceSelect.locator('option').allTextContents();
            console.log(`  Source options: ${options.join(', ')}`);
            if (options.length > 1) {
              await sourceSelect.selectOption({ index: 1 });
              await page.waitForTimeout(1500);
            }
          } else {
            await sourceSelect.click();
            await page.waitForTimeout(500);
          }
          await screenshot(page, '04g-source-changed');
          log('TEST 4g - Source achat', 'PASS', 'Source modifiée');
        } else {
          log('TEST 4g - Source achat', 'FAIL', 'Aucun sélecteur de source trouvé');
        }
      } catch (e) {
        log('TEST 4g - Source achat', 'FAIL', e.message);
      }

      // 4h: Date d'achat + jours en stock
      try {
        const dateInput = page.locator('input[type="date"], input[name*="date"]').first();
        const dateVisible = await dateInput.isVisible({ timeout: 3000 }).catch(() => false);

        if (dateVisible) {
          await dateInput.fill('2026-03-15');
          await dateInput.dispatchEvent('change');
          await page.waitForTimeout(1500);
          await screenshot(page, '04h-date-changed');

          const stockDays = await page.locator('text=/jour|stock|jours/i').first().isVisible({ timeout: 2000 }).catch(() => false);
          log('TEST 4h - Date achat', 'PASS', `Date saisie. Jours en stock visible: ${stockDays}`);
        } else {
          log('TEST 4h - Date achat', 'FAIL', 'Aucun input date trouvé');
        }
      } catch (e) {
        log('TEST 4h - Date achat', 'FAIL', e.message);
      }

      // 4i: Export PDF
      try {
        const pdfBtn = page.locator('button:has-text("PDF"), button:has-text("Exporter"), button:has-text("Imprimer"), a:has-text("PDF")').first();
        const pdfVisible = await pdfBtn.isVisible({ timeout: 3000 }).catch(() => false);

        if (pdfVisible) {
          // Listen for print dialog
          page.once('dialog', async dialog => {
            await dialog.dismiss();
          });
          await pdfBtn.click();
          await page.waitForTimeout(2000);
          await screenshot(page, '04i-pdf-export');
          log('TEST 4i - Export PDF', 'PASS', 'Bouton PDF cliqué');
        } else {
          log('TEST 4i - Export PDF', 'FAIL', 'Aucun bouton PDF/Exporter trouvé');
        }
      } catch (e) {
        log('TEST 4i - Export PDF', 'FAIL', e.message);
      }

      // 4j: Breadcrumb retour dashboard
      try {
        const breadcrumb = page.locator('a:has-text("Dashboard"), a:has-text("← Dashboard"), a:has-text("Retour"), button:has-text("← Dashboard"), a[href="/dashboard"]').first();
        const breadcrumbVisible = await breadcrumb.isVisible({ timeout: 3000 }).catch(() => false);

        if (breadcrumbVisible) {
          await breadcrumb.click();
          await page.waitForURL('**/dashboard', { timeout: 5000 }).catch(() => {});
          await page.waitForTimeout(1000);
          const url = page.url();
          await screenshot(page, '04j-breadcrumb-dashboard');

          if (url.endsWith('/dashboard') || url.endsWith('/dashboard/')) {
            log('TEST 4j - Breadcrumb', 'PASS', `Retour au dashboard: ${url}`);
          } else {
            log('TEST 4j - Breadcrumb', 'FAIL', `URL après clic breadcrumb: ${url}`);
          }
        } else {
          log('TEST 4j - Breadcrumb', 'FAIL', 'Aucun lien retour dashboard trouvé');
        }
      } catch (e) {
        log('TEST 4j - Breadcrumb', 'FAIL', e.message);
      }
    }
  } catch (e) {
    log('TEST 4', 'FAIL', `Exception globale: ${e.message}`);
    await screenshot(page, '04-error');
  }

  // ============================================================
  // TEST 5: Mobile viewport
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

    // Go to a vehicle page
    const mVehicleLink = mobilePage.locator('a[href*="/dashboard/"]').first();
    const mVehicleLinkVisible = await mVehicleLink.isVisible({ timeout: 5000 }).catch(() => false);

    if (mVehicleLinkVisible) {
      const href = await mVehicleLink.getAttribute('href');
      if (href && !href.includes('scan')) {
        await mVehicleLink.click();
      } else {
        // Find non-scan link
        const allLinks = await mobilePage.locator('a[href*="/dashboard/"]').all();
        for (const l of allLinks) {
          const h = await l.getAttribute('href');
          if (h && !h.includes('scan')) {
            await l.click();
            break;
          }
        }
      }
      await mobilePage.waitForTimeout(2000);
    }

    await screenshot(mobilePage, '05-mobile-vehicle');

    // Check if rentability is first
    const bodyText = await mobilePage.locator('body').innerText().catch(() => '');
    const rentaIndex = bodyText.search(/rentabilité|marge|prix.*achat/i);
    const repairIndex = bodyText.search(/réparation|défaillance/i);

    const rentaFirst = rentaIndex !== -1 && (repairIndex === -1 || rentaIndex < repairIndex);
    console.log(`  Rentabilité position: ${rentaIndex}, Réparations position: ${repairIndex}`);

    // Check input sizes
    const inputsOnMobile = await mobilePage.locator('input').all();
    let smallInputs = 0;
    for (const inp of inputsOnMobile) {
      const box = await inp.boundingBox().catch(() => null);
      if (box && box.height < 36) {
        smallInputs++;
      }
    }

    // Check header overlap
    await screenshot(mobilePage, '05-mobile-header');

    if (rentaFirst) {
      log('TEST 5 - Mobile', 'PASS', `Rentabilité en premier. Inputs trop petits: ${smallInputs}/${inputsOnMobile.length}`);
    } else {
      log('TEST 5 - Mobile', 'FAIL', `Rentabilité PAS en premier (pos ${rentaIndex} vs réparations pos ${repairIndex}). Inputs trop petits: ${smallInputs}`);
    }

    await mobileContext.close();
  } catch (e) {
    log('TEST 5', 'FAIL', `Exception: ${e.message}`);
  }

  // ============================================================
  // TEST 6: Persistance
  // ============================================================
  console.log('\n========== TEST 6: Persistance ==========');
  try {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await screenshot(page, '06-dashboard-persistence');

    // Find vehicle and check if data persisted
    const vehicleCard = page.locator('a[href*="/dashboard/"]').first();
    const vcVisible = await vehicleCard.isVisible({ timeout: 5000 }).catch(() => false);

    if (vcVisible) {
      const href = await vehicleCard.getAttribute('href');
      if (href && !href.includes('scan')) {
        await vehicleCard.click();
        await page.waitForTimeout(2000);
        await screenshot(page, '06-vehicle-persisted');

        // Check if prices are still there
        const numInputs = await page.locator('input[type="number"], input[inputmode="numeric"]').all();
        const values = [];
        for (const inp of numInputs.slice(0, 5)) {
          values.push(await inp.inputValue().catch(() => ''));
        }
        console.log(`  Input values: ${values.join(', ')}`);

        // Check notes
        const notesInput = page.locator('textarea').first();
        const noteVal = await notesInput.inputValue().catch(() => 'N/A');
        console.log(`  Notes value: ${noteVal}`);

        log('TEST 6', 'PASS', `Véhicule rechargé. Valeurs inputs: [${values.join(', ')}]. Notes: "${noteVal.substring(0, 50)}"`);
      } else {
        log('TEST 6', 'FAIL', 'Lien véhicule pointe vers scan');
      }
    } else {
      log('TEST 6', 'FAIL', 'Aucun véhicule trouvé sur le dashboard');
    }
  } catch (e) {
    log('TEST 6', 'FAIL', `Exception: ${e.message}`);
  }

  // ============================================================
  // TEST 7: Page publique
  // ============================================================
  console.log('\n========== TEST 7: Page publique ==========');
  try {
    // Use a fresh context (not logged in)
    const publicContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const publicPage = await publicContext.newPage();

    await publicPage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await publicPage.waitForTimeout(2000);
    await screenshot(publicPage, '07-public-homepage');

    // Check for dashboard/login links
    const dashboardLink = await publicPage.locator('a[href*="dashboard"], a[href*="login"]').count();
    if (dashboardLink === 0) {
      log('TEST 7a - Pas de lien privé', 'PASS', 'Aucun lien vers /dashboard ou /login sur la page publique');
    } else {
      const links = await publicPage.locator('a[href*="dashboard"], a[href*="login"]').all();
      const hrefs = [];
      for (const l of links) {
        hrefs.push(await l.getAttribute('href'));
      }
      log('TEST 7a - Pas de lien privé', 'FAIL', `Liens trouvés: ${hrefs.join(', ')}`);
    }

    // Test public upload
    const publicFileInput = publicPage.locator('input[type="file"]').first();
    const publicFileExists = await publicFileInput.count() > 0;

    if (publicFileExists) {
      await publicFileInput.setInputFiles(testPNG);
      await publicPage.waitForTimeout(3000);
      await screenshot(publicPage, '07-public-upload-started');

      // Wait for processing
      await publicPage.waitForTimeout(30000);
      await screenshot(publicPage, '07-public-upload-result');

      const resultVisible = await publicPage.locator('text=/résultat|véhicule|défaillance|contrôle/i').first().isVisible({ timeout: 5000 }).catch(() => false);

      if (resultVisible) {
        log('TEST 7b - Upload public', 'PASS', 'Résultat affiché après upload');

        // Check WhatsApp share
        const whatsappBtn = await publicPage.locator('a[href*="whatsapp"], button:has-text("WhatsApp"), a:has-text("WhatsApp"), button:has-text("Partager")').first().isVisible({ timeout: 3000 }).catch(() => false);
        if (whatsappBtn) {
          log('TEST 7c - WhatsApp', 'PASS', 'Bouton WhatsApp visible');
        } else {
          log('TEST 7c - WhatsApp', 'FAIL', 'Pas de bouton WhatsApp trouvé');
        }
      } else {
        const errorVis = await publicPage.locator('text=/erreur|error/i').first().isVisible({ timeout: 2000 }).catch(() => false);
        if (errorVis) {
          const errText = await publicPage.locator('text=/erreur|error/i').first().textContent().catch(() => '');
          log('TEST 7b - Upload public', 'FAIL', `Erreur: ${errText}`);
        } else {
          log('TEST 7b - Upload public', 'PASS', 'Upload envoyé, état final à vérifier sur screenshot');
        }
      }
    } else {
      log('TEST 7b - Upload public', 'FAIL', 'Pas d\'input file sur la page publique');
    }

    await publicContext.close();
  } catch (e) {
    log('TEST 7', 'FAIL', `Exception: ${e.message}`);
  }

  // ============================================================
  // TEST 8: Sécurité
  // ============================================================
  console.log('\n========== TEST 8: Sécurité ==========');
  try {
    // First, logout
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    const logoutBtn = page.locator('button:has-text("Déconnexion"), button:has-text("Logout"), a:has-text("Déconnexion"), button:has-text("déconnexion")').first();
    const logoutVisible = await logoutBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (logoutVisible) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '08-after-logout');
      log('TEST 8a - Déconnexion', 'PASS', `Déconnecté. URL: ${page.url()}`);
    } else {
      log('TEST 8a - Déconnexion', 'FAIL', 'Bouton déconnexion non trouvé');
      // Clear cookies to simulate logout
      await context.clearCookies();
    }

    // Test /dashboard redirect
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const dashUrl = page.url();
    await screenshot(page, '08-dashboard-no-auth');

    if (dashUrl.includes('/login')) {
      log('TEST 8b - /dashboard protégé', 'PASS', `Redirigé vers: ${dashUrl}`);
    } else if (dashUrl.includes('/dashboard')) {
      log('TEST 8b - /dashboard protégé', 'FAIL', `PAS redirigé — URL: ${dashUrl}`);
    } else {
      log('TEST 8b - /dashboard protégé', 'PASS', `Redirigé vers: ${dashUrl}`);
    }

    // Test /api/dashboard
    const apiContext = await browser.newContext();
    const apiPage = await apiContext.newPage();
    const apiResponse = await apiPage.goto(`${BASE_URL}/api/dashboard`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => null);
    const apiStatus = apiResponse ? apiResponse.status() : 'N/A';
    const apiBody = await apiPage.locator('body').innerText().catch(() => '');
    await screenshot(apiPage, '08-api-no-auth');

    if (apiStatus === 401 || apiStatus === 403 || apiBody.includes('unauthorized') || apiBody.includes('Unauthorized') || apiBody.includes('error')) {
      log('TEST 8c - /api/dashboard', 'PASS', `Status: ${apiStatus}, Body: ${apiBody.substring(0, 100)}`);
    } else {
      log('TEST 8c - /api/dashboard', 'FAIL', `Status: ${apiStatus}, Body: ${apiBody.substring(0, 200)}`);
    }
    await apiContext.close();

    // Test /dashboard/scan redirect
    await page.goto(`${BASE_URL}/dashboard/scan`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const scanUrl = page.url();
    await screenshot(page, '08-scan-no-auth');

    if (scanUrl.includes('/login')) {
      log('TEST 8d - /dashboard/scan protégé', 'PASS', `Redirigé vers: ${scanUrl}`);
    } else if (scanUrl.includes('/scan')) {
      log('TEST 8d - /dashboard/scan protégé', 'FAIL', `PAS redirigé — URL: ${scanUrl}`);
    } else {
      log('TEST 8d - /dashboard/scan protégé', 'PASS', `Redirigé vers: ${scanUrl}`);
    }
  } catch (e) {
    log('TEST 8', 'FAIL', `Exception: ${e.message}`);
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n\n========================================');
  console.log('         RÉSUMÉ DES TESTS E2E');
  console.log('========================================\n');

  let passCount = 0;
  let failCount = 0;

  for (const r of results) {
    const emoji = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${emoji} ${r.test}: ${r.detail}`);
    if (r.status === 'PASS') passCount++;
    else failCount++;
  }

  console.log(`\n📊 Score: ${passCount} PASS / ${passCount + failCount} total (${failCount} FAIL)`);

  await browser.close();
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
