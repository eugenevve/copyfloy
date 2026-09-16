import { ipcMain } from "electron";

import { UpdaterService } from "./UpdaterService";

// IPC handlers for application updates
export class UpdaterIpc {
  constructor(private readonly updater: UpdaterService) {}

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
