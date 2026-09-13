import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from "@app/utils/zoomNumber";
import { useEffect } from "react";

export const useZoomShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (!window.api?.settings?.zoom) return;

        const isPlus = event.key === "=" || event.key === "+" || event.code === "NumpadAdd";
        const isMinus = event.key === "-" || event.code === "NumpadSubtract";
        const isReset = event.key === "0" || event.code === "Numpad0";

        if (isPlus || isMinus || isReset) {
          event.preventDefault();

          void (async () => {
            let nextZoom: number | null = null;

            if (isPlus) {
              const current = await window.api.settings.zoom.get();
              nextZoom = Math.min(current + ZOOM_STEP, MAX_ZOOM);
            } else if (isMinus) {
              const current = await window.api.settings.zoom.get();
              nextZoom = Math.max(current - ZOOM_STEP, MIN_ZOOM);
            } else if (isReset) {
              nextZoom = 1.0;
            }

            if (nextZoom !== null) {
              const roundedZoom = Number(nextZoom.toFixed(2));
              await window.api.settings.zoom.set(roundedZoom);

              window.dispatchEvent(new CustomEvent("app-zoom-changed", { detail: roundedZoom }));
            }
          })();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
};
