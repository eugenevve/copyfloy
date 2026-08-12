import fs from "node:fs";
import path from "node:path";

import { Task } from "@shared/types/tasks";
import { app } from "electron";

// Storage for Task entities
// Responsible only for reading and writing tasks.json
export class TaskStorage {
  readonly dataPath = path.join(app.getPath("userData"), "tasks.json");

  // Reads all tasks from the default tasks.json
  load(): Task[] {
    return this.loadFromFile(this.dataPath);
  }

  // Reads tasks from a specific JSON file
  loadFromFile(filePath: string): Task[] {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    try {
      const content = fs.readFileSync(filePath, "utf-8");

      return JSON.parse(content) as Task[];
    } catch (error) {
      console.error(`[TaskStorage] Failed to read tasks from "${filePath}":`, error);

      return [];
    }
  }

  // Saves tasks to the default tasks.json
  save(tasks: Task[]): void {
    this.saveToFile(tasks, this.dataPath);
  }

  // Saves tasks to a specific JSON file
  saveToFile(tasks: Task[], filePath: string): void {
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
