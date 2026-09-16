import packageJson from "@package";
import { IPC_CHANNELS } from "@shared/constants/ipc";
import { ITask, TaskType } from "@shared/types/tasks";
import { IAppSettings } from "@shared/types/window";
import { ipcRenderer, IpcRendererEvent } from "electron";

export type ElectronAPI = typeof api;

export const api = {
  app: {
    appVersion: packageJson.version,
    isPackaged: ipcRenderer.sendSync(IPC_CHANNELS.app.isPackaged) as boolean,
    isAdmin: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.app.isAdmin),
  },
  window: {
    close: (): void => ipcRenderer.send(IPC_CHANNELS.window.close),
    minimize: (): void => ipcRenderer.send(IPC_CHANNELS.window.minimize),
    maximize: (): void => ipcRenderer.send(IPC_CHANNELS.window.maximize),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.window.isMaximized),
    onMaximizedChange: (callback: (isMaximized: boolean) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, value: boolean) => {
        callback(value);
      };
      ipcRenderer.on(IPC_CHANNELS.window.maximizedChange, listener);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.window.maximizedChange, listener);
      };
    },
  },
  settings: {
    get: (): Promise<IAppSettings> => ipcRenderer.invoke(IPC_CHANNELS.settings.get),
    save: (settings: IAppSettings): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.settings.save, settings),
    onUpdate: (callback: (settings: IAppSettings) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, data: IAppSettings) => {
        callback(data);
      };
      ipcRenderer.on(IPC_CHANNELS.settings.updated, listener);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.settings.updated, listener);
      };
    },
    runAdmin: {
      get: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.settings.getAdmin),
      set: (isAdmin: boolean): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.settings.setAdmin, isAdmin),
    },
    sidebar: {
      get: (): boolean => ipcRenderer.sendSync(IPC_CHANNELS.settings.getSidebar) as boolean,
      set: (isOpen: boolean): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.settings.setSidebar, isOpen),
    },
    zoom: {
      get: (): Promise<number> => ipcRenderer.invoke(IPC_CHANNELS.settings.getZoom),
      set: (isFactor: number): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.settings.setZoom, isFactor),
    },
  },
  tasks: {
    get: (): Promise<ITask[]> => ipcRenderer.invoke(IPC_CHANNELS.tasks.getAll),
    save: (task: Omit<ITask, "id">): Promise<ITask[]> => ipcRenderer.invoke(IPC_CHANNELS.tasks.save, task),
    update: (task: ITask): Promise<ITask[]> => ipcRenderer.invoke(IPC_CHANNELS.tasks.update, task),
    delete: (id: number): Promise<ITask[]> => ipcRenderer.invoke(IPC_CHANNELS.tasks.delete, id),
    run: (task: ITask): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.tasks.run, task),
    export: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.tasks.export),
    import: (): Promise<ITask[] | "invalid_json" | null> => ipcRenderer.invoke(IPC_CHANNELS.tasks.import),
    saveBulk: (tasks: ITask[]): Promise<ITask[]> => ipcRenderer.invoke(IPC_CHANNELS.tasks.saveBulk, tasks),
    openDialog: (type: TaskType): Promise<string | null> => ipcRenderer.invoke(IPC_CHANNELS.tasks.openDialog, type),
    openExceptionDialog: (sourcePath: string, mode: TaskType.FOLDER | TaskType.FILE): Promise<string[] | null> =>
      ipcRenderer.invoke(IPC_CHANNELS.tasks.openExceptionDialog, sourcePath, mode),
  },
  updater: {
    check: () => ipcRenderer.invoke(IPC_CHANNELS.updater.check),
    download: () => ipcRenderer.invoke(IPC_CHANNELS.updater.download),
    install: () => ipcRenderer.invoke(IPC_CHANNELS.updater.install),
    onAvailable: (callback: (version: string) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, version: string) => {
        callback(version);
      };
      ipcRenderer.on(IPC_CHANNELS.updater.ipc.available, listener);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.updater.ipc.available, listener);
      };
    },
    onNotAvailable: (callback: () => void): (() => void) => {
      const listener = () => {
        callback();
      };
      ipcRenderer.on(IPC_CHANNELS.updater.ipc.notAvailable, listener);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.updater.ipc.notAvailable, listener);
      };
    },
    onProgress: (callback: (percent: number) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, percent: number) => {
        callback(percent);
      };
      ipcRenderer.on(IPC_CHANNELS.updater.ipc.progress, listener);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.updater.ipc.progress, listener);
      };
    },
    onDownloaded: (callback: () => void): (() => void) => {
      const listener = () => {
        callback();
      };
      ipcRenderer.on(IPC_CHANNELS.updater.ipc.downloaded, listener);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.updater.ipc.downloaded, listener);
      };
    },
    onError: (callback: (message: string) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, message: string) => {
        callback(message);
      };
      ipcRenderer.on(IPC_CHANNELS.updater.ipc.error, listener);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.updater.ipc.error, listener);
      };
    },
  },
};
