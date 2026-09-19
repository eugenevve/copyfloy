import { IAppSettings, IWindowState, SettingsAction } from "@shared/types/window";

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
    sidebarOpen: true,
    autoStart: false,
    runAdmin: false,
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
  private async updateSettings(newSettings: Partial<IAppSettings>): Promise<void> {
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

  async setSidebar(sidebarOpen: boolean): Promise<void> {
    await this.updateSettings({ sidebarOpen });
  }

  // Admin
  getAdmin(): boolean {
    return this.settings.runAdmin;
  }

  async setAdmin(runAdmin: boolean): Promise<void> {
    await this.updateSettings({ runAdmin });
  }

  // Auto Start
  getAutoStart(): boolean {
    return this.settings.autoStart;
  }

  async setAutoStart(autoStart: boolean): Promise<void> {
    await this.updateSettings({ autoStart });
  }

  // Zoom
  getZoom(): number {
    return this.settings.zoomFactor;
  }

  async setZoom(zoomFactor: number): Promise<void> {
    await this.updateSettings({ zoomFactor });
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
}
