import { AppShell } from './components/AppShell';
import { EmptyState } from './components/EmptyState';
import { LoadState } from './components/LoadState';
import { useTeamData } from './data/useTeamData';
import { OverviewPage } from './features/overview/OverviewPage';
import { SECTIONS } from './navigation/sections';
import { useSection } from './navigation/useSection';

export function App() {
  const { refresh, ...state } = useTeamData();
  const section = useSection();

  return (
    <AppShell section={section} state={state} onRefresh={refresh}>
      <LoadState state={state} onRetry={refresh} />
      {state.data ? (
        section === 'overview' ? (
          <OverviewPage data={state.data} />
        ) : (
          // Các trang còn lại được tích hợp ở T5.
          <EmptyState
            title={SECTIONS.find((s) => s.id === section)?.label ?? ''}
            description="Mục này sẽ được tích hợp ở bước tiếp theo."
          />
        )
      ) : null}
    </AppShell>
  );
}
