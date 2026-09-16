import { Checkbox } from "@app/ui/Checkbox";
import { ChangeEvent, FC, useEffect, useState } from "react";

import styles from "./RunAdmin.module.css";

export const RunAdmin: FC = () => {
  const [runAsAdmin, setRunAsAdmin] = useState(false);
  const isPackaged = window.api.env.isPackaged;

  useEffect(() => {
    if (!isPackaged) return;
    void window.api.settings.runAdmin.get().then(setRunAsAdmin);
  }, [isPackaged]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const enabled = event.target.checked;
    setRunAsAdmin(enabled);
    void window.api.settings.runAdmin.set(enabled);
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>Run Admin</div>
      <Checkbox label="Run as administrator" checked={runAsAdmin} onChange={handleChange} disabled={!isPackaged} />
      <div className={styles.hint}>
        {isPackaged
          ? "Run the application as an administrator. The current setting may affect the autostart time, if enabled."
          : "The setting is not available in development mode"}
      </div>
    </div>
  );
};
