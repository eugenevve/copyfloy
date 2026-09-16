import { exec } from "node:child_process";

import { isPackagedWindows } from "@main/utils/environment";
import { exePath } from "@main/utils/exePath";
import { Logger } from "@main/utils/logger";
import packageJson from "@package";
import { app } from "electron";

export class AutoStartService {
  private readonly TASK_NAME = `${packageJson.name}-auto-start`;

  update(openAtLogin: boolean, runAdmin: boolean): void {
    if (!isPackagedWindows) return;

    Logger.info("AutoStartService", `Updating: openAtLogin=${openAtLogin}, runAdmin=${runAdmin}`);

    // Autostart via Task Scheduler (for administrators so that Windows does not block the program from launching)
    if (openAtLogin && runAdmin) {
      Logger.info("AutoStartService", "Enabling Task Scheduler autostart");

      app.setLoginItemSettings({
        openAtLogin: false,
      });

      const command =
        `schtasks /create ` +
        `/tn "${this.TASK_NAME}" ` +
        `/tr "\\"${exePath}\\"" ` +
        `/sc onlogon ` +
        `/rl highest ` +
        `/it ` +
        `/f`;

      exec(command, (error) => {
        if (error) {
          Logger.error("AutoStartService", "Failed to create scheduled task", error);
          return;
        }

        Logger.info("AutoStartService", "Scheduled task created successfully");
      });

      return;
    }

    // Normal program startup (system registry)
    if (openAtLogin) {
      Logger.info("AutoStartService", "Enabling normal login autostart");

      exec(`schtasks /delete /tn "${this.TASK_NAME}" /f`, () => {});

      app.setLoginItemSettings({
        openAtLogin: true,
        path: exePath,
      });

      return;
    }

    // Disabled autostart
    Logger.info("AutoStartService", "Disabling autostart");

    app.setLoginItemSettings({
      openAtLogin: false,
    });

    exec(`schtasks /delete /tn "${this.TASK_NAME}" /f`, () => {});
  }
}
