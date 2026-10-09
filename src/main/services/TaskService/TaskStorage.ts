import fs from "node:fs";
import path from "node:path";

import { Logger } from "@main/utils/logger";
import { ILabel } from "@shared/types/labels";
import { ITask, TaskType } from "@shared/types/tasks";
import { ITaskTransfer } from "@shared/types/transfer";
import { app } from "electron";

// Storage for Task entities
// Responsible only for reading and writing tasks.json
export class TaskStorage {
  readonly dataPath = path.join(app.getPath("userData"), "tasks.json");

  // Reads all tasks from the default tasks.json
  load(): ITask[] {
    if (!fs.existsSync(this.dataPath)) {
      return [];
    }

    try {
      return this.loadFromFile(this.dataPath);
    } catch (error) {
      Logger.error("TaskStorage", `Failed to load tasks from "${this.dataPath}"`, error);

      return [];
    }
  }

  // Saves tasks to the default tasks.json
  loadFromFile(filePath: string): ITask[] {
    return this.loadTransferFromFile(filePath).tasks;
  }

  loadTransferFromFile(filePath: string): ITaskTransfer {
    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist");
    }

    const content = fs.readFileSync(filePath, "utf-8");

    if (!content.trim()) {
      throw new Error("Tasks file is empty");
    }

    const data: unknown = JSON.parse(content);

    const isLegacyTasksFile = Array.isArray(data);
    const transfer = isLegacyTasksFile
      ? { version: 1 as const, tasks: data, labels: [] }
      : this.parseTransfer(data);

    if (isLegacyTasksFile && transfer.tasks.length === 0) {
      throw new Error("Tasks file contains no tasks");
    }

    if (!transfer.tasks.every((task) => this.isValidTask(task))) {
      throw new Error("Invalid task format");
    }

    if (!transfer.labels.every((label) => this.isValidLabel(label))) {
      throw new Error("Invalid label format");
    }

    if (new Set(transfer.labels.map((label) => label.id)).size !== transfer.labels.length) {
      throw new Error("Duplicate label IDs");
    }

    return transfer;
  }

  save(tasks: ITask[]): void {
    this.saveToFile(tasks, this.dataPath);
  }

  // Saves tasks to a specific JSON file
  saveToFile(tasks: ITask[], filePath: string): void {
    try {
      this.ensureDirectory(filePath);

      fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), "utf-8");
    } catch (error) {
      Logger.error("TaskStorage", `Failed to save tasks to "${filePath}"`, error);
    }
  }

  saveTransferToFile(transfer: ITaskTransfer, filePath: string): void {
    try {
      this.ensureDirectory(filePath);

      fs.writeFileSync(filePath, JSON.stringify(transfer, null, 2), "utf-8");
    } catch (error) {
      Logger.error("TaskStorage", `Failed to save transfer to "${filePath}"`, error);
    }
  }

  private parseTransfer(value: unknown): ITaskTransfer {
    if (!value || typeof value !== "object") {
      throw new Error("Invalid transfer format");
    }

    const transfer = value as Record<string, unknown>;

    if (
      (transfer.version !== undefined && transfer.version !== 1) ||
      !Array.isArray(transfer.tasks) ||
      (transfer.labels !== undefined && !Array.isArray(transfer.labels))
    ) {
      throw new Error("Invalid transfer format");
    }

    return {
      tasks: transfer.tasks as ITask[],
      labels: (transfer.labels ?? []) as ILabel[],
    };
  }

  // Verification that the imported file is valid
  private isValidTask(value: unknown): value is ITask {
    if (!value || typeof value !== "object") {
      return false;
    }

    const task = value as Record<string, unknown>;

    return (
      typeof task.id === "number" &&
      typeof task.name === "string" &&
      typeof task.source === "string" &&
      typeof task.target === "string" &&
      (task.type === TaskType.FILE || task.type === TaskType.FOLDER) &&
      (task.schedule === undefined || typeof task.schedule === "object") &&
      (task.labelsIds === undefined ||
        (Array.isArray(task.labelsIds) && task.labelsIds.every((labelId) => typeof labelId === "number"))) &&
      (task.exceptions === undefined ||
        (Array.isArray(task.exceptions) && task.exceptions.every((exception) => typeof exception === "string")))
    );
  }

  private isValidLabel(value: unknown): value is ILabel {
    if (!value || typeof value !== "object") {
      return false;
    }

    const label = value as Record<string, unknown>;

    return typeof label.id === "number" && typeof label.name === "string" && typeof label.color === "string";
  }

  // Ensures that the parent directory exists
  private ensureDirectory(filePath: string): void {
    const directory = path.dirname(filePath);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }
}
