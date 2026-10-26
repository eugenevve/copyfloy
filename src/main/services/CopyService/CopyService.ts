import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";

import { Logger } from "@main/utils/logger";
import { IPC_CHANNELS } from "@shared/constants/ipc";
import { ITask, TaskType } from "@shared/types/tasks";
import { BrowserWindow, app } from "electron";
import fs from "fs-extra";

import { createZip } from "./ArchiveService";
import { ICopyEntry, IRunningTask } from "./CopyService.types";
import { cloneRepository, isGitAvailable } from "./GitRepositoryService";
import { NotificationService } from "../NotificationService/NotificationService";

// Service responsible for executing file and folder copy operations
export class CopyService {
  private readonly running = new Map<number, IRunningTask>();

  // Returns progress (0-100) of every task that is currently running
  getRunning(): Record<number, number> {
    const result: Record<number, number> = {};

    this.running.forEach((value, id) => {
      result[id] = value.percent;
    });

    return result;
  }

  // Stops a running task; already copied files are kept
  stop(taskId: number): void {
    this.running.get(taskId)?.controller.abort();
  }

  async isGitAvailable(): Promise<boolean> {
    return isGitAvailable();
  }

  // Copies a source file or directory to a target directory and honors the task's excluded paths
  async run(task: ITask): Promise<void> {
    if (this.running.has(task.id)) {
      return;
    }

    const state: IRunningTask = { controller: new AbortController(), percent: 0 };
    this.running.set(task.id, state);
    this.broadcast(task.id, 0);

    try {
      if (task.type === TaskType.REPOSITORY) {
        const report = (percent: number): void => {
          if (percent > state.percent) {
            state.percent = percent;
            this.broadcast(task.id, percent);
          }
        };

        if (task.isArchive) {
          await this.archiveRepository(task, state.controller.signal, report);
        } else {
          await cloneRepository(task, report, state.controller.signal);
        }

        Logger.info("CopyService", `Task "${task.name}" completed successfully.`);

        if (task.schedule?.notify) {
          NotificationService.show("Successful copying!", `Task: "${task.name}" done!`);
        }

        return;
      }

      const destination = path.join(task.target, path.basename(task.source));

      if (task.isArchive) {
        const archivePath = path.join(task.target, `${path.basename(task.source)}.zip`);
        const onProgress = (percent: number): void => {
          if (percent > state.percent) {
            state.percent = percent;
            this.broadcast(task.id, percent);
          }
        };

        Logger.info("CopyService", `Starting backup "${task.name}": "${task.source}" → "${archivePath}"`);
        await fs.ensureDir(task.target);

        const entries: ICopyEntry[] = [];
        await this.collect(task.source, path.basename(task.source), task.exceptions, entries);
        await createZip(entries, archivePath, state.controller.signal, onProgress);

        Logger.info("CopyService", `Task "${task.name}" completed successfully.`);

        if (task.schedule?.notify) {
          NotificationService.show("Successful copying!", `Task: "${task.name}" done!`);
        }

        return;
      }

      Logger.info("CopyService", `Starting task "${task.name}": "${task.source}" → "${destination}"`);

      const entries: ICopyEntry[] = [];
      await this.collect(task.source, destination, task.exceptions, entries);

      const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
      let copiedSize = 0;

      const report = (): void => {
        const percent = totalSize === 0 ? 0 : Math.min(100, Math.floor((copiedSize / totalSize) * 100));

        if (percent !== state.percent) {
          state.percent = percent;
          this.broadcast(task.id, percent);
        }
      };

      for (const entry of entries) {
        if (state.controller.signal.aborted) {
          throw new Error("Aborted");
        }

        if (entry.isDirectory) {
          await fs.ensureDir(entry.destination);
          continue;
        }

        await fs.ensureDir(path.dirname(entry.destination));
        await this.copyFile(entry, state.controller.signal, (bytes) => {
          copiedSize += bytes;
          report();
        });
      }

      Logger.info("CopyService", `Task "${task.name}" completed successfully.`);

      // Show a notification when the task requests it
      if (task.schedule?.notify) {
        NotificationService.show("Successful copying!", `Task: "${task.name}" done!`);
      }
    } catch (error) {
      if (state.controller.signal.aborted) {
        Logger.info("CopyService", `Task "${task.name}" was stopped.`);
        return;
      }

      Logger.error("CopyService", `Failed to copy task "${task.name}"`, error);

      NotificationService.error(`Failed to complete the task: "${task.name}"`);
    } finally {
      this.running.delete(task.id);
      this.broadcast(task.id, null);
    }
  }

  // Clones into a temp folder, then zips the whole clone (including .git) into the target
  private async archiveRepository(
    task: ITask,
    signal: AbortSignal,
    onProgress: (percent: number) => void
  ): Promise<void> {
    const tempDir = await fs.mkdtemp(path.join(app.getPath("temp"), "copyfloy-"));

    try {
      // Clone takes 0-70%, packing takes 70-100%
      await cloneRepository({ ...task, target: tempDir }, (percent) => onProgress(Math.floor(percent * 0.7)), signal);

      const [repositoryName] = await fs.readdir(tempDir);
      const entries: ICopyEntry[] = [];
      await this.collect(path.join(tempDir, repositoryName), repositoryName, undefined, entries);

      await fs.ensureDir(task.target);
      await createZip(entries, path.join(task.target, `${repositoryName}.zip`), signal, (percent) =>
        onProgress(70 + Math.floor(percent * 0.3))
      );
    } finally {
      await fs.remove(tempDir).catch(() => undefined);
    }
  }

  // Copies one file, removing the partial result if the copy is interrupted
  private async copyFile(entry: ICopyEntry, signal: AbortSignal, onBytes: (bytes: number) => void): Promise<void> {
    const readStream = createReadStream(entry.source);
    readStream.on("data", (chunk) => onBytes(chunk.length));

    try {
      await pipeline(readStream, createWriteStream(entry.destination), { signal });
    } catch (error) {
      await fs.remove(entry.destination).catch(() => undefined);
      throw error;
    }
  }

  // Builds a flat list of everything to copy, skipping excluded paths
  private async collect(
    source: string,
    destination: string,
    exceptions: string[] | undefined,
    entries: ICopyEntry[]
  ): Promise<void> {
    if (this.isExcluded(source, exceptions)) {
      return;
    }

    const stats = await fs.stat(source);

    if (stats.isDirectory()) {
      entries.push({ source, destination, isDirectory: true, size: 0 });

      for (const name of await fs.readdir(source)) {
        await this.collect(path.join(source, name), path.join(destination, name), exceptions, entries);
      }

      return;
    }

    entries.push({ source, destination, isDirectory: false, size: stats.size });
  }

  private broadcast(taskId: number, percent: number | null): void {
    BrowserWindow.getAllWindows().forEach((window) => {
      if (!window.isDestroyed()) {
        window.webContents.send(IPC_CHANNELS.tasks.progress, { taskId, percent });
      }
    });
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
