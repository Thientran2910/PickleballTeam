import { expect, test } from '@playwright/test';
import { makePayload } from '../src/test/fixtures';
import { API_GLOB, CORS } from './helpers';

test.describe('first load failures never show a zero balance', () => {
  const cases: Array<[string, Parameters<import('@playwright/test').Route['fulfill']>[0]]> = [
    ['HTTP 500', { status: 500, body: 'boom', headers: CORS }],
    ['HTML instead of JSON', { status: 200, contentType: 'text/html', body: '<html>login</html>' }],
    ['ok=false', { json: { ok: false, error: 'x' } }],
  ];
  for (const [name, response] of cases) {
    test(name, async ({ page }) => {
      await page.route(API_GLOB, (route) => route.fulfill({ headers: CORS, ...response }));
      await page.goto('./#overview');
      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Thử lại' }).first()).toBeVisible();
      await expect(page.getByText('Quỹ đội hiện có')).toHaveCount(0);
      await expect(page.getByText(/0đ/)).toHaveCount(0);
    });
  }

  test('network failure', async ({ page }) => {
    await page.route(API_GLOB, (route) => route.abort('failed'));
    await page.goto('./#overview');
    await expect(page.getByRole('alert')).toContainText('Không kết nối được');
    await expect(page.getByText('Quỹ đội hiện có')).toHaveCount(0);
  });

  test('timeout after 20s', async ({ page }) => {
    await page.clock.install();
    await page.route(API_GLOB, () => {
      /* never answers */
    });
    await page.goto('./#overview');
    await page.clock.runFor(21_000);
    await expect(page.getByRole('alert')).toContainText('quá thời gian chờ');
    await expect(page.getByText('Quỹ đội hiện có')).toHaveCount(0);
  });
});

test('failed refresh keeps old numbers and timestamp and marks stale', async ({ page }) => {
  let fail = false;
  await page.route(API_GLOB, (route) =>
    fail ? route.fulfill({ status: 500, body: 'boom', headers: CORS }) : route.fulfill({ json: makePayload(), headers: CORS }),
  );
  await page.goto('./#overview');
  const readAt = page.locator('.read-at');
  await expect(readAt).toContainText('Cập nhật thành công');
  const readTime = (await readAt.textContent())!.split(' · ')[1];
  const balance = page.getByText('Quỹ đội hiện có');
  await expect(balance).toBeVisible();

  fail = true;
  await page.getByRole('button', { name: 'Cập nhật' }).click();
  await expect(page.getByRole('alert')).toContainText('Chưa cập nhật được');
  await expect(balance).toBeVisible();
  await expect(readAt).toContainText(readTime);
  await expect(readAt).not.toContainText('thành công');
});

test('recovers after retry from first-load error', async ({ page }) => {
  let fail = true;
  await page.route(API_GLOB, (route) =>
    fail ? route.fulfill({ status: 500, body: 'x', headers: CORS }) : route.fulfill({ json: makePayload(), headers: CORS }),
  );
  await page.goto('./#overview');
  await expect(page.getByRole('alert')).toBeVisible();
  fail = false;
  await page.getByRole('alert').getByRole('button', { name: 'Thử lại' }).click();
  await expect(page.getByText('Quỹ đội hiện có')).toBeVisible();
});

test('only GET requests reach the API', async ({ page }) => {
  const methods: string[] = [];
  await page.route(API_GLOB, (route) => {
    methods.push(route.request().method());
    return route.fulfill({ json: makePayload(), headers: CORS });
  });
  await page.goto('./#overview');
  await page.getByRole('button', { name: 'Cập nhật' }).click();
  await expect.poll(() => methods.length).toBeGreaterThanOrEqual(2);
  expect(new Set(methods)).toEqual(new Set(['GET']));
});
