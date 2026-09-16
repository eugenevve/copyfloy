import { optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow } from "electron";

import { AppIpc } from "./services/AppService/AppIpc";
import { AppService } from "./services/AppService/AppService";
import { DiscordService } from "./services/DiscordService/DiscordService";
import { SettingsIpc } from "./services/SettingsService/SettingsIpc";
import { SettingsService } from "./services/SettingsService/SettingsService";
import { TaskService } from "./services/TaskService/TaskService";
import { TrayService } from "./services/TrayService/TrayService";
import { UpdaterIpc } from "./services/UpdaterService/UpdaterIpc";
import { UpdaterService } from "./services/UpdaterService/UpdaterService";
import { WindowIpc } from "./services/WindowService/WindowIpc";
import { WindowService } from "./services/WindowService/WindowService";
import { WindowStateService } from "./services/WindowService/WindowStateService";
import { appState } from "./utils/environment";

const appService = new AppService();
const appIpc = new AppIpc(appService);
const settingsService = new SettingsService();
const settingsIpc = new SettingsIpc(settingsService);
const windowStateService = new WindowStateService(settingsService);
const windowService = new WindowService(settingsService, windowStateService);
const windowIpc = new WindowIpc(windowService);
const taskService = new TaskService();
const updater = new UpdaterService();
const updaterIpc = new UpdaterIpc(updater);
const discordService = new DiscordService();

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    windowService.restoreOrCreate();
  });

  void app.whenReady().then(() => {
    initializeApplication();
  });
}

function initializeApplication(): void {
  appService.configure();

  initializeServices();
  registerIpcHandlers();

  const mainWindow = windowService.createMainWindow();

  initializeWindowDependentServices(mainWindow);

  registerApplicationEvents();
}

function initializeServices(): void {
  taskService.init();
  updater.init();

  discordService.init();
  discordService.setActivity({
    details: "Taking care of files",
    state: app.isPackaged ? "Staying Busy" : "Developing",
    largeImageKey: "app",
    largeImageText: "Copyfloy",
    startTimestamp: Date.now(),
  });
}

function registerIpcHandlers(): void {
  appIpc.init();
  settingsIpc.init();
  windowIpc.init();
  updaterIpc.init();
}

function initializeWindowDependentServices(mainWindow: BrowserWindow): void {
  const trayService = new TrayService(mainWindow);
  trayService.init();

  updater.initEvents(mainWindow);
}

function registerApplicationEvents(): void {
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowService.createMainWindow();
    } else {
      windowService.restoreOrCreate();
    }
  });
}

app.on("before-quit", () => {
  appState.isQuitting = true;
  discordService.destroy();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
