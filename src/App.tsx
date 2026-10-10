import type { ComponentType } from 'react';
import { AppShell } from './components/AppShell';
import { LoadState } from './components/LoadState';
import { useTeamData } from './data/useTeamData';
import type { PageProps } from './data/schema';
import { AssetsPage } from './features/assets/AssetsPage';
import { FinancePage } from './features/finance/FinancePage';
import { MembersPage } from './features/members/MembersPage';
import { OverviewPage } from './features/overview/OverviewPage';
import { RankingPage } from './features/ranking/RankingPage';
import { SessionsPage } from './features/sessions/SessionsPage';
import type { Section } from './navigation/sections';
import { useSection } from './navigation/useSection';

const pages: Record<Section, ComponentType<PageProps>> = {
  overview: OverviewPage,
  finance: FinancePage,
  members: MembersPage,
  ranking: RankingPage,
  sessions: SessionsPage,
  assets: AssetsPage,
};

export function App() {
  const { refresh, ...state } = useTeamData();
  const section = useSection();
  const Page = pages[section];

  return (
    <AppShell section={section} state={state} onRefresh={refresh}>
      <LoadState state={state} onRetry={refresh} />
      {state.data ? <Page data={state.data} /> : null}
    </AppShell>
  );
}
