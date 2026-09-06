import path from "node:path";

import { ITask, TaskType } from "@shared/types/tasks";
import { app, BrowserWindow, dialog, ipcMain } from "electron";

import { TaskStorage } from "./TaskStorage";
import { CopyService } from "../CopyService/CopyService";
import { SchedulerService } from "../SchedulerService/SchedulerService";

// Initializes IPC handlers
export class TaskIpc {
  constructor(
    private readonly taskStorage: TaskStorage,
    private readonly copyService: CopyService,
    private readonly scheduler: SchedulerService
  ) {}

  init(): void {
    // Create a new task
    ipcMain.handle("tasks:save", (_, newTask: Omit<ITask, "id">) => {
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

    // Get all tasks
    ipcMain.handle("tasks:get-all", () => {
      return this.taskStorage.load();
    });

    // Update a task
    ipcMain.handle("tasks:update", (_, updatedTask: ITask) => {
      const tasks = this.taskStorage.load().map((task) => {
        return task.id === updatedTask.id ? updatedTask : task;
      });

      this.taskStorage.save(tasks);
      this.scheduler.rescheduleAll(tasks);

      return tasks;
    });

    // Run a task manually
    ipcMain.handle("tasks:run", async (_, task: ITask) => {
      await this.copyService.run(task);
    });

    // Delete a task
    ipcMain.handle("tasks:delete", (_, id: number) => {
      const tasks = this.taskStorage.load().filter((task) => task.id !== id);

      this.taskStorage.save(tasks);
      this.scheduler.rescheduleAll(tasks);

      return tasks;
    });

    // Export tasks
    ipcMain.handle("tasks:export", async () => {
      const tasks = this.taskStorage.load();

      const { filePath, canceled } = await dialog.showSaveDialog({
        title: "Export task",
        defaultPath: path.join(app.getPath("documents"), "tasks.json"),
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (canceled || !filePath) {
        return false;
      }

      this.taskStorage.saveToFile(tasks, filePath);

      return true;
    });

    // Import tasks
    ipcMain.handle("tasks:import", async () => {
      const { filePaths, canceled } = await dialog.showOpenDialog({
        title: "Importing tasks",
        filters: [{ name: "JSON", extensions: ["json"] }],
        properties: ["openFile"],
      });

      if (canceled || filePaths.length === 0) {
        return null;
      }

      return this.taskStorage.loadFromFile(filePaths[0]);
    });

    // Save imported tasks
    ipcMain.handle("tasks:save-bulk", (_, tasks: ITask[]) => {
      this.taskStorage.save(tasks);
      this.scheduler.rescheduleAll(tasks);

      return tasks;
    });

    // Select a file or folder
    ipcMain.handle("dialog:open", async (event, type: TaskType) => {
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
      "dialog:open-exception",
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
