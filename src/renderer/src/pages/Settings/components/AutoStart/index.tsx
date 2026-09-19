import { Switch } from "@app/ui/Switch";
import { ChangeEvent, FC, useEffect, useState } from "react";

import styles from "./AutoStart.module.css";

export const AutoStart: FC = () => {
  const [autoStart, setAutoStart] = useState(false);
  const isPackaged = window.api.app.isPackaged;

  useEffect(() => {
    if (!isPackaged) return;
    void window.api.settings.autoStart.get().then(setAutoStart);
  }, [isPackaged]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const enabled = event.target.checked;
    setAutoStart(enabled);
    void window.api.settings.autoStart.set(enabled);
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>Auto Start</div>
      <Switch label="Auto-start" checked={autoStart} onChange={handleChange} disabled={!isPackaged} />
      <div className={styles.hint}>
        {isPackaged
          ? "Launch the application when the computer starts up"
          : "The setting is not available in development mode"}
      </div>
    </div>
  );
};
