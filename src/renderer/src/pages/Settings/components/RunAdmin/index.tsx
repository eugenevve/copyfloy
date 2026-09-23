import { Switch } from "@app/ui/Switch";
import { ChangeEvent, FC, useEffect, useState } from "react";

import { WidgetContainer } from "../WidgetContainer";

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

  const hint = isPackaged
    ? "Run the application as an administrator. The current setting may affect the autostart time, if enabled"
    : "The setting is not available in development mode";

  return (
    <WidgetContainer title="Run Admin" hint={hint}>
      <Switch label="Run as administrator" checked={runAdmin} onChange={handleChange} disabled={!isPackaged} />
    </WidgetContainer>
  );
};
