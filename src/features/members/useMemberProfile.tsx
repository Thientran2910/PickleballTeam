import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { TeamData } from '../../data/schema';
import { MemberDialog } from './MemberDialog';

/**
 * Turns member names into buttons that open the profile dialog. Only names present in
 * `data.members` become buttons; anything else (guests, people who left) stays plain text
 * because the dialog would have nothing to show.
 */
export function useMemberProfile(data: TeamData) {
  const [selected, setSelected] = useState<{ name: string; opener: HTMLElement } | null>(null);
  const known = useMemo(() => new Set(data.members.map((row) => row.name)), [data.members]);

  const memberLink = useCallback(
    (name: string): ReactNode =>
      !name ? (
        '—'
      ) : !known.has(name) ? (
        name
      ) : (
        <button
          type="button"
          className="link-button"
          aria-haspopup="dialog"
          onClick={(event) => setSelected({ name, opener: event.currentTarget })}
        >
          {name}
        </button>
      ),
    [known],
  );

  const dialog = selected ? (
    <MemberDialog
      data={data}
      name={selected.name}
      opener={selected.opener}
      onClose={() => setSelected(null)}
    />
  ) : null;

  return { memberLink, dialog };
}
