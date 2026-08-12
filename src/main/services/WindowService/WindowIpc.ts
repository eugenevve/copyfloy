import { ipcMain } from "electron";

import { WindowService } from "./WindowService";

// IPC handlers for controlling the main application window
export class WindowIpc {
  constructor(private readonly windowService: WindowService) {}

  // Registers all IPC handlers related to the main window
  init(): void {
    ipcMain.on("window-close", () => {
      this.windowService.close();
    });

    ipcMain.on("window-minimize", () => {
      this.windowService.minimize();
    });

    ipcMain.on("window-maximize", () => {
      this.windowService.toggleMaximize();
    });

    ipcMain.handle("window-is-maximized", () => {
      return this.windowService.isMaximized();
    });
  }
}
