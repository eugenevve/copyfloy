import { createReadStream, createWriteStream } from "node:fs";

import { ZipArchive } from "archiver";
import fs from "fs-extra";

import { ICopyEntry } from "./CopyService.types";

// Writes entries (destination = path inside the archive) to a ZIP file
export const createZip = async (
  entries: ICopyEntry[],
  archivePath: string,
  signal: AbortSignal,
  onProgress: (percent: number) => void
) => {
  const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
  let processedSize = 0;
  const output = createWriteStream(archivePath);
  const archive = new ZipArchive({ zlib: { level: 6 } });

  const finished = new Promise<void>((resolve, reject) => {
    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);
    signal.addEventListener("abort", () => {
      archive.abort();
      reject(new Error("Aborted"));
    });
  });

  archive.pipe(output);

  for (const entry of entries) {
    if (entry.isDirectory) {
      archive.append("", { name: `${entry.destination.replaceAll("\\", "/")}/` });
    } else {
      const source = createReadStream(entry.source);
      source.on("data", (chunk) => {
        processedSize += chunk.length;

        if (totalSize > 0) {
          onProgress(Math.min(99, Math.floor((processedSize / totalSize) * 100)));
        }
      });
      archive.append(source, { name: entry.destination.replaceAll("\\", "/") });
    }
  }

  archive.finalize();

  try {
    await finished;
  } catch (error) {
    output.destroy();
    await fs.remove(archivePath).catch(() => undefined);
    throw error;
  }
};
