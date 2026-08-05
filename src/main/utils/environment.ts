import { app } from "electron";

export const isWindows = process.platform === "win32";

export const isPackagedWindows = app.isPackaged && isWindows;
