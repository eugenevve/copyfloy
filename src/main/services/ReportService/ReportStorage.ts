import fs from "node:fs";
import path from "node:path";

import { Logger } from "@main/utils/logger";
import { IReportRecord } from "@shared/types/report";
import { app } from "electron";

const MAX_RECORDS = 1000;

export class ReportStorage {
  readonly dataPath = path.join(app.getPath("userData"), "report.json");

  load(): IReportRecord[] {
    if (!fs.existsSync(this.dataPath)) {
      return [];
    }

    try {
      const content = fs.readFileSync(this.dataPath, "utf-8");

      if (!content.trim()) {
        return [];
      }

      const data: unknown = JSON.parse(content);

      if (!Array.isArray(data) || !data.every((record) => this.isValidRecord(record))) {
        throw new Error("Invalid report format");
      }

      return data;
    } catch (error) {
      Logger.error("ReportStorage", `Failed to load report from "${this.dataPath}"`, error);

      return [];
    }
  }

  save(records: IReportRecord[]): void {
    try {
      fs.mkdirSync(path.dirname(this.dataPath), { recursive: true });
      fs.writeFileSync(this.dataPath, JSON.stringify(records, null, 2), "utf-8");
    } catch (error) {
      Logger.error("ReportStorage", `Failed to save report to "${this.dataPath}"`, error);
    }
  }

  append(record: IReportRecord): void {
    this.save([...this.load(), record].slice(-MAX_RECORDS));
  }

  private isValidRecord(value: unknown): value is IReportRecord {
    if (!value || typeof value !== "object") {
      return false;
    }

    const record = value as Record<string, unknown>;

    return (
      typeof record.id === "number" &&
      typeof record.taskId === "number" &&
      typeof record.taskName === "string" &&
      typeof record.startedAt === "number" &&
      typeof record.durationMs === "number" &&
      typeof record.status === "string"
    );
  }
}
