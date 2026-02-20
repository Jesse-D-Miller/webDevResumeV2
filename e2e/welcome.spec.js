import { test, expect } from '@playwright/test';

test('welcome page shows primary actions and links', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /jesse miller/i })
  ).toBeVisible();
  await expect(page.getByText(/greater vancouver area/i)).toBeVisible();
  await expect(page.getByText(/open to full-time/i)).toBeVisible();

  await expect(page.getByRole('link', { name: /email/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /github/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /linkedin/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /resume pdf/i })).toBeVisible();

  await expect(page.getByRole('button', { name: /resume/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /explorer/i })).toBeVisible();
});

test('welcome page navigates to resume and explorer', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /open resume/i }).click();
  await expect(page).toHaveURL(/\/resume$/);

  await page.goto('/');
  await page.getByRole('button', { name: /enter explorer/i }).click();
  await expect(page).toHaveURL(/\/explorer$/);
});
