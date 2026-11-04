import { DateFormat, IDateTimeFormat, TimeFormat } from "@shared/types/settings";
import { IAppSettings, IWindowState } from "@shared/types/window";

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
    sidebarOpen: true,
    autoStart: false,
    runAdmin: false,
    zoomFactor: 1,
    minimizeTray: true,
    dateTimeFormat: {
      dateFormat: DateFormat.DMY,
      timeFormat: TimeFormat.TWENTY_FOUR_HOUR,
    },
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
  private async updateSettings(newSettings: Partial<IAppSettings>) {
    const previousSettings = { ...this.settings };

    this.settings = {
      ...this.settings,
      ...newSettings,
    };

    await this.applySystemSettings(previousSettings);
    this.saveSettings();
  }

  // SideBar
  getSidebar(): boolean {
    return this.settings.sidebarOpen;
  }

  async setSidebar(sidebarOpen: boolean) {
    await this.updateSettings({ sidebarOpen });
  }

  // Admin
  getAdmin(): boolean {
    return this.settings.runAdmin;
  }

  async setAdmin(runAdmin: boolean) {
    await this.updateSettings({ runAdmin });
  }

  // Auto Start
  getAutoStart(): boolean {
    return this.settings.autoStart;
  }

  async setAutoStart(autoStart: boolean) {
    await this.updateSettings({ autoStart });
  }

  // Zoom
  getZoom(): number {
    return this.settings.zoomFactor;
  }

  async setZoom(zoomFactor: number) {
    await this.updateSettings({ zoomFactor });
  }

  // Minimize Tray
  getMinimizeTray(): boolean {
    return this.settings.minimizeTray;
  }

  async setMinimizeTray(minimizeTray: boolean) {
    await this.updateSettings({ minimizeTray });
  }

  // Date and Time Format
  getDateTimeFormat(): IDateTimeFormat {
    return this.settings.dateTimeFormat;
  }

  async setDateTimeFormat(dateTimeFormat: IDateTimeFormat) {
    await this.updateSettings({ dateTimeFormat });
  }

  // Saves the current window state
  updateWindowState(state: IWindowState) {
    this.settings.windowState = state;
    this.saveSettings();
  }

  // Loads settings from disk.
  private loadSettings() {
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
  private async applySystemSettings(previousSettings: IAppSettings) {
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
  private saveSettings() {
    this.settingsStorage.save(this.settings);
  }
}
