import path from "path";

import { app } from "electron";

export const iconPath = app.isPackaged
  ? path.join(process.resourcesPath, "icon.png")
  : path.join(app.getAppPath(), "resources", "icon.png");
