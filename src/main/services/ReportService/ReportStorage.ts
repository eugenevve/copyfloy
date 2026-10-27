import fs from "node:fs";
import path from "node:path";

import { Logger } from "@main/utils/logger";
import { IReportRecord, ReportStatus } from "@shared/types/report";
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
    const records = this.load();
    const usedIds = new Set(records.map((item) => item.id));
    let id = record.id;

    // Report ids double as React keys, so bump on collision (same-millisecond runs)
    while (usedIds.has(id)) {
      id += 1;
    }

    this.save([...records, { ...record, id }].slice(-MAX_RECORDS));
  }

  private isValidRecord(value: unknown): value is IReportRecord {
    if (!value || typeof value !== "object") {
      return false;
    }

    const record = value as Record<string, unknown>;

    const isNumber = (field: unknown): field is number => typeof field === "number" && Number.isFinite(field);
    const isOptional = (field: unknown, check: (item: unknown) => boolean): boolean =>
      field === undefined || check(field);

    return (
      isNumber(record.id) &&
      isNumber(record.taskId) &&
      typeof record.taskName === "string" &&
      isNumber(record.startedAt) &&
      isNumber(record.durationMs) &&
      Object.values(ReportStatus).includes(record.status as ReportStatus) &&
      isNumber(record.filesSkipped) &&
      isOptional(record.filesCopied, isNumber) &&
      isOptional(record.totalBytes, isNumber) &&
      isOptional(record.error, (field) => typeof field === "string")
    );
  }
}
