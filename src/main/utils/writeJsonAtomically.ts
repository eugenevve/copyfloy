import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export function writeJsonAtomically(filePath: string, value: unknown, spaces = 2): void {
  const content = JSON.stringify(value, null, spaces);

  if (content === undefined) {
    throw new TypeError("Value cannot be serialized as JSON");
  }

  const directory = path.dirname(filePath);
  const temporaryPath = path.join(directory, `.${path.basename(filePath)}.${process.pid}.${randomUUID()}.tmp`);

  try {
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(temporaryPath, content, { encoding: "utf-8", flag: "wx" });
    fs.renameSync(temporaryPath, filePath);
  } catch (error) {
    try {
      fs.rmSync(temporaryPath, { force: true });
    } catch (cleanupError) {
      console.warn("Failed to clean up temporary JSON file", cleanupError);
    }

    throw error;
  }
}
