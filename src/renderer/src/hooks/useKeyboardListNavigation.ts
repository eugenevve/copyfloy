import { PAGE_ITEMS } from "@shared/constants/limits";
import { useEffect, useEffectEvent, useRef, useState } from "react";

interface IKeyboardListNavigation<T extends { id: number }> {
  items: T[];
  visibleCount: number;
  showMore: () => void;
  disabled?: boolean;
  actions: Record<string, (item: T) => void>;
}

export const useKeyboardListNavigation = <T extends { id: number }>({
  items,
  visibleCount,
  showMore,
  disabled = false,
  actions,
}: IKeyboardListNavigation<T>) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const list = listRef.current;
    if (disabled || !list || document.querySelector('[aria-modal="true"]')) return;

    const target = event.target;
    if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const currentIndex = items.findIndex((item) => item.id === selectedId);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = currentIndex < 0 ? (direction === 1 ? 0 : items.length - 1) : currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= items.length) return;
      for (let count = visibleCount; nextIndex >= count; count += PAGE_ITEMS) showMore();
      const nextId = items[nextIndex].id;
      setSelectedId(nextId);
      window.requestAnimationFrame(() => list.querySelector<HTMLElement>(`[data-keyboard-item="${nextId}"]`)?.focus());
      return;
    }

    if (event.key === "Escape") {
      if (selectedId === null) return;
      event.preventDefault();
      setSelectedId(null);
      list.focus();
      return;
    }

    if (target instanceof HTMLElement && target.closest("button")) return;
    const modifiers = [
      event.ctrlKey || event.metaKey ? "mod" : "",
      event.altKey ? "alt" : "",
      event.shiftKey ? "shift" : "",
    ].filter(Boolean);
    const action = actions[[...modifiers, event.key.toLowerCase()].join("+")];
    const selectedItem = items.find((item) => item.id === selectedId);
    if (!action || !selectedItem) return;

    event.preventDefault();
    action(selectedItem);
  });

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return {
    selectedId,
    onSelect: setSelectedId,
    listRef,
  };
};
