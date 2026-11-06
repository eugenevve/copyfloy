import path from "path";

import { optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow } from "electron";

import { AppIpc } from "./services/AppService/AppIpc";
import { AppService } from "./services/AppService/AppService";
import { DiscordService } from "./services/DiscordService/DiscordService";
import { LabelIpc } from "./services/LabelService/LabelIpc";
import { LabelService } from "./services/LabelService/LabelService";
import { ReportIpc } from "./services/ReportService/ReportIpc";
import { ReportStorage } from "./services/ReportService/ReportStorage";
import { SettingsIpc } from "./services/SettingsService/SettingsIpc";
import { SettingsService } from "./services/SettingsService/SettingsService";
import { TaskService } from "./services/TaskService/TaskService";
import { TaskStorage } from "./services/TaskService/TaskStorage";
import { TrayService } from "./services/TrayService/TrayService";
import { UpdaterIpc } from "./services/UpdaterService/UpdaterIpc";
import { UpdaterService } from "./services/UpdaterService/UpdaterService";
import { WindowIpc } from "./services/WindowService/WindowIpc";
import { WindowService } from "./services/WindowService/WindowService";
import { WindowStateService } from "./services/WindowService/WindowStateService";
import { appState } from "./utils/environment";

function bootstrap() {
  // Must run before services are created: storages resolve userData at construction
  if (!app.isPackaged) {
    app.setPath("userData", path.join(app.getPath("appData"), `${app.getName()}-dev`));
  }

  if (!app.requestSingleInstanceLock()) {
    app.quit();
    return;
  }

  const appService = new AppService();
  const appIpc = new AppIpc(appService);
  const settingsService = new SettingsService();
  const settingsIpc = new SettingsIpc(settingsService);
  const windowStateService = new WindowStateService(settingsService);
  const windowService = new WindowService(settingsService, windowStateService);
  const windowIpc = new WindowIpc(windowService);
  const taskStorage = new TaskStorage();
  const taskService = new TaskService(taskStorage);
  const labelService = new LabelService(taskStorage);
  const labelIpc = new LabelIpc(labelService);
  const reportIpc = new ReportIpc(new ReportStorage(), taskStorage);
  const updater = new UpdaterService();
  const updaterIpc = new UpdaterIpc(updater);
  const discordService = new DiscordService();

  app.on("second-instance", () => {
    windowService.restoreOrCreate();
  });

  app.whenReady().then(() => {
    appService.configure();

    taskService.init();
    updater.init();
    labelIpc.init();
    reportIpc.init();

    discordService.init();
    discordService.setActivity({
      details: "Taking care of files",
      state: app.isPackaged ? "Staying Busy" : "Developing",
      largeImageKey: "app",
      largeImageText: "Copyfloy",
      startTimestamp: Date.now(),
    });

    appIpc.init();
    settingsIpc.init();
    windowIpc.init();
    updaterIpc.init();

    const mainWindow = windowService.createMainWindow();
    const trayService = new TrayService(mainWindow);
    trayService.init();
    updater.initEvents(mainWindow);

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
  });

  app.on("before-quit", () => {
    appState.isQuitting = true;
    discordService.destroy();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}

bootstrap();
