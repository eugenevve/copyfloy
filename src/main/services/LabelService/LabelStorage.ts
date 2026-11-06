import fs from "node:fs";
import path from "node:path";

import { Logger } from "@main/utils/logger";
import { writeJsonAtomically } from "@main/utils/writeJsonAtomically";
import { ILabel } from "@shared/types/labels";
import { app } from "electron";

export class LabelStorage {
  readonly dataPath = path.join(app.getPath("userData"), "labels.json");

  load(): ILabel[] {
    if (!fs.existsSync(this.dataPath)) {
      return [];
    }

    try {
      const content = fs.readFileSync(this.dataPath, "utf-8");

      if (!content.trim()) {
        return [];
      }

      const data: unknown = JSON.parse(content);

      if (!Array.isArray(data)) {
        throw new Error("Invalid labels format");
      }

      if (!data.every((label) => this.isValidLabel(label))) {
        throw new Error("Invalid label format");
      }

      return data;
    } catch (error) {
      Logger.error("LabelStorage", `Failed to load labels from "${this.dataPath}"`, error);

      return [];
    }
  }

  save(labels: ILabel[]) {
    try {
      writeJsonAtomically(this.dataPath, labels);
    } catch (error) {
      Logger.error("LabelStorage", `Failed to save labels to "${this.dataPath}"`, error);
    }
  }

  private isValidLabel(value: unknown): value is ILabel {
    if (!value || typeof value !== "object") {
      return false;
    }

    const label = value as Record<string, unknown>;

    return typeof label.id === "number" && typeof label.name === "string" && typeof label.color === "string";
  }
}
