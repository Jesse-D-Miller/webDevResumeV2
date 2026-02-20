import { test, expect } from '@playwright/test';

test('resume page shows content and navigation', async ({ page }) => {
  await page.goto('/resume');

  await expect(
    page.getByRole('heading', { name: /jesse miller/i })
  ).toBeVisible();
  await expect(page.getByText(/greater vancouver area/i)).toBeVisible();

  await expect(page.getByRole('button', { name: /resume pdf/i })).toBeVisible();
  await expect(
    page.getByRole('button', { name: /return to explorer/i })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: /education/i })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /lighthouse labs/i })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /simon fraser university/i })
  ).toBeVisible();
});

test('resume page returns to explorer', async ({ page }) => {
  await page.goto('/resume');

  await page.getByRole('button', { name: /return to explorer/i }).click();
  await expect(page).toHaveURL(/\/explorer$/);
});
