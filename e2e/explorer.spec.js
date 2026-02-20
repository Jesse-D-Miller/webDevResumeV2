import { test, expect } from '@playwright/test';

const hasToken = Boolean(process.env.VITE_GITHUB_TOKEN);

const waitForBuild = async (page, name) => {
  await expect(
    page.getByRole('heading', { name, exact: false })
  ).toBeVisible({ timeout: 10000 });
};

test('explorer navigation and builds', async ({ page }) => {
  await page.goto('/explorer');

  await expect(page.getByText(/character summary/i)).toBeVisible();

  await page.getByRole('button', { name: 'Projects' }).click();
  await page
    .getByRole('button', { name: /click to build project web dev resume/i })
    .click();
  await waitForBuild(page, 'Web Dev Resume');

  await page.getByRole('button', { name: 'Experience' }).click();
  await page
    .getByRole('button', { name: /click to build experience crew supervisor/i })
    .click();
  await waitForBuild(page, 'Crew Supervisor');

  await page.getByRole('button', { name: 'Map' }).click();
  await expect(page.getByRole('img', { name: /resume map/i })).toBeVisible();
});

test('stats flow reflects API availability', async ({ page }) => {
  await page.goto('/explorer');

  await page.getByRole('button', { name: 'Levels' }).click();

  const enrollButton = page.getByRole('button', {
    name: /click to enroll lighthouse labs/i,
  });
  if (await enrollButton.isVisible()) {
    await enrollButton.click();
  }

  await expect(
    page.getByRole('heading', { name: /lighthouse labs/i })
  ).toBeVisible({ timeout: 10000 });

  const installButton = page.getByRole('button', { name: /install api/i });

  if (hasToken) {
    await installButton.click();
    await expect(
      page.locator('.programming-levels-language-list')
    ).toBeVisible({ timeout: 20000 });
  } else {
    await expect(installButton).toBeVisible();
  }

  await page.getByRole('button', { name: 'Statistics' }).click();

  if (hasToken) {
    const enhanceButton = page.getByRole('button', { name: /enhance api/i });
    await enhanceButton.click();
    await expect(
      page.getByRole('heading', { name: /public repos/i })
    ).toBeVisible({ timeout: 20000 });
  } else {
    await expect(
      page.getByText(/install api first to unlock github stats/i)
    ).toBeVisible();
  }
});
