import fs from "node:fs";
import path from "node:path";

import { writeJsonAtomically } from "@main/utils/writeJsonAtomically";
import { app } from "electron";

export class MissedTaskStorage {
  readonly dataPath = path.join(app.getPath("userData"), "missed-dismissed.json");

  load(): Record<number, number> {
    try {
      return JSON.parse(fs.readFileSync(this.dataPath, "utf-8")) as Record<number, number>;
    } catch {
      return {};
    }
  }

  save(dismissed: Record<number, number>) {
    writeJsonAtomically(this.dataPath, dismissed, 0);
  }
}
