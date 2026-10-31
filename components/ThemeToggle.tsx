'use client';

import { useEffect, useState } from 'react';

const isDark = () => {
  const set = document.documentElement.dataset.theme;
  return set ? set === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
};

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  const [swapping, setSwapping] = useState(false);

  useEffect(() => setDark(isDark()), []);

  function toggle() {
    const next = isDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('lc-theme', next); } catch {}
    setDark(next === 'dark');
    setSwapping(true);
    setTimeout(() => setSwapping(false), 120);
  }

  return (
    <button
      type="button"
      className={`theme-btn${swapping ? ' swapping' : ''}`}
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-icon" aria-hidden>{dark ? '☀' : '☾'}</span>
      <span>{dark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
