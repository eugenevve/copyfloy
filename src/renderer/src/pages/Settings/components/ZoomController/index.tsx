import { Button } from "@app/ui/Button";
import { MinusIcon, PlusIcon } from "@app/ui/Icons";
import { getZoom, initZoom, setZoom, subscribeZoom } from "@app/utils/zoomState";
import { MAX_ZOOM, MIN_ZOOM, STANDART_ZOOM, ZOOM_STEP } from "@shared/constants/zoom";
import { useEffect, useSyncExternalStore, FC } from "react";

import styles from "./ZoomController.module.css";

export const ZoomController: FC = () => {
  const zoomFactor = useSyncExternalStore(subscribeZoom, getZoom);

  useEffect(() => {
    void initZoom();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.title}>Page Zoom</div>
      <div className={styles.section}>
        <Button onClick={() => setZoom(zoomFactor - ZOOM_STEP)} disabled={zoomFactor <= MIN_ZOOM} icon>
          <MinusIcon />
        </Button>
        <div>{Math.round(zoomFactor * 100)}%</div>
        <Button onClick={() => setZoom(zoomFactor + ZOOM_STEP)} disabled={zoomFactor >= MAX_ZOOM} icon>
          <PlusIcon />
        </Button>
      </div>
      <Button onClick={() => setZoom(STANDART_ZOOM)} disabled={zoomFactor === STANDART_ZOOM}>
        Reset
      </Button>
    </div>
  );
};
