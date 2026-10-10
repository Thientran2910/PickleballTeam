import type { ReactNode } from 'react';

export type StatCardProps = {
  label: string;
  value: ReactNode;
  note?: string;
  primary?: boolean;
};

export function StatCard({ label, value, note, primary }: StatCardProps) {
  return (
    <div className={primary ? 'stat-card is-primary' : 'stat-card'}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {note ? <p className="stat-note">{note}</p> : null}
    </div>
  );
}
