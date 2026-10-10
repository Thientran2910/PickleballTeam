import { expect, test } from '@playwright/test';
import { makePayload } from '../src/test/fixtures';
import { mockApi } from './helpers';

const sections = [
  ['overview', 'Tổng quan'],
  ['finance', 'Quỹ đội'],
  ['members', 'Thành viên'],
  ['ranking', 'Thi đấu'],
  ['sessions', 'Lịch chơi'],
  ['assets', 'Dụng cụ'],
] as const;

test('opens and reloads finance under the Pages project path', async ({ page }) => {
  await mockApi(page);
  await page.goto('./#finance');
  await expect(page.getByRole('heading', { name: 'Quỹ đội', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Quỹ đội', exact: true })).toBeVisible();
});

test('reaches all six sections, with Back/Forward and no refetch', async ({ page }) => {
  const api = await mockApi(page);
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Tổng quan', exact: true })).toBeVisible();

  const nav = page.getByRole('navigation', { name: 'Điều hướng chính' });
  for (const [, label] of sections) {
    await nav.getByRole('link', { name: label }).click();
    await expect(page.getByRole('heading', { level: 2, name: label, exact: true })).toBeVisible();
  }
  await page.goBack();
  await expect(page.getByRole('heading', { level: 2, name: 'Lịch chơi', exact: true })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { level: 2, name: 'Dụng cụ', exact: true })).toBeVisible();
  expect(api.count()).toBe(1);
});

test('unknown hash falls back to overview', async ({ page }) => {
  await mockApi(page);
  await page.goto('./#nope');
  await expect(page.getByRole('heading', { level: 2, name: 'Tổng quan', exact: true })).toBeVisible();
});

test('changing filters does not refetch; Cập nhật does', async ({ page }) => {
  const api = await mockApi(page);
  await page.goto('./#finance');
  await expect(page.getByRole('heading', { level: 2, name: 'Quỹ đội' })).toBeVisible();
  await page.getByLabel('Trạng thái đóng').selectOption({ index: 1 });
  expect(api.count()).toBe(1);
  await page.getByRole('button', { name: 'Cập nhật' }).click();
  await expect.poll(() => api.count()).toBe(2);
});

test('skip link keeps the current route', async ({ page }) => {
  await mockApi(page);
  await page.goto('./#finance');
  await expect(page.getByRole('heading', { level: 2, name: 'Quỹ đội' })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByText('Bỏ qua điều hướng')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#finance$/);
  await expect(page.locator('#main-content')).toBeFocused();
});

test('shows hostile Sheet text as plain text', async ({ page }) => {
  const payload = makePayload();
  payload.data.members[0].name = '<img src=x onerror="window.__xss=1">';
  await mockApi(page, payload);
  await page.goto('./#members');
  await expect(page.getByText('<img src=x onerror="window.__xss=1">').first()).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
  expect(await page.locator('main img').count()).toBe(0);
});

test('built HTML carries noindex', async ({ request }) => {
  const html = await (await request.get('./')).text();
  expect(html).toMatch(/<meta name="robots" content="noindex/);
});

test('mobile 390px has no page-level horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApi(page);
  for (const [id, label] of sections) {
    await page.goto(`./#${id}`);
    await expect(page.getByRole('heading', { level: 2, name: label, exact: true })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, `${id} overflows`).toBeLessThanOrEqual(0);
  }
});
