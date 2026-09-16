import path from "node:path";

import { Logger } from "@main/utils/logger";
import { ITask } from "@shared/types/tasks";
import fs from "fs-extra";

import { NotificationService } from "../NotificationService/NotificationService";

// Service responsible for executing file and folder copy operations
export class CopyService {
  // Copies a source file or directory to a target directory and honors the task's excluded paths
  async run(task: ITask): Promise<void> {
    try {
      const destination = path.join(task.target, path.basename(task.source));

      Logger.info("CopyService", `Starting task "${task.name}": "${task.source}" → "${destination}"`);

      await fs.copy(task.source, destination, {
        overwrite: true,

        // Exclude configured files and directories from copying
        filter: (sourcePath: string) => {
          return !this.isExcluded(sourcePath, task.exceptions);
        },
      });

      Logger.info("CopyService", `Task "${task.name}" completed successfully.`);

      // Show a notification when the task requests it
      if (task.schedule?.notify) {
        NotificationService.show("Successful copying!", `Task: "${task.name}" done!`);
      }
    } catch (error) {
      Logger.error("CopyService", `Failed to copy task "${task.name}"`, error);

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
