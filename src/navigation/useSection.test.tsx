import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useSection } from './useSection';

afterEach(() => {
  window.location.hash = '';
});

describe('useSection', () => {
  it('supports direct finance hash and browser hash changes', () => {
    window.location.hash = '#finance';
    const { result } = renderHook(() => useSection());
    expect(result.current).toBe('finance');
    act(() => {
      window.location.hash = '#assets';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current).toBe('assets');
  });

  it('falls back to overview for empty and unknown hashes', () => {
    window.location.hash = '#nope';
    const { result } = renderHook(() => useSection());
    expect(result.current).toBe('overview');
    act(() => {
      window.location.hash = '';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current).toBe('overview');
  });

  it('stops listening after unmount', () => {
    window.location.hash = '#members';
    const { result, unmount } = renderHook(() => useSection());
    unmount();
    window.location.hash = '#ranking';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(result.current).toBe('members');
  });
});
