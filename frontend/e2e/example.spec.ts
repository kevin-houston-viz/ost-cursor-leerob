import { test, expect } from '@playwright/test';

test.describe('Ostly Application', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Frontend/); // Case-sensitive
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    // Add more assertions as features are built
  });
});

