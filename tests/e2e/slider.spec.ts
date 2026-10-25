import { test, expect } from '@playwright/test';

test.describe('Comparador antes/después: solo se arrastra desde el centro', () => {
  test('tocar la foto fuera del centro no mueve el corte', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/');
    const compare = page.locator('[data-compare]').first();
    const range = compare.locator('[data-compare-range]');
    await compare.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000); // deja terminar el vaivén inicial
    const box = (await compare.boundingBox())!;
    if (isMobile)
      await page.touchscreen.tap(
        box.x + box.width * 0.15,
        box.y + box.height * 0.5,
      );
    else
      await page.mouse.click(
        box.x + box.width * 0.15,
        box.y + box.height * 0.5,
      );
    await expect(range).toHaveAttribute(
      'aria-valuetext',
      'Mostrando 50% antes',
    );
  });

  test('la foto deja pasar el scroll y el centro no', async ({ page }) => {
    await page.goto('/');
    const compare = page.locator('[data-compare]').first();
    const touchAction = (sel: string) =>
      compare
        .locator(sel)
        .first()
        .evaluate((el) => getComputedStyle(el).touchAction);
    expect(await touchAction('figure')).not.toBe('none');
    expect(await touchAction('[data-compare-handle]')).toBe('none');
  });

  test('arrastrar el círculo del centro mueve el corte', async ({ page }) => {
    await page.goto('/');
    const compare = page.locator('[data-compare]').first();
    const range = compare.locator('[data-compare-range]');
    await compare.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    const handle = (await compare
      .locator('[data-compare-handle] span')
      .nth(1)
      .boundingBox())!;
    const box = (await compare.boundingBox())!;
    await page.mouse.move(
      handle.x + handle.width / 2,
      handle.y + handle.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width * 0.25,
      handle.y + handle.height / 2,
      { steps: 6 },
    );
    await page.mouse.up();
    await expect(range).toHaveAttribute(
      'aria-valuetext',
      /Mostrando (2[0-9]|3[0-0])% antes/,
    );
  });
});
