import { getZoom, initZoom, setZoom } from "@app/utils/zoomState";
import { STANDART_ZOOM, ZOOM_STEP } from "@shared/constants/zoom";
import { useEffect } from "react";

export const useZoomShortcuts = () => {
  useEffect(() => {
    void initZoom();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;

      const isPlus = event.key === "=" || event.key === "+" || event.code === "NumpadAdd";
      const isMinus = event.key === "-" || event.code === "NumpadSubtract";
      const isReset = event.key === "0" || event.code === "Numpad0";

      if (!isPlus && !isMinus && !isReset) return;
      event.preventDefault();

      if (isPlus) setZoom(getZoom() + ZOOM_STEP);
      else if (isMinus) setZoom(getZoom() - ZOOM_STEP);
      else setZoom(STANDART_ZOOM);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
};
