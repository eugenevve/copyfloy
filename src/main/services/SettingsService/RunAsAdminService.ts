import { exec } from "node:child_process";
import { promisify } from "node:util";

import { isPackagedWindows } from "@main/utils/environment";
import { exePath } from "@main/utils/exePath";

const execAsync = promisify(exec);

// Service for managing the launch of applications as administrator in Windows
// Uses the AppCompatFlags registry key, which allows Windows
// to automatically request administrator rights when launching an application
export class RunAsAdminService {
  async update(enable: boolean): Promise<void> {
    if (!isPackagedWindows) return;

    // Registry section responsible for application compatibility settings
    const regPath = "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers";
    const value = "~ RUNASADMIN";

    // Adding and removing an entry from the registry
    try {
      if (enable) {
        await execAsync(`reg add "${regPath}" /v "${exePath}" /t REG_SZ /d "${value}" /f`);
      } else {
        await execAsync(`reg delete "${regPath}" /v "${exePath}" /f`);
      }
    } catch (error) {
      console.error("[RunAsAdmin] Failed to update registry:", error);
    }
  }
}
