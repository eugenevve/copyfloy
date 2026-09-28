import fs from "node:fs";
import path from "node:path";

import { Logger } from "@main/utils/logger";
import { ITask, TaskType } from "@shared/types/tasks";
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
    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist");
    }

    const content = fs.readFileSync(filePath, "utf-8");

    if (!content.trim()) {
      throw new Error("Tasks file is empty");
    }

    const data: unknown = JSON.parse(content);

    if (!Array.isArray(data)) {
      throw new Error("Invalid tasks format");
    }

    if (data.length === 0) {
      throw new Error("Tasks file contains no tasks");
    }

    if (!data.every((task) => this.isValidTask(task))) {
      throw new Error("Invalid task format");
    }

    return data;
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
      (task.exceptions === undefined ||
        (Array.isArray(task.exceptions) && task.exceptions.every((exception) => typeof exception === "string")))
    );
  }

  // Ensures that the parent directory exists
  private ensureDirectory(filePath: string): void {
    const directory = path.dirname(filePath);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }
}
