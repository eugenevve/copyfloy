import { IPC_CHANNELS } from "@shared/constants/ipc";
import { IReport, ReportStatus } from "@shared/types/report";
import { ipcMain } from "electron";

import { ReportStorage } from "./ReportStorage";
import { TaskStorage } from "../TaskService/TaskStorage";

export class ReportService {
  private readonly reportStorage = new ReportStorage();
  private readonly taskStorage = new TaskStorage();

  init(): void {
    ipcMain.handle(IPC_CHANNELS.report.get, (): IReport => {
      const records = this.reportStorage.load();

      return {
        totalTasks: this.taskStorage.load().length,
        successCount: records.filter((record) => record.status === ReportStatus.SUCCESS).length,
        errorCount: records.filter((record) => record.status === ReportStatus.ERROR).length,
        records: records.toReversed(),
      };
    });
  }
}
