import { IPC_CHANNELS } from "@shared/constants/ipc";
import { clampZoom } from "@shared/constants/zoom";
import { IAppSettings } from "@shared/types/window";
import { ipcMain } from "electron";

import { SettingsService } from "./SettingsService";

export class SettingsIpc {
  constructor(private readonly settingsService: SettingsService) {}

  init(): void {
    // Returns the current application settings
    ipcMain.handle(IPC_CHANNELS.settings.get, () => {
      return this.settingsService.getSettings();
    });

    // Saves new settings received from the renderer
    ipcMain.handle(IPC_CHANNELS.settings.save, async (_, newSettings: Partial<IAppSettings>) => {
      await this.settingsService.updateSettings(newSettings);

      return this.settingsService.getSettings();
    });

    // Returns whether the application is configured to run as administrator
    ipcMain.handle(IPC_CHANNELS.settings.getAdmin, () => {
      return this.settingsService.getSettings().runAdmin;
    });

    // Updates whether the application should run as administrator
    ipcMain.handle(IPC_CHANNELS.settings.setAdmin, async (_, runAdmin: boolean) => {
      await this.settingsService.updateSettings({ runAdmin });
    });

    // Returns the current sidebar setting
    ipcMain.on(IPC_CHANNELS.settings.getSidebar, (event) => {
      event.returnValue = this.settingsService.getSettings().sidebarOpen;
    });

    // Sets the sidebar setting
    ipcMain.handle(IPC_CHANNELS.settings.setSidebar, async (_, sidebarOpen: boolean) => {
      await this.settingsService.updateSettings({ sidebarOpen });
    });

    // Getting the page scale
    ipcMain.handle(IPC_CHANNELS.settings.getZoom, (event) => {
      return event.sender.getZoomFactor();
    });

    // Set scale + save to settings service
    ipcMain.handle(IPC_CHANNELS.settings.setZoom, async (event, zoomFactor: number) => {
      const clamped = clampZoom(zoomFactor);

      event.sender.setZoomFactor(clamped);

      await this.settingsService.updateSettings({ zoomFactor: clamped });
    });
  }
}
