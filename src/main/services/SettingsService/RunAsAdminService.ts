import { exec } from "child_process";
import { promisify } from "util";

import { app } from "electron";

const execAsync = promisify(exec);

export class RunAsAdminService {
  public async update(enable: boolean): Promise<void> {
    if (!app.isPackaged || process.platform !== "win32") return;

    const exePath = app.getPath("exe");
    const regPath = "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers";
    const value = "~ RUNASADMIN";

    try {
      if (enable) {
        await execAsync(`reg add "${regPath}" /v "${exePath}" /t REG_SZ /d "${value}" /f`);
      } else {
        await execAsync(`reg delete "${regPath}" /v "${exePath}" /f`);
      }
    } catch (error) {
      console.error("[Settings] Failed to update RunAsAdmin registry key:", error);
    }
  }
}
