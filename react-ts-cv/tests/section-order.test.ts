import { test, expect } from '@playwright/test';

test.describe('Section order management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
    page.on('dialog', (dialog) => dialog.accept());
  });

  test('section order panel is visible and contains all four sections', async ({ page }) => {
    await page.locator('text=Kolejnosc sekcji').click();

    const orderPanel = page.locator('[data-testid="section-order-row"]');
    await expect(orderPanel).toHaveCount(4);
    await expect(orderPanel.filter({ hasText: 'Opis zawodowy' })).toBeVisible();
    await expect(orderPanel.filter({ hasText: 'Doswiadczenie zawodowe' })).toBeVisible();
    await expect(orderPanel.filter({ hasText: 'Sekcje personalizowane' })).toBeVisible();
    await expect(orderPanel.filter({ hasText: 'Informacje dodatkowe' })).toBeVisible();
  });

  test('moving a section down changes its position in the order panel', async ({ page }) => {
    await page.locator('text=Kolejnosc sekcji').click();

    const rows = page.locator('[data-testid="section-order-row"]');
    const initialFirst = await rows.first().textContent();

    const firstRowDownButton = rows.first().locator('button[title="Przesuń w dół"]');
    await firstRowDownButton.click();

    const newSecond = await rows.nth(1).textContent();
    expect(newSecond).toContain(initialFirst!.trim().split('\n')[0].trim());
  });

  test('first section up button is disabled and last section down button is disabled', async ({ page }) => {
    await page.locator('text=Kolejnosc sekcji').click();

    const rows = page.locator('[data-testid="section-order-row"]');
    const count = await rows.count();

    const firstUpBtn = rows.first().locator('button[title="Przesuń w górę"]');
    const lastDownBtn = rows.nth(count - 1).locator('button[title="Przesuń w dół"]');

    await expect(firstUpBtn).toBeDisabled();
    await expect(lastDownBtn).toBeDisabled();
  });

  test('changed section order persists in JSON export', async ({ page }) => {
    await page.locator('text=Kolejnosc sekcji').click();

    const rows = page.locator('[data-testid="section-order-row"]');
    const firstRowDownButton = rows.first().locator('button[title="Przesuń w dół"]');
    await firstRowDownButton.click();

    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Zapisz do pliku")').click();
    const download = await downloadPromise;

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const json = JSON.parse(Buffer.concat(chunks).toString('utf-8'));

    expect(json.sectionOrder).toBeDefined();
    expect(Array.isArray(json.sectionOrder)).toBe(true);
    expect(json.sectionOrder[0]).not.toBe('summary');
  });

  test('importing JSON without sectionOrder uses default order', async ({ page }) => {
    const minimalCV = JSON.stringify({
      firstName: 'Test',
      lastName: 'User',
      birthDate: '',
      photo: null,
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      email: '',
      socialLinks: [],
      summary: '',
      additionalInfo: [],
      experience: [],
      customSections: [],
      language: 'pl',
      cvFont: 'Inter, sans-serif',
      gdprConsent: false,
    });

    const buffer = Buffer.from(minimalCV);
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({ name: 'old-cv.json', mimeType: 'application/json', buffer });

    await page.waitForTimeout(500);
    await page.locator('text=Kolejnosc sekcji').click();

    const orderPanel = page.locator('[data-testid="section-order-row"]');
    await expect(orderPanel).toHaveCount(4);
    await expect(orderPanel.filter({ hasText: 'Opis zawodowy' })).toBeVisible();
    await expect(orderPanel.filter({ hasText: 'Doswiadczenie zawodowe' })).toBeVisible();
    await expect(orderPanel.filter({ hasText: 'Sekcje personalizowane' })).toBeVisible();
    await expect(orderPanel.filter({ hasText: 'Informacje dodatkowe' })).toBeVisible();
  });

  test('section order is preserved after import round-trip', async ({ page }) => {
    await page.locator('text=Kolejnosc sekcji').click();

    const rows = page.locator('[data-testid="section-order-row"]');
    await rows.first().locator('button[title="Przesuń w dół"]').click();
    await rows.first().locator('button[title="Przesuń w dół"]').click();

    const orderedLabels: string[] = [];
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).locator('span.flex-1').textContent();
      orderedLabels.push(text!.trim());
    }

    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Zapisz do pliku")').click();
    const download = await downloadPromise;

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const json = JSON.parse(Buffer.concat(chunks).toString('utf-8'));

    await page.reload();
    await page.waitForLoadState('networkidle');

    const buffer = Buffer.from(JSON.stringify(json));
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({ name: 'exported.json', mimeType: 'application/json', buffer });
    await page.waitForTimeout(500);

    await page.locator('text=Kolejnosc sekcji').click();

    const rows2 = page.locator('[data-testid="section-order-row"]');
    for (let i = 0; i < orderedLabels.length; i++) {
      const text = await rows2.nth(i).locator('span.flex-1').textContent();
      expect(text!.trim()).toBe(orderedLabels[i]);
    }
  });
});