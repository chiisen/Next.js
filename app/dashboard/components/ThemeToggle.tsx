'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggle = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setDarkMode(false);
      localStorage.theme = 'light';
    } else {
      html.classList.add('dark');
      setDarkMode(true);
      localStorage.theme = 'dark';
    }
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      title={darkMode ? '切換亮色模式' : '切換暗色模式'}
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-zinc-400" />
      ) : (
        <Moon className="w-5 h-5 text-zinc-600" />
      )}
    </button>
  );
}