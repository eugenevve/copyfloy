import { Checkbox } from "@app/ui/Checkbox";
import { ChangeEvent, FC, useEffect, useState } from "react";

import styles from "./RunAdmin.module.css";

export const RunAdmin: FC = () => {
  const [runAdmin, setRunAdmin] = useState(false);
  const isPackaged = window.api.app.isPackaged;

  useEffect(() => {
    if (!isPackaged) return;
    void window.api.settings.runAdmin.get().then(setRunAdmin);
  }, [isPackaged]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const enabled = event.target.checked;
    setRunAdmin(enabled);
    void window.api.settings.runAdmin.set(enabled);
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>Run Admin</div>
      <Checkbox label="Run as administrator" checked={runAdmin} onChange={handleChange} disabled={!isPackaged} />
      <div className={styles.hint}>
        {isPackaged
          ? "Run the application as an administrator. The current setting may affect the autostart time, if enabled"
          : "The setting is not available in development mode"}
      </div>
    </div>
  );
};
