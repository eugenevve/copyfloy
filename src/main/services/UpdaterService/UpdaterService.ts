import { IPC_CHANNELS } from "@shared/constants/ipc";
import { app, BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";

import { getUpdateWindowHtml } from "./UpdaterServiceHtml";

// Service responsible for application updates
export class UpdaterService {
  // Initializes the updater configuration
  init(): void {
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.autoDownload = false;
  }

  // Checks whether a new version is available
  check() {
    return autoUpdater.checkForUpdates();
  }

  // Starts downloading the available update
  download() {
    return autoUpdater.downloadUpdate();
  }

  // Closes the application and installs the downloaded update
  install(): void {
    this.quitAndInstall();
  }

  // Subscribes to autoUpdater events and forwards them to the Renderer
  initEvents(mainWindow: BrowserWindow): void {
    autoUpdater.on(IPC_CHANNELS.updater.events.available, (info) => {
      this.sendToRenderer(mainWindow, IPC_CHANNELS.updater.ipc.available, info.version);
    });

    autoUpdater.on(IPC_CHANNELS.updater.events.notAvailable, () => {
      this.sendToRenderer(mainWindow, IPC_CHANNELS.updater.ipc.notAvailable);
    });

    autoUpdater.on(IPC_CHANNELS.updater.events.progress, (progress) => {
      this.sendToRenderer(mainWindow, IPC_CHANNELS.updater.ipc.progress, Math.floor(progress.percent));
    });

    autoUpdater.on(IPC_CHANNELS.updater.events.downloaded, () => {
      this.sendToRenderer(mainWindow, IPC_CHANNELS.updater.ipc.downloaded);
    });

    autoUpdater.on(IPC_CHANNELS.updater.events.error, (error) => {
      this.sendToRenderer(mainWindow, IPC_CHANNELS.updater.ipc.error, error.message);
    });
  }

  // Creates the update status window and starts the installation process
  private quitAndInstall(): void {
    this.createUpdateStatusWindow();

    // In development there is no packaged application to update
    if (!app.isPackaged) {
      return;
    }

    // Close application windows before starting the installer
    BrowserWindow.getAllWindows().forEach((window) => {
      if (window.isResizable()) {
        window.destroy();
      }
    });

    if (!app.isPackaged) {
      return;
    }

    // Give the update status window a moment to become visible
    setTimeout(() => {
      autoUpdater.quitAndInstall(true, true);
    }, 3000);
  }

  // Creates the small window displayed while the update is being installed
  private createUpdateStatusWindow(): BrowserWindow {
    const window = new BrowserWindow({
      width: 350,
      height: 180,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      center: true,
      backgroundColor: "#0a0a0a",
      show: false,
      webPreferences: {
        sandbox: false,
        contextIsolation: true,
      },
    });

    void window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(getUpdateWindowHtml())}`);

    window.once("ready-to-show", () => {
      window.show();
    });

    return window;
  }

  // Sends an update event to the Renderer if the window is still available
  private sendToRenderer<T>(window: BrowserWindow, channel: string, data?: T): void {
    if (window.isDestroyed()) {
      return;
    }

    if (data === undefined) {
      window.webContents.send(channel);
      return;
    }

    window.webContents.send(channel, data);
  }
}
