import packageJson from "@package";
import { IPC_CHANNELS } from "@shared/constants/ipc";
import { ILabel } from "@shared/types/labels";
import { IReport } from "@shared/types/report";
import { IDateTimeFormat } from "@shared/types/settings";
import { ITask, ITaskProgress, TaskType } from "@shared/types/tasks";
import { ITaskTransfer, ImportMode } from "@shared/types/transfer";
import { ipcRenderer } from "electron";

import { invoke, receive, receiveNoData } from "./ipc";

export type ElectronAPI = typeof api;

export const api = {
  app: {
    appVersion: packageJson.version,
    isPackaged: ipcRenderer.sendSync(IPC_CHANNELS.app.isPackaged) as boolean,
    isPortable: ipcRenderer.sendSync(IPC_CHANNELS.app.isPortable) as boolean,
    isAdmin: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.app.isAdmin),
  },
  window: {
    close: (): void => ipcRenderer.send(IPC_CHANNELS.window.close),
    minimize: (): void => ipcRenderer.send(IPC_CHANNELS.window.minimize),
    maximize: (): void => ipcRenderer.send(IPC_CHANNELS.window.maximize),
    isMaximized: () => invoke<boolean>(IPC_CHANNELS.window.isMaximized),
    onMaximizedChange: (callback: (isMaximized: boolean) => void): (() => void) =>
      receive<boolean>(IPC_CHANNELS.window.maximizedChange, callback),
  },
  settings: {
    sidebar: {
      get: (): boolean => ipcRenderer.sendSync(IPC_CHANNELS.settings.getSidebar) as boolean,
      set: (isOpen: boolean) => invoke<void>(IPC_CHANNELS.settings.setSidebar, isOpen),
    },
    autoStart: {
      get: () => invoke<boolean>(IPC_CHANNELS.settings.getAutoStart),
      set: (isStart: boolean) => invoke<void>(IPC_CHANNELS.settings.setAutoStart, isStart),
    },
    runAdmin: {
      get: () => invoke<boolean>(IPC_CHANNELS.settings.getAdmin),
      set: (isAdmin: boolean) => invoke<void>(IPC_CHANNELS.settings.setAdmin, isAdmin),
    },
    zoom: {
      get: () => invoke<number>(IPC_CHANNELS.settings.getZoom),
      set: (factor: number) => invoke<void>(IPC_CHANNELS.settings.setZoom, factor),
    },
    minimizeTray: {
      get: () => invoke<boolean>(IPC_CHANNELS.settings.getTray),
      set: (minimizeTray: boolean) => invoke<void>(IPC_CHANNELS.settings.setTray, minimizeTray),
    },
    dateTimeFormat: {
      get: () => invoke<IDateTimeFormat>(IPC_CHANNELS.settings.getDateTimeFormat),
      set: (format: IDateTimeFormat) => invoke<void>(IPC_CHANNELS.settings.setDateTimeFormat, format),
    },
  },
  tasks: {
    get: () => invoke<ITask[]>(IPC_CHANNELS.tasks.get),
    save: (task: Omit<ITask, "id">) => invoke<ITask[]>(IPC_CHANNELS.tasks.save, task),
    update: (task: ITask) => invoke<ITask[]>(IPC_CHANNELS.tasks.update, task),
    delete: (id: number) => invoke<ITask[]>(IPC_CHANNELS.tasks.delete, id),
    reorder: (orderedIds: number[]) => invoke<ITask[]>(IPC_CHANNELS.tasks.reorder, orderedIds),
    run: (task: ITask) => invoke<void>(IPC_CHANNELS.tasks.run, task),
    stop: (id: number) => invoke<void>(IPC_CHANNELS.tasks.stop, id),
    getRunning: () => invoke<Record<number, number>>(IPC_CHANNELS.tasks.getRunning),
    getMissed: () => invoke<ITask[]>(IPC_CHANNELS.tasks.getMissed),
    dismissMissed: (id: number) => invoke<void>(IPC_CHANNELS.tasks.dismissMissed, id),
    onProgress: (callback: (progress: ITaskProgress) => void): (() => void) =>
      receive<ITaskProgress>(IPC_CHANNELS.tasks.progress, callback),
    isGitAvailable: () => invoke<boolean>(IPC_CHANNELS.tasks.gitAvailable),
    export: () => invoke<boolean>(IPC_CHANNELS.tasks.export),
    import: () => invoke<ITaskTransfer | null>(IPC_CHANNELS.tasks.import),
    saveBulk: (transfer: ITaskTransfer, mode: ImportMode) =>
      invoke<ITask[]>(IPC_CHANNELS.tasks.saveBulk, transfer, mode),
    openDialog: (type: TaskType) => invoke<string | null>(IPC_CHANNELS.tasks.openDialog, type),
    openExceptionDialog: (sourcePath: string, mode: TaskType.FOLDER | TaskType.FILE) =>
      invoke<string[] | null>(IPC_CHANNELS.tasks.openExceptionDialog, sourcePath, mode),
  },
  labels: {
    get: () => invoke<ILabel[]>(IPC_CHANNELS.labels.get),
    save: (label: Omit<ILabel, "id">) => invoke<ILabel[]>(IPC_CHANNELS.labels.save, label),
    update: (label: ILabel) => invoke<ILabel[]>(IPC_CHANNELS.labels.update, label),
    delete: (id: number) => invoke<ILabel[]>(IPC_CHANNELS.labels.delete, id),
    reorder: (orderedIds: number[]) => invoke<ILabel[]>(IPC_CHANNELS.labels.reorder, orderedIds),
  },
  report: {
    get: () => invoke<IReport>(IPC_CHANNELS.report.get),
    clear: () => invoke<void>(IPC_CHANNELS.report.clear),
  },
  updater: {
    check: () => invoke<void>(IPC_CHANNELS.updater.check),
    download: () => invoke<void>(IPC_CHANNELS.updater.download),
    install: () => invoke<void>(IPC_CHANNELS.updater.install),
    onAvailable: (callback: (version: string) => void): (() => void) =>
      receive<string>(IPC_CHANNELS.updater.ipc.available, callback),
    onNotAvailable: (callback: () => void): (() => void) =>
      receiveNoData(IPC_CHANNELS.updater.ipc.notAvailable, callback),
    onProgress: (callback: (percent: number) => void): (() => void) =>
      receive<number>(IPC_CHANNELS.updater.ipc.progress, callback),
    onDownloaded: (callback: () => void): (() => void) => receiveNoData(IPC_CHANNELS.updater.ipc.downloaded, callback),
    onError: (callback: (message: string) => void): (() => void) =>
      receive<string>(IPC_CHANNELS.updater.ipc.error, callback),
  },
};
