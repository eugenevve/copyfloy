import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, shell } from "electron";

import { api } from "./api";

export type { ElectronAPI } from "./api";

if (process.contextIsolated) {
  try {
    const exposedElectronApi = {
      ...electronAPI,
      shell: {
        openExternal: (url: string): Promise<void> => {
          return shell.openExternal(url);
        },
      },
    };

    contextBridge.exposeInMainWorld("electron", exposedElectronApi);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
}
