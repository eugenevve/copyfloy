import { IPC_CHANNELS } from "@shared/constants/ipc";
import { ITask, TaskType } from "@shared/types/tasks";
import { ITaskTransfer, ImportMode } from "@shared/types/transfer";
import { ipcMain } from "electron";

import type { TaskService } from "./TaskService";

// Initializes IPC handlers
export class TaskIpc {
  constructor(private readonly taskService: TaskService) {}

  init() {
    // Handle IPC requests for task operations
    ipcMain.handle(IPC_CHANNELS.tasks.get, () => this.taskService.get());

    // Handle IPC request to get a single task by ID
    ipcMain.handle(IPC_CHANNELS.tasks.save, (_, newTask: Omit<ITask, "id">) => this.taskService.create(newTask));

    // Handle IPC request to update an existing task
    ipcMain.handle(IPC_CHANNELS.tasks.update, (_, updatedTask: ITask) => this.taskService.update(updatedTask));

    // Handle IPC request to run a task
    ipcMain.handle(IPC_CHANNELS.tasks.run, (_, task: ITask) => this.taskService.run(task));

    // Handle IPC request to check if Git is available
    ipcMain.handle(IPC_CHANNELS.tasks.gitAvailable, () => this.taskService.gitAvailable());

    // Handle IPC request to stop a running task
    ipcMain.handle(IPC_CHANNELS.tasks.stop, (_, id: number) => this.taskService.stop(id));

    // Handle IPC request to get currently running tasks
    ipcMain.handle(IPC_CHANNELS.tasks.getRunning, () => this.taskService.getRunning());

    // Handle IPC request to delete a task
    ipcMain.handle(IPC_CHANNELS.tasks.delete, (_, id: number) => this.taskService.delete(id));

    // Handle IPC request to reorder tasks
    ipcMain.handle(IPC_CHANNELS.tasks.reorder, (_, orderedIds: number[]) => this.taskService.reorder(orderedIds));

    // Handle IPC request to export tasks
    ipcMain.handle(IPC_CHANNELS.tasks.export, () => this.taskService.export());

    // Handle IPC request to import tasks
    ipcMain.handle(IPC_CHANNELS.tasks.import, () => this.taskService.import());

    // Handle IPC request to save tasks in bulk
    ipcMain.handle(IPC_CHANNELS.tasks.saveBulk, (_, transfer: ITaskTransfer, mode: ImportMode) =>
      this.taskService.saveBulk(transfer, mode)
    );

    // Handle IPC request to open a task dialog
    ipcMain.handle(IPC_CHANNELS.tasks.openDialog, (event, type: TaskType) =>
      this.taskService.openDialog(event.sender, type)
    );

    // Handle IPC request to open an exception dialog for a task
    ipcMain.handle(
      IPC_CHANNELS.tasks.openExceptionDialog,
      (event, sourcePath: string, mode: TaskType.FOLDER | TaskType.FILE) =>
        this.taskService.openExceptionDialog(event.sender, sourcePath, mode)
    );
  }
}
