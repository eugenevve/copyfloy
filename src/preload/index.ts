import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, shell } from "electron";

import { api } from "./api";

export type { ElectronAPI } from "./api";

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", {
      ...electronAPI,
      shell: {
        openExternal: (url: string): Promise<void> => {
          return shell.openExternal(url);
        },
      },
    });

    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
}
