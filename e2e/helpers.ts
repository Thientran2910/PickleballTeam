import type { Page } from '@playwright/test';
import { makePayload } from '../src/test/fixtures';

/** Apps Script answers cross-origin GETs with ACAO:*; mocks must do the same. */
export const CORS = { 'access-control-allow-origin': '*' };

export const API_GLOB = 'https://script.google.com/macros/s/**/exec';

/** Mock GET /exec with the synthetic fixture; returns a live request counter. */
export async function mockApi(
  page: Page,
  payload: unknown = makePayload(),
): Promise<{ count(): number }> {
  let requests = 0;
  await page.route(API_GLOB, (route) => {
    requests += 1;
    return route.fulfill({ json: payload, headers: CORS });
  });
  return { count: () => requests };
}
