import type { PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeTeamData } from '../test/fixtures';
import { fetchTeamData } from './client';
import { TeamDataProvider } from './TeamDataProvider';
import { useTeamData } from './useTeamData';

vi.mock('./client', () => ({ fetchTeamData: vi.fn() }));

const mockedFetchTeamData = vi.mocked(fetchTeamData);

function wrapper({ children }: PropsWithChildren) {
  return <TeamDataProvider>{children}</TeamDataProvider>;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe('TeamDataProvider', () => {
  beforeEach(() => {
    mockedFetchTeamData.mockReset();
  });

  it('exposes an error with no fallback snapshot after the first failure', async () => {
    mockedFetchTeamData.mockRejectedValueOnce(new Error('Lỗi kiểm thử'));

    const { result } = renderHook(() => useTeamData(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.data).toBeNull();
    expect(result.current.readAt).toBeNull();
    expect(result.current.error).toBe('Lỗi kiểm thử');
  });

  it('keeps the same snapshot and read time when refresh fails', async () => {
    const data = makeTeamData();
    mockedFetchTeamData.mockResolvedValueOnce(data);
    const { result } = renderHook(() => useTeamData(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const firstData = result.current.data;
    const firstReadAt = result.current.readAt;
    mockedFetchTeamData.mockRejectedValueOnce(new Error('Mất kết nối'));

    act(() => result.current.refresh());

    expect(result.current.status).toBe('refreshing');
    await waitFor(() => expect(result.current.status).toBe('stale'));
    expect(result.current.data).toBe(firstData);
    expect(result.current.readAt).toBe(firstReadAt);
    expect(result.current.error).toBe('Mất kết nối');
  });

  it('replaces the snapshot and read time after a successful refresh', async () => {
    const first = makeTeamData();
    const second = makeTeamData({
      overview: { ...first.overview, balance: 2_000_000 },
    });
    mockedFetchTeamData
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second);
    const { result } = renderHook(() => useTeamData(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const firstReadAt = result.current.readAt;

    act(() => result.current.refresh());
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
      expect(result.current.data).toBe(second);
    });

    expect(result.current.readAt).not.toBe(firstReadAt);
  });

  it('does not start overlapping refresh requests', async () => {
    const pending = deferred<ReturnType<typeof makeTeamData>>();
    mockedFetchTeamData.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useTeamData(), { wrapper });
    expect(mockedFetchTeamData).toHaveBeenCalledOnce();

    act(() => {
      result.current.refresh();
      result.current.refresh();
    });

    expect(mockedFetchTeamData).toHaveBeenCalledOnce();
    pending.resolve(makeTeamData());
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });

  it('aborts the active request and does not update after unmount', async () => {
    const pending = deferred<ReturnType<typeof makeTeamData>>();
    let requestSignal: AbortSignal | undefined;
    mockedFetchTeamData.mockImplementationOnce((signal) => {
      requestSignal = signal;
      return pending.promise;
    });
    const { unmount } = renderHook(() => useTeamData(), { wrapper });

    unmount();
    expect(requestSignal?.aborted).toBe(true);

    pending.resolve(makeTeamData());
    await act(async () => {
      await pending.promise;
    });
  });
});
