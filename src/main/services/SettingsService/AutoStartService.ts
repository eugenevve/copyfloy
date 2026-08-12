import { exec } from "node:child_process";

import { isPackagedWindows } from "@main/utils/environment";
import { exePath } from "@main/utils/exePath";
import { app } from "electron";

export class AutoStartService {
  private readonly taskName = "BackupProgramAutoStart";

  update(openAtLogin: boolean, runAsAdmin: boolean): void {
    if (!isPackagedWindows) return;

    // Autostart via Task Scheduler (for administrators so that Windows does not block the program from launching)
    if (openAtLogin && runAsAdmin) {
      app.setLoginItemSettings({
        openAtLogin: false,
      });

      const command =
        `schtasks /create ` +
        `/tn "${this.taskName}" ` +
        `/tr "\\"${exePath}\\"" ` +
        `/sc onlogon ` +
        `/rl highest ` +
        `/it ` +
        `/f`;

      exec(command);

      return;
    }

    // Normal program startup (system registry)
    if (openAtLogin) {
      exec(`schtasks /delete /tn "${this.taskName}" /f`, () => {});

      app.setLoginItemSettings({
        openAtLogin: true,
        path: exePath,
      });

      return;
    }

    // Disabled autostart
    app.setLoginItemSettings({
      openAtLogin: false,
    });

    exec(`schtasks /delete /tn "${this.taskName}" /f`, () => {});
  }
}
