import { iconPath } from "@main/utils/iconPath";
import { app, BrowserWindow, Menu, nativeImage, NativeImage, Tray } from "electron";

import packageJson from "../../../../package.json";
import { appState } from "../AppState/AppState";

// Manages the application tray icon and its interactions
export class TrayService {
  private tray: Tray | null = null;

  constructor(private readonly mainWindow: BrowserWindow) {}

  // Initializes the tray icon and its events
  init(): void {
    this.tray = new Tray(this.createTrayIcon());

    this.tray.setToolTip(packageJson.name);

    this.tray.on("click", () => {
      this.showWindow();
    });

    this.tray.on("right-click", () => {
      this.tray?.popUpContextMenu(this.createContextMenu());
    });
  }

  // Creates the tray icon
  private createTrayIcon(): NativeImage {
    return nativeImage.createFromPath(iconPath).resize({
      width: 16,
      height: 16,
    });
  }

  // Creates the tray context menu
  private createContextMenu(): Menu {
    return Menu.buildFromTemplate([
      {
        label: "Open",
        click: () => {
          this.showWindow();
        },
      },
      {
        type: "separator",
      },
      {
        label: "Close",
        click: () => {
          appState.isQuitting = true;
          app.quit();
        },
      },
    ]);
  }

  // Restores and focuses the main window
  private showWindow(): void {
    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore();
    }

    if (!this.mainWindow.isVisible()) {
      this.mainWindow.show();
    }

    this.mainWindow.focus();
  }
}
