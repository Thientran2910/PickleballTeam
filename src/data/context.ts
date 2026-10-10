import { createContext } from 'react';
import type { TeamData } from './schema';

export type TeamDataState =
  | { status: 'loading'; data: null; readAt: null; error: null }
  | { status: 'error'; data: null; readAt: null; error: string }
  | { status: 'ready'; data: TeamData; readAt: Date; error: null }
  | { status: 'refreshing'; data: TeamData; readAt: Date; error: null }
  | { status: 'stale'; data: TeamData; readAt: Date; error: string };

export type TeamDataContextValue = TeamDataState & { refresh(): void };

export const TeamDataContext = createContext<TeamDataContextValue | undefined>(
  undefined,
);
