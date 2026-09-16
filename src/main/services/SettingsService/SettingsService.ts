import { IAppSettings, IWindowState, SettingsAction } from "@shared/types/window";
import { BrowserWindow } from "electron";

import { AutoStartService } from "./AutoStartService";
import { RunAdminService } from "./RunAdminService";
import { SettingsStorage } from "./SettingsStorage";

// Service responsible for application settings
export class SettingsService {
  private readonly settingsStorage = new SettingsStorage();
  private readonly autoStartService = new AutoStartService();
  private readonly runAdminService = new RunAdminService();

  // Default application settings
  private settings: IAppSettings = {
    closeAction: SettingsAction.MINIMIZE,
    runAdmin: false,
    autoStart: false,
    sidebarOpen: true,
    zoomFactor: 1,
  };

  // Loading settings data from a file
  constructor() {
    this.loadSettings();
  }

  // Returns current application settings
  getSettings(): IAppSettings {
    return this.settings;
  }

  // Applies new settings
  async updateSettings(newSettings: Partial<IAppSettings>): Promise<void> {
    const previousSettings = { ...this.settings };

    this.settings = {
      ...this.settings,
      ...newSettings,
    };

    await this.applySystemSettings(previousSettings);

    this.saveSettings();
    this.broadcastSettings();
  }

  // Saves the current window state
  updateWindowState(state: IWindowState): void {
    this.settings.windowState = state;
    this.saveSettings();
  }

  // Loads settings from disk.
  private loadSettings(): void {
    const loadedSettings = this.settingsStorage.load();

    if (!loadedSettings) {
      this.saveSettings();
      return;
    }

    // Merge loaded settings with defaults to support new fields
    // added in future versions
    this.settings = {
      ...this.settings,
      ...loadedSettings,
    };

    this.autoStartService.update(this.settings.autoStart, this.settings.runAdmin);
  }

  // Applies system-level changes
  private async applySystemSettings(previousSettings: IAppSettings): Promise<void> {
    if (this.settings.runAdmin !== previousSettings.runAdmin) {
      await this.runAdminService.update(this.settings.runAdmin);
    }

    if (
      this.settings.autoStart !== previousSettings.autoStart ||
      this.settings.runAdmin !== previousSettings.runAdmin
    ) {
      this.autoStartService.update(this.settings.autoStart, this.settings.runAdmin);
    }
  }

  // Saves settings to disk
  private saveSettings(): void {
    this.settingsStorage.save(this.settings);
  }

  // Broadcasts updated settings to all renderer windows
  private broadcastSettings(): void {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send("settings:updated", this.settings);
    });
  }
}
