import { ITask, TaskType } from "@shared/types/tasks";
import { IAppSettings } from "@shared/types/window";
import { ipcRenderer, IpcRendererEvent } from "electron";

import packageJson from "../../package.json";

export type ElectronAPI = typeof api;

export const api = {
  window: {
    close: (): void => ipcRenderer.send("window:close"),
    minimize: (): void => ipcRenderer.send("window:minimize"),
    maximize: (): void => ipcRenderer.send("window:maximize"),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke("window:is-maximized"),
    onMaximizedChange: (callback: (isMaximized: boolean) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, value: boolean) => {
        callback(value);
      };
      ipcRenderer.on("window:maximized-change", listener);
      return () => {
        ipcRenderer.removeListener("window:maximized-change", listener);
      };
    },
  },
  settings: {
    get: (): Promise<IAppSettings> => ipcRenderer.invoke("settings:get"),
    save: (settings: IAppSettings): Promise<void> => ipcRenderer.invoke("settings:save", settings),
    onUpdate: (callback: (settings: IAppSettings) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, data: IAppSettings) => {
        callback(data);
      };
      ipcRenderer.on("settings:updated", listener);
      return () => {
        ipcRenderer.removeListener("settings:updated", listener);
      };
    },
    isAdmin: (): Promise<boolean> => ipcRenderer.invoke("app:is-admin"),
    sidebar: {
      get: (): boolean => ipcRenderer.sendSync("settings:get-sidebar") as boolean,
      set: (isOpen: boolean): Promise<void> => ipcRenderer.invoke("settings:set-sidebar", isOpen),
    },
  },
  tasks: {
    get: (): Promise<ITask[]> => ipcRenderer.invoke("tasks:get-all"),
    save: (task: Omit<ITask, "id">): Promise<ITask[]> => ipcRenderer.invoke("tasks:save", task),
    update: (task: ITask): Promise<ITask[]> => ipcRenderer.invoke("tasks:update", task),
    delete: (id: number): Promise<ITask[]> => ipcRenderer.invoke("tasks:delete", id),
    run: (task: ITask): Promise<void> => ipcRenderer.invoke("tasks:run", task),
    export: (): Promise<boolean> => ipcRenderer.invoke("tasks:export"),
    import: (): Promise<ITask[] | "invalid_json" | null> => ipcRenderer.invoke("tasks:import"),
    saveBulk: (tasks: ITask[]): Promise<ITask[]> => ipcRenderer.invoke("tasks:save-bulk", tasks),
    openDialog: (type: TaskType): Promise<string | null> => ipcRenderer.invoke("dialog:open", type),
    openExceptionDialog: (sourcePath: string, mode: TaskType.FILE | TaskType.FOLDER): Promise<string[] | null> =>
      ipcRenderer.invoke("dialog:open-exception", sourcePath, mode),
  },
  updater: {
    check: () => ipcRenderer.invoke("updater:check"),
    download: () => ipcRenderer.invoke("updater:download"),
    install: () => ipcRenderer.invoke("updater:install"),
    onAvailable: (callback: (version: string) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, version: string) => {
        callback(version);
      };
      ipcRenderer.on("updater:available", listener);
      return () => {
        ipcRenderer.removeListener("updater:available", listener);
      };
    },
    onNotAvailable: (callback: () => void): (() => void) => {
      const listener = () => {
        callback();
      };
      ipcRenderer.on("updater:not-available", listener);
      return () => {
        ipcRenderer.removeListener("updater:not-available", listener);
      };
    },
    onProgress: (callback: (percent: number) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, percent: number) => {
        callback(percent);
      };
      ipcRenderer.on("updater:progress", listener);
      return () => {
        ipcRenderer.removeListener("updater:progress", listener);
      };
    },
    onDownloaded: (callback: () => void): (() => void) => {
      const listener = () => {
        callback();
      };
      ipcRenderer.on("updater:downloaded", listener);
      return () => {
        ipcRenderer.removeListener("updater:downloaded", listener);
      };
    },
    onError: (callback: (message: string) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, message: string) => {
        callback(message);
      };
      ipcRenderer.on("updater:error", listener);
      return () => {
        ipcRenderer.removeListener("updater:error", listener);
      };
    },
  },
  env: {
    appVersion: packageJson.version,
    isPackaged: ipcRenderer.sendSync("get-is-packaged") as boolean,
  },
};
