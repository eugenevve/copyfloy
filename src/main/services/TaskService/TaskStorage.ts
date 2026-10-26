import fs from "node:fs";
import path from "node:path";

import { Logger } from "@main/utils/logger";
import { ILabel } from "@shared/types/labels";
import { ITask, RepositoryProvider, TaskType } from "@shared/types/tasks";
import { ITaskTransfer } from "@shared/types/transfer";
import { app, safeStorage } from "electron";

// Storage for Task entities
// Responsible only for reading and writing tasks.json
export class TaskStorage {
  readonly dataPath = path.join(app.getPath("userData"), "tasks.json");

  // Ciphertexts that could not be decrypted, kept so save() does not erase them
  private readonly undecryptableTokens = new Map<number, string>();

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
    const transfer: ITaskTransfer = isLegacyTasksFile
      ? { tasks: data as ITask[], labels: [] }
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

    transfer.tasks = transfer.tasks.map((task) => this.decryptTaskToken(task));

    return transfer;
  }

  save(tasks: ITask[]): void {
    const ids = new Set(tasks.map((task) => task.id));

    for (const id of this.undecryptableTokens.keys()) {
      if (!ids.has(id)) {
        this.undecryptableTokens.delete(id);
      }
    }

    this.saveToFile(
      tasks.map((task) => this.encryptTaskToken(task)),
      this.dataPath
    );
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
      (task.type === TaskType.FILE ||
        task.type === TaskType.FOLDER ||
        (task.type === TaskType.REPOSITORY &&
          (task.repositoryProvider === RepositoryProvider.GITHUB ||
            task.repositoryProvider === RepositoryProvider.GITLAB) &&
          typeof task.isPrivate === "boolean")) &&
      (task.accessToken === undefined || typeof task.accessToken === "string") &&
      (task.schedule === undefined || typeof task.schedule === "object") &&
      (task.labelsIds === undefined ||
        (Array.isArray(task.labelsIds) && task.labelsIds.every((labelId) => typeof labelId === "number"))) &&
      (task.exceptions === undefined ||
        (Array.isArray(task.exceptions) && task.exceptions.every((exception) => typeof exception === "string"))) &&
      (task.isPinned === undefined || typeof task.isPinned === "boolean") &&
      (task.isArchive === undefined || typeof task.isArchive === "boolean")
    );
  }

  private encryptTaskToken(task: ITask): ITask {
    if (task.accessToken === undefined) {
      const preserved = this.undecryptableTokens.get(task.id);

      return preserved ? { ...task, accessToken: preserved } : task;
    }

    this.undecryptableTokens.delete(task.id);

    if (!task.accessToken) {
      return task;
    }

    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Secure token storage is unavailable");
    }

    return { ...task, accessToken: `encrypted:${safeStorage.encryptString(task.accessToken).toString("base64")}` };
  }

  private decryptTaskToken(task: ITask): ITask {
    if (!task.accessToken?.startsWith("encrypted:")) {
      return task;
    }

    try {
      if (!safeStorage.isEncryptionAvailable()) {
        throw new Error("Secure token storage is unavailable");
      }

      const encryptedToken = Buffer.from(task.accessToken.slice("encrypted:".length), "base64");
      return { ...task, accessToken: safeStorage.decryptString(encryptedToken) };
    } catch (error) {
      Logger.error("TaskStorage", `Failed to decrypt access token for task "${task.id}"`, error);

      this.undecryptableTokens.set(task.id, task.accessToken);

      return { ...task, accessToken: undefined };
    }
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
