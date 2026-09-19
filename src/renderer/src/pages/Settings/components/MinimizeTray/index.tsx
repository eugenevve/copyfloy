import { Checkbox } from "@app/ui/Checkbox";
import { ChangeEvent, FC, useEffect, useState } from "react";

import styles from "./MinimizeTray.module.css";

export const MinimizeTray: FC = () => {
  const [minimizeTray, setMinimizeTray] = useState(true);

  useEffect(() => {
    void window.api.settings.minimizeTray.get().then(setMinimizeTray);
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const enabled = event.target.checked;
    setMinimizeTray(enabled);
    void window.api.settings.minimizeTray.set(enabled);
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>Closing the app</div>
      <Checkbox label="Minimize to tray on close" checked={minimizeTray} onChange={handleChange} />
      <div className={styles.hint}>
        Keep the app running in the system tray instead of exiting completely when you close the window
      </div>
    </div>
  );
};
