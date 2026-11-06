import path from "node:path";

import { createUniqueId } from "@main/utils/createUniqueId";
import { reorderDisplayIds } from "@main/utils/reorderDisplayIds";
import { MAX_LIST_ITEMS } from "@shared/constants/limits";
import { ITask, TaskType } from "@shared/types/tasks";
import { ITaskTransfer, ImportMode } from "@shared/types/transfer";
import { app, BrowserWindow, dialog, WebContents } from "electron";

import { TaskIpc } from "./TaskIpc";
import { TaskStorage } from "./TaskStorage";
import { CopyService } from "../CopyService/CopyService";
import { LabelStorage } from "../LabelService/LabelStorage";
import { ReportStorage } from "../ReportService/ReportStorage";
import { MissedTaskIpc } from "../SchedulerService/MissedTaskIpc";
import { MissedTaskService } from "../SchedulerService/MissedTaskService";
import { MissedTaskStorage } from "../SchedulerService/MissedTaskStorage";
import { SchedulerService } from "../SchedulerService/SchedulerService";

// Service responsible for coordinating task-related services
export class TaskService {
  private readonly taskStorage: TaskStorage;
  private readonly labelStorage: LabelStorage;
  private readonly copyService: CopyService;
  private readonly scheduler: SchedulerService;
  private readonly taskIpc: TaskIpc;
  private readonly missedTasks: MissedTaskService;
  private readonly missedTaskIpc: MissedTaskIpc;

  constructor(taskStorage: TaskStorage) {
    this.taskStorage = taskStorage;
    this.labelStorage = new LabelStorage();
    this.copyService = new CopyService();

    this.scheduler = new SchedulerService((task) => {
      this.copyService.run(task);
    });

    this.taskIpc = new TaskIpc(this);
    this.missedTasks = new MissedTaskService(this.taskStorage, new ReportStorage(), new MissedTaskStorage());
    this.missedTaskIpc = new MissedTaskIpc(this.missedTasks);
  }

  get() {
    return this.taskStorage.load();
  }

  create(newTask: Omit<ITask, "id">) {
    const tasks = this.taskStorage.load();

    if (tasks.length >= MAX_LIST_ITEMS) {
      return tasks;
    }

    tasks.push({ id: createUniqueId(new Set(tasks.map((task) => task.id))), ...newTask });
    this.taskStorage.save(tasks);
    this.scheduler.rescheduleAll(tasks);

    return tasks;
  }

  update(updatedTask: ITask) {
    const tasks = this.taskStorage.load().map((task) => (task.id === updatedTask.id ? updatedTask : task));

    this.taskStorage.save(tasks);
    this.scheduler.rescheduleAll(tasks);

    return tasks;
  }

  run(task: ITask) {
    return this.copyService.run(task);
  }

  gitAvailable() {
    return this.copyService.isGitAvailable();
  }

  stop(id: number) {
    this.copyService.stop(id);
  }

  getRunning() {
    return this.copyService.getRunning();
  }

  delete(id: number) {
    const tasks = this.taskStorage.load().filter((task) => task.id !== id);

    this.taskStorage.save(tasks);
    this.scheduler.rescheduleAll(tasks);

    return tasks;
  }

  reorder(orderedIds: number[]) {
    const tasks = this.taskStorage.load();
    const reorderedTasks = reorderDisplayIds(tasks, orderedIds);

    if (!reorderedTasks) {
      return tasks;
    }

    this.taskStorage.save(reorderedTasks);

    return reorderedTasks;
  }

  async export() {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: "Export tasks and labels",
      defaultPath: path.join(app.getPath("documents"), "tasks.json"),
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (canceled || !filePath) {
      return false;
    }

    const transfer: ITaskTransfer = {
      tasks: this.taskStorage.load().map((task) => {
        const exportedTask = { ...task };
        delete exportedTask.accessToken;
        return exportedTask;
      }),
      labels: this.labelStorage.load(),
    };

    this.taskStorage.saveTransferToFile(transfer, filePath);

    return true;
  }

  async import() {
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: "Import tasks and labels",
      filters: [{ name: "JSON", extensions: ["json"] }],
      properties: ["openFile"],
    });

    if (canceled || filePaths.length === 0) {
      return null;
    }

    return this.taskStorage.loadTransferFromFile(filePaths[0]);
  }

  saveBulk(transfer: ITaskTransfer, mode: ImportMode) {
    const keepCurrent = mode === ImportMode.ADD || transfer.tasks.length === 0;
    const currentTasks = keepCurrent ? this.taskStorage.load() : [];
    const currentLabels = keepCurrent ? this.labelStorage.load() : [];
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
    const tasksWithIds: ITask[] = [...currentTasks, ...importedTasks].slice(0, MAX_LIST_ITEMS);

    this.labelStorage.save(currentLabels.slice(0, MAX_LIST_ITEMS));
    this.taskStorage.save(tasksWithIds);
    this.scheduler.rescheduleAll(tasksWithIds);

    return tasksWithIds;
  }

  openDialog(sender: WebContents, type: TaskType) {
    const window = BrowserWindow.fromWebContents(sender);

    if (!window) {
      return null;
    }

    return dialog
      .showOpenDialog(window, {
        properties: type === TaskType.FOLDER ? ["openDirectory"] : ["openFile"],
        title: type === TaskType.FOLDER ? "Select a folder" : "Select file",
      })
      .then((result) => (result.canceled ? null : result.filePaths[0]));
  }

  openExceptionDialog(sender: WebContents, sourcePath: string, mode: TaskType.FOLDER | TaskType.FILE) {
    const window = BrowserWindow.fromWebContents(sender);

    if (!window) {
      return null;
    }

    return dialog
      .showOpenDialog(window, {
        title: mode === TaskType.FOLDER ? "Select folders to exclude" : "Select files to exclude",
        defaultPath: path.normalize(sourcePath),
        buttonLabel: "Select",
        properties: mode === TaskType.FOLDER ? ["openDirectory", "multiSelections"] : ["openFile", "multiSelections"],
      })
      .then((result) => (result.canceled ? null : result.filePaths));
  }

  // Initializes the task system
  init() {
    this.taskIpc.init();
    this.missedTasks.init();
    this.missedTaskIpc.init();

    const tasks = this.taskStorage.load();
    this.scheduler.init(tasks);
  }
}
