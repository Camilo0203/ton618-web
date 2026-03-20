import { useEffect } from 'react';

export function useDashboardDarkMode() {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const hadDarkClass = root.classList.contains('dark');
    const hadLightClass = root.classList.contains('light');
    const hadDashboardDarkLockClass = root.classList.contains('dashboard-dark-lock');

    root.classList.add('dashboard-dark-lock', 'dark');
    root.classList.remove('light');

    return () => {
      root.classList.remove('dashboard-dark-lock');
      root.classList.remove('dark');
      root.classList.remove('light');

      if (hadDashboardDarkLockClass) {
        root.classList.add('dashboard-dark-lock');
      }
      if (hadDarkClass) {
        root.classList.add('dark');
      }
      if (hadLightClass) {
        root.classList.add('light');
      }
    };
  }, []);
}
