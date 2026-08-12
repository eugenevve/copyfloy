import path from "node:path";

import { IAppSettings } from "@shared/types/window";
import { app } from "electron";
import fs from "fs-extra";

// Application settings storage
// Responsible only for reading and writing the settings.json file
export class SettingsStorage {
  private readonly settingsPath = path.join(app.getPath("userData"), "settings.json");

  // Reading settings from disk
  load(): Partial<IAppSettings> | null {
    if (!fs.existsSync(this.settingsPath)) {
      return null;
    }

    try {
      return fs.readJsonSync(this.settingsPath) as Partial<IAppSettings>;
    } catch (error) {
      console.error("[SettingsStorage] Failed to read settings:", error);
      return null;
    }
  }

  // Saving settings to disk
  save(settings: IAppSettings): void {
    try {
      fs.writeJsonSync(this.settingsPath, settings, {
        spaces: 2,
      });
    } catch (error) {
      console.error("[SettingsStorage] Failed to save settings:", error);
    }
  }
}
