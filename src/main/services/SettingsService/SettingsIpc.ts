import { IPC_CHANNELS } from "@shared/constants/ipc";
import { clampZoom } from "@shared/constants/zoom";
import { ipcMain } from "electron";

import { SettingsService } from "./SettingsService";

export class SettingsIpc {
  constructor(private readonly settingsService: SettingsService) {}

  init(): void {
    // Returns the current sidebar setting
    ipcMain.on(IPC_CHANNELS.settings.getSidebar, (event) => {
      event.returnValue = this.settingsService.getSidebar();
    });

    // Sets the sidebar setting
    ipcMain.handle(IPC_CHANNELS.settings.setSidebar, async (_, sidebarOpen: boolean) => {
      await this.settingsService.setSidebar(sidebarOpen);
    });

    // Returns the current autostart setting
    ipcMain.handle(IPC_CHANNELS.settings.getAutoStart, () => {
      return this.settingsService.getAutoStart();
    });

    // Sets the autostart setting
    ipcMain.handle(IPC_CHANNELS.settings.setAutoStart, async (_, autoStart: boolean) => {
      await this.settingsService.setAutoStart(autoStart);
    });

    // Returns whether the application is configured to run as administrator
    ipcMain.handle(IPC_CHANNELS.settings.getAdmin, () => {
      return this.settingsService.getAdmin();
    });

    // Updates whether the application should run as administrator
    ipcMain.handle(IPC_CHANNELS.settings.setAdmin, async (_, runAdmin: boolean) => {
      await this.settingsService.setAdmin(runAdmin);
    });

    // Getting the page scale
    ipcMain.handle(IPC_CHANNELS.settings.getZoom, () => {
      return this.settingsService.getZoom();
    });

    // Set scale + save to settings service
    ipcMain.handle(IPC_CHANNELS.settings.setZoom, async (event, zoomFactor: number) => {
      const clamped = clampZoom(zoomFactor);

      event.sender.setZoomFactor(clamped);

      await this.settingsService.setZoom(clamped);
    });

    // Returns the current app minimize tray
    ipcMain.handle(IPC_CHANNELS.settings.getTray, () => {
      return this.settingsService.getMinimizeTray();
    });

    // Sets the app minimize tray
    ipcMain.handle(IPC_CHANNELS.settings.setTray, async (_, minimizeTray: boolean) => {
      await this.settingsService.setMinimizeTray(minimizeTray);
    });
  }
}
