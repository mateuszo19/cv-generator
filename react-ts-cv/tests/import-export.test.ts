import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('CV Import/Export Test', () => {
  const testCVPath = path.join(__dirname, '../../test-comprehensive-cv.json');
  const exportPath = path.join(__dirname, '../../exported-cv.json');

  test.beforeAll(async () => {
    // Verify test CV file exists
    expect(fs.existsSync(testCVPath)).toBeTruthy();
  });

  test('full import/export cycle with comprehensive CV', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5175');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    console.log('📄 Page loaded, starting import test...');

    // Step 1: Import the comprehensive CV
    const fileInput = await page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();

    console.log('📥 Importing test CV file...');
    await fileInput.setInputFiles(testCVPath);

    // Wait for file to be processed (alert should appear)
    await page.waitForTimeout(1000);

    // Dismiss any alerts
    page.on('dialog', async dialog => {
      console.log(`ℹ️  Alert: ${dialog.message()}`);
      await dialog.accept();
    });

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Verify some key data was loaded in the CV preview (left panel)
    console.log('✅ CV imported successfully');

    // Check if data is visible in the CV preview
    const previewName = page.locator('.cv-preview').getByText('Jan Kowalski');
    await expect(previewName).toBeVisible();

    // Verify some data in preview (use first() since text may appear multiple times)
    await expect(page.locator('.cv-preview').getByText('Tech Solutions Sp. z o.o.').first()).toBeVisible();

    console.log('✅ Basic data verified in CV preview');

    // Step 2: Export the CV
    console.log('📤 Exporting CV...');

    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    const exportButton = await page.locator('button:has-text("Zapisz do JSON")').first();
    await expect(exportButton).toBeAttached();
    await exportButton.click();

    // Wait for download
    const download = await downloadPromise;
    console.log(`✅ File downloaded: ${download.suggestedFilename()}`);

    // Save the downloaded file
    await download.saveAs(exportPath);

    // Step 3: Verify the exported data matches the original
    console.log('🔍 Verifying exported data...');

    const originalData = JSON.parse(fs.readFileSync(testCVPath, 'utf-8'));
    const exportedData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));

    // Compare the data
    const dataMatches = JSON.stringify(originalData) === JSON.stringify(exportedData);

    if (dataMatches) {
      console.log('✅ SUCCESS: Exported data matches original data perfectly!');
    } else {
      console.log('❌ FAILURE: Exported data differs from original');

      // Find differences
      const diffs = findDifferences(originalData, exportedData);
      console.log('Differences found:', JSON.stringify(diffs, null, 2));
    }

    expect(dataMatches).toBeTruthy();

    // Step 4: Test re-importing the exported file
    console.log('🔄 Testing re-import of exported file...');

    // Clear the form by reloading
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Import the exported file
    const fileInput2 = await page.locator('input[type="file"]').first();
    await fileInput2.setInputFiles(exportPath);

    // Wait for processing
    await page.waitForTimeout(2000);

    // Dismiss alert
    page.removeAllListeners('dialog');
    page.on('dialog', async dialog => {
      console.log(`ℹ️  Alert: ${dialog.message()}`);
      await dialog.accept();
    });

    // Verify data again in CV preview
    const previewName2 = page.locator('.cv-preview').getByText('Jan Kowalski');
    await expect(previewName2).toBeVisible();

    console.log('✅ Re-import successful!');

    // Verify complex sections in preview
    console.log('🔍 Verifying complex sections in preview...');

    // Check for custom section titles
    await expect(page.locator('.cv-preview').getByText('Projekty IT')).toBeVisible();
    await expect(page.locator('.cv-preview').getByText('Wykształcenie')).toBeVisible();
    await expect(page.locator('.cv-preview').getByText('Certyfikaty')).toBeVisible();

    console.log('✅ All complex sections verified in preview');

    console.log('🎉 All tests passed!');
  });

  test.afterAll(async () => {
    // Clean up exported file
    if (fs.existsSync(exportPath)) {
      fs.unlinkSync(exportPath);
      console.log('🧹 Cleaned up exported file');
    }
  });
});

function findDifferences(obj1: any, obj2: any, path = ''): any {
  const diffs: any = {};

  if (obj1 === obj2) return diffs;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    diffs[path] = { original: obj1, exported: obj2 };
    return diffs;
  }

  if (obj1 === null || obj2 === null) {
    diffs[path] = { original: obj1, exported: obj2 };
    return diffs;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  for (const key of keys1) {
    const currentPath = path ? `${path}.${key}` : key;

    if (!(key in obj2)) {
      diffs[currentPath] = { original: obj1[key], exported: 'MISSING' };
      continue;
    }

    const val1 = obj1[key];
    const val2 = obj2[key];

    if (Array.isArray(val1) && Array.isArray(val2)) {
      if (val1.length !== val2.length) {
        diffs[currentPath] = {
          original: `array with ${val1.length} items`,
          exported: `array with ${val2.length} items`
        };
      } else {
        for (let i = 0; i < val1.length; i++) {
          const arrayPath = `${currentPath}[${i}]`;
          const arrayDiffs = findDifferences(val1[i], val2[i], arrayPath);
          Object.assign(diffs, arrayDiffs);
        }
      }
    } else if (typeof val1 === 'object' && typeof val2 === 'object') {
      Object.assign(diffs, findDifferences(val1, val2, currentPath));
    } else if (val1 !== val2) {
      diffs[currentPath] = { original: val1, exported: val2 };
    }
  }

  for (const key of keys2) {
    if (!(key in obj1)) {
      const currentPath = path ? `${path}.${key}` : key;
      diffs[currentPath] = { original: 'MISSING', exported: obj2[key] };
    }
  }

  return diffs;
}