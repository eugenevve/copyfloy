import { checkIsAdmin } from "@main/utils/checkIsAdmin";
import { IAppSettings } from "@shared/types/window";
import { ipcMain } from "electron";

import { SettingsService } from "./SettingsService";

// IPC handlers for application settings
export class SettingsIpc {
  constructor(private readonly settingsService: SettingsService) {}

  init(): void {
    // Returns the current application settings
    ipcMain.handle("settings:get", () => {
      return this.settingsService.getSettings();
    });

    // Saves new settings received from the renderer
    ipcMain.handle("settings:save", async (_, newSettings: Partial<IAppSettings>) => {
      await this.settingsService.updateSettings(newSettings);

      return this.settingsService.getSettings();
    });

    // Returns whether the application is running with administrator privileges
    ipcMain.handle("app:is-admin", () => {
      return checkIsAdmin();
    });

    // Returns the current sidebar setting
    ipcMain.on("settings:get-sidebar", (event) => {
      event.returnValue = this.settingsService.getSettings().isSidebarOpen;
    });

    // Sets the sidebar setting
    ipcMain.handle("settings:set-sidebar", async (_, isSidebarOpen: boolean) => {
      await this.settingsService.updateSettings({
        isSidebarOpen,
      });
    });

    // Getting the page scale
    ipcMain.handle("settings:get-zoom", (event) => {
      return event.sender.getZoomFactor();
    });

    // Set scale + save to settings service
    ipcMain.handle("settings:set-zoom", async (event, zoomFactor: number) => {
      event.sender.setZoomFactor(zoomFactor);
      await this.settingsService.updateSettings({ zoomFactor });
    });
  }
}
