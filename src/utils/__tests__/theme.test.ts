import { describe, it, expect, beforeEach } from 'vitest';
import { getTheme, setTheme, initTheme } from '../theme';

describe('theme utility', () => {
  const storageMap: Record<string, string> = {};
  const attributesMap: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(storageMap).forEach(k => delete storageMap[k]);
    Object.keys(attributesMap).forEach(k => delete attributesMap[k]);

    (globalThis as any).localStorage = {
      getItem: (key: string) => storageMap[key] || null,
      setItem: (key: string, val: string) => { storageMap[key] = val; },
      removeItem: (key: string) => { delete storageMap[key]; },
      clear: () => { Object.keys(storageMap).forEach(k => delete storageMap[k]); }
    };

    (globalThis as any).document = {
      documentElement: {
        getAttribute: (attr: string) => attributesMap[attr] || null,
        setAttribute: (attr: string, val: string) => { attributesMap[attr] = val; },
        removeAttribute: (attr: string) => { delete attributesMap[attr]; }
      }
    };
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
