import { checkIsAdmin } from "@main/utils/checkIsAdmin";
import { IPC_CHANNELS } from "@shared/constants/ipc";
import { ipcMain } from "electron";

import { AppService } from "./AppService";

export class AppIpc {
  constructor(private readonly appService: AppService) {}

  init(): void {
    // Returns whether the application is packaged
    ipcMain.on(IPC_CHANNELS.app.isPackaged, (event) => {
      event.returnValue = this.appService.isPackaged();
    });

    // Returns whether the application is running with administrator privileges
    ipcMain.handle(IPC_CHANNELS.app.isAdmin, () => {
      return checkIsAdmin();
    });
  }
}
