import { describe, expect, it } from 'vitest';
import { makePayload } from '../test/fixtures';
import { parseTeamPayload } from './schema';

describe('parseTeamPayload', () => {
  it('parses the verified schema and strips unknown object keys', () => {
    const input = {
      ...makePayload(),
      data: { ...makePayload().data, privateNote: 'must not escape' },
    };

    const result = parseTeamPayload(input);

    expect(result.schemaVersion).toBe(1);
    expect(result).not.toHaveProperty('privateNote');
  });

  it('rejects malformed money instead of rendering zero', () => {
    const payload = makePayload();
    const malformed: unknown = {
      ...payload,
      data: {
        ...payload.data,
        overview: { ...payload.data.overview, balance: '' },
      },
    };

    expect(() => parseTeamPayload(malformed)).toThrow();
  });

  it('accepts valid empty unverified arrays without inferring row fields', () => {
    const result = parseTeamPayload(makePayload());
    expect(result.sessions).toEqual([]);
    expect(result.matches).toEqual([]);
    expect(result.refunds).toEqual([]);
  });

  it('rejects application-level errors', () => {
    expect(() =>
      parseTeamPayload({ ok: false, error: 'failed' }),
    ).toThrow();
  });

  it('rejects payloads missing the overview', () => {
    const payload = makePayload();
    const data: Partial<typeof payload.data> = { ...payload.data };
    delete data.overview;
    expect(() => parseTeamPayload({ ...payload, data })).toThrow();
  });

  it('rejects unsupported schema versions', () => {
    expect(() =>
      parseTeamPayload({
        ...makePayload(),
        data: { ...makePayload().data, schemaVersion: 2 },
      }),
    ).toThrow();
  });

  it('does not coerce numeric strings into verified numeric fields', () => {
    const payload = makePayload();
    expect(() =>
      parseTeamPayload({
        ...payload,
        data: {
          ...payload.data,
          members: [{ ...payload.data.members[0], matches: '3' }],
        },
      }),
    ).toThrow();
  });
});
