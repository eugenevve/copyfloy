import { useCallback, useLayoutEffect, useRef, useState } from "react";

export function useHorizontalScroll<T extends HTMLElement>(deps: unknown) {
  const ref = useRef<T>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => setIsScrollable(element.scrollWidth > element.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [deps]);

  const scrollBy = useCallback((direction: -1 | 1) => {
    ref.current?.scrollBy({ left: direction * 200, behavior: "smooth" });
  }, []);

  return { ref, isScrollable, scrollBy };
}
