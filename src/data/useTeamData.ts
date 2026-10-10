import { useContext } from 'react';
import {
  TeamDataContext,
  type TeamDataContextValue,
  type TeamDataState,
} from './context';

export type { TeamDataState } from './context';

export function useTeamData(): TeamDataState & { refresh(): void } {
  const context = useContext(TeamDataContext);
  if (!context) {
    throw new Error('useTeamData must be used within TeamDataProvider');
  }
  return context satisfies TeamDataContextValue;
}
