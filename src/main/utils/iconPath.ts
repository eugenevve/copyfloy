import path from "path";

import { app } from "electron";

import { isPackagedWindows } from "./environment";

const iconFileName = isPackagedWindows ? "icon-prod.png" : "icon-dev.png";

export const iconPath = app.isPackaged
  ? path.join(process.resourcesPath, iconFileName)
  : path.join(app.getAppPath(), "resources", iconFileName);
