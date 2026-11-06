import { useEffect, useEffectEvent } from "react";

export interface IKeyboardShortcut {
  key: string;
  action: () => void;
  enabled?: boolean;
  ignoreInputs?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: IKeyboardShortcut[]) => {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (document.querySelector('[aria-modal="true"]') || event.altKey || event.shiftKey) return;

    const shortcut = shortcuts.find(({ key, enabled = true }) => {
      const usesModifier = key.startsWith("mod+");
      const expectedKey = usesModifier ? key.slice(4) : key;
      const modifierPressed = event.ctrlKey || event.metaKey;
      return enabled && modifierPressed === usesModifier && event.key.toLowerCase() === expectedKey.toLowerCase();
    });

    if (!shortcut) return;
    if (
      shortcut.ignoreInputs &&
      event.target instanceof HTMLElement &&
      event.target.closest("input, textarea, select, [contenteditable='true']")
    ) {
      return;
    }

    event.preventDefault();
    shortcut.action();
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
};
