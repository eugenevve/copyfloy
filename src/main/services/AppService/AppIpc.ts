import { checkIsAdmin } from "@main/utils/checkIsAdmin";
import { ipcMain } from "electron";

import { AppService } from "./AppService";

export class AppIpc {
  constructor(private readonly appService: AppService) {}

  init(): void {
    // Returns whether the application is packaged
    ipcMain.on("app:is-packaged", (event) => {
      event.returnValue = this.appService.isPackaged();
    });

    // Returns whether the application is running with administrator privileges
    ipcMain.handle("app:is-admin", () => {
      return checkIsAdmin();
    });
  }
}
