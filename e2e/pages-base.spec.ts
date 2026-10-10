import { expect, test } from '@playwright/test';
import { mockApi } from './helpers';

test('assets resolve under the project subpath', async ({ page }) => {
  const failed: string[] = [];
  page.on('response', (res) => {
    if (res.url().startsWith('http://127.0.0.1') && res.status() >= 400) failed.push(res.url());
  });
  await mockApi(page);
  await page.goto('./#overview');
  await expect(page.getByRole('heading', { level: 2, name: 'Tổng quan', exact: true })).toBeVisible();
  expect(failed).toEqual([]);
  const srcs = await page.$$eval('script[src], link[href]', (els) =>
    els.map((e) => e.getAttribute('src') ?? e.getAttribute('href') ?? ''),
  );
  for (const s of srcs.filter((s) => s.includes('assets/'))) {
    expect(s.startsWith('/PickleballTeam/assets/')).toBe(true);
  }
});
