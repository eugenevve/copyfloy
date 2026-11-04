import { electronApp } from "@electron-toolkit/utils";
import { checkIsAdmin } from "@main/utils/checkIsAdmin";
import { isWindows } from "@main/utils/environment";
import { isPortable } from "@main/utils/isPortable";
import packageJson from "@package";
import { app } from "electron";

export class AppService {
  configure() {
    const appId = packageJson.appId;
    electronApp.setAppUserModelId(appId);
    if (isWindows) {
      app.setAppUserModelId(appId);
    }
  }

  isPackaged(): boolean {
    return app.isPackaged;
  }

  isPortable(): boolean {
    return isPortable();
  }

  isAdmin() {
    return checkIsAdmin();
  }
}
