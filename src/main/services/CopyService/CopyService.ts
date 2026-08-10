import path from "path";

import { Task } from "@shared/types/tasks";
import fs from "fs-extra";

import { NotificationService } from "../NotificationService/NotificationService";

// Service responsible for executing file and folder copy operations
export class CopyService {
  // Copies a source file or directory to a target directory and honors the task's excluded paths
  public async run(task: Task): Promise<void> {
    try {
      const destination = path.join(task.target, path.basename(task.source));

      await fs.copy(task.source, destination, {
        overwrite: true,
        // Exclude configured files and directories from copying
        filter: (sourcePath: string) => {
          return !this.isExcluded(sourcePath, task.exceptions);
        },
      });

      // Show a notification when the task requests it
      if (task.schedule?.notify) {
        NotificationService.show("Successful copying!", `Task: "${task.name}" done!`);
      }
    } catch (error) {
      console.error(`[CopyService] Failed to copy task "${task.name}":`, error);
      NotificationService.error(`Failed to complete the task: "${task.name}"`);
    }
  }

  // Checks whether a path should be excluded from copying
  private isExcluded(sourcePath: string, exceptions?: string[]): boolean {
    if (!exceptions?.length) {
      return false;
    }

    const normalizedSource = path.normalize(sourcePath);

    return exceptions.some((exceptionPath) => {
      const normalizedException = path.normalize(exceptionPath);
      return normalizedSource === normalizedException || normalizedSource.startsWith(normalizedException + path.sep);
    });
  }
}
