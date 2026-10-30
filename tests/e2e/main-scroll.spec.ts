import { expect, test } from '@playwright/test';

test.use({ baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:1207' });

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
]) {
  test.describe(`${viewport.width}px main layout`, () => {
    test.use({ viewport });

    for (const route of ['/dashboard', '/analytics', '/problems/contest']) {
      test(`${route} can scroll to its bottom`, async ({ page }) => {
        await page.goto(route);
        const main = page.getByRole('main');
        const scrollArea = main.locator(':scope > div').first();
        await expect(scrollArea).toBeVisible();

        await expect.poll(() => scrollArea.evaluate(
          (element) => element.scrollHeight - element.clientHeight
        )).toBeGreaterThan(0);

        const bounds = await scrollArea.boundingBox();
        if (!bounds) throw new Error('Page scroll area has no bounds');
        await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 100);
        await page.mouse.wheel(0, 10000);

        await expect.poll(() => scrollArea.evaluate(
          (element) => Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop)
        )).toBeLessThanOrEqual(1);
        await expect.poll(() => main.evaluate(
          (element) => element.getBoundingClientRect().bottom
        )).toBeLessThanOrEqual(viewport.height + 1);
      });
    }

    test('editing and undo keep the workspace below the header', async ({ page }) => {
      await page.goto('/solutions/new');
      const main = page.getByRole('main');
      const editor = page.locator('[data-slate-editor="true"]');
      await expect(editor).toBeVisible();
      await editor.click();
      await editor.pressSequentially('Layout regression');
      for (let index = 0; index < 30; index += 1) await editor.press('Enter');
      for (let index = 0; index < 30; index += 1) await editor.press('ControlOrMeta+z');

      await main.evaluate((element) => { element.scrollTop = 1000; });
      await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBe(0);
      const header = await page.getByRole('banner').boundingBox();
      if (!header) throw new Error('Header has no bounds');
      await expect.poll(() => main.evaluate(
        (element) => element.getBoundingClientRect().top
      )).toBeGreaterThanOrEqual(header.y + header.height - 1);
      await expect.poll(() => main.evaluate(
        (element) => element.getBoundingClientRect().bottom
      )).toBeLessThanOrEqual(viewport.height + 1);
    });
  });
}
