export type Theme = ThemeKind.LIGHT | ThemeKind.DARK | ThemeKind.SYSTEM;

export enum ThemeKind {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

export const THEME_KEY = "theme";

export function getSystemTheme(): ThemeKind.LIGHT | ThemeKind.DARK {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? ThemeKind.DARK : ThemeKind.LIGHT;
}
