import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";

import { ITask } from "@shared/types/tasks";
import { app } from "electron";
import fs from "fs-extra";

import { createZip } from "./ArchiveService";
import { ICopyEntry, IOperationStats } from "./CopyService.types";
import { cloneRepository } from "./GitRepositoryService";

type ProgressReporter = (percent: number) => void;

export class FileCopier {
  async run(task: ITask, signal: AbortSignal, stats: IOperationStats, onProgress: ProgressReporter) {
    const destination = path.join(task.target, path.basename(task.source));
    const entries: ICopyEntry[] = [];
    await collect(task.source, destination, task.exceptions, entries, stats);

    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    let copiedSize = 0;
    stats.filesCopied = 0;

    for (const entry of entries) {
      if (signal.aborted) {
        throw new Error("Aborted");
      }

      if (entry.isDirectory) {
        await fs.ensureDir(entry.destination);
        continue;
      }

      await fs.ensureDir(path.dirname(entry.destination));
      await copyFile(entry, signal, (bytes) => {
        copiedSize += bytes;
        const percent = totalSize === 0 ? 0 : Math.min(100, Math.floor((copiedSize / totalSize) * 100));
        onProgress(percent);
      });
      stats.filesCopied += 1;
    }

    stats.totalBytes = copiedSize;
  }
}

export class RepositoryRunner {
  async run(task: ITask, signal: AbortSignal, stats: IOperationStats, onProgress: ProgressReporter) {
    const clonedPath = await cloneRepository(task, onProgress, signal);
    const entries: ICopyEntry[] = [];
    await collect(clonedPath, clonedPath, undefined, entries);
    applyEntryStats(entries, stats);
  }
}

export class ArchiveRunner {
  async runFiles(task: ITask, signal: AbortSignal, stats: IOperationStats, onProgress: ProgressReporter) {
    const archivePath = path.join(task.target, `${path.basename(task.source)}.zip`);
    await fs.ensureDir(task.target);

    const entries: ICopyEntry[] = [];
    await collect(task.source, path.basename(task.source), task.exceptions, entries, stats);
    await createZip(entries, archivePath, signal, onProgress);
    applyEntryStats(entries, stats);
  }

  async runRepository(task: ITask, signal: AbortSignal, stats: IOperationStats, onProgress: ProgressReporter) {
    const tempDir = await fs.mkdtemp(path.join(app.getPath("temp"), "copyfloy-"));

    try {
      await cloneRepository({ ...task, target: tempDir }, (percent) => onProgress(Math.floor(percent * 0.7)), signal);

      const [repositoryName] = await fs.readdir(tempDir);
      const entries: ICopyEntry[] = [];
      await collect(path.join(tempDir, repositoryName), repositoryName, undefined, entries);
      applyEntryStats(entries, stats);

      await fs.ensureDir(task.target);
      await createZip(entries, path.join(task.target, `${repositoryName}.zip`), signal, (percent) =>
        onProgress(70 + Math.floor(percent * 0.3))
      );
    } finally {
      await fs.remove(tempDir).catch(() => undefined);
    }
  }
}

async function collect(
  source: string,
  destination: string,
  exceptions: string[] | undefined,
  entries: ICopyEntry[],
  operationStats?: IOperationStats
) {
  if (isExcluded(source, exceptions)) {
    if (operationStats) {
      operationStats.skipped += 1;
    }

    return;
  }

  const fileStats = await fs.stat(source);

  if (fileStats.isDirectory()) {
    entries.push({ source, destination, isDirectory: true, size: 0 });

    for (const name of await fs.readdir(source)) {
      await collect(path.join(source, name), path.join(destination, name), exceptions, entries, operationStats);
    }

    return;
  }

  entries.push({ source, destination, isDirectory: false, size: fileStats.size });
}

function applyEntryStats(entries: ICopyEntry[], stats: IOperationStats) {
  stats.filesCopied = entries.filter((entry) => !entry.isDirectory).length;
  stats.totalBytes = entries.reduce((sum, entry) => sum + entry.size, 0);
}

async function copyFile(entry: ICopyEntry, signal: AbortSignal, onBytes: (bytes: number) => void) {
  const readStream = createReadStream(entry.source);
  readStream.on("data", (chunk) => onBytes(chunk.length));

  try {
    await pipeline(readStream, createWriteStream(entry.destination), { signal });
  } catch (error) {
    await fs.remove(entry.destination).catch(() => undefined);
    throw error;
  }
}

function isExcluded(sourcePath: string, exceptions?: string[]): boolean {
  if (!exceptions?.length) {
    return false;
  }

  const normalizedSource = path.normalize(sourcePath);

  return exceptions.some((exceptionPath) => {
    const normalizedException = path.normalize(exceptionPath);

    return normalizedSource === normalizedException || normalizedSource.startsWith(normalizedException + path.sep);
  });
}
