import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { fetchTeamData } from './client';
import {
  TeamDataContext,
  type TeamDataContextValue,
  type TeamDataState,
} from './context';

const initialState: TeamDataState = {
  status: 'loading',
  data: null,
  readAt: null,
  error: null,
};

function messageFrom(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Không tải được dữ liệu. Vui lòng thử lại.';
}

export function TeamDataProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<TeamDataState>(initialState);
  const mountedRef = useRef(false);
  const inFlightRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    if (inFlightRef.current) return;

    const controller = new AbortController();
    inFlightRef.current = controller;
    setState((current) =>
      current.data
        ? {
            status: 'refreshing',
            data: current.data,
            readAt: current.readAt,
            error: null,
          }
        : initialState,
    );

    void fetchTeamData(controller.signal)
      .then((data) => {
        if (!mountedRef.current || controller.signal.aborted) return;
        setState({
          status: 'ready',
          data,
          readAt: new Date(),
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (!mountedRef.current || controller.signal.aborted) return;
        setState((current) =>
          current.data
            ? {
                status: 'stale',
                data: current.data,
                readAt: current.readAt,
                error: messageFrom(error),
              }
            : {
                status: 'error',
                data: null,
                readAt: null,
                error: messageFrom(error),
              },
        );
      })
      .finally(() => {
        if (inFlightRef.current === controller) {
          inFlightRef.current = null;
        }
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
      inFlightRef.current?.abort();
      inFlightRef.current = null;
    };
  }, [load]);

  const value = useMemo<TeamDataContextValue>(
    () => ({ ...state, refresh: load }),
    [load, state],
  );

  return (
    <TeamDataContext.Provider value={value}>
      {children}
    </TeamDataContext.Provider>
  );
}
