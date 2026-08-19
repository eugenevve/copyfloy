import { CloneIcon, LineIcon, SquareIcon, XmarkIcon } from "@app/ui/Icons";
import { TilebarButton } from "@app/ui/TilebarButton";
import { TilebarButtonKind } from "@app/ui/TilebarButton/TilebarButton.types";
import { FC, useEffect, useState } from "react";

import styles from "./Tilebar.module.css";

export const Tilebar: FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const handleClose = () => window.api.window.close();
  const handleMinimize = () => window.api.window.minimize();
  const handleMaximize = () => window.api.window.maximize();

  useEffect(() => {
    void window.api.settings.isAdmin().then(setIsAdmin);
    void window.api.window.isMaximized().then(setIsMaximized);
    const unsubscribe = window.api.window.onMaximizedChange(setIsMaximized);
    return unsubscribe;
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.title}>Copyflow {isAdmin && "(administrator)"}</div>
      <div className={styles.controls}>
        <TilebarButton onClick={handleMinimize}>
          <LineIcon />
        </TilebarButton>
        <TilebarButton onClick={handleMaximize}>{isMaximized ? <CloneIcon /> : <SquareIcon />}</TilebarButton>
        <TilebarButton kind={TilebarButtonKind.SECONDARY} onClick={handleClose}>
          <XmarkIcon />
        </TilebarButton>
      </div>
    </div>
  );
};
