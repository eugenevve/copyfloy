import { IAppSettings, IWindowState, SettingsAction } from "@shared/types/window";
import { BrowserWindow } from "electron";

import { AutoStartService } from "./AutoStartService";
import { RunAsAdminService } from "./RunAsAdminService";
import { SettingsStorage } from "./SettingsStorage";

// Service responsible for application settings
export class SettingsService {
  private readonly settingsStorage = new SettingsStorage();
  private readonly autoStartService = new AutoStartService();
  private readonly runAsAdminService = new RunAsAdminService();

  // Default application settings
  private settings: IAppSettings = {
    closeAction: SettingsAction.MINIMIZE,
    autoStart: false,
    runAsAdmin: false,
    isSidebarOpen: true,
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

    this.autoStartService.update(this.settings.autoStart, this.settings.runAsAdmin);
  }

  // Applies system-level changes
  private async applySystemSettings(previousSettings: IAppSettings): Promise<void> {
    if (this.settings.runAsAdmin !== previousSettings.runAsAdmin) {
      await this.runAsAdminService.update(this.settings.runAsAdmin);
    }

    if (
      this.settings.autoStart !== previousSettings.autoStart ||
      this.settings.runAsAdmin !== previousSettings.runAsAdmin
    ) {
      this.autoStartService.update(this.settings.autoStart, this.settings.runAsAdmin);
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
