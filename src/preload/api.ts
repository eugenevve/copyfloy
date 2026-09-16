import packageJson from "@package";
import { IPC_CHANNELS } from "@shared/constants/ipc";
import { ITask, TaskType } from "@shared/types/tasks";
import { IAppSettings } from "@shared/types/window";
import { ipcRenderer } from "electron";

import { invoke, receive, receiveNoData } from "./ipc";

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
    isMaximized: (): Promise<boolean> => invoke<boolean>(IPC_CHANNELS.window.isMaximized),
    onMaximizedChange: (callback: (isMaximized: boolean) => void): (() => void) =>
      receive<boolean>(IPC_CHANNELS.window.maximizedChange, callback),
  },
  settings: {
    get: (): Promise<IAppSettings> => invoke<IAppSettings>(IPC_CHANNELS.settings.get),
    save: (settings: IAppSettings): Promise<void> => invoke<void>(IPC_CHANNELS.settings.save, settings),
    onUpdate: (callback: (settings: IAppSettings) => void): (() => void) =>
      receive<IAppSettings>(IPC_CHANNELS.settings.updated, callback),
    runAdmin: {
      get: (): Promise<boolean> => invoke<boolean>(IPC_CHANNELS.settings.getAdmin),
      set: (isAdmin: boolean): Promise<void> => invoke<void>(IPC_CHANNELS.settings.setAdmin, isAdmin),
    },
    sidebar: {
      get: (): boolean => ipcRenderer.sendSync(IPC_CHANNELS.settings.getSidebar) as boolean,
      set: (isOpen: boolean): Promise<void> => invoke<void>(IPC_CHANNELS.settings.setSidebar, isOpen),
    },
    zoom: {
      get: (): Promise<number> => invoke<number>(IPC_CHANNELS.settings.getZoom),
      set: (factor: number): Promise<void> => invoke<void>(IPC_CHANNELS.settings.setZoom, factor),
    },
  },
  tasks: {
    get: (): Promise<ITask[]> => invoke<ITask[]>(IPC_CHANNELS.tasks.getAll),
    save: (task: Omit<ITask, "id">): Promise<ITask[]> => invoke<ITask[]>(IPC_CHANNELS.tasks.save, task),
    update: (task: ITask): Promise<ITask[]> => invoke<ITask[]>(IPC_CHANNELS.tasks.update, task),
    delete: (id: number): Promise<ITask[]> => invoke<ITask[]>(IPC_CHANNELS.tasks.delete, id),
    run: (task: ITask): Promise<void> => invoke<void>(IPC_CHANNELS.tasks.run, task),
    export: (): Promise<boolean> => invoke<boolean>(IPC_CHANNELS.tasks.export),
    import: (): Promise<ITask[] | null> => invoke<ITask[] | null>(IPC_CHANNELS.tasks.import),
    saveBulk: (tasks: ITask[]): Promise<ITask[]> => invoke<ITask[]>(IPC_CHANNELS.tasks.saveBulk, tasks),
    openDialog: (type: TaskType): Promise<string | null> => invoke<string | null>(IPC_CHANNELS.tasks.openDialog, type),
    openExceptionDialog: (sourcePath: string, mode: TaskType.FOLDER | TaskType.FILE): Promise<string[] | null> =>
      invoke<string[] | null>(IPC_CHANNELS.tasks.openExceptionDialog, sourcePath, mode),
  },
  updater: {
    check: (): Promise<void> => invoke<void>(IPC_CHANNELS.updater.check),
    download: (): Promise<void> => invoke<void>(IPC_CHANNELS.updater.download),
    install: (): Promise<void> => invoke<void>(IPC_CHANNELS.updater.install),
    onAvailable: (callback: (version: string) => void): (() => void) =>
      receive<string>(IPC_CHANNELS.updater.ipc.available, callback),
    onNotAvailable: (callback: () => void): (() => void) =>
      receiveNoData(IPC_CHANNELS.updater.ipc.notAvailable, callback),
    onProgress: (callback: (percent: number) => void): (() => void) =>
      receive<number>(IPC_CHANNELS.updater.ipc.progress, callback),
    onDownloaded: (callback: () => void): (() => void) => 
      receiveNoData(IPC_CHANNELS.updater.ipc.downloaded, callback),
    onError: (callback: (message: string) => void): (() => void) =>
      receive<string>(IPC_CHANNELS.updater.ipc.error, callback),
  },
};
