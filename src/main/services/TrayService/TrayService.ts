import { iconPath } from "@main/utils/iconPath";
import { Tray, Menu, nativeImage, BrowserWindow, app, NativeImage } from "electron";

import { AppState } from "../AppState/AppState";

// Application management service in the system tray
export class TrayService {
  private tray: Tray | null = null;

  // Reference to the main window to control its display
  constructor(
    private readonly mainWindow: BrowserWindow,
    private readonly appState: AppState
  ) {}

  // Initializes the tray icon and its events
  public init(): void {
    this.tray = new Tray(this.createTrayIcon());

    this.tray.setToolTip("backup-program");

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
          this.appState.setIsQuitting(true);
          app.quit();
        },
      },
    ]);
  }

  // Restores and focuses the main window
  private showWindow(): void {
    if (!this.mainWindow.isVisible()) {
      this.mainWindow.show();
    }

    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore();
    }

    this.mainWindow.focus();
  }
}
