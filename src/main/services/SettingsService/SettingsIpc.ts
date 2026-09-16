import { clampZoom } from "@shared/constants/zoom";
import { IAppSettings } from "@shared/types/window";
import { ipcMain } from "electron";

import { SettingsService } from "./SettingsService";

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

    // Returns whether the application is configured to run as administrator
    ipcMain.handle("settings:get-run-as-admin", () => {
      return this.settingsService.getSettings().runAdmin;
    });

    // Updates whether the application should run as administrator
    ipcMain.handle("settings:set-run-as-admin", async (_, runAdmin: boolean) => {
      await this.settingsService.updateSettings({ runAdmin });
    });

    // Returns the current sidebar setting
    ipcMain.on("settings:get-sidebar", (event) => {
      event.returnValue = this.settingsService.getSettings().sidebarOpen;
    });

    // Sets the sidebar setting
    ipcMain.handle("settings:set-sidebar", async (_, sidebarOpen: boolean) => {
      await this.settingsService.updateSettings({ sidebarOpen });
    });

    // Getting the page scale
    ipcMain.handle("settings:get-zoom", (event) => {
      return event.sender.getZoomFactor();
    });

    // Set scale + save to settings service
    ipcMain.handle("settings:set-zoom", async (event, zoomFactor: number) => {
      const clamped = clampZoom(zoomFactor);

      event.sender.setZoomFactor(clamped);

      await this.settingsService.updateSettings({ zoomFactor: clamped });
    });
  }
}
