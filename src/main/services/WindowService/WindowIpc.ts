import { IPC_CHANNELS } from "@shared/constants/ipc";
import { ipcMain } from "electron";

import { WindowService } from "./WindowService";

// IPC handlers for controlling the main application window
export class WindowIpc {
  constructor(private readonly windowService: WindowService) {}

  // Registers all IPC handlers related to the main window
  init(): void {
    ipcMain.on(IPC_CHANNELS.window.close, () => {
      this.windowService.close();
    });

    ipcMain.on(IPC_CHANNELS.window.minimize, () => {
      this.windowService.minimize();
    });

    ipcMain.on(IPC_CHANNELS.window.maximize, () => {
      this.windowService.toggleMaximize();
    });

    ipcMain.handle(IPC_CHANNELS.window.isMaximized, () => {
      return this.windowService.isMaximized();
    });
  }
}
