import path from "node:path";

import { IPC_CHANNELS } from "@shared/constants/ipc";
import { ITask, TaskType } from "@shared/types/tasks";
import { ITaskTransfer, ImportMode } from "@shared/types/transfer";
import { app, BrowserWindow, dialog, ipcMain } from "electron";

import { TaskStorage } from "./TaskStorage";
import { CopyService } from "../CopyService/CopyService";
import { LabelStorage } from "../LabelService/LabelStorage";
import { SchedulerService } from "../SchedulerService/SchedulerService";

const createUniqueId = (usedIds: Set<number>): number => {
  let id = Date.now();
  while (usedIds.has(id)) {
    id += 1;
  }

  usedIds.add(id);
  return id;
};

// Initializes IPC handlers
export class TaskIpc {
  constructor(
    private readonly taskStorage: TaskStorage,
    private readonly copyService: CopyService,
    private readonly scheduler: SchedulerService,
    private readonly labelStorage: LabelStorage
  ) {}

  init(): void {
    // Get tasks
    ipcMain.handle(IPC_CHANNELS.tasks.get, () => {
      return this.taskStorage.load();
    });

    // Create a new task
    ipcMain.handle(IPC_CHANNELS.tasks.save, (_, newTask: Omit<ITask, "id">) => {
      const tasks = this.taskStorage.load();

      const taskWithId: ITask = {
        id: Date.now(),
        ...newTask,
      };

      tasks.push(taskWithId);

      this.taskStorage.save(tasks);
      this.scheduler.rescheduleAll(tasks);

      return tasks;
    });

    // Update a task
    ipcMain.handle(IPC_CHANNELS.tasks.update, (_, updatedTask: ITask) => {
      const tasks = this.taskStorage.load().map((task) => {
        return task.id === updatedTask.id ? updatedTask : task;
      });

      this.taskStorage.save(tasks);
      this.scheduler.rescheduleAll(tasks);

      return tasks;
    });

    // Run a task manually
    ipcMain.handle(IPC_CHANNELS.tasks.run, async (_, task: ITask) => {
      await this.copyService.run(task);
    });

    // Delete a task
    ipcMain.handle(IPC_CHANNELS.tasks.delete, (_, id: number) => {
      const tasks = this.taskStorage.load().filter((task) => task.id !== id);

      this.taskStorage.save(tasks);
      this.scheduler.rescheduleAll(tasks);

      return tasks;
    });

    // Export tasks and labels
    ipcMain.handle(IPC_CHANNELS.tasks.export, async () => {
      const { filePath, canceled } = await dialog.showSaveDialog({
        title: "Export tasks and labels",
        defaultPath: path.join(app.getPath("documents"), "tasks.json"),
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (canceled || !filePath) {
        return false;
      }

      const transfer: ITaskTransfer = {
        tasks: this.taskStorage.load(),
        labels: this.labelStorage.load(),
      };

      this.taskStorage.saveTransferToFile(transfer, filePath);

      return true;
    });

    // Import tasks and labels
    ipcMain.handle(IPC_CHANNELS.tasks.import, async () => {
      const { filePaths, canceled } = await dialog.showOpenDialog({
        title: "Import tasks and labels",
        filters: [{ name: "JSON", extensions: ["json"] }],
        properties: ["openFile"],
      });

      if (canceled || filePaths.length === 0) {
        return null;
      }

      return this.taskStorage.loadTransferFromFile(filePaths[0]);
    });

    // Save imported tasks and merge imported labels
    ipcMain.handle(IPC_CHANNELS.tasks.saveBulk, (_, transfer: ITaskTransfer, mode: ImportMode) => {
      const currentTasks = mode === ImportMode.ADD || transfer.tasks.length === 0 ? this.taskStorage.load() : [];
      const currentLabels = this.labelStorage.load();
      const importedLabelIds = new Map<number, number>();
      const usedLabelIds = new Set(currentLabels.map((label) => label.id));

      transfer.labels.forEach((importedLabel) => {
        const sameId = currentLabels.find((label) => label.id === importedLabel.id);
        const sameLabel = currentLabels.find(
          (label) => label.name === importedLabel.name && label.color === importedLabel.color
        );

        if (sameId && sameId.name === importedLabel.name && sameId.color === importedLabel.color) {
          importedLabelIds.set(importedLabel.id, sameId.id);
          return;
        }

        if (sameLabel) {
          importedLabelIds.set(importedLabel.id, sameLabel.id);
          return;
        }

        const newId = createUniqueId(usedLabelIds);
        importedLabelIds.set(importedLabel.id, newId);
        currentLabels.push({ ...importedLabel, id: newId });
      });

      const usedTaskIds = new Set(currentTasks.map((task) => task.id));
      const importedTasks = transfer.tasks.map((task) => ({
        ...task,
        id: createUniqueId(usedTaskIds),
        labelsIds: task.labelsIds?.map((labelId) => importedLabelIds.get(labelId) ?? labelId),
      }));
      const tasksWithIds: ITask[] = [...currentTasks, ...importedTasks];

      this.labelStorage.save(currentLabels);
      this.taskStorage.save(tasksWithIds);
      this.scheduler.rescheduleAll(tasksWithIds);

      return tasksWithIds;
    });

    // Select a file or folder
    ipcMain.handle(IPC_CHANNELS.tasks.openDialog, async (event, type: TaskType) => {
      const window = BrowserWindow.fromWebContents(event.sender);

      if (!window) {
        return null;
      }

      const result = await dialog.showOpenDialog(window, {
        properties: type === TaskType.FOLDER ? ["openDirectory"] : ["openFile"],
        title: type === TaskType.FOLDER ? "Select a folder" : "Select file",
      });

      return result.canceled ? null : result.filePaths[0];
    });

    // Select exceptions
    ipcMain.handle(
      IPC_CHANNELS.tasks.openExceptionDialog,
      async (event, sourcePath: string, mode: TaskType.FOLDER | TaskType.FILE) => {
        const window = BrowserWindow.fromWebContents(event.sender);

        if (!window) {
          return null;
        }

        const result = await dialog.showOpenDialog(window, {
          title: mode === TaskType.FOLDER ? "Select folders to exclude" : "Select files to exclude",
          defaultPath: path.normalize(sourcePath),
          buttonLabel: "Select",
          properties: mode === TaskType.FOLDER ? ["openDirectory", "multiSelections"] : ["openFile", "multiSelections"],
        });

        return result.canceled ? null : result.filePaths;
      }
    );
  }
}
