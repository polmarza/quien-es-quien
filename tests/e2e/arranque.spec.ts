import { expect, test } from '@playwright/test';

// Humo del andamiaje: el build de producción se sirve y pinta la página.
test('la app arranca y muestra el título', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Quién es quién' })).toBeVisible();
});
