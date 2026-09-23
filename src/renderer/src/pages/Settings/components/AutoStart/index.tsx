import { Switch } from "@app/ui/Switch";
import { ChangeEvent, FC, useEffect, useState } from "react";

import { WidgetContainer } from "../WidgetContainer";

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

  const hint = isPackaged
    ? "Launch the application when the computer starts up"
    : "The setting is not available in development mode";

  return (
    <WidgetContainer title="Auto Start" hint={hint}>
      <Switch label="Auto-start" checked={autoStart} onChange={handleChange} disabled={!isPackaged} />
    </WidgetContainer>
  );
};
