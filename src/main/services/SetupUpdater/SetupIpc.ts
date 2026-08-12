import { ipcMain } from "electron";

import { SetupUpdater } from "./SetupUpdater";

// IPC handlers for application updates
export class UpdaterIpc {
  constructor(private readonly updater: SetupUpdater) {}

  init(): void {
    // Check whether a new version is available
    ipcMain.handle("updater:check", () => {
      return this.updater.check();
    });

    // Start downloading the available update
    ipcMain.handle("updater:download", () => {
      return this.updater.download();
    });

    // Close the application and install the downloaded update
    ipcMain.handle("updater:install", () => {
      this.updater.install();
    });
  }
}
