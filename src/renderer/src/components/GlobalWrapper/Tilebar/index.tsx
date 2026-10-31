import { CloneIcon, LineIcon, SquareIcon, XmarkIcon } from "@app/ui/Icons";
import { TilebarButton } from "@app/ui/TilebarButton";
import { TilebarButtonKind } from "@app/ui/TilebarButton/TilebarButton.types";
import { TooltipPlacement } from "@app/ui/Tooltip/Tooltip.types";
import { FC, useEffect, useState } from "react";

import styles from "./Tilebar.module.css";

export const Tilebar: FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const { isPackaged } = window.api.app;

  const handleClose = () => window.api.window.close();
  const handleMinimize = () => window.api.window.minimize();
  const handleMaximize = () => window.api.window.maximize();

  useEffect(() => {
    void window.api.app.isAdmin().then(setIsAdmin);
    void window.api.window.isMaximized().then(setIsMaximized);
    const unsubscribe = window.api.window.onMaximizedChange(setIsMaximized);
    return unsubscribe;
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        Copyfloy {isPackaged ? "" : "(dev)"} {isAdmin && "(administrator)"}
      </div>
      <div className={styles.controls}>
        <TilebarButton onClick={handleMinimize} tooltip="Minimize" tooltipPlacement={TooltipPlacement.LEFT}>
          <LineIcon />
        </TilebarButton>
        <TilebarButton
          onClick={handleMaximize}
          tooltip={isMaximized ? "Restore" : "Maximize"}
          tooltipPlacement={TooltipPlacement.LEFT}
        >
          {isMaximized ? <CloneIcon /> : <SquareIcon />}
        </TilebarButton>
        <TilebarButton
          kind={TilebarButtonKind.SECONDARY}
          onClick={handleClose}
          tooltip="Close"
          tooltipPlacement={TooltipPlacement.LEFT}
        >
          <XmarkIcon />
        </TilebarButton>
      </div>
    </div>
  );
};
