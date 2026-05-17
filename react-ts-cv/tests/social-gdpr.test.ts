import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const exportPath = path.join(__dirname, '../../social-gdpr-test-export.json');

/**
 * Opens the contact section panel if it is currently collapsed.
 */
async function openContactSection(page: import('@playwright/test').Page) {
  const header = page.locator('text=Dane kontaktowe').first();
  const section = header.locator('..');
  const isExpanded = await section.locator('input[type="email"]').isVisible().catch(() => false);
  if (!isExpanded) {
    await header.click();
    await page.waitForTimeout(200);
  }
}

test.describe('Social links and GDPR consent', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.afterAll(() => {
    if (fs.existsSync(exportPath)) fs.unlinkSync(exportPath);
  });

  test('GDPR consent clause is enabled by default and appears in preview', async ({ page }) => {
    const gdprText = 'Wyrażam zgodę na przetwarzanie moich danych osobowych';
    await expect(page.locator('.cv-preview').getByText(gdprText, { exact: false })).toBeVisible();
  });

  test('disabling GDPR checkbox removes clause from preview', async ({ page }) => {
    const gdprText = 'Wyrażam zgodę na przetwarzanie moich danych osobowych';
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.uncheck();
    await expect(page.locator('.cv-preview').getByText(gdprText, { exact: false })).not.toBeVisible();
  });

  test('adding a social link shows it in the CV preview', async ({ page }) => {
    await openContactSection(page);

    await page.locator('button:has-text("+ Dodaj profil")').click();

    const nameInputs = page.locator('input[placeholder="np. GitHub"]');
    const urlInputs = page.locator('input[placeholder="https://..."]');
    await nameInputs.last().fill('GitHub');
    await urlInputs.last().fill('https://github.com/testuser');

    await expect(page.locator('.cv-preview').getByText('GitHub:', { exact: false })).toBeVisible();
    await expect(page.locator('.cv-preview a[href="https://github.com/testuser"]')).toBeVisible();
  });

  test('social links with empty name or url are not shown in preview', async ({ page }) => {
    await openContactSection(page);

    await page.locator('button:has-text("+ Dodaj profil")').click();

    await expect(page.locator('.cv-preview a')).toHaveCount(0);
  });

  test('social links and GDPR consent are persisted in JSON export', async ({ page }) => {
    await openContactSection(page);

    await page.locator('button:has-text("+ Dodaj profil")').click();
    const nameInputs = page.locator('input[placeholder="np. GitHub"]');
    const urlInputs = page.locator('input[placeholder="https://..."]');
    await nameInputs.last().fill('LinkedIn');
    await urlInputs.last().fill('https://linkedin.com/in/testuser');

    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Zapisz do pliku")').click();
    const download = await downloadPromise;
    await download.saveAs(exportPath);

    const exported = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));

    expect(exported.gdprConsent).toBe(true);
    expect(exported.socialLinks).toHaveLength(1);
    expect(exported.socialLinks[0].name).toBe('LinkedIn');
    expect(exported.socialLinks[0].url).toBe('https://linkedin.com/in/testuser');
  });

  test('multiple social links all appear in preview', async ({ page }) => {
    await openContactSection(page);

    const platforms = [
      { name: 'GitHub', url: 'https://github.com/user' },
      { name: 'LinkedIn', url: 'https://linkedin.com/in/user' },
    ];

    for (const platform of platforms) {
      await page.locator('button:has-text("+ Dodaj profil")').click();
      await page.locator('input[placeholder="np. GitHub"]').last().fill(platform.name);
      await page.locator('input[placeholder="https://..."]').last().fill(platform.url);
    }

    await expect(page.locator('.cv-preview').getByText('GitHub:', { exact: false })).toBeVisible();
    await expect(page.locator('.cv-preview').getByText('LinkedIn:', { exact: false })).toBeVisible();
  });
});