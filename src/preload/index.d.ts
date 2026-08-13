import { electronAPI } from "@electron-toolkit/preload";

import { ElectronAPI } from "./api";

export type FullElectronAPI = typeof electronAPI & {
  shell: {
    openExternal: (url: string) => Promise<void>;
  };
};

declare global {
  interface Window {
    electron: FullElectronAPI;
    api: ElectronAPI;
  }
}
