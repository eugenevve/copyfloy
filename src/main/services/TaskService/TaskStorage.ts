import fs from "node:fs";
import path from "node:path";

import { ITask } from "@shared/types/tasks";
import { app } from "electron";

// Storage for Task entities
// Responsible only for reading and writing tasks.json
export class TaskStorage {
  readonly dataPath = path.join(app.getPath("userData"), "tasks.json");

  // Reads all tasks from the default tasks.json
  load(): ITask[] {
    return this.loadFromFile(this.dataPath);
  }

  // Reads tasks from a specific JSON file
  loadFromFile(filePath: string): ITask[] {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    try {
      const content = fs.readFileSync(filePath, "utf-8");

      return JSON.parse(content) as ITask[];
    } catch (error) {
      console.error(`[TaskStorage] Failed to read tasks from "${filePath}":`, error);

      return [];
    }
  }

  // Saves tasks to the default tasks.json
  save(tasks: ITask[]): void {
    this.saveToFile(tasks, this.dataPath);
  }

  // Saves tasks to a specific JSON file
  saveToFile(tasks: ITask[], filePath: string): void {
    try {
      this.ensureDirectory(filePath);

      fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), "utf-8");
    } catch (error) {
      console.error(`[TaskStorage] Failed to save tasks to "${filePath}":`, error);
    }
  }

  // Ensures that the parent directory exists
  private ensureDirectory(filePath: string): void {
    const directory = path.dirname(filePath);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }
}
