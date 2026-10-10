const vndFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  timeZone: 'Asia/Ho_Chi_Minh',
});

const ratioFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'percent',
  maximumFractionDigits: 2,
});

export function formatVnd(value: number): string {
  return `${vndFormatter.format(value)}đ`;
}

export function formatDate(value: string): string {
  const trimmed = value.trim();
  const datePart = trimmed.match(/^(\d{4}-\d{2}-\d{2})(?:$|T)/)?.[1];
  if (!datePart) return '—';
  const calendarCheck = new Date(`${datePart}T00:00:00Z`);
  if (
    Number.isNaN(calendarCheck.getTime()) ||
    !calendarCheck.toISOString().startsWith(datePart)
  ) {
    return '—';
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return '—';
  return dateFormatter.format(parsed);
}

export function formatRatio(value: number): string {
  return ratioFormatter.format(value);
}
