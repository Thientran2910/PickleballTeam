import { describe, expect, it } from 'vitest';
import { formatDate, formatRatio, formatVnd } from './format';

describe('format helpers', () => {
  it('formats VND without discarding a negative sign or precision', () => {
    expect(formatVnd(-100_000)).toMatch(/100[.\s]000/);
    expect(formatVnd(-100_000)).toContain('-');
    expect(formatVnd(100_001)).toMatch(/100[.\s]001/);
  });

  it('returns a dash for empty or invalid dates', () => {
    expect(formatDate('')).toBe('—');
    expect(formatDate('not-a-date')).toBe('—');
    expect(formatDate('2026-02-31')).toBe('—');
  });

  it('keeps the calendar day in the team timezone', () => {
    expect(formatDate('2026-10-09T00:00:00+07:00')).toBe('09/10/2026');
  });

  it('formats a verified numeric ratio as a percentage', () => {
    expect(formatRatio(0.5)).toMatch(/50/);
    expect(formatRatio(0.5)).toContain('%');
  });
});
