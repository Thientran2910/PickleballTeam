import { afterEach, describe, expect, it, vi } from 'vitest';
import { API_TIMEOUT_MS, API_URL } from '../config';
import { makePayload } from '../test/fixtures';
import { fetchTeamData } from './client';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchTeamData', () => {
  it('uses only the public simple GET endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(makePayload()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await fetchTeamData();

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe(API_URL);
    expect(options.method).toBe('GET');
    expect(options.credentials).toBe('omit');
    expect(options.redirect).toBe('follow');
    expect(options.cache).toBe('no-store');
    expect(options.headers).toBeUndefined();
    expect(options.mode).not.toBe('no-cors');
  });

  it('rejects HTTP errors before parsing a body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('failed', { status: 500 })),
    );

    await expect(fetchTeamData()).rejects.toThrow('Không tải được dữ liệu');
  });

  it('rejects an HTML response instead of treating it as data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('<html>not json</html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }),
      ),
    );

    await expect(fetchTeamData()).rejects.toThrow(
      'Dữ liệu nhận được không hợp lệ',
    );
  });

  it('rejects a successful response with an invalid schema', async () => {
    const payload = makePayload();
    const data: Partial<typeof payload.data> = { ...payload.data };
    delete data.overview;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ...payload, data }), { status: 200 }),
      ),
    );

    await expect(fetchTeamData()).rejects.toThrow(
      'Dữ liệu nhận được không hợp lệ',
    );
  });

  it('aborts and reports a timeout after 20 seconds', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_url: string, options: RequestInit | undefined) =>
        new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => {
            reject(options.signal?.reason);
          });
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = fetchTeamData();
    const rejection = expect(request).rejects.toThrow('quá thời gian chờ');
    await vi.advanceTimersByTimeAsync(API_TIMEOUT_MS);

    await rejection;
  });

  it('propagates a caller abort separately from a timeout', async () => {
    const fetchMock = vi.fn(
      (_url: string, options: RequestInit | undefined) =>
        new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => {
            reject(options.signal?.reason);
          });
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    const request = fetchTeamData(controller.signal);
    controller.abort(new DOMException('Unmounted', 'AbortError'));

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });
});
