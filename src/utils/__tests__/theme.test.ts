import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getTheme, setTheme, initTheme } from '../theme';

describe('theme utility', () => {
  let mockStorage: Record<string, string> = {};
  let mockAttributes: Record<string, string> = {};
  let originalLocalStorage: unknown;
  let originalDocument: unknown;

  beforeEach(() => {
    mockStorage = {};
    mockAttributes = {};

    originalLocalStorage = (globalThis as unknown as { localStorage?: unknown }).localStorage;
    originalDocument = (globalThis as unknown as { document?: unknown }).document;

    (globalThis as unknown as { localStorage: unknown }).localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => { mockStorage[key] = val; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { mockStorage = {}; }
    };

    (globalThis as unknown as { document: unknown }).document = {
      documentElement: {
        getAttribute: (attr: string) => mockAttributes[attr] || null,
        setAttribute: (attr: string, val: string) => { mockAttributes[attr] = val; },
        removeAttribute: (attr: string) => { delete mockAttributes[attr]; }
      }
    };
  });

  afterEach(() => {
    (globalThis as unknown as { localStorage: unknown }).localStorage = originalLocalStorage;
    (globalThis as unknown as { document: unknown }).document = originalDocument;
    vi.restoreAllMocks();
  });

  it('defaults to system when no theme is saved', () => {
    expect(getTheme()).toBe('system');
  });

  it('saves and applies light theme', () => {
    setTheme('light');
    expect(getTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('saves and applies dark theme', () => {
    setTheme('dark');
    expect(getTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('removes data-theme when system theme is applied', () => {
    setTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    setTheme('system');
    expect(getTheme()).toBe('system');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('initializes theme from storage correctly', () => {
    localStorage.setItem('app-theme', 'dark');
    initTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
