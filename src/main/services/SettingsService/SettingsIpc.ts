import { checkIsAdmin } from "@main/utils/checkIsAdmin";
import { IAppSettings } from "@shared/types/window";
import { ipcMain } from "electron";

import { SettingsService } from "./SettingsService";

// Registers IPC handlers for application settings
export function registerSettingsIpc(settingsService: SettingsService): void {
  // Returns the current application settings
  ipcMain.handle("settings:get", () => {
    return settingsService.getSettings();
  });

  // Saves new settings received from the renderer
  ipcMain.handle("settings:save", async (_, newSettings: Partial<IAppSettings>) => {
    await settingsService.updateSettings(newSettings);
    return settingsService.getSettings();
  });

  // Returns whether the application is running with administrator privileges
  ipcMain.handle("app:is-admin", async () => {
    return checkIsAdmin();
  });
}
