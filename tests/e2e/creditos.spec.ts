import { expect, test } from '@playwright/test';
import deck from '../../src/decks/politicos-es/deck.json' with { type: 'json' };

// M-11: cada foto del juego aparece en la página de créditos con su autor, su licencia y el enlace
// a la fuente original.
test('M-11 la página de créditos muestra autor, licencia y fuente de cada foto', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Créditos de las fotos' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Créditos de las fotos' })).toBeVisible();

  const items = page.locator('[data-testid^="credito-"]');
  await expect(items).toHaveCount(deck.characters.length);

  for (const c of deck.characters) {
    const item = page.getByTestId(`credito-${c.id}`);
    await expect(item.getByRole('heading', { name: c.name })).toBeVisible();
    await expect(item.getByTestId('autor')).toHaveText(c.photo.author);
    await expect(item.getByTestId('licencia')).toHaveText(c.photo.license);
    await expect(item.getByTestId('licencia')).toHaveAttribute('href', c.photo.licenseUrl);
    await expect(item.getByTestId('fuente')).toHaveAttribute('href', c.photo.sourceUrl);
  }

  await expect(page.getByText('Recortada, con el fondo sustituido')).toBeVisible();
});

test('M-11 las 24 fotos de los créditos cargan', async ({ page }) => {
  await page.goto('/creditos');
  const images = page.locator('[data-testid^="credito-"] img');
  await expect(images).toHaveCount(deck.characters.length);
  for (const img of await images.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});
