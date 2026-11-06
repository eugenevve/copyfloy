import path from "node:path";

import { Logger } from "@main/utils/logger";
import { IPC_CHANNELS } from "@shared/constants/ipc";
import { ReportStatus } from "@shared/types/report";
import { ITask, TaskType } from "@shared/types/tasks";
import { BrowserWindow } from "electron";

import { ArchiveRunner, FileCopier, RepositoryRunner } from "./CopyRunners";
import { IOperationStats, IRunningTask } from "./CopyService.types";
import { isGitAvailable } from "./GitRepositoryService";
import { NotificationService } from "../NotificationService/NotificationService";
import { ReportStorage } from "../ReportService/ReportStorage";

// Service responsible for executing file and folder copy operations
export class CopyService {
  private readonly running = new Map<number, IRunningTask>();
  private readonly reportStorage = new ReportStorage();
  private readonly fileCopier = new FileCopier();
  private readonly repositoryRunner = new RepositoryRunner();
  private readonly archiveRunner = new ArchiveRunner();

  // Returns progress (0-100) of every task that is currently running
  getRunning(): Record<number, number> {
    const result: Record<number, number> = {};

    this.running.forEach((value, id) => {
      result[id] = value.percent;
    });

    return result;
  }

  // Stops a running task; already copied files are kept
  stop(taskId: number) {
    this.running.get(taskId)?.controller.abort();
  }

  async isGitAvailable() {
    return isGitAvailable();
  }

  // Copies a source file or directory to a target directory and honors the task's excluded paths
  async run(task: ITask) {
    if (this.running.has(task.id)) {
      return;
    }

    const state: IRunningTask = { controller: new AbortController(), percent: 0 };
    this.running.set(task.id, state);
    this.broadcast(task.id, 0);

    const startedAt = Date.now();
    const stats: IOperationStats = { skipped: 0 };
    let outcome: ReportStatus | null = null;
    let errorMessage: string | undefined;

    try {
      const report = (percent: number) => {
        if (percent > state.percent) {
          state.percent = percent;
          this.broadcast(task.id, percent);
        }
      };

      if (task.type === TaskType.REPOSITORY) {
        if (task.isArchive) {
          await this.archiveRunner.runRepository(task, state.controller.signal, stats, report);
        } else {
          await this.repositoryRunner.run(task, state.controller.signal, stats, report);
        }
      } else if (task.isArchive) {
        const archivePath = path.join(task.target, `${path.basename(task.source)}.zip`);
        Logger.info("CopyService", `Starting backup "${task.name}": "${task.source}" → "${archivePath}"`);
        await this.archiveRunner.runFiles(task, state.controller.signal, stats, report);
      } else {
        const destination = path.join(task.target, path.basename(task.source));
        Logger.info("CopyService", `Starting task "${task.name}": "${task.source}" → "${destination}"`);
        await this.fileCopier.run(task, state.controller.signal, stats, report);
      }

      outcome = ReportStatus.SUCCESS;
      Logger.info("CopyService", `Task "${task.name}" completed successfully.`);

      if (task.schedule?.notify) {
        NotificationService.show("Successful copying!", `Task: "${task.name}" done!`);
      }
    } catch (error) {
      if (state.controller.signal.aborted) {
        Logger.info("CopyService", `Task "${task.name}" was stopped.`);
        return;
      }

      Logger.error("CopyService", `Failed to copy task "${task.name}"`, error);

      outcome = ReportStatus.ERROR;
      errorMessage = error instanceof Error ? error.message : String(error);

      NotificationService.error(`Failed to complete the task: "${task.name}"`);
    } finally {
      if (outcome) {
        this.reportStorage.append({
          id: startedAt,
          taskId: task.id,
          taskName: task.name,
          startedAt,
          durationMs: Date.now() - startedAt,
          status: outcome,
          filesCopied: stats.filesCopied,
          filesSkipped: stats.skipped,
          totalBytes: stats.totalBytes,
          error: errorMessage,
        });
      }

      this.running.delete(task.id);
      this.broadcast(task.id, null);
    }
  }

  private broadcast(taskId: number, percent: number | null) {
    BrowserWindow.getAllWindows().forEach((window) => {
      if (!window.isDestroyed()) {
        window.webContents.send(IPC_CHANNELS.tasks.progress, { taskId, percent });
      }
    });
  }
}
