import { useCallback, useState, type ReactNode } from 'react';
import type { TeamData } from '../../data/schema';
import { SessionDialog } from './SessionDialog';

/** Turns session labels into buttons that open the session detail dialog. */
export function useSessionDetail(data: TeamData) {
  const [selected, setSelected] = useState<{ id: string; opener: HTMLElement } | null>(null);

  const sessionLink = useCallback(
    (id: string, label: ReactNode): ReactNode => (
      <button
        type="button"
        className="link-button"
        aria-haspopup="dialog"
        onClick={(event) => setSelected({ id, opener: event.currentTarget })}
      >
        {label}
      </button>
    ),
    [],
  );

  const dialog = selected ? (
    <SessionDialog
      data={data}
      id={selected.id}
      opener={selected.opener}
      onClose={() => setSelected(null)}
    />
  ) : null;

  return { sessionLink, dialog };
}
