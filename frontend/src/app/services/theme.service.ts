import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const theme = this.theme();
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    });
  }

  toggleTheme() {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  setTheme(theme: Theme) {
    this.theme.set(theme);
  }

  private getInitialTheme(): Theme {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      return storedTheme;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}

