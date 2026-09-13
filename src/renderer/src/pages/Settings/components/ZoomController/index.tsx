import { Button } from "@app/ui/Button";
import { MinusIcon, PlusIcon } from "@app/ui/Icons";
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from "@app/utils/zoomNumber";
import React, { useState, useEffect } from "react";

import styles from "./ZoomController.module.css";

export const ZoomController: React.FC = () => {
  const [zoomFactor, setZoomFactor] = useState<number>(1.0);

  useEffect(() => {
    if (window.api?.settings?.zoom?.get) {
      void window.api.settings.zoom.get().then(setZoomFactor);
    }

    if (window.api?.settings?.onUpdate) {
      const unsubscribe = window.api.settings.onUpdate((newSettings) => {
        if (typeof newSettings.zoomFactor === "number") {
          setZoomFactor(newSettings.zoomFactor);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  const changeZoom = async (newZoom: number) => {
    const clampedZoom = Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);
    const roundedZoom = Number(clampedZoom.toFixed(2));

    if (window.api?.settings?.zoom.set) {
      await window.api.settings.zoom.set(roundedZoom);
      setZoomFactor(roundedZoom);
    }
  };

  const handleZoomOut = () => void changeZoom(zoomFactor - ZOOM_STEP);
  const handleZoomIn = () => void changeZoom(zoomFactor + ZOOM_STEP);
  const handleReset = () => void changeZoom(1.0);

  return (
    <div className={styles.container}>
      <div className={styles.title}>Page Zoom</div>
      <div className={styles.section}>
        <Button onClick={handleZoomOut} disabled={zoomFactor <= MIN_ZOOM} icon>
          <MinusIcon />
        </Button>
        <div>{Math.round(zoomFactor * 100)}%</div>
        <Button onClick={handleZoomIn} disabled={zoomFactor >= MAX_ZOOM} icon>
          <PlusIcon />
        </Button>
      </div>
      <Button onClick={handleReset} disabled={zoomFactor === 1.0}>
        Reset
      </Button>
    </div>
  );
};
