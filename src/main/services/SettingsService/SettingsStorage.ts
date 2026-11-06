import path from "node:path";

import { Logger } from "@main/utils/logger";
import { writeJsonAtomically } from "@main/utils/writeJsonAtomically";
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
      Logger.error("SettingsStorage", "Failed to read settings", error);
      return null;
    }
  }

  // Saving settings to disk
  save(settings: IAppSettings) {
    try {
      writeJsonAtomically(this.settingsPath, settings);
    } catch (error) {
      Logger.error("SettingsStorage", "Failed to save settings", error);
    }
  }
}
