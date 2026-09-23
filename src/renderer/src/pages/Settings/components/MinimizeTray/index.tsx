import { Switch } from "@app/ui/Switch";
import { ChangeEvent, FC, useEffect, useState } from "react";

import { WidgetContainer } from "../WidgetContainer";

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

  const hint = "Keep the app running in the system tray instead of exiting completely when you close the window";

  return (
    <WidgetContainer title="Closing the app" hint={hint}>
      <Switch label="Minimize to tray on close" checked={minimizeTray} onChange={handleChange} />
    </WidgetContainer>
  );
};
