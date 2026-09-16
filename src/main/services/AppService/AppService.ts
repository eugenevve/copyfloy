import { electronApp } from "@electron-toolkit/utils";
import { checkIsAdmin } from "@main/utils/checkIsAdmin";
import { isWindows } from "@main/utils/environment";
import packageJson from "@package";
import { app } from "electron";

export class AppService {
  configure(): void {
    const appId = packageJson.appId;
    electronApp.setAppUserModelId(appId);
    if (isWindows) {
      app.setAppUserModelId(appId);
    }
  }

  isPackaged(): boolean {
    return app.isPackaged;
  }

  isAdmin(): Promise<boolean> {
    return checkIsAdmin();
  }
}
