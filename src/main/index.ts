import { electronApp, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain } from "electron";

import packageJson from "../../package.json";
import { appState } from "./services/AppState/AppState";
import { DiscordPresenceService } from "./services/DiscordPresence/DiscordPresenceService";
import { SettingsIpc } from "./services/SettingsService/SettingsIpc";
import { SettingsService } from "./services/SettingsService/SettingsService";
import { UpdaterIpc } from "./services/SetupUpdater/SetupIpc";
import { SetupUpdater } from "./services/SetupUpdater/SetupUpdater";
import { TaskService } from "./services/TaskService/TaskService";
import { TrayService } from "./services/TrayService/TrayService";
import { WindowIpc } from "./services/WindowService/WindowIpc";
import { WindowService } from "./services/WindowService/WindowService";
import { WindowStateService } from "./services/WindowService/WindowStateService";

const settingsService = new SettingsService();
const settingsIpc = new SettingsIpc(settingsService);
const windowStateService = new WindowStateService(settingsService);
const windowService = new WindowService(settingsService, windowStateService);
const windowIpc = new WindowIpc(windowService);
const taskService = new TaskService();
const updater = new SetupUpdater();
const updaterIpc = new UpdaterIpc(updater);
const discordPresence = new DiscordPresenceService();

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
  configureApplication();

  initializeServices();
  registerIpcHandlers();

  const mainWindow = windowService.createMainWindow();

  initializeWindowDependentServices(mainWindow);

  registerApplicationEvents();
}

function configureApplication(): void {
  const appIdName = packageJson.appId;
  electronApp.setAppUserModelId(appIdName);

  if (process.platform === "win32") {
    app.setAppUserModelId(appIdName);
  }
}

function initializeServices(): void {
  taskService.init();
  updater.init();

  discordPresence.init();
  discordPresence.setActivity({
    details: "Taking care of files",
    state: app.isPackaged ? "Staying Busy" : "Developing",
    largeImageKey: "app",
    largeImageText: "Copyfloy",
    // smallImageKey: "app",
    // smallImageText: "Copyfloy",
    startTimestamp: Date.now(),
  });
}

function registerIpcHandlers(): void {
  settingsIpc.init();
  windowIpc.init();
  updaterIpc.init();

  setupGlobalHandlers();
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

function setupGlobalHandlers(): void {
  ipcMain.on("get-is-packaged", (event) => {
    event.returnValue = app.isPackaged;
  });

  ipcMain.on("ping", () => {
    console.log("IPC Pong");
  });
}

app.on("before-quit", () => {
  appState.isQuitting = true;
  discordPresence.destroy();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
