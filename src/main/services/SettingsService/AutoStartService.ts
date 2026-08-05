import { exec } from "child_process";

import { exePath } from "@main/utils/exePath";
import { app } from "electron";

export class AutoStartService {
  private readonly TASK_NAME = "BackupProgramAutoStart";

  public update(openAtLogin: boolean, runAsAdmin: boolean): void {
    if (!app.isPackaged || process.platform !== "win32") return;

    // Autostart via Task Scheduler (for administrators so that Windows does not block the program from launching)
    if (openAtLogin && runAsAdmin) {
      app.setLoginItemSettings({ openAtLogin: false });

      const cmd =
        `schtasks /create ` +
        `/tn "${this.TASK_NAME}" ` +
        `/tr "\\"${exePath}\\"" ` +
        `/sc onlogon ` +
        `/rl highest ` +
        `/it ` +
        `/f`;

      exec(cmd);

      return;
    }

    // Normal program startup (system registry)
    if (openAtLogin) {
      exec(`schtasks /delete /tn "${this.TASK_NAME}" /f`, () => {});

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

    exec(`schtasks /delete /tn "${this.TASK_NAME}" /f`, () => {});
  }
}
