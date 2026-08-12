import { IWindowState } from "@shared/types/window";
import { screen } from "electron";

import { SettingsService } from "../SettingsService/SettingsService";

export class WindowStateService {
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly settingsService: SettingsService) {}

  // Returns the previously saved window state
  getState(): IWindowState | undefined {
    return this.settingsService.getSettings().windowState;
  }

  // Saves the current window state
  saveState(state: IWindowState): void {
    this.settingsService.updateWindowState(state);
  }

  // Schedules saving the window state after a short delay
  // This prevents writing to disk on every resize/move event
  scheduleSave(getState: () => IWindowState): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.saveState(getState());
      this.saveTimeout = null;
    }, 500);
  }

  // Cancels a pending state save
  cancelPendingSave(): void {
    if (!this.saveTimeout) {
      return;
    }

    clearTimeout(this.saveTimeout);
    this.saveTimeout = null;
  }

  // Checks whether the saved position is still located on one of the
  // currently connected displays
  isPositionVisible(state: IWindowState): boolean {
    if (state.x === undefined || state.y === undefined) {
      return false;
    }

    return screen.getAllDisplays().some((display) => {
      const { x, y, width, height } = display.bounds;

      return state.x! >= x && state.x! < x + width && state.y! >= y && state.y! < y + height;
    });
  }
}
