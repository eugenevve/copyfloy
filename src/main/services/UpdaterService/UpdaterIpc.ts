import { IPC_CHANNELS } from "@shared/constants/ipc";
import { ipcMain } from "electron";

import { UpdaterService } from "./UpdaterService";

// IPC handlers for application updates
export class UpdaterIpc {
  constructor(private readonly updater: UpdaterService) {}

  init(): void {
    // Check whether a new version is available
    ipcMain.handle(IPC_CHANNELS.updater.check, () => {
      return this.updater.check();
    });

    // Start downloading the available update
    ipcMain.handle(IPC_CHANNELS.updater.download, () => {
      return this.updater.download();
    });

    // Close the application and install the downloaded update
    ipcMain.handle(IPC_CHANNELS.updater.install, () => {
      this.updater.install();
    });
  }
}
