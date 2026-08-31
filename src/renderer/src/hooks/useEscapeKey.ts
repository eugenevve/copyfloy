import { useEffect, useRef } from "react";

export function useEscapeKey(onClose: () => void): void {
  const callbackRef = useRef(onClose);

  useEffect(() => {
    callbackRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        callbackRef.current();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);
}
